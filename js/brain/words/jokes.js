/* Local joke request handler; phrase vocabulary is in banter.js. */
(function(g){'use strict';const W=g.CHAOSWords;if(!W)return;const jokes=[
'مبرمج فتح الثلاجة، شاف الضوء يشتغل، قال: أخيرًا خدمة بدأت بدون إعادة تشغيل.',
'سألوا النظام: ليش ساكت؟ قال: أنتظر المستخدم يكتب السؤال بدون ما يغيّر رأيه بالنص.',
'واحد سمّى مجلده النهائي FINAL، وبعده FINAL2، وبعده FINAL_الأخير_صدق؛ صار عنده ثلاث نهايات وماكو نهاية.'
];let cursor=0;W.register({id:'jokes',title:'توليد النكات المحلية',priority:25,entries:{},handle:(raw,q)=>{if(/^(?:نكته|نكته ثانية|احكي نكته|قل نكته|ضحكني|مزحه|امزح|نكت)$/i.test(q)||/(?:احكي|قل|اعطني|عطني)\s+(?:لي\s+)?نكته/.test(q)){const answer=jokes[cursor++%jokes.length];return{answer,source:'local-original-joke'}}return null}});})(window);
