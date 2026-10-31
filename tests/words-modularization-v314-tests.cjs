/* v3.1.4 modular words and command-only dispatch tests. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');const window={console,Math,Date,Map,Set,Promise,Number,String,Object,Array,RegExp,JSON};const context=vm.createContext({window,console,Math,Date,Map,Set,Promise,Number,String,Object,Array,RegExp,JSON});
function load(rel){vm.runInContext(fs.readFileSync(path.join(base,rel),'utf8'),context,{filename:rel});}
const modules=['registry','greetings','identity','aiTools','ordinary','relationships','locations','countries','archive','darkThemes','banter','stories','jokes','links','knowledgeBase','courtesy','emotions','technology','philosophy','naturalConversation','secrets'];
for(const m of modules)load(`js/brain/words/${m}.js`);load('js/brain/words/commands.js');
const W=window.CHAOSWords;assert.ok(W);assert.ok(Object.keys(W.entries()).length>=300,`expected expanded vocabulary, got ${Object.keys(W.entries()).length}`);
assert.equal(W.match('مرحبا').module,'greetings');assert.equal(W.match('من أنت').module,'identity');assert.equal(W.match('OpenAI').module,'aiTools');assert.equal(W.match('وش تبي تسوي').module,'ordinary');assert.equal(W.match('صديق').module,'relationships');assert.equal(W.match('هنا').module,'locations');assert.equal(W.match('العراق').module,'countries');assert.equal(W.match('سر').module,'archive');assert.equal(W.match('ظلام').module,'darkThemes');assert.equal(W.match('يا غبي').module,'banter');
assert.equal(W.Commands.commandsList.help.action,'show_help');assert.deepEqual(Object.keys(W.Commands.commandsList).sort(),['about','clear','help','status']);assert.equal(W.resolve('احكي نكتة').handled,true);assert.equal(W.resolve('احكي قصة غامضة').handled,true);assert.match(W.match('lore').answer,/Eye of Chaos/);
assert.equal(fs.existsSync(path.join(base,'js/brain/commands.js')),false);assert.equal(fs.existsSync(path.join(base,'js/brain/knowledge.js')),false);
for(const html of ['index.html','terminal/index.html','apps/void-manager/index.html']){const s=fs.readFileSync(path.join(base,html),'utf8');assert.match(s,/words\/registry\.js/);assert.doesNotMatch(s,/js\/brain\/commands\.js/);if(html==='terminal/index.html')assert.match(s,/words\/commands\.js/);}
assert.match(W.match('صباح الخير').answer,/الصباح/);assert.match(W.match('شكرا').answer,/العفو/);
console.log(`PASS: ${Object.keys(W.entries()).length} phrases, ${modules.length} modular word files, command-only dispatch, knowledgeBase migration, and script wiring.`);
