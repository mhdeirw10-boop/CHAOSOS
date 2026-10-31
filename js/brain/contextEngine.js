/* CHAOSAI Context Engine v3.1.6 — bounded conversational context and reference resolution. */
(function(g){'use strict';const MAX=24;const sessions=new Map();
function normalize(s){return String(s||'').trim().replace(/[إأآ]/g,'ا').replace(/[ًٌٍَُِّْـ]/g,'').replace(/[؟?!.,،؛:]+$/u,'').replace(/\s+/g,' ').toLocaleLowerCase('ar');}
function topicFrom(text){const s=String(text||'').trim();const patterns=[/(?:عن|حول|بخصوص|موضوع)\s+(.{2,90})$/u,/(?:ما رأيك في|شنو رأيك ب|اشرح لي|حدثني عن)\s+(.{2,90})$/u];for(const r of patterns){const m=s.match(r);if(m)return m[1].replace(/[؟?!.,،]+$/u,'').trim();}return s.length<100?s:'';}
function observe(sessionId,role,text){const id=String(sessionId||'default');let a=sessions.get(id)||[];const row={role:role==='assistant'?'assistant':'user',text:String(text||'').slice(0,1200),at:Date.now()};a.push(row);if(a.length>MAX)a=a.slice(-MAX);sessions.set(id,a);if(row.role==='user'){const t=topicFrom(row.text);if(t&&!/^(?:نعم|لا|اي|إي|تمام|حسنا|كمل|تابع|ليش|لماذا)$/u.test(normalize(t)))sessions.set(id+'_topic',t);}return snapshot(id);}
function snapshot(id='default'){const rows=sessions.get(String(id))||[];return{sessionId:String(id),messages:rows.map(x=>({...x})),topic:sessions.get(String(id)+'_topic')||null,count:rows.length};}
function resolve(id,text){const s=snapshot(id),q=normalize(text);const ref=/^(?:هو|هي|هذا|هذه|هاذا|هذي|هم|هن|ها|عنه|عنها|منه|منها|مشاكله|مشاكلها|مميزاته|مميزاتها|شنو مشاكله|ما مشاكله|ما هي مشاكله|كمل|تابع|وضح اكثر)$/u.test(q);return{resolved:!!(ref&&s.topic),topic:ref?s.topic:null,ambiguous:!!(ref&&!s.topic)};}
function clear(id='default'){sessions.delete(String(id));sessions.delete(String(id)+'_topic');}
g.CHAOSContextEngine={version:'3.1.6',observe,snapshot,resolve,clear,normalize};
})(window);
