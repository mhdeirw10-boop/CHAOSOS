/* CHAOSAI Intent Router v3.1.6 — deterministic routing with explicit confidence. */
(function(g){'use strict';const rules=[
{type:'story',re:/^(?:ماذا لو|تخيل|تخيّل|في عالم|سيناريو|كان يا ما كان)(?=\s|$)/u,confidence:.88},
{type:'command',re:/^(?:افتح|شغل|شغّل|أغلق|اغلق|احذف|احفظ|نفذ|نفّذ|ابدا|ابدأ|أعد تشغيل|اعد تشغيل)(?=\s|$)/u,confidence:.94},
{type:'search',re:/^(?:ابحث|أبحث|دور|دورلي|ابحثلي|search)(?=\s|$)/u,confidence:.92},
{type:'continuation',re:/^(?:كمل|اكمل|تابع|استمر|وضح اكثر|ماذا بعد|وبعدين|شنو مشاكله|ما مشاكله|ما هي مشاكله|ليش|لماذا)(?=\s|$)/u,confidence:.82},
{type:'question',re:/^(?:هل|ما|ماذا|من|متى|أين|اين|وين|كيف|كم|ليش|لماذا|شنو|شكو)(?=\s|$)/u,confidence:.82},
{type:'greeting',re:/^(?:مرحبا|هلا|السلام عليكم|صباح الخير|مساء الخير|هلو|شلونك)(?=\s|$)/u,confidence:.96},
{type:'feedback',re:/^(?:أحسنت|حلو|ممتاز|غلط|خطأ|مو صحيح|لا أقصد|اقصد)(?=\s|$)/u,confidence:.75}
];
function normalize(s){return String(s||'').trim().replace(/[إأآ]/g,'ا').replace(/[ًٌٍَُِّْـ]/g,'').replace(/[؟?!.,،؛:]+$/u,'').replace(/\s+/g,' ').toLocaleLowerCase('ar');}
function classify(input,context={}){const raw=String(input||'').trim(),n=normalize(raw);if(!n)return{type:'empty',confidence:1,needsClarification:false};for(const r of rules)if(r.re.test(n))return{type:r.type,confidence:r.confidence,needsClarification:false,raw};const pronoun=/^(?:هو|هي|هذا|هذه|هاذا|هذي|هم|هن|ها|عنه|عنها|منه|منها|بي|بها|مشاكله|مشاكلها|مميزاته|مميزاتها)(?=\s|$)/u.test(n);if(pronoun&&!context.topic)return{type:'ambiguous-reference',confidence:.35,needsClarification:true,raw};if(context.topic&&pronoun)return{type:'contextual-followup',confidence:.78,needsClarification:false,raw,topic:context.topic};return{type:'conversation',confidence:.62,needsClarification:false,raw};}
g.CHAOSIntentRouter={version:'3.1.6',classify,normalize,rules:rules.map(r=>({type:r.type,confidence:r.confidence}))};
})(window);
