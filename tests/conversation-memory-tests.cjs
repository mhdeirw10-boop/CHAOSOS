'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '..');
function makeMemory() {
  const store = new Map();
  const localStorage = { getItem:k=>store.has(k)?store.get(k):null, setItem:(k,v)=>store.set(k,String(v)), removeItem:k=>store.delete(k) };
  const window = { localStorage, dispatchEvent() {}, addEventListener() {} };
  const ctx = vm.createContext({ window, localStorage, Date, console, URL });
  vm.runInContext(fs.readFileSync(path.join(base,'js/brain/conversationMemory.js'),'utf8'),ctx,{filename:'conversationMemory.js'});
  return { memory:window.CHAOSConversationMemory, store };
}
const { memory, store } = makeMemory();
let messages = [
  {role:'user',content:'العراق',timestamp:1},
  {role:'assistant',content:'العراق دولة في غرب آسيا، وعاصمتها بغداد. هل تريد معرفة تاريخه أو أخباره؟',timestamp:2},
  {role:'user',content:'أبحث',timestamp:3}
];
let context = memory.buildContext('iraq-flow',messages,'أبحث');
assert.equal(context.topic.entity,'العراق','single Iraq entity remains current after search follow-up');
assert.equal(memory.parseSearchRequest('أبحث','iraq-flow',messages).topic,'العراق','bare search resolves prior topic');
messages.push({role:'assistant',content:'سيتم البحث عن العراق عند توفر الاتصال.',timestamp:4});
messages.push({role:'user',content:'دولة في غرب آسيا وموطن دجلة والفرات',timestamp:5});
memory.index('iraq-flow',messages);
assert.equal(memory.currentTopic('iraq-flow',messages).entity,'العراق','geographic paraphrase infers Iraq');
messages.push({role:'user',content:'اقتصادها',timestamp:6});
assert.equal(memory.currentTopic('iraq-flow',messages).entity,'العراق','pronoun follow-up does not replace the topic anchor');
assert.match(memory.contextualReply('اقتصادها','iraq-flow',messages),/العراق|بحث/u);
const report = memory.report('iraq-flow');
assert.equal(report.totalMessages,6);
assert.ok(report.uniqueKeywords>=2);
assert.equal(report.onlineRequired,false);
// A newly imported massive chat samples a bounded old portion, indexes the recent window,
// and then continues to index new messages beyond the initial backfill size.
const large = [];
for (let i=0;i<22050;i++) large.push({role:i%2?'assistant':'user',content:i===0?'موضوعقديممميز':`رسالة محادثة رقم ${i} عن موضوع عام`,timestamp:i+100});
const largeCtx = memory.buildContext('large-flow',large,'رسالة محادثة رقم 22049');
const bigReport = memory.report('large-flow');
assert.equal(bigReport.totalMessages,22050);
assert.ok(bigReport.indexedMessages>=20000 && bigReport.indexedMessages<22050,'large transcript indexing stays bounded by sampling older messages');
assert.ok(bigReport.skippedOlderMessages>0,'older skipped count is reported');
large.push({role:'user',content:'موضوع جديد بعد الحد التفصيلي',timestamp:999999});
memory.index('large-flow',large);
assert.equal(memory.report('large-flow').totalMessages,22051);
assert.equal(memory.report('large-flow').indexedMessages,bigReport.indexedMessages+1,'future messages continue indexing after long-session backfill');
assert.ok(largeCtx.summary.length>0);
assert.ok(store.has('chaosos_conversation_index_v1'));
console.log('PASS: full-transcript topic tracking, bare search context, Iraq entity inference, anchored follow-ups, bounded large-chat sampling, and continued incremental indexing');
