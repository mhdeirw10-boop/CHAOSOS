/* CHAOSOS Runtime Orchestrator v3.1.0 — local-first service lifecycle and capability boundary. */
(function (g) {
  'use strict';
  if (g.CHAOSOSRuntime?.version === '3.1.0') return;
  const services = new Map();
  const clean = (v, n=240) => String(v ?? '').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, ' ').trim().slice(0,n);
  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch { return null; } };
  const emit = (name, detail) => { try { g.VoidEventBus?.emit?.('runtime:' + name, detail); } catch {} };
  function register(id, definition={}) {
    const key = clean(id,80).toLowerCase();
    if (!/^[a-z][a-z0-9_.-]{1,79}$/.test(key) || !definition || typeof definition !== 'object') return {ok:false,code:'INVALID_SERVICE'};
    if (services.has(key)) return {ok:false,code:'SERVICE_EXISTS'};
    const caps = Array.isArray(definition.capabilities) ? [...new Set(definition.capabilities.map(x=>clean(x,80)).filter(x=>/^[a-z0-9_.-]+$/i.test(x)))].slice(0,40) : [];
    services.set(key,{id:key,title:clean(definition.title||key,100),description:clean(definition.description||'',260),capabilities:caps,readOnly:definition.readOnly!==false,handler:typeof definition.handler==='function'?definition.handler:null,available:definition.available!==false,createdAt:Date.now(),calls:0,failures:0});
    emit('service-registered',{id:key,capabilities:caps}); return {ok:true,id:key};
  }
  function inventory(){return [...services.values()].map(s=>({id:s.id,title:s.title,description:s.description,capabilities:s.capabilities.slice(),readOnly:s.readOnly,available:s.available,hasHandler:!!s.handler,calls:s.calls,failures:s.failures}));}
  async function invoke(id, capability, args={}, options={}) {
    const s=services.get(clean(id,80).toLowerCase());
    if(!s||!s.available||!s.handler)return {ok:false,code:'SERVICE_UNAVAILABLE',message:'الخدمة المحلية غير متاحة.'};
    const cap=clean(capability,80); if(!s.capabilities.includes(cap))return {ok:false,code:'CAPABILITY_DENIED',message:'الخدمة لا تعلن هذه الصلاحية.'};
    if(!s.readOnly && options.confirmed!==true)return {ok:false,code:'CONFIRMATION_REQUIRED',message:'تتطلب العملية تأكيدًا صريحًا قبل التنفيذ.'};
    s.calls++;
    try {const result=await s.handler(clone(args)||{}, {confirmed:options.confirmed===true,source:clean(options.source||'local-ui',60)});emit('service-invoked',{id:s.id,capability:cap,ok:true});return {ok:true,service:s.id,capability:cap,result:clone(result)};}
    catch(error){s.failures++;emit('service-invoked',{id:s.id,capability:cap,ok:false,code:clean(error?.code||'SERVICE_FAILED',80)});return {ok:false,code:clean(error?.code||'SERVICE_FAILED',80),message:'فشل تنفيذ الخدمة المحلية.'};}
  }
  function boot(){
    const safeRegister=(id,def)=>{if(!services.has(id))register(id,def)};
    safeRegister('runtime.kernel',{title:'Local Kernel',description:'Runtime inventory and health metadata',capabilities:['status.read'],readOnly:true,handler:()=>({kernel:g.VoidKernel?.version||null,core:!!g.CHAOSOSCore,runtime:'local-first',nativePrivileges:false})});
    safeRegister('runtime.knowledge',{title:'Local Knowledge Router',description:'Search domain-specific local knowledge',capabilities:['knowledge.search'],readOnly:true,handler:({query}={})=>{const r=g.CHAOSKnowledgeRouter?.route?.(clean(query,12000));return r?.handled?{handled:true,module:r.module,title:r.title,confidence:r.confidence,source:r.source,answer:r.answer}:{handled:false};}});
    safeRegister('runtime.apps',{title:'App Catalog',description:'List registered application metadata',capabilities:['apps.list'],readOnly:true,handler:()=>((g.VoidAppCatalog?.apps)||[]).map(a=>({id:a.id,title:a.title,path:a.path,category:a.category}))});
    safeRegister('runtime.android',{title:'Android Capability Boundary',description:'Report native capabilities without requesting or bypassing permissions',capabilities:['android.capabilities.read'],readOnly:true,handler:()=>g.VoidAndroidBridge?.list?.()||{available:false,realAndroidOSControl:false}});
    const report=status();emit('booted',report);return report;
  }
  function status(){const list=inventory();return {version:'3.1.0',mode:'local-first-web-runtime',available:true,serviceCount:list.length,availableServices:list.filter(s=>s.available).length,failedCalls:list.reduce((n,s)=>n+s.failures,0),cloudAutoEnabled:false,rawPromptsPersistedByRuntime:false,generatedCodeExecuted:false,androidKernelReplacement:false,services:list};}
  function healthCheck(){const checks={eventBus:!!g.VoidEventBus,serviceRegistry:!!g.VoidServiceRegistry,kernel:!!g.VoidKernel,knowledgeRouter:!!g.CHAOSKnowledgeRouter,languageRuntime:!!g.CHAOSLocalLanguageRuntime,androidBridge:!!g.VoidAndroidBridge};return {version:'3.1.0',ok:Object.values(checks).filter(Boolean).length===Object.keys(checks).length,checks,missing:Object.keys(checks).filter(k=>!checks[k])};}
  g.CHAOSOSRuntime={version:'3.1.0',register,invoke,inventory,status,healthCheck,boot};
  const start=()=>{try{boot()}catch(e){emit('boot-error',{code:clean(e?.name||'BOOT_FAILED',80)});}};
  if(g.document?.readyState==='loading')g.document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
