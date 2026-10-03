import {AppError,config,one,run,uid,now,audit} from './db';
import {currentUser,requireUser,createAccount,hash,safeEqual,sessionCookie} from './security';
import {availability} from './providers';
async function stateCookieName(state:string){return 'cp_google_state_'+(await hash(state)).slice(0,24)}
function redirectUri(req:Request){return (config().APP_URL||new URL(req.url).origin).replace(/\/$/,'')+'/api/auth/google-callback'}
export async function googleStart(req:Request){
 if(!availability().google)throw new AppError('Google sign-in is being configured. Use email and password for now.',503);
 const url=new URL(req.url),canonical=new URL(redirectUri(req));
 if(url.origin!==canonical.origin){canonical.pathname=url.pathname;canonical.search=url.search;return new Response(null,{status:302,headers:{Location:canonical.href,'Cache-Control':'no-store'}})}
 const link=url.searchParams.get('link')==='1',user=link?await requireUser(req):null,state=uid()+uid();
 await run('INSERT INTO oauth_states (id,user_id,provider,expires_at) VALUES (?,?,?,?)',await hash(state),user?.id||'anonymous','google',new Date(Date.now()+600000).toISOString());
 const google=new URL('https://accounts.google.com/o/oauth2/v2/auth');google.search=new URLSearchParams({client_id:config().GOOGLE_CLIENT_ID,redirect_uri:redirectUri(req),response_type:'code',scope:'openid email profile',state,prompt:'select_account'}).toString();
 return new Response(null,{status:302,headers:{Location:google.href,'Set-Cookie':`${await stateCookieName(state)}=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${url.protocol==='https:'?'; Secure':''}`}});
}
export async function googleCallback(req:Request){
 const url=new URL(req.url),state=url.searchParams.get('state')||'';
 const cookies=new Map((req.headers.get('cookie')||'').split(';').map(v=>{const i=v.indexOf('=');return [v.slice(0,i).trim(),v.slice(i+1)]}));
 const cookie=state.length<=200?cookies.get(await stateCookieName(state))||cookies.get('cp_google_state'):undefined;
 if(!state||!cookie||!safeEqual(state,cookie))throw new AppError('Google sign-in could not be verified. Please try again.');
 const attempt=await one('DELETE FROM oauth_states WHERE id=? AND provider=? AND expires_at>? RETURNING *',await hash(state),'google',now());if(!attempt)throw new AppError('The sign-in link expired.');
 if(url.searchParams.has('error')||!url.searchParams.get('code'))return new Response(null,{status:302,headers:{Location:'/login?google=canceled'}});
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:url.searchParams.get('code')!,client_id:config().GOOGLE_CLIENT_ID,client_secret:config().GOOGLE_CLIENT_SECRET,grant_type:'authorization_code',redirect_uri:redirectUri(req)}),signal:AbortSignal.timeout(15000)});
 const token:any=await response.json();if(!response.ok||typeof token.access_token!=='string')throw new AppError('Google sign-in failed. Please try again.',502);
 const info=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${token.access_token}`},signal:AbortSignal.timeout(15000)});const profile:any=await info.json();
 if(!info.ok||profile.email_verified!==true||typeof profile.sub!=='string'||!profile.sub||typeof profile.email!=='string'||!profile.email.includes('@'))throw new AppError('Google did not verify your account.',401);
 const email=profile.email.toLowerCase(),identity='google:'+profile.sub;let user=await one('SELECT * FROM users WHERE platform_id=?',identity),created=false;
 if(attempt.user_id!=='anonymous'){
  const signedIn=await currentUser(req);if(!signedIn||signedIn.id!==attempt.user_id||signedIn.email!==email)throw new AppError('Sign in to your account and choose the Google account with the same email.',403);
  if(user&&user.id!==signedIn.id||signedIn.platform_id&&signedIn.platform_id!==identity)throw new AppError('This Google identity cannot be linked to this account.',409);
  await run('UPDATE users SET platform_id=?,verified=1 WHERE id=?',identity,signedIn.id);user=await one('SELECT * FROM users WHERE id=?',signedIn.id);await audit(user.id,'account.google_linked');
 }else if(!user){
  if(await one('SELECT id FROM users WHERE email=?',email))throw new AppError('Sign in with your password, then connect Google in Profile to use both methods.',409);
  user=await createAccount({email,first_name:profile.given_name||email.split('@')[0],last_name:profile.family_name||''},identity);created=true;
 }
 if(user.status!=='active')throw new AppError('This account is suspended.',403);
 const headers=new Headers({Location:attempt.user_id!=='anonymous'?'/studio?view=profile':created?'/plans':'/studio'});headers.append('Set-Cookie',await sessionCookie(req,user.id));headers.append('Set-Cookie',`${await stateCookieName(state)}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${url.protocol==='https:'?'; Secure':''}`);return new Response(null,{status:302,headers});
}
