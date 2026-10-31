'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const net=require('node:net');
const {spawn}=require('node:child_process');
const base=path.join(__dirname,'..');
function reservePort(){return new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(e=>e?reject(e):resolve(p))})})}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const port=await reservePort();
 const env={...process.env,HOST:'127.0.0.1',PORT:String(port),CHAOSOS_API_TOKEN:'',CHAOSOS_CLIENT_TOKEN:'',CHAOSOS_AI_ENDPOINT:'',CHAOSOS_AI_API_KEY:'',CHAOSOS_AI_MODEL:'',CHAOSOS_ALLOWED_ORIGINS:''};
 const child=spawn(process.execPath,[path.join(base,'cloud/server.cjs')],{cwd:base,env,stdio:'ignore'});
 let ready=false;
 try{
  for(let i=0;i<80;i++){if(child.exitCode!==null)throw new Error('cloud server exited before readiness');try{const r=await fetch(`http://127.0.0.1:${port}/health`);if(r.ok){ready=true;break}}catch{}await wait(40)}
  assert.equal(ready,true,'local development server should start on loopback');
  const health=await(await fetch(`http://127.0.0.1:${port}/health`)).json();assert.equal(health.productionReady,false);assert.equal(health.storage,'ephemeral-memory');assert.equal(health.aiGatewayConfigured,false);
  const response=await fetch(`http://127.0.0.1:${port}/api/v1/ai/respond`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:'must not reach an unconfigured provider'})});assert.equal(response.status,503);const data=await response.json();assert.equal(data.error,'ai_gateway_disabled');
  const notFound=await fetch(`http://127.0.0.1:${port}/api/v1/ai/respond`);assert.equal(notFound.status,404);
  console.log('PASS: cloud AI route stays disabled without server-side configuration; ephemeral dev server is loopback-only by default.');
 }finally{child.kill('SIGTERM');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),wait(1000)])}
})().catch(e=>{console.error(e);process.exitCode=1});
