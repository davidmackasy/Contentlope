import {validatePublicUrl} from './security';
export type BrowserBrand={html:string;url:string;css:string;resources:Map<string,{bytes:Uint8Array;mime:string}>};
export async function renderBrandWebsite(binding:any,url:string):Promise<BrowserBrand>{
 const target=validatePublicUrl(url).href;
 const {default:puppeteer}=await import('@cloudflare/puppeteer');
 const browser=await puppeteer.launch(binding);const resources=new Map<string,{bytes:Uint8Array;mime:string}>();const pending:Promise<void>[]=[];let total=0,requests=0;
 try{
 const page=await browser.newPage();await page.setViewport({width:1440,height:1000});await page.setRequestInterception(true);
 page.on('request',request=>{try{validatePublicUrl(request.url());if(request.method()!=='GET'||++requests>180)return void request.abort();void request.continue()}catch{void request.abort()}});
 page.on('response',response=>{const mime=(response.headers()['content-type']||'').split(';')[0];if(!response.ok()||!['image/png','image/jpeg','image/webp','image/svg+xml','font/woff2','font/woff','font/ttf'].includes(mime)||pending.length>=25)return;const length=Number(response.headers()['content-length']);if(length>8000000)return;pending.push((async()=>{try{const bytes=new Uint8Array(await response.buffer());if(bytes.length<=8000000&&total+bytes.length<=20000000){total+=bytes.length;resources.set(response.url(),{bytes,mime})}}catch{}})())});
 const response=await page.goto(target,{waitUntil:'domcontentloaded',timeout:25000});if(response&&response.status()>=400)throw new Error('The website declined the browser request.');
 await page.waitForSelector('body',{timeout:5000});await page.waitForNetworkIdle({idleTime:700,timeout:6000}).catch(()=>{});
 validatePublicUrl(page.url());
 const result=await page.evaluate(()=>{
 const css:string[]=[];const visible=(e:Element)=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 for(const selector of ['body','h1','h2','button','a[role="button"]']){for(const e of Array.from(document.querySelectorAll(selector)).filter(visible).slice(0,12)){const s=getComputedStyle(e);css.push(`${selector}{font-family:${s.fontFamily};color:${s.color};background-color:${s.backgroundColor}}`);if(selector==='button'||selector==='a[role="button"]')css.push(`:root{--brand-primary:${s.backgroundColor}}`)}}
 for(const e of Array.from(document.querySelectorAll('img')).slice(0,80)){const img=e as HTMLImageElement;if(img.currentSrc)img.setAttribute('src',img.currentSrc)}
 for(const e of Array.from(document.querySelectorAll('main section,main div')).filter(visible).slice(0,80)){const bg=getComputedStyle(e).backgroundImage;const match=bg.match(/url\(["']?([^"')]+)["']?\)/);if(match){const img=document.createElement('img');img.src=match[1];img.alt='Website image';document.body.appendChild(img)}}
 for(const sheet of Array.from(document.styleSheets)){try{for(const rule of Array.from(sheet.cssRules))if(rule.cssText.startsWith('@font-face'))css.push(rule.cssText)}catch{}}
 return {html:document.documentElement.outerHTML.slice(0,1500000),css:css.join('\n'),url:location.href};
 });
 await Promise.allSettled(pending);return {...result,resources};
 }finally{await browser.close()}
}
