'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'..');
const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>Array.from(store.keys())[i]??null,get length(){return store.size;}};
class Storage { setItem(k,v){localStorage.setItem(k,v)} removeItem(k){localStorage.removeItem(k)} }
class CustomEvent { constructor(type,options={}){this.type=type;this.detail=options.detail;} }
const listeners={};
const window={VoidOS:{openApp(path){return{ok:true,path}},goHome(){return true},notify(message){return message}},isSecureContext:false,addEventListener:(n,f)=>{(listeners[n] ||= []).push(f)},dispatchEvent:e=>{for(const f of listeners[e.type]||[])f(e);return true;}};
const navigator={onLine:false,userAgent:'test',serviceWorker:null};
const ctx=vm.createContext({window,localStorage,navigator,Storage,CustomEvent,Date,console,URL,Map,Set,Math});
vm.runInContext(fs.readFileSync(path.join(base,'js/system-core.js'),'utf8'),ctx,{filename:'system-core.js'});
assert.equal(window.VoidOS.version,'3.0.0');
assert.equal(typeof window.VoidOS.openApp,'function','system-core must preserve launcher API created before it loads');
assert.equal(typeof window.VoidOS.goHome,'function','system-core must preserve home navigation API');
assert.equal(typeof window.VoidOS.notify,'function','system-core must preserve notification bridge');
assert.equal(typeof window.VoidOS.exportLocalData,'function','system-core contributes its own services too');
assert.equal(window.VoidOS.openApp('settings.html').path,'settings.html');
console.log('PASS: shared system core preserves shell launcher APIs while adding version 3.0.0 local services');
