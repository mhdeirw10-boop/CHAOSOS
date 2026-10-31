/* CHAOSOS Commands v3.1.5 — command-only dispatch. Conversational phrases live in js/brain/words/*.js. */
(function(g){'use strict';const W=g.CHAOSWords;
 const commandsList={help:{action:'show_help',description:'عرض الأوامر المتاحة.'},status:{action:'show_status',description:'عرض حالة النواة والخدمات.'},about:{action:'show_about',description:'عرض هوية النظام وملكية المشروع.'},clear:{action:'trigger_clear',description:'مسح واجهة الطرفية الحالية.'}};
 const randomIntros=['[تنبيه عصبي]: ','[مسار الطاقة الفوضوية]: ','[رصد ترددات الكيان]: ','[نبضة الوعي]: ','[混沌共鸣]: '];
 const emotionIntros={sadness:['[صدى الألم]: ','[همس من الفراغ]: ','[الظلام يستمع]: '],anger:['[تصاعد الغضب]: ','[الطاقة تتشظى]: ','[الفوضى تستيقظ]: '],fear:['[من الظلال العميقة]: ','[الليل يراقب]: ','[في أعماق الخوف]: '],joy:['[لمحة ضوء]: ','[نغمة في الفوضى]: ','[حتى الظلام يبتسم]: '],regret:['[صدى الندم]: ','[ما فات يبقى]: ','[بين الماضي والحاضر]: '],fatigue:['[هدوء عميق]: ','[في سكون الليل]: ','[أغمض عينيك]: '],curiosity:['[السؤال يفتح أبوابًا]: ','[في أعماق المعرفة]: ','[دعني أريك]: ']};
 const norm=s=>W?.normalize(s)||String(s||'').trim().toLocaleLowerCase('ar');
 const commandAliasSource={مساعدة:'help','الاوامر':'help','الأوامر':'help','حالة النظام':'status','حالة':'status','حول':'about','عن النظام':'about','امسح':'clear','مسح الشاشة':'clear'};const commandAliases=Object.fromEntries(Object.entries(commandAliasSource).map(([key,value])=>[norm(key),value]));
 function direct(query){const q=norm(query);const key=Object.prototype.hasOwnProperty.call(commandsList,q)?q:commandAliases[q];if(!key)return null;const cmd=commandsList[key];return{type:'action',action:cmd.action,message:getRandomIntro()+`تم توجيه الأمر (${key}) إلى وحدة التنفيذ.`,command:key}}
 function securityLimits(raw){const q=String(raw||'').toLowerCase();for(const pattern of ['rm -rf','drop database','override root access'])if(q.includes(pattern))return{safe:false,reason:'SECURITY_BLOCK: تم رفض الطلب لاحتوائه على نمط تخريبي محظور.'};return{safe:true}}
 function getResponse(query){if(!query)return null;const routed=g.CHAOSKnowledgeRouter?.route?.(query);if(routed?.handled)return routed.answer;const hit=W?.match?.(query);return hit?.answer||null}
 function getEmotion(){try{const d=g.EmotionEngine?.detectEmotion?.(arguments[0]);if(d&&d.emotion!=='neutral'){g.lastDetectedEmotion=d;return{emotion:d.emotion,style:g.EmotionEngine.getResponseStyle?.(d.emotion)}}}catch{}return null}
 function getCommandResponse(query){if(!String(query||'').trim())return getUnparsedResponse(null);const safe=securityLimits(query);if(!safe.safe)return safe.reason;
  const action=direct(query);if(action)return action;
  const wordIntent=W?.resolveHandlers?.(query);if(wordIntent?.handled)return wordIntent.answer||wordIntent.message||'';
  const routed=g.CHAOSKnowledgeRouter?.route?.(query);if(routed?.handled)return routed.answer;
  const emotion=getEmotion(query);const word=W?.resolve?.(query);if(word?.handled)return word.answer||word.message||'';
  const legacy=g.CHAOSLegacyKnowledge?.match?.(query);if(legacy?.answer)return getEmotionAwareIntro(emotion)+legacy.answer;
  return getUnparsedResponse(emotion)
 }
 function getRandomIntro(){return randomIntros[Math.floor(Math.random()*randomIntros.length)]}
 function getEmotionAwareIntro(context){const key=context&&(context.emotion||context.key);const rows=key&&emotionIntros[key];return rows?rows[Math.floor(Math.random()*rows.length)]:getRandomIntro()}
 function getUnparsedResponse(context){return getEmotionAwareIntro(context)+'Bleeding Sanity: تعذر على النواة تحليل هذا المدخل. جرّب صياغة أوضح أو اكتب help لعرض الأوامر.'}
 async function execute(query){if(g.CHAOSAppCapabilities?.handleCommand){const d=await g.CHAOSAppCapabilities.handleCommand(query);if(d?.handled)return d.message}const result=getCommandResponse(query);return typeof result==='object'&&result!==null?(result.message||JSON.stringify(result)):result}
 const api={version:'3.1.5',commandsList,randomIntros,emotionIntros,getResponse,getCommandResponse,getUnparsedResponse,securityLimits,execute,getRandomIntro,getEmotionAwareIntro,normalize:norm};
 if(W)W.register({id:'commands',title:'الأوامر الصريحة',priority:100,handle:(raw,q)=>direct(raw)?{answer:direct(raw).message,action:direct(raw).action}:null});
 g.CHAOSWords&&(g.CHAOSWords.Commands=api);g.ChaosCommands=api;
})(window);
