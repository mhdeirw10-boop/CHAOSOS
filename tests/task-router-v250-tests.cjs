const assert = require('node:assert/strict');
const fs = require('node:fs'); const vm = require('node:vm'); const path = require('node:path');
const emitted=[]; let opened=[];
const window={
  VoidIntentEngine:{classify(raw){const q=String(raw);if(q.startsWith('calc:'))return{type:'calculator',expression:q.slice(5)};if(q.startsWith('store:'))return{type:'store',query:q.slice(6)};if(q.startsWith('open:'))return{type:'open',app:q.slice(5)};return{type:'conversation'};}},
  CHAOS:{evaluateMath(expr){if(expr==='(2+3)*4')return 20;throw Error('bad expression');},open(app){opened.push(app);return{ok:true,message:'opened'};},execute(){return{ok:true,message:'saved'};}},
  VoidAppManager:{list(){return[{id:'void-notes',title:'Void Notes',path:'apps/void-notes/index.html',state:{enabled:true}}];},byPath(p){return this.list().find(x=>x.path===p);}},
  VoidEventBus:{emit(...x){emitted.push(x);}},VoidKernelDiagnostics:{reportText(){return 'ok';}}
};
const context={window,globalThis:window,localStorage:{setItem(){},getItem(){return null;}},Date,Math,Set,Map,JSON,String,Error};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/kernel/taskRouter.js'),'utf8'),context,{filename:'taskRouter.js'});
let r=window.VoidTaskRouter.route('calc:(2+3)*4');assert.equal(r.handled,true);assert.equal(r.ok,true);assert.match(r.message,/20/);assert.equal(opened.length,0,'calculation must not open an app');
r=window.VoidTaskRouter.route('store:Void Notes');assert.equal(r.ok,true);assert.match(r.message,/apps\/void-notes/);assert.equal(opened.length,0,'store search must not open the store');
r=window.VoidTaskRouter.route('open:apps/void-notes/index.html');assert.equal(r.ok,true);assert.equal(opened[0],'apps/void-notes/index.html','explicit open command is honored');
r=window.VoidTaskRouter.route('hello there');assert.equal(r.handled,false,'ordinary conversation is left to conversation engine');
r=window.VoidTaskRouter.route('calc:bad');assert.equal(r.ok,false,'invalid calculation must fail safely');
console.log('PASS 5 task-router scenarios');
