const assert = require('node:assert/strict');
const proxy = require('../cloud/chaosai-voice-proxy.cjs');
function response() { return { headers: {}, setHeader(k,v){this.headers[k]=v}, end(body){this.body=body;this.finished=true} }; }
(async () => {
  const oldKey = process.env.ELEVENLABS_API_KEY, oldVoice = process.env.CHAOSAI_VOICE_ID;
  const oldFetch = global.fetch;
  try {
    delete process.env.ELEVENLABS_API_KEY;
    let res = response(); await proxy.handler({ method:'POST', body:{text:'hello'}, headers:{} }, res);
    assert.equal(res.statusCode, 503); assert.equal(JSON.parse(res.body).error, 'VOICE_PROVIDER_NOT_CONFIGURED');
    process.env.ELEVENLABS_API_KEY = 'test-secret'; process.env.CHAOSAI_VOICE_ID = 'trusted-voice';
    let request;
    global.fetch = async (url, opts) => { request={url,opts}; return { ok:true, status:200, headers:{get:()=> 'audio/mpeg'}, arrayBuffer:async()=>Uint8Array.from([1,2,3]).buffer }; };
    res = response(); await proxy.handler({ method:'POST', body:{text:'I am awake',voiceId:'attacker-selected-voice',modelId:'attacker-model'}, headers:{}, socket:{remoteAddress:'test'} }, res);
    assert.equal(res.statusCode, 200); assert.deepEqual([...res.body], [1,2,3]);
    assert.match(request.url, /trusted-voice/); assert.doesNotMatch(request.url, /attacker-selected-voice/);
    assert.equal(request.opts.headers['xi-api-key'], 'test-secret');
    assert.equal(JSON.parse(request.opts.body).text, 'I am awake');
    res = response(); await proxy.handler({ method:'GET', headers:{} }, res); assert.equal(res.statusCode,405);
    res = response(); await proxy.handler({ method:'POST', body:{text:'x'.repeat(501)}, headers:{}, socket:{remoteAddress:'test2'} }, res); assert.equal(res.statusCode,400);
    console.log('PASS: voice proxy protects key server-side, restricts voice, validates requests and returns audio');
  } finally {
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = oldKey;
    if (oldVoice === undefined) delete process.env.CHAOSAI_VOICE_ID; else process.env.CHAOSAI_VOICE_ID = oldVoice;
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
