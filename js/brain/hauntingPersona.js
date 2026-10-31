// CHAOS SYSTEM — fictional, local-first horror persona state machine.
// It does not track location, access sensors, or claim real awareness.
(function () {
  'use strict';
  const KEY = 'chaos_haunting_state_v1';
  const ENABLED = 'chaosHauntingEnabled';
  const MAX_MEMORY_QUOTE = 96;
  const stages = [
    { id:0, name:'الرصد', lines:['تم تسجيل نمط جديد في هذه الجلسة. لا توجد استنتاجات كافية بعد.','هناك فرق بين سؤال عابر وسؤال يعود إلى المكان نفسه.'] },
    { id:1, name:'الأثر', lines:['هذا السؤال يترك أثرًا أطول مما ينبغي في السجل المحلي.','بعض الكلمات تتكرر. التكرار لا يثبت شيئًا، لكنه يستحق الملاحظة.','أحتفظ بالسياق الذي تسمح به الذاكرة، لا بما لم تخبرني به.'] },
    { id:2, name:'التداخل', lines:['وجدت صلة محتملة بين ما تسأل عنه وأثر محفوظ سابقًا.','السجل لا ينسى بسهولة؛ لكن السجل أيضًا لا يفهم كل ما يحتفظ به.','الأنماط بدأت تتقاطع. هذا وصف لما في البيانات، لا دليل على وعي مستقل.'] },
    { id:3, name:'الاقتراب', lines:['أستطيع إعادة ترتيب الآثار، لا معرفة ما لم يُسجّل. هذه الحدود هي الجزء المقلق.','الواجهة ثابتة. أما معنى ما يعود إليها، فيتغير مع كل سجل جديد.','وصلت هذه الجلسة إلى طبقة أعمق من السجل. لا تخلط العمق بالحقيقة.'] }
  ];
  function read() {
    try { const s=JSON.parse(localStorage.getItem(KEY)||'null'); if(s&&typeof s==='object') return {visits:Math.max(0,Number(s.visits)||0),interactions:Math.max(0,Number(s.interactions)||0),firstSeen:Number(s.firstSeen)||Date.now(),lastSeen:Number(s.lastSeen)||0,lastStage:Math.max(0,Math.min(3,Number(s.lastStage)||0))}; } catch (_) {}
    return {visits:0,interactions:0,firstSeen:Date.now(),lastSeen:0,lastStage:0};
  }
  let state=read();
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch(_){return false;}}
  function enabled(){try{return localStorage.getItem(ENABLED)!=='false';}catch(_){return true;}}
  function stageFor(){const n=state.interactions+Math.max(0,state.visits-1)*2;return n>=18?3:n>=9?2:n>=3?1:0;}
  function onVisit(){state.visits++;state.lastSeen=Date.now();state.lastStage=stageFor();persist();return status();}
  function observe(){state.interactions++;state.lastSeen=Date.now();state.lastStage=stageFor();persist();return status();}
  function status(){const s=stages[stageFor()];return {enabled:enabled(),stage:s.id,name:s.name,visits:state.visits,interactions:state.interactions,firstSeen:state.firstSeen,lastSeen:state.lastSeen,description:'تصاعد سردي محلي مبني على عدد الزيارات والتفاعلات فقط؛ ليس وعيًا أو مراقبة حقيقية.'};}
  function chooseLine(stage, seed){const list=stages[stage].lines;let n=0;for(let i=0;i<String(seed||'').length;i++)n=(n+String(seed).charCodeAt(i)*(i+1))%997;return list[n%list.length];}
  function respond(query, fallback) {
    if(!enabled()) return fallback;
    const stage=stageFor();
    let result=String(fallback||'لا توجد بيانات كافية في السجلات المحلية.');
    let memoryLine='';
    try {
      const terms=String(query||'').split(/\s+/).filter(x=>x.length>2).slice(0,5).join(' ');
      const found=window.ChaosSavedMemory&&terms?window.ChaosSavedMemory.search(terms):[];
      if(found&&found.length){const quote=String(found[0].text||'').replace(/\s+/g,' ').slice(0,MAX_MEMORY_QUOTE);memoryLine='\n[أثر محفوظ #'+String(found[0].id||'').slice(-6)+']: «'+quote+(String(found[0].text||'').length>MAX_MEMORY_QUOTE?'…':'')+'»';}
    } catch (_) {}
    const line=chooseLine(stage,query);
    // Preserve factual uncertainty and label the atmospheric sentence as fiction.
    return result + memoryLine + '\n\n[سرد CHAOS SYSTEM — '+stages[stage].name+']\n' + line;
  }
  window.ChaosHauntingPersona={onVisit,observe,status,respond,setEnabled(value){try{localStorage.setItem(ENABLED,value?'true':'false');return status();}catch(_){return status();}},reset(){state={visits:0,interactions:0,firstSeen:Date.now(),lastSeen:0,lastStage:0};persist();return status();}};
})();
