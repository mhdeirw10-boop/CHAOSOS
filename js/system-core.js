/* CHAOSOS shared local services (legacy window.VoidOS API retained): local identity, settings bus, trainable small text model, and synthesized audio. */
(function(){'use strict';
const K={identity:'voidos_unified_identity_v1',prefs:'voidos_global_settings_v1',training:'chaos_micro_model_corpus_v1',lexicon:'chaos_generated_lexicon_v1'};
const safeRead=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k));return x==null?d:x}catch{return d}};
const safeWrite=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
function publishIdentity(name,email,source){
 const old=safeRead(K.identity,{})||{};
 const username=String(name||old.username||'').trim().slice(0,64);
 if(!username)return old;
 const nextSource=source||old.source||'local-device';
 const changed=old.username!==username||old.email!==(String(email||old.email||'').trim())||old.source!==nextSource;
 const id={...(old||{}),username,displayName:username,email:String(email||old.email||'').trim().slice(0,120),source:nextSource,updatedAt:changed?new Date().toISOString():(old.updatedAt||new Date().toISOString()),scope:'this-device-only'};
 safeWrite(K.identity,id);
 safeWrite('chaosos_unified_account_v2',{schema:2,username:id.username,displayName:id.displayName,email:id.email||'',source:id.source,activeSession:['voidos-shell','void-store'].includes(id.source),scope:'this-device-only',createdAt:old.createdAt||new Date().toISOString(),updatedAt:id.updatedAt});
 if(changed)window.dispatchEvent(new CustomEvent('voidos:identity',{detail:id}));
 return id;
}
function syncLegacy(){
 let id=safeRead(K.identity,null);
 const shell=safeRead('voidos_local_session_v1',null);
 let store=null;
 try{const a=JSON.parse(localStorage.getItem('voidStoreV1DemoAccount')||'null');const ss=localStorage.getItem('voidStoreV1DemoSession');if(a&&ss===a.username)store=a}catch{}
 if(shell?.username){
   const name=shell.displayName||shell.username;
   if(!id||id.username!==name||id.email!==(shell.email||id.email||'')||id.source!=='voidos-shell')id=publishIdentity(name,shell.email||id?.email||'','voidos-shell');
   return id;
 }
 if(store?.username){
   if(!id||id.username!==store.username||id.email!==(store.email||id.email||'')||id.source!=='void-store')id=publishIdentity(store.username,store.email||id?.email||'','void-store');
   return id;
 }
 if(id&&['voidos-shell','void-store'].includes(id.source)){
   try{localStorage.removeItem(K.identity)}catch{}
   const profile=safeRead('chaosos_unified_account_v2',null);
   if(profile?.username){profile.activeSession=false;profile.updatedAt=new Date().toISOString();safeWrite('chaosos_unified_account_v2',profile)}
   id=null;
 }
 if(!id){
   const oldProfile=safeRead('voidos_unified_profile_v1',null);
   const unified=safeRead('chaosos_unified_account_v2',null);
   const saved=oldProfile?.username?oldProfile:(unified?.username?unified:null);
   if(saved?.username)id=publishIdentity(saved.displayName||saved.username,saved.email||'','migrated-local-profile');
 }
 return id||safeRead(K.identity,null);
}
const prefs=()=>safeRead(K.prefs,{language:'en',theme:'dark',motion:true,voice:true,learning:false,particles:true,fontScale:1,contrast:false});
const setPref=(key,value)=>{const p=prefs();p[key]=value;safeWrite(K.prefs,p);window.dispatchEvent(new CustomEvent('voidos:settings',{detail:p}));return p};
function tokenize(s){return String(s||'').toLocaleLowerCase().normalize('NFKC').match(/[\p{L}\p{N}_'-]+/gu)||[]}
function corpus(){try{const raw=localStorage.getItem(K.training);if(window.CHAOSTrainingDataBoundary?.parseCorpus){const checked=window.CHAOSTrainingDataBoundary.parseCorpus(raw);return checked.ok?checked.rows:[]}if(raw&&raw.length>1650000)return[];const c=raw?JSON.parse(raw):[];return Array.isArray(c)?c.slice(-500).filter(x=>x&&typeof x.text==='string').map(x=>({text:String(x.text).slice(0,3000),source:String(x.source||'user').slice(0,64),at:Number(x.at)||0})):[]}catch{return[]}}
function train(text,source='user-opt-in'){const checked=window.CHAOSTrainingDataBoundary?.validateExample?.(text);if(checked&&!checked.ok)return {ok:false,message:checked.message};const s=(checked?.text??String(text||'').replace(/[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g,' ').trim().slice(0,3000));if(s.length<3)return {ok:false,message:'أدخل مثالًا صالحًا لا يقل عن ثلاثة أحرف.'};const c=corpus();c.push({text:s,source:String(source||'user-opt-in').slice(0,64),at:Date.now()});const bounded=c.slice(-500);if(!safeWrite(K.training,bounded))return {ok:false,message:'تعذّر حفظ المثال؛ قد تكون مساحة التخزين المحلية ممتلئة.'};return {ok:true,examples:Math.min(bounded.length,500),tokens:tokenize(bounded.map(x=>x.text).join(' ')).length}}
function generate(seed='',limit=48){if(window.CHAOSLocalTextModel?.generate){const local=window.CHAOSLocalTextModel.generate(seed,{maxTokens:Math.max(12,Math.min(70,Number(limit)||48))});if(local?.ok)return local.text;return local?.message||'تعذّر التوليد الإحصائي المحلي.'}const all=corpus().map(x=>x.text).join(' ');const toks=tokenize(all);if(toks.length<8)return 'النموذج المحلي يحتاج أمثلة تدريب أكثر. أضف نصوصًا بنفسك ثم أعد المحاولة.';const next=new Map();for(let i=0;i<toks.length-1;i++){const k=toks[i],arr=next.get(k)||[];arr.push(toks[i+1]);next.set(k,arr)}let current=tokenize(seed).slice(-1)[0];if(!current||!next.has(current))current=toks[Math.floor(Math.random()*toks.length)];const out=[current];for(let i=0;i<limit;i++){const opts=next.get(current);if(!opts?.length)break;current=opts[Math.floor(Math.random()*opts.length)];out.push(current);if(/[.!?؟]$/.test(current))break}return out.join(' ')}
function newWord(root=''){const lex=safeRead(K.lexicon,[]);const a=['va','zor','kai','eth','umi','dra','xel','no','shi','tor','ae','ruk','ivo','zan','mir','oth'];const b=['ra','th','ion','vek','uma','aris','eon','keth','ora','yx','uun','esh','al','ith'];const word=(String(root).replace(/[^\p{L}]/gu,'').slice(0,5)||a[Math.floor(Math.random()*a.length)])+b[Math.floor(Math.random()*b.length)]+a[Math.floor(Math.random()*a.length)];lex.push({word,createdAt:new Date().toISOString(),root:root||null});safeWrite(K.lexicon,lex.slice(-1000));return word}
function availableVoices(){try{return window.speechSynthesis?.getVoices?.()||[]}catch{return []}}
function voiceStatus(){const supported=!!(window.speechSynthesis&&typeof SpeechSynthesisUtterance!=='undefined');const voices=availableVoices();return {supported,voices:voices.map(v=>({name:v.name,lang:v.lang,default:!!v.default,localService:!!v.localService})),arabicAvailable:voices.some(v=>/^ar([_-]|$)/i.test(v.lang)),count:voices.length}}
function speak(text,opts={}){const synth=window.speechSynthesis;if(!synth||typeof SpeechSynthesisUtterance==='undefined')return {ok:false,code:'TTS_UNSUPPORTED',message:'النطق غير مدعوم في بيئة التشغيل الحالية. جرّب WebView أو متصفحًا أحدث.'};const clean=String(text??'').replace(/https?:\/\/\S+/g,'رابط').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,' ').trim().slice(0,1800);if(!clean)return {ok:false,code:'EMPTY_TEXT',message:'لا يوجد نص صالح للنطق.'};const p=prefs();const isArabic=/[\u0600-\u06FF]/.test(clean);const requested=String(opts.lang||p.voiceLanguage||(isArabic?'ar':'en-US'));const voices=availableVoices();const base=requested.toLowerCase().split(/[-_]/)[0];const voice=voices.find(v=>v.lang.toLowerCase()===requested.toLowerCase())||voices.find(v=>v.lang.toLowerCase().split(/[-_]/)[0]===base)||((isArabic)?voices.find(v=>/^ar([_-]|$)/i.test(v.lang)):null);const u=new SpeechSynthesisUtterance(clean);u.lang=voice?.lang||requested;u.rate=Math.max(.65,Math.min(1.25,Number(opts.rate)||.92));u.pitch=Math.max(.5,Math.min(1.5,Number(opts.pitch)||.9));u.volume=Math.max(0,Math.min(1,Number(opts.volume??1)));if(voice)u.voice=voice;let finished=false;u.onend=()=>{finished=true;window.dispatchEvent(new CustomEvent('voidos:voiceend',{detail:{lang:u.lang,voice:voice?.name||null}}))};u.onerror=e=>window.dispatchEvent(new CustomEvent('voidos:voiceerror',{detail:{error:e.error||'unknown',lang:u.lang,voice:voice?.name||null}}));try{synth.cancel();synth.speak(u);return {ok:true,code:'TTS_QUEUED',message:voice?'بدأت قراءة النص باستخدام صوت النظام المحدد.':'أُرسل النص إلى محرك النطق؛ قد يختار النظام صوتًا افتراضيًا أو يحتاج إلى تثبيت بيانات اللغة.',lang:u.lang,voice:voice?.name||null,arabicVoiceAvailable:voices.some(v=>/^ar([_-]|$)/i.test(v.lang))}}catch(e){return {ok:false,code:'TTS_FAILED',message:'تعذر تشغيل محرك النطق: '+String(e?.message||e)}}}

function stopSpeaking(){if(window.speechSynthesis)window.speechSynthesis.cancel();return {ok:true,message:'تم إيقاف القراءة.'}}
function exportLocalData(){const data={format:'voidos-local-backup',version:'3.0.0',createdAt:new Date().toISOString(),data:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(/^(voidos_|voidStore|chaos_)/i.test(k))){try{data.data[k]=JSON.parse(localStorage.getItem(k))}catch{data.data[k]=localStorage.getItem(k)}}}return data}
function importLocalData(payload){if(!payload||payload.format!=='voidos-local-backup'||!payload.data||typeof payload.data!=='object'||Array.isArray(payload.data))return {ok:false,message:'ملف النسخة الاحتياطية غير صالح.'};let imported=0,skipped=0;for(const [k,v] of Object.entries(payload.data)){if(!/^(voidos_|voidStore|chaos_)/i.test(k)||k.length>180){skipped++;continue}try{const raw=JSON.stringify(v);if(raw.length>2_000_000){skipped++;continue}localStorage.setItem(k,raw);imported++}catch{skipped++}}syncLegacy();window.dispatchEvent(new CustomEvent('voidos:backup-imported',{detail:{imported,skipped}}));return {ok:true,imported,skipped,message:`استوردت ${imported} عنصرًا وتجاوزت ${skipped}. راجع البيانات قبل اعتمادها.`}}
function foundationStatus(){return {version:'3.0.0',storageAvailable:(()=>{try{const k='__voidos_test__';localStorage.setItem(k,'1');localStorage.removeItem(k);return true}catch{return false}})(),speech:voiceStatus(),identity:!!syncLegacy(),online:navigator.onLine,secureContext:!!window.isSecureContext,serviceWorker:!!navigator.serviceWorker,platform: /Android/i.test(navigator.userAgent)?'android-webview-or-browser':'web'}}
window.VoidOS=Object.assign(window.VoidOS||{},{version:'3.0.0',keys:K,read:safeRead,write:safeWrite,getIdentity:syncLegacy,publishIdentity,prefs,setPref,train,generate,newWord,speak,stopSpeaking,availableVoices,voiceStatus,exportLocalData,importLocalData,foundationStatus,corpus});
window.addEventListener('storage',e=>{if(['voidos_local_session_v1','voidStoreV1DemoSession','voidStoreV1DemoAccount','voidos_local_accounts_v1'].includes(e.key))syncLegacy()});
// Same-page writes are not reported by the browser storage event, so observe the legacy local-only account keys.
try{const observed=['voidos_local_session_v1','voidStoreV1DemoSession','voidStoreV1DemoAccount','voidos_local_accounts_v1'];const originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){const result=originalSet.call(this,key,value);if(observed.includes(String(key))){try{syncLegacy()}catch{}}return result};const originalRemove=Storage.prototype.removeItem;Storage.prototype.removeItem=function(key){const result=originalRemove.call(this,key);if(observed.includes(String(key))){try{syncLegacy()}catch{}}return result}}catch{}
syncLegacy();
})();
