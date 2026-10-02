import {env} from 'cloudflare:workers';
export function database():D1Database{const db=(env as any).DB;if(!db)throw new AppError('Your workspace storage is temporarily unavailable. Please retry.',503);return db}
export class AppError extends Error{constructor(message:string,public status=400){super(message)}}
export const config=()=>env as any;
export const now=()=>new Date().toISOString();export const uid=()=>crypto.randomUUID();
export const json=(v:any)=>JSON.stringify(v);
export const parse=(v:any,fallback:any={})=>{try{return typeof v==='string'?JSON.parse(v):v??fallback}catch{return fallback}};
export async function one(sql:string,...args:any[]):Promise<any>{return database().prepare(sql).bind(...args).first()}
export async function all(sql:string,...args:any[]):Promise<any[]>{return (await database().prepare(sql).bind(...args).all()).results}
export async function run(sql:string,...args:any[]){return database().prepare(sql).bind(...args).run()}
export function stmt(sql:string,...args:any[]){return database().prepare(sql).bind(...args)}
export async function audit(userId:string|null,event:string,businessId:string|null=null,details:any={}){await run('INSERT INTO audit_logs (id,user_id,business_id,event,details,created_at) VALUES (?,?,?,?,?,?)',uid(),userId,businessId,event,json(details),now())}
export function decode(row:any,fields:string[]){if(!row)return row;for(const f of fields)row[f]=parse(row[f],['slides','tags','hashtags'].includes(f)?[]:{});return row}
export const businessRow=(r:any)=>decode(r,['brain','kit','preferences']);export const contentRow=(r:any)=>decode(r,['slides','hashtags','metadata']);export const assetRow=(r:any)=>decode(r,['tags','metadata']);
export async function seedConfiguration(){await database().batch([
stmt('INSERT OR IGNORE INTO plans (id,name,price,description,entitlements,enabled) VALUES (?,?,?,?,?,1)','trial','Studio trial',0,'Explore your complete creative workflow.',json({'businesses.max':1,'carousels.monthly':10,'videos.monthly':2,'images.monthly':10,'social_accounts.max':2,'storage.max':104857600,'scheduling.enabled':true,'analytics.enabled':true,'team_members.max':1})),
stmt('INSERT OR IGNORE INTO plans (id,name,price,description,entitlements,stripe_price,enabled) VALUES (?,?,?,?,?,?,1)','creator','Creator',29,'For a brand ready to show up.',json({'businesses.max':3,'carousels.monthly':100,'videos.monthly':20,'images.monthly':100,'social_accounts.max':6,'storage.max':1073741824,'scheduling.enabled':true,'analytics.enabled':true,'team_members.max':1}),config().STRIPE_CREATOR_PRICE_ID||null),
stmt('INSERT OR IGNORE INTO plans (id,name,price,description,entitlements,stripe_price,enabled) VALUES (?,?,?,?,?,?,1)','growth','Growth',79,'For your growing brand portfolio.',json({'businesses.max':10,'carousels.monthly':400,'videos.monthly':80,'images.monthly':400,'social_accounts.max':20,'storage.max':5368709120,'scheduling.enabled':true,'analytics.enabled':true,'team_members.max':5}),config().STRIPE_GROWTH_PRICE_ID||null),
...['Viral Bold','Creator UGC','Minimal','Editorial','Product Demo','SaaS','Lifestyle','Storytime','Dark Tech','Educational'].map((name,i)=>stmt('INSERT OR IGNORE INTO templates (id,name,config,enabled) VALUES (?,?,?,1)',name,name,json({font:i===3||i===7?'Georgia':'Arial',contrast:'auto',safeMargin:90}))),
...['strategy','copy','vision','image','video','embedding'].map(kind=>stmt('INSERT OR IGNORE INTO ai_models (id,kind,provider,model,enabled) VALUES (?,?,?,?,1)',kind,kind,'configured',config()['AI_'+kind.toUpperCase()+'_MODEL']||'not configured'))])}
export async function entitlement(workspace:any,key:string){const p=await one('SELECT entitlements FROM plans WHERE id=? AND enabled=1',workspace.plan_id);return parse(p?.entitlements)[key]??0}
export async function workspaceFor(userId:string){return one('SELECT w.* FROM workspaces w JOIN workspace_members m ON m.workspace_id=w.id WHERE m.user_id=? ORDER BY w.created_at LIMIT 1',userId)}
export async function requireBusiness(userId:string,id:string){const b=await one('SELECT b.* FROM businesses b JOIN workspace_members m ON m.workspace_id=b.workspace_id WHERE b.id=? AND m.user_id=?',id,userId);if(!b)throw new AppError('Business not found or access denied.',404);return businessRow(b)}
export async function requireContent(userId:string,id:string){const c=await one('SELECT c.* FROM content_packages c JOIN businesses b ON b.id=c.business_id JOIN workspace_members m ON m.workspace_id=b.workspace_id WHERE c.id=? AND m.user_id=?',id,userId);if(!c)throw new AppError('Content not found or access denied.',404);return contentRow(c)}
