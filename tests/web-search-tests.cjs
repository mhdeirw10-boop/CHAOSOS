'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '..');
const storage = new Map();
const localStorage = { getItem:k=>storage.has(k)?storage.get(k):null, setItem:(k,v)=>storage.set(k,String(v)), removeItem:k=>storage.delete(k) };
const document = { createElement(){ let html=''; return { set innerHTML(v){html=String(v)}, get textContent(){return html.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>') } }; } };
const window = {};
async function fetch(url) {
  const u = new URL(url);
  if (u.hostname === 'ar.wikipedia.org') return { ok:true, json:async()=>({query:{search:[{title:'VoidOS',snippet:'نظام تشغيل تجريبي <b>مفتوح</b>'},{title:'نواة النظام',snippet:'معلومات عن النواة'}]}}) };
  if (u.hostname === 'api.duckduckgo.com') return { ok:true, json:async()=>({Heading:'VoidOS',AbstractText:'ملخص من مصدر عام',AbstractURL:'https://example.org/voidos',AbstractSource:'Example',RelatedTopics:[{FirstURL:'https://example.org/kernel',Text:'Kernel - معلومات عن النواة'}]}) };
  throw Error('Unexpected endpoint '+url);
}
const context = vm.createContext({ window, localStorage, document, URL, fetch, AbortController, setTimeout, clearTimeout, Date, console });
vm.runInContext(fs.readFileSync(path.join(base,'js/brain/hippocampus/webMemory.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(base,'js/brain/webSearch.js'),'utf8'),context);
(async()=>{
  const result = await window.ChaosWebSearch.searchDetailed('VoidOS',{limit:10});
  assert.equal(result.results.length,4);
  assert.equal(result.results[0].title,'VoidOS');
  assert.equal(result.results[0].url,'https://ar.wikipedia.org/wiki/VoidOS');
  assert.equal(window.ChaosWebMemory.listSearches().length,1);
  window.ChaosWebSearch.clearRuntimeCache();
  const cached = await window.ChaosWebSearch.searchDetailed('VoidOS',{limit:10});
  assert.equal(cached.cached,true);
  assert.equal(cached.results.length,4);
  assert.equal(window.ChaosWebMemory.enabled(),true);
  localStorage.setItem('chaosMemoryEnabled','false');
  assert.equal(window.ChaosWebMemory.enabled(),false);
  assert.equal(window.ChaosWebMemory.search('VoidOS',10).length,0);
  console.log('PASS: multi-source web search, safe result URLs, bounded search memory, and memory cache retrieval');
})().catch(error=>{console.error(error);process.exitCode=1});
