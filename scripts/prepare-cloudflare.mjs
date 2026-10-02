import {writeFileSync} from 'node:fs';
writeFileSync('dist/server/cloudflare-entry.js',`import app from './index.js';
export default {
 fetch(request,env,ctx){return app.fetch(request,env,ctx)},
 scheduled(event,env,ctx){if(env.SCHEDULER_ENABLED!=='true')return;ctx.waitUntil(app.fetch(new Request(env.APP_URL+'/api/internal/tick',{method:'POST',headers:{Authorization:'Bearer '+env.SCHEDULER_SECRET}}),env,ctx).then(response=>{if(!response.ok)throw new Error('Scheduler tick failed: '+response.status)}))}
};
`);
