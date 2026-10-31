'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const base=path.join(__dirname,'..');const data=new Map();const localStorage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};let confirmValue=false;const window={VoidEventBus:{emit(){}},confirm:()=>confirmValue};const context=vm.createContext({window,localStorage,Date,console});
for(const file of ['permissionManager.js','appManager.js'])vm.runInContext(fs.readFileSync(path.join(base,'js/kernel',file),'utf8'),context,{filename:file});
assert.equal(window.VoidAppManager.list().length,24);assert.equal(window.VoidAppManager.get('browser').path,'apps/void-browserx/index.html');assert.equal(window.VoidAppManager.get('discovery').path,'apps/void-discovery/index.html');assert.equal(window.VoidPermissionManager.canLaunch('browser'),true);
assert.equal(window.VoidPermissionManager.setEnabled('browser',false),true);assert.equal(window.VoidPermissionManager.canLaunch('browser'),false);assert.equal(window.VoidPermissionManager.setEnabled('browser',true),true);
assert.equal(window.VoidPermissionManager.isGranted('browser','network'),false);confirmValue=false;assert.equal(window.VoidPermissionManager.request('browser','network','test'),false);confirmValue=true;assert.equal(window.VoidPermissionManager.request('browser','network','test'),true);assert.equal(window.VoidPermissionManager.isGranted('browser','network'),true);
assert.equal(window.VoidPermissionManager.grant('notes','storage',true),true);assert.equal(window.VoidPermissionManager.isGranted('notes','storage'),true);
console.log('PASS: app catalogue, enable/disable policy, and permission grant flows');
