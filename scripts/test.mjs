import {build} from 'esbuild';import {spawnSync} from 'node:child_process';
await build({entryPoints:['tests/integration.ts'],bundle:true,platform:'node',alias:{'cloudflare:workers':'./tests/mock-env.ts'},format:'esm',outfile:'.sites-runtime/integration.mjs'});
const result=spawnSync(process.execPath,['.sites-runtime/integration.mjs'],{stdio:'inherit'});process.exitCode=result.status??1;
