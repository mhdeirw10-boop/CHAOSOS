/* CHAOSOS Word Registry v1.1 — normalized Arabic phrases, explainable matching and handler-only dispatch. */
(function(g){'use strict';
 const modules=new Map();
 const clean=s=>String(s??'').normalize('NFKC').toLocaleLowerCase('ar')
  .replace(/[\u064B-\u065F\u0670\u0640]/g,'')
  .replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
  .replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
  .replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
  .replace(/[?!؟.,،؛;:()[\]{}"'`“”‘’…]/g,' ').replace(/\s+/g,' ').trim();
 function register(def){if(!def||typeof def.id!=='string'||modules.has(def.id))return false;const entries=def.entries&&typeof def.entries==='object'?def.entries:{};modules.set(def.id,{id:def.id,title:String(def.title||def.id),priority:Number(def.priority)||0,entries,handle:typeof def.handle==='function'?def.handle:null,match:typeof def.match==='function'?def.match:null});return true}
 function list(){return [...modules.values()].sort((a,b)=>b.priority-a.priority).map(m=>({id:m.id,title:m.title,priority:m.priority,entries:Object.keys(m.entries).length,hasHandler:!!m.handle,hasMatcher:!!m.match}))}
 function entries(){const out=Object.create(null);for(const m of [...modules.values()].sort((a,b)=>a.priority-b.priority))Object.assign(out,m.entries);return out}
 function matchExact(raw){const q=clean(raw);if(!q)return null;const rows=[...modules.values()].sort((a,b)=>b.priority-a.priority);for(const m of rows){for(const [key,answer] of Object.entries(m.entries)){const k=clean(key);if(k&&q===k)return{key,answer,module:m.id,title:m.title};}}return null;}
 function match(raw){const q=clean(raw);if(!q)return null;const rows=[...modules.values()].sort((a,b)=>b.priority-a.priority);
  // Exact curated entries must outrank broad pattern matchers; this prevents generic chat rules eclipsing a category-specific answer.
  const exact=matchExact(raw);if(exact)return exact;
  for(const m of rows){if(m.match){let hit=null;try{hit=m.match(raw,q)}catch{}if(hit)return typeof hit==='string'?{key:q,answer:hit,module:m.id,title:m.title}:{...hit,key:hit.key||q,module:hit.module||m.id,title:hit.title||m.title};}}
  // Whole-phrase fallback only; prefer the longest phrase to avoid broad short matches eclipsing a specific one.
  const candidates=[];for(const m of rows)for(const [key,answer] of Object.entries(m.entries)){const k=clean(key);if(k.length>=5&&(` ${q} `).includes(` ${k} `))candidates.push({key,answer,module:m.id,title:m.title,length:k.length,priority:m.priority});}
  candidates.sort((a,b)=>b.length-a.length||b.priority-a.priority);if(candidates.length){const {length,priority,...hit}=candidates[0];return hit;}
  return null;
 }
 function resolveHandlers(raw){const q=clean(raw);if(!q)return{handled:false};const rows=[...modules.values()].sort((a,b)=>b.priority-a.priority);for(const m of rows){if(!m.handle)continue;try{const r=m.handle(raw,q);if(r!==undefined&&r!==null&&r!==false)return typeof r==='string'?{handled:true,answer:r,module:m.id,title:m.title}:{handled:true,module:m.id,title:m.title,...r};}catch(e){return{handled:true,ok:false,module:m.id,title:m.title,answer:'تعذّر تشغيل وحدة الكلمات: '+String(e?.message||'WORD_MODULE_ERROR')}}}return{handled:false};}
 function resolve(raw,options={}){const handled=resolveHandlers(raw);if(handled.handled)return handled;if(options&&options.handlersOnly)return{handled:false};const m=match(raw);return m?{handled:true,...m}:{handled:false};}
 g.CHAOSWords={version:'1.1.0',normalize:clean,register,list,entries,match,matchExact,resolve,resolveHandlers,module:id=>modules.get(String(id))||null};
})(window);
