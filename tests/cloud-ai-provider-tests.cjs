'use strict';
const assert=require('node:assert/strict');
const {createProvider}=require('../cloud/providers/openai-compatible.cjs');
(async()=>{
 const off=createProvider({CHAOSOS_AI_ENDPOINT:'',CHAOSOS_AI_API_KEY:'',CHAOSOS_AI_MODEL:''},async()=>{throw Error('must not call')});
 assert.equal(off.configured,false);await assert.rejects(()=>off.respond('hello'),e=>e.code==='AI_PROVIDER_DISABLED');
 const http=createProvider({CHAOSOS_AI_ENDPOINT:'http://model.local/v1/chat/completions',CHAOSOS_AI_API_KEY:'x',CHAOSOS_AI_MODEL:'test'},async()=>({}));assert.equal(http.configured,false);
 let request;const provider=createProvider({CHAOSOS_AI_ENDPOINT:'https://api.example.test/v1/chat/completions',CHAOSOS_AI_API_KEY:'secret-value',CHAOSOS_AI_MODEL:'model-test'},async(url,opts)=>{request={url,opts};return{ok:true,status:200,text:async()=>JSON.stringify({model:'model-test',choices:[{message:{content:'A safe answer'}}]})}});
 assert.equal(provider.configured,true);const result=await provider.respond('hello user');assert.equal(result.answer,'A safe answer');assert.equal(request.url,'https://api.example.test/v1/chat/completions');assert.equal(request.opts.redirect,'error');assert.ok(request.opts.headers.Authorization.includes('secret-value'));assert.ok(!JSON.stringify(result).includes('secret-value'));
 await assert.rejects(()=>provider.respond('x'.repeat(8001)),e=>e.code==='PROMPT_SIZE_INVALID');
 console.log('PASS: AI provider disabled by default, HTTPS-only endpoint, bounded prompts, redirect rejection, and server-side secret handling');
})().catch(e=>{console.error(e);process.exitCode=1});
