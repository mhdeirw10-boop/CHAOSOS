/* CHAOSAI Adaptive Agent v3.0.0 — bounded local planning and auditable execution. */
(function (g) {
  'use strict';
  if (g.CHAOSAIAdaptiveAgent?.version === '3.0.0') return;
  const MAX_GOAL = 4000, MAX_STEPS = 8, KEY = 'chaosai_adaptive_metrics_v1';
  const traces = [];
  const clean = (v, n=400) => String(v ?? '').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, ' ').trim().slice(0,n);
  const normalize = v => clean(v, MAX_GOAL).normalize('NFKC').toLocaleLowerCase('ar').replace(/[ً-ٰٟـ]/g,'').replace(/[أإآ]/g,'ا');
  function metrics() { try { const x=JSON.parse(g.localStorage.getItem(KEY)||'{}'); return x&&typeof x==='object'?x:{total:0,success:0,failed:0,ratings:0,routes:{}}; } catch { return {total:0,success:0,failed:0,ratings:0,routes:{}}; } }
  function saveMetrics(m) { try { g.localStorage.setItem(KEY, JSON.stringify(m)); return true; } catch { return false; } }
  function feedbackBias(route) {
    const row=metrics().feedback?.[route];
    if(!row||Number(row.count||0)<2||!Number.isFinite(Number(row.average)))return{bias:0,samples:Number(row?.count||0),averageRating:row?Number(row.average):null};
    // Feedback can resolve close classifications, but cannot override high-confidence action cues.
    const strength=Math.min(1.5,Number(row.count)/2);
    const bias=Math.max(-1.5,Math.min(1.5,((Number(row.average)-3)/2)*strength));
    return{bias,samples:Number(row.count),averageRating:Number(row.average)};
  }
  function chooseRoute(text) {
    const q=normalize(text),candidates=[];
    const rules=[
      {route:'app.navigation',pattern:/(?:افتح|افتحي|شغل|شغّل|شغلي|انتقل|روح الى|open|launch)\s+/,weight:24},
      {route:'knowledge.math',pattern:/(?:احسب|حساب|ناتج|يساوي|\d\s*[+*/%-]\s*\d|calculate)/,weight:19},
      {route:'explicit.search',pattern:/(?:ابحث|مصدر|روابط|الويب|internet|search web)/,weight:18},
      {route:'task.planning',pattern:/(?:مهمة|المهام|خطة عمل|رتب|جدول|task|plan)/,weight:16},
      {route:'system.cloud-status',pattern:/(?:سحابة|خادم|cloud|server)/,weight:15},
      {route:'knowledge.math',pattern:/(?:رياضيات|رياضيات|math)/,weight:14},
      {route:'knowledge.local',pattern:/(?:علوم|فيزياء|كيمياء|احياء|علم|فسر|اشرح|ما هو|ماهي|لماذا|كيف)/,weight:14}
    ];
    for(const rule of rules){if(!rule.pattern.test(q))continue;const fb=feedbackBias(rule.route);candidates.push({route:rule.route,baseScore:rule.weight,feedbackBias:fb.bias,score:rule.weight+fb.bias,samples:fb.samples,averageRating:fb.averageRating});}
    candidates.sort((a,b)=>b.score-a.score||b.baseScore-a.baseScore);
    if(!candidates.length)return{route:'conversation.local',baseScore:0,feedbackBias:0,samples:0,averageRating:null,runnerUp:null};
    const best=candidates[0];return{...best,runnerUp:candidates[1]?{route:candidates[1].route,score:candidates[1].score}:null};
  }
  function propose(goal, options={}) {
    const original=String(goal ?? '').trim(); if(!original) return {ok:false,code:'EMPTY_GOAL',message:'اكتب هدفًا أولًا.'};
    if(original.length>MAX_GOAL) return {ok:false,code:'GOAL_TOO_LONG',message:'تجاوز الهدف الحد المسموح.'};
    const text=clean(original,MAX_GOAL);
    const security=g.ChaosSecurity?.inspectQuery?.(text); if(security&&!security.safe) return {ok:false,code:'SECURITY_REJECTED',message:'رفضت طبقة الأمان الطلب قبل التخطيط.'};
    const routeChoice=chooseRoute(text),route=routeChoice.route, language=g.CHAOSOSCore?.plan?.(text,{history:Array.isArray(options.history)?options.history:[]})||g.CHAOSAILanguageEngine?.plan?.(text,{history:Array.isArray(options.history)?options.history:[]})||null;
    const steps=[{id:'understand',kind:'analysis',label:'فهم الهدف وتحديد النية',tool:null,permission:'local'}];
    if(route==='app.navigation') steps.push({id:'locate-app',kind:'resolve',label:'مطابقة اسم التطبيق مع فهرس التطبيقات',tool:'apps.inventory',permission:'read-only'});
    else if(route==='system.cloud-status') steps.push({id:'inspect-cloud',kind:'inspect',label:'فحص حالة السحابة دون إرسال بيانات',tool:'cloud.status',permission:'read-only'});
    else if(route==='task.planning') steps.push({id:'inspect-tasks',kind:'inspect',label:'فحص طابور المهام المحلي',tool:'tasks.status',permission:'read-only'});
    else if(route.startsWith('knowledge')) steps.push({id:'retrieve-knowledge',kind:'retrieve',label:'استرجاع المعرفة المحلية المتخصصة',tool:'knowledge.search',permission:'read-only'});
    else if(route==='explicit.search') steps.push({id:'search-boundary',kind:'inspect',label:'تحديد حد البحث الخارجي؛ لا اتصال تلقائي',tool:null,permission:'explicit-consent'});
    steps.push({id:'verify',kind:'verify',label:'التحقق من النتيجة وتحديد القيود',tool:null,permission:'local'});
    if(steps.length>MAX_STEPS) steps.length=MAX_STEPS;
    const plan={ok:true,id:'agent_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),goalLength:text.length,route,steps,modelProfile:{mode:'local-adaptive-orchestration',neuralModelLoaded:false,cloudUsed:false},corePlan:language?{intent:language.intent?.type||'unknown',confidence:Number(language.confidence||0),algorithm:language.algorithm||'local'}:null,routeAnalysis:{selected:route,baseScore:routeChoice.baseScore||0,feedbackBias:routeChoice.feedbackBias||0,feedbackSamples:routeChoice.samples||0,averageRating:routeChoice.averageRating??null,runnerUp:routeChoice.runnerUp||null,policy:'explicit cues dominate; feedback only resolves close routes'},policies:{maxSteps:MAX_STEPS,generatedCodeExecution:false,implicitCloud:false,rawGoalStored:false,writeActionsRequireExplicitConfirmation:true},createdAt:Date.now()};
    return JSON.parse(JSON.stringify(plan));
  }
  async function run(goal, options={}) {
    const p=propose(goal,options); if(!p.ok) return p;
    const started=Date.now(), results=[], q=clean(goal,MAX_GOAL); let finalAnswer='',status='completed';
    for(const step of p.steps){
      const row={id:step.id,status:'running',startedAt:Date.now()};
      try {
        if(step.id==='understand') row.result={route:p.route,intent:p.corePlan?.intent||'unknown',confidence:p.corePlan?.confidence||0};
        else if(step.tool && g.CHAOSOSCore?.invokeTool){
          let args={};
          if(step.tool==='knowledge.search') args={query:q};
          const r=await g.CHAOSOSCore.invokeTool(step.tool,args,{confirmed:false});
          row.result=r;
          if(step.tool==='knowledge.search'){
            if(r.ok&&r.result?.answer) finalAnswer=String(r.result.answer).slice(0,16000);
            else { const local=g.CHAOSKnowledgeRouter?.route?.(q); if(local?.handled&&local.answer){row.result={ok:true,tool:step.tool,fallback:'knowledge-router',result:{module:local.module,confidence:local.confidence,answerLength:String(local.answer).length}};finalAnswer=String(local.answer).slice(0,16000);} }
          }
          if(step.tool==='apps.inventory'){
            const catalog=Array.isArray(g.VoidAppCatalog?.apps)?g.VoidAppCatalog.apps:[];
            const raw=catalog.length?catalog:(g.VoidAppManager?.list?.()||r.result||[]);
            const target=normalize(q.replace(/^(افتح|افتحي|شغل|شغّل|شغلي|انتقل الى|روح الى|open|launch)\s+/i,'').trim());
            const match=target?raw.find(x=>{const names=[x.id,x.title,x.path,...(x.tags||[])].filter(Boolean).map(normalize);return names.some(n=>n===target||n.includes(target)||target.includes(n)&&n.length>3)}):null;
            row.result={ok:true,tool:step.tool,result:{found:!!match,app:match?{id:match.id,title:match.title,path:match.path}:null,count:raw.length}};
            if(match) finalAnswer='وجدت التطبيق '+match.title+' في الفهرس المحلي. المسار: '+match.path+'. لم أفتحه تلقائيًا؛ فتحه يحتاج تأكيدًا منفصلًا.';
            else finalAnswer='لم أجد تطبيقًا يطابق الاسم في فهرس التطبيقات المحلي ('+raw.length+' تطبيقًا مسجلًا).';
          }
          if(step.tool==='cloud.status'&&r.ok){const d=r.result||{};finalAnswer='حالة السحابة محليًا: '+((d.cloud?.enabled||d.ai?.enabled||d.sync?.enabled)?'هناك مكوّن مفعّل حسب الإعدادات':'معطّلة/غير مهيأة')+'. لم أرسل أي بيانات إلى خادم.';}
          if(step.tool==='tasks.status'&&r.ok){const d=r.result||{};const count=Number(d.total??d.count??d.pending??0);finalAnswer='قرأت حالة مدير المهام المحلي. عدد المهام المبلغ عنه: '+(Number.isFinite(count)?count:'غير متاح')+'. لم أعدّل أي مهمة.';}
        } else if(step.id==='retrieve-knowledge') { const r=g.CHAOSKnowledgeRouter?.route?.(q); row.result=r?.handled?{module:r.module,confidence:r.confidence,source:r.source}: {handled:false}; if(r?.handled&&r.answer) finalAnswer=String(r.answer).slice(0,16000); }
        else if(step.id==='search-boundary') row.result={requiresConsent:true,cloudUsed:false,message:'البحث الخارجي غير منفّذ في هذه الخطة المحلية.'};
        else if(step.id==='verify') row.result={hasAnswer:!!finalAnswer,route:p.route,rawInputStored:false,cloudUsed:false};
        else row.result={available:true};
        row.status='completed';
      } catch(e){row.status='failed';row.error=clean(e?.code||e?.name||'STEP_FAILED',80);status='partial';}
      row.elapsedMs=Date.now()-row.startedAt;results.push(row);
      if(row.status==='failed') break;
    }
    if(!finalAnswer){
      if(p.route==='explicit.search') finalAnswer='حددت أن الطلب يحتاج بحثًا خارجيًا. لم يُرسل أي طلب إلى الإنترنت؛ افتح VoidBrowserX وأكد البحث هناك.';
      else if(p.route==='app.navigation') finalAnswer='حللت طلب فتح تطبيق، لكن لم أُنفّذ تنقلًا تلقائيًا لأن اسم التطبيق أو هدف التنقل يحتاج مطابقة صريحة.';
      else if(p.route==='system.cloud-status') finalAnswer='فُحص مسار حالة السحابة إن كانت أدوات النواة محمّلة. السحابة لا تُستخدم لتوليد الإجابة في هذه المهمة.';
      else if(p.route==='task.planning') finalAnswer='أعددت خطوة لفحص المهام المحلية. إدارة المهام الفعلية لا تعني تنفيذ أعمال كتابة أو حذف دون تأكيد.';
      else finalAnswer='لم تعثر المعرفة المحلية على إجابة كافية. تستطيع CHAOSAI إعداد خطة؛ أما التوليد اللغوي المتقدم فيتطلب نموذجًا حقيقيًا مهيأً وموافقة منفصلة قبل إرسال الطلب.';
    }
    const trace={id:p.id,route:p.route,status,stepCount:results.length,completedSteps:results.filter(r=>r.status==='completed').length,elapsedMs:Date.now()-started,goalLength:q.length,answerLength:finalAnswer.length,rawGoalStored:false,rawAnswerStored:false,cloudUsed:false,createdAt:Date.now()};
    traces.unshift(trace); while(traces.length>30) traces.pop();
    const m=metrics();m.total=(m.total||0)+1;m[status==='completed'?'success':'failed']=(m[status==='completed'?'success':'failed']||0)+1;m.routes=m.routes||{};m.routes[p.route]=(m.routes[p.route]||0)+1;saveMetrics(m);
    try{g.VoidEventBus?.emit?.('chaosai:agent-complete',{id:trace.id,status,route:p.route,steps:results.length,elapsedMs:trace.elapsedMs})}catch{}
    return {ok:status==='completed',status,plan:p,steps:results.map(r=>({id:r.id,status:r.status,elapsedMs:r.elapsedMs,error:r.error||null,result:summarize(r.result)})),answer:finalAnswer,trace};
  }
  function summarize(v){if(v==null)return null;try{const s=JSON.stringify(v);return JSON.parse(s.length>1800?s.slice(0,1790)+'"…"':s)}catch{return clean(v,500)}}
  function feedback(route,rating){const n=Number(rating);if(!Number.isInteger(n)||n<1||n>5)return{ok:false,code:'INVALID_RATING'};const m=metrics();m.ratings=(m.ratings||0)+1;m.feedback=m.feedback||{};const key=clean(route||'unknown',80);const row=m.feedback[key]||{count:0,sum:0};row.count++;row.sum+=n;row.average=Number((row.sum/row.count).toFixed(2));m.feedback[key]=row;const saved=saveMetrics(m);return{ok:saved,rating:n,route:key,aggregate:row,rawTextStored:false};}
  function status(){const m=metrics();return{version:'3.0.0',available:true,mode:'bounded-local-agent',neuralModelLoaded:false,cloudEnabled:false,maxSteps:MAX_STEPS,metrics:{total:m.total||0,success:m.success||0,failed:m.failed||0,ratings:m.ratings||0,routes:m.routes||{},feedback:m.feedback||{}},rawGoalsStored:false,generatedCodeExecuted:false};}
  g.CHAOSAIAdaptiveAgent={version:'3.0.0',propose,run,feedback,status,traces:()=>traces.map(x=>({...x})),clearTrace:()=>{traces.length=0;return{ok:true}}};
})(window);
