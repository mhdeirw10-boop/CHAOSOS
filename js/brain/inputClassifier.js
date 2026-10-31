/* CHAOSOS input dispatcher: keeps conversation separate from explicit commands. */
(function(root){'use strict';
 const commandPatterns=[
  /^(?:\/|!)(?:help|clear|status|search|open|run|history|export)\b/i,
  /^(?:نفذ|نفّذ|شغّل|شغل|افتح|افتحي|أغلق|اغلق|امسح|صدّر|صدر|ابحث|أبحث|بحث|دور|دورلي|احسب|أحسب|نزّل|نزل|حمّل|حمل|احفظ|تذكر)(?:\s+|$)/u,
  /^(?:help|clear|status|diagnostics|search|open|run|history|export)\s*$/i
 ];
 function classify(input){
  const text=String(input??'').trim();if(!text)return{type:'empty',category:'empty',text:''};
  const local=root.CHAOSLocalLanguage?.classify?.(text);
  const isCommand=commandPatterns.some(r=>r.test(text))||local?.type==='command';
  return {type:isCommand?'command':'daily',category:local?.type||'open_conversation',confidence:local?.confidence??(isCommand?.97:.2),text,normalized:local?.text||text.toLocaleLowerCase('ar')};
 }
 root.CHAOSInputClassifier={version:'2.4.2',classify,isCommand:s=>classify(s).type==='command'};
})(typeof window!=='undefined'?window:globalThis);
