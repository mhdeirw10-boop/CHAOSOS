/* CHAOSAI decision planner — explainable, bounded routing; never evaluates generated code. */
(function(g){'use strict';
 const SERVICE_BY_INTENT={calculator:'math.local',store:'apps.catalog',websearch:'web.search',open:'apps.launch',note:'notes.local',task:'planner.local',event:'calendar.local',time:'clock.local',diagnostics:'system.diagnostics',help:'help.local',conversation:'conversation.local',empty:'none'};
 const ALGORITHMS={
  calculator:{id:'local.math.safe-evaluate',fields:['expression'],steps:['التحقق من وجود تعبير رياضي','تمرير التعبير إلى الحاسبة المحلية الآمنة','إرجاع النتيجة دون فتح تطبيق']},
  store:{id:'local.apps.catalog-search',fields:['query'],steps:['تنظيف اسم التطبيق','البحث في فهرس التطبيقات المحلي','عرض الموجود فقط دون ادعاء تنزيل غير متاح']},
  websearch:{id:'local.web.search-dispatch',fields:['query'],steps:['التحقق من وجود موضوع البحث','تمرير الموضوع إلى محرك البحث المخصص','عدم فتح المتصفح تلقائيًا']},
  open:{id:'local.apps.explicit-launch',fields:['appId'],steps:['التحقق من معرّف التطبيق','تمرير الطلب إلى مدير التطبيقات','الحفاظ على قاعدة أن الفتح يجب أن يكون صريحًا']},
  note:{id:'local.notes.create',fields:['text'],steps:['التحقق من نص الملاحظة','تمرير الحقول إلى خدمة الملاحظات المحلية','إرجاع حالة الحفظ']},
  task:{id:'local.tasks.create',fields:['text'],steps:['التحقق من عنوان المهمة','تمرير العنوان إلى مدير المهام المحلي','إرجاع حالة الإضافة']},
  event:{id:'local.calendar.create',fields:['date','text'],steps:['التحقق من التاريخ والعنوان','تمرير الحقول إلى خدمة التقويم','إرجاع حالة الإضافة']},
  time:{id:'local.clock.read',fields:[],steps:['قراءة الوقت المحلي للجهاز','تنسيق النتيجة بلغة المستخدم']},
  diagnostics:{id:'local.system.diagnostics',fields:[],steps:['قراءة حالات النواة والوحدات','عرض المؤشرات دون تعديل الخدمات']},
  help:{id:'local.help.index',fields:[],steps:['مطابقة طلب المساعدة مع قائمة الأوامر','عرض أمثلة معروفة']},
  conversation:{id:'local.conversation.engine',fields:[],steps:['ترك النص لمحرك المحادثة المحلي','عدم تخزين نص الطلب في ملف التعلّم']},
  empty:{id:'none',fields:[],steps:['لا شيء؛ الطلب فارغ']}
 };
 const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
 function performanceFor(type){const s=g.CHAOSAIUserModel?.summary?.();return(s?.outcomes||[]).find(x=>x.intent===type)||null}
 function paramsFor(intent){const t=intent.type,p={};if(t==='calculator')p.expression=String(intent.expression||'').slice(0,120);else if(t==='store'||t==='websearch')p.query=String(intent.query||'').slice(0,500);else if(t==='open')p.appId=String(intent.app||'').slice(0,100);else if(['note','task'].includes(t))p.text=String(intent.text||'').slice(0,2000);else if(t==='event'){p.date=String(intent.date||'').slice(0,10);p.text=String(intent.text||'').slice(0,2000)}return p}
 function plan(input){
  const safeInput=String(input??'').slice(0,12000);
  const intent=g.VoidIntentEngine?.classify?.(safeInput)||{type:'unknown',confidence:0,original:safeInput};
  const baseType=intent.type||'unknown';
  // Prefer a local specialist for generic conversation; never overwrite explicit system actions.
  const specialist=['conversation','unknown'].includes(baseType)?g.CHAOSKnowledgeRouter?.route?.(safeInput):null;
  if(specialist?.handled){
   const moduleId=String(specialist.module||'general').slice(0,80),type='knowledge.'+moduleId;
   const metric=performanceFor(type),sampleCount=metric?.count||0,rate=metric?.successRate;
   const confidence=clamp(Number(specialist.confidence)||0.75);
   const negative=metric?.explicitNegative||0,positive=metric?.explicitPositive||0;
   const reviewRequired=(sampleCount>=4&&rate!==null&&rate<0.5)||(negative-positive>=3&&negative>=3);
   return{version:'1.2.0',intent:{type,confidence,needsClarification:false},route:'knowledge.local.'+moduleId,action:'respond-local-knowledge',adjustedConfidence:confidence,requiresExplicitAction:false,executionPlan:{algorithm:'local.knowledge.'+moduleId+'.match-and-answer',inputs:{moduleId,queryLength:safeInput.length},requiredFields:['moduleId'],missingFields:[],steps:['تطبيع النص العربي وتوحيد صيغ الحروف','اختيار الوحدة المتخصصة حسب أولوية المطابقة','تنفيذ المطابقة المحلية المحددة في الوحدة','عرض الإجابة مع بيان أنها معرفة محلية','عند غياب مطابقة موثوقة، عدم اختلاق حقيقة أو مصدر'],ready:true,rawPromptPersisted:false},learningState:{sampleCount,successRate:rate===undefined?null:rate,explicitPositive:positive,explicitNegative:negative,reviewRequired},warnings:['المعرفة ناتجة من وحدة محلية؛ قد تحتاج المعلومات الحديثة أو عالية الدقة إلى مصادر موثوقة.'].concat(reviewRequired?['توجد نتائج ضعيفة في هذا المسار؛ يلزم مراجعة القواعد ولا يُعدّل الكود تلقائيًا.']:[]),explanation:`اختيرت وحدة المعرفة المحلية «${moduleId}» بدرجة توجيه ${confidence.toFixed(2)}. تحتوي الخطة على معرّف الوحدة وطول الاستعلام فقط؛ لا تحفظ نص الطلب الخام في ملف التعلّم.`};
  }
  const type=baseType,route=SERVICE_BY_INTENT[type]||'conversation.local',algorithm=ALGORITHMS[type]||ALGORITHMS.conversation,inputs=paramsFor(intent),missingFields=algorithm.fields.filter(key=>typeof inputs[key]!=='string'||!inputs[key].trim());
  const metric=performanceFor(type),sampleCount=metric?.count||0,rate=metric?.successRate;
  const adjustedConfidence=sampleCount>=4&&rate!==null&&rate!==undefined?clamp((Number(intent.confidence)||0)*(0.82+clamp(rate)*0.18)):clamp(Number(intent.confidence)||0);
  const negative=metric?.explicitNegative||0,positive=metric?.explicitPositive||0;
  const reviewRequired=(sampleCount>=4&&rate!==null&&rate<0.5)||(negative-positive>=3&&negative>=3);
  let action='respond-locally';if(type==='open')action='explicit-app-launch';else if(type==='websearch')action='explicit-web-search';else if(['calculator','store','note','task','event','time','help','diagnostics'].includes(type))action='local-service';else if(type==='empty')action='no-op';
  const warnings=[];
  const clarificationNeeded=!!intent.needsClarification||missingFields.length>0;
  if(clarificationNeeded){action='ask-for-clarification';warnings.push('لا تكتمل الخطة قبل توفير الحقول المطلوبة.');}
  if(adjustedConfidence<0.55&&type!=='empty')warnings.push('الثقة منخفضة؛ راجع التصنيف قبل أي إجراء حساس.');
  if(type==='websearch')warnings.push('البحث عبر الشبكة لا يبدأ إلا عبر المسار الصريح المخصص له.');
  if(type==='open')warnings.push('فتح التطبيق أثر جانبي صريح ويجب أن يطلبه المستخدم.');
  if(reviewRequired)warnings.push('سجل التعلّم أظهر إخفاقات أو تقييمات سلبية متكررة؛ يوصى بمراجعة قواعد هذا المسار. لم يتغير الكود تلقائيًا.');
  return{version:'1.2.0',intent:{type,confidence:clamp(Number(intent.confidence)||0),needsClarification:clarificationNeeded},route,action,adjustedConfidence,requiresExplicitAction:['explicit-app-launch','explicit-web-search'].includes(action),executionPlan:{algorithm:algorithm.id,inputs,requiredFields:algorithm.fields.slice(),missingFields,steps:algorithm.steps.slice(),ready:!clarificationNeeded,rawPromptPersisted:false},learningState:{sampleCount,successRate:rate===undefined?null:rate,explicitPositive:positive,explicitNegative:negative,reviewRequired},warnings,explanation:`صُنّف الطلب على أنه «${type}»، واختير المسار «${route}»، والخوارزمية «${algorithm.id}» وفق جدول توجيه ثابت قابل للتدقيق. الحقول والخطوات معروضة للمراجعة، ولا يُولّد النظام كودًا لتنفيذه.`};
 }
 g.CHAOSAIDecisionEngine={version:'1.2.0',plan};
})(window);
