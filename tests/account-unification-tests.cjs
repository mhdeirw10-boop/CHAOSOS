'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'..');
const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const listeners={};
class CustomEvent { constructor(type,options={}) { this.type=type; this.detail=options.detail; this.key=options.key; } }
const window={localStorage,VoidOS:{publishIdentity:(username,email,source)=>{window.lastIdentity={username,email,source};}},addEventListener:(name,fn)=>{(listeners[name] ||= []).push(fn);},dispatchEvent:event=>{for(const fn of listeners[event.type]||[])fn(event);return true;}};
const ctx=vm.createContext({window,localStorage,CustomEvent,Date,console});
vm.runInContext(fs.readFileSync(path.join(base,'js/accountManager.js'),'utf8'),ctx,{filename:'accountManager.js'});
const manager=window.ChaosAccountManager;
assert.ok(manager,'unified account manager loads');
let p=manager.publishShellLogin('Void Walker','vw@example.invalid');
assert.equal(p.ok,true);
assert.equal(manager.getProfile().username,'Void Walker');
assert.equal(JSON.parse(store.get('chaosos_unified_account_v2')).source,'voidos-shell');
assert.equal(window.lastIdentity.username,'Void Walker');
// Shell session takes precedence when both local app account stores exist.
store.set('voidos_local_accounts_v1',JSON.stringify({'void walker':{username:'Void Walker'}}));
store.set('voidos_local_session_v1',JSON.stringify({username:'void walker',displayName:'Void Walker'}));
store.set('voidStoreV1DemoAccount',JSON.stringify({username:'StorePerson',email:'store@example.invalid'}));
store.set('voidStoreV1DemoSession','StorePerson');
assert.equal(manager.sync().username,'Void Walker');
// Without shell login, the active local Store identity may feed the unified display profile.
store.delete('voidos_local_session_v1');
assert.equal(manager.sync().username,'StorePerson');
assert.equal(manager.status().scope,'this-device-only');
assert.equal(manager.status().passwordCredentialsMerged,false,'profile sync must not falsely claim credential merge');
console.log('PASS: shared device-local profile, shell/store source precedence, legacy-safe sync, and honest credential-boundary status');
