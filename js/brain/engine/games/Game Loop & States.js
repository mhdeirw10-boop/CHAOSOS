// CHAOS SYSTEM — deterministic game state helpers; caller owns scheduling.
const GameLoopAndStatesEngine = (() => {
  const STATES={INIT:'INIT',PLAYING:'PLAYING',PAUSED:'PAUSED',GAME_OVER:'GAME_OVER'};
  const allowed={INIT:['PLAYING','GAME_OVER'],PLAYING:['PAUSED','GAME_OVER'],PAUSED:['PLAYING','GAME_OVER'],GAME_OVER:['INIT']};
  let state=STATES.INIT, frame=0, elapsed=0;
  return {module:'Game Loop & States',status:'ACTIVE',states:STATES,
    transition(next){ if(!Object.values(STATES).includes(next)) return {ok:false,state,error:'حالة غير معروفة.'}; if(next===state) return {ok:true,state,changed:false}; if(!allowed[state].includes(next)) return {ok:false,state,error:`انتقال غير مسموح: ${state} -> ${next}`}; const previous=state; state=next; if(next===STATES.INIT){frame=0;elapsed=0;} return {ok:true,previous,state,changed:true}; },
    evaluateState(){return {activeState:state,frame,elapsedSeconds:Number(elapsed.toFixed(3)),allowedTransitions:allowed[state].slice()};},
    tick(delta,update){if(state!==STATES.PLAYING)return {ok:false,state,updated:false,reason:'حلقة التحديث لا تعمل إلا في حالة PLAYING.'};if(!Number.isFinite(delta)||delta<0)return {ok:false,state,error:'delta يجب أن يكون رقمًا غير سالب.'};const dt=Math.min(delta,0.1);elapsed+=dt;frame++;if(typeof update==='function')update(dt,{frame,elapsed,state});return {ok:true,state,frame,elapsedSeconds:elapsed,deltaUsed:dt};}
  };
})();
if (typeof module !== 'undefined') module.exports = GameLoopAndStatesEngine;

if (typeof window !== 'undefined') window.GameLoopAndStatesEngine = GameLoopAndStatesEngine;
