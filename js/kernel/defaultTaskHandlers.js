/* CHAOSOS safe default job handlers. Only allowlisted read-only operations are exposed. */
(function(g){'use strict';
 const T=g.VoidTaskManager;if(!T)return;
 const summary=(value,fallback)=>String(value||fallback).replace(/[\u0000-\u001f]/g,' ').slice(0,280);
 T.registerHandler('system.diagnostics.snapshot',async(_payload,{signal}={})=>{
  if(signal?.aborted)throw Object.assign(new Error('Cancelled'),{code:'CANCELLED'});
  const s=g.VoidKernelDiagnostics?.snapshot?.()||{version:g.VoidKernel?.version||'unknown',checks:{kernel:!!g.VoidKernel}};
  const good=Object.values(s.checks||{}).filter(Boolean).length,total=Object.keys(s.checks||{}).length;
  return{summary:`لقطة تشخيصية محلية: ${good}/${total} فحوص متصلة؛ إصدار النواة ${s.version||'غير معروف'}.`};
 },{title:'لقطة تشخيصية',timeoutMs:4000});
 T.registerHandler('system.cognitive.evaluate',async(_payload,{signal}={})=>{
  if(signal?.aborted)throw Object.assign(new Error('Cancelled'),{code:'CANCELLED'});
  const result=g.CHAOSAI?.evaluate?.();if(!result)throw Object.assign(new Error('Cognitive engine unavailable'),{code:'COGNITIVE_ENGINE_UNAVAILABLE'});
  return{summary:`اكتمل تقييم CHAOSAI محليًا: ${result.measuredIntents||0} نوايا مقاسة، ${result.recommendations?.length||0} توصيات. لا تغييرات تلقائية في الكود.`};
 },{title:'تقييم CHAOSAI',timeoutMs:4000});
 T.registerHandler('system.services.health-check',async(_payload,{signal,reportProgress}={})=>{
  const supervisor=g.VoidServiceSupervisor;if(!supervisor)throw Object.assign(new Error('Service supervisor unavailable'),{code:'SUPERVISOR_UNAVAILABLE'});
  const list=supervisor.list();let healthy=0,unavailable=0,degraded=0;
  for(let i=0;i<list.length;i++){
   if(signal?.aborted)throw Object.assign(new Error('Cancelled'),{code:'CANCELLED'});
   const item=list[i],r=await supervisor.check(item.id);if(!item.available||r.health==='unavailable')unavailable++;else if(r.health==='healthy'||r.health==='stopped')healthy++;else degraded++;
   reportProgress?.((i+1)/Math.max(1,list.length)*100);
  }
  return{summary:`اكتمل فحص الخدمات: ${healthy} سليمة/متوقفة، ${unavailable} غير متاحة، ${degraded} متدهورة من أصل ${list.length}.`};
 },{title:'فحص صحة الخدمات',timeoutMs:12000});
 T.registerHandler('system.cognitive.explain-last-plan',async(_payload,{signal}={})=>{
  if(signal?.aborted)throw Object.assign(new Error('Cancelled'),{code:'CANCELLED'});
  const plan=g.CHAOSAI?.explain?.();return{summary:plan?summary(`آخر خطة: ${plan.intent?.type||'غير معروف'} → ${plan.route||'غير محدد'}، الثقة ${Math.round((plan.adjustedConfidence||0)*100)}%.`,'خطة غير متاحة.'):'لا توجد خطة محفوظة في الجلسة.'};
 },{title:'شرح آخر خطة توجيه',timeoutMs:3000});
})(window);
