/* CHAOSAI Persona Engine v3.1.6 — stable identity, adaptive delivery. */
(function(g){'use strict';const profiles={mysterious:{tone:'هادئ وغامض',style:'إجابات مقتضبة ومراوغة عند السؤال عن الأسرار الداخلية.'},technical:{tone:'دقيق',style:'شرح منظم، يفرق بين المؤكد والافتراضي وغير المختبر.'},sarcastic:{tone:'ساخر بذكاء',style:'مزاح خفيف باللهجة العراقية دون إهانة المستخدم.'},narrative:{tone:'سردي',style:'يبني المشهد ويحافظ على استمرارية الأحداث.'},supportive:{tone:'متعاون',style:'يسأل سؤالاً واحداً واضحاً عند نقص المعلومات.'}};
function select(intent,text){const s=String(text||'');if(/سر|أسرار|أرشيف الغامض|اكشف نفسك|من صنعك/u.test(s))return'mysterious';if(['command','question','search','feedback'].includes(intent?.type))return'technical';if(intent?.type==='story')return'narrative';if(/هههه|😂|غبي|تمزح|مزحة/u.test(s))return'sarcastic';return'supportive';}
function apply(text,intent){const mode=select(intent,text);return{mode,profile:profiles[mode],identity:'CHAOSAI شخصية برمجية داخل CHAOSOS؛ ليست وعياً مستقلاً ولا تدّعي معرفة غير موجودة.'};}
g.CHAOSPersonaEngine={version:'3.1.6',profiles,select,apply};
})(window);
