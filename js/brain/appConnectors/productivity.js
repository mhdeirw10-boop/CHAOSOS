/* Local productivity app adapters. Reading is explicit-consent gated; writes are separately confirmed. */
(function (g) {
  'use strict'; const B=g.CHAOSAppCapabilities; if(!B)return;
  const arr=(key)=>{try{const v=JSON.parse(g.localStorage?.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const norm=s=>String(s??'').toLocaleLowerCase('ar');
  const summary=(rows,fields)=>rows.slice(0,60).map(x=>{const o={};for(const f of fields)if(x[f]!==undefined)o[f]=x[f];return o});
  B.register({id:'notes',appId:'void-notes',title:'Void Notes',description:'ملاحظات محلية عبر voidos_notes_v1.',actions:{
    list:{title:'قراءة عناوين الملاحظات',permission:'read',handler:()=>summary(arr('voidos_notes_v1'),['id','title','tag','created','updated'])},
    search:{title:'البحث في نصوص الملاحظات',permission:'read',handler:p=>{const q=norm(p.query);return summary(arr('voidos_notes_v1').filter(x=>norm(x.title+' '+x.body+' '+x.tag).includes(q)),['id','title','tag','created','updated','body']).map(x=>({...x,body:String(x.body||'').slice(0,500)}))}},
    create:{title:'إنشاء ملاحظة',permission:'write',handler:(p)=>{const title=String(p.title||'').trim().slice(0,120),body=String(p.body||'').slice(0,5000);if(!title)throw Error('عنوان الملاحظة مطلوب.');const a=arr('voidos_notes_v1');a.unshift({id:'chaos_'+Date.now().toString(36),title,body,tag:'CHAOSAI',created:Date.now(),updated:Date.now()});g.localStorage.setItem('voidos_notes_v1',JSON.stringify(a.slice(0,500)));return{created:true,title,count:a.length}}}
  }});
  B.register({id:'planner',appId:'void-planner',title:'Void Planner',description:'مهام المستخدم المحلية.',actions:{
    list:{title:'قراءة قائمة المهام',permission:'read',handler:()=>summary(arr('voidos_planner_tasks_v1'),['id','title','date','priority','done','created'])},
    search:{title:'البحث في المهام',permission:'read',handler:p=>summary(arr('voidos_planner_tasks_v1').filter(x=>norm(x.title+' '+x.details).includes(norm(p.query))),['id','title','date','priority','done','details']).map(x=>({...x,details:String(x.details||'').slice(0,400)}))},
    add:{title:'إضافة مهمة',permission:'write',handler:p=>{const title=String(p.title||'').trim().slice(0,240);if(!title)throw Error('عنوان المهمة مطلوب.');const a=arr('voidos_planner_tasks_v1');a.push({id:'chaos_'+Date.now().toString(36),title,date:'',priority:'normal',details:String(p.details||'').slice(0,1000),done:false,created:Date.now()});g.localStorage.setItem('voidos_planner_tasks_v1',JSON.stringify(a.slice(-1000)));return{created:true,title,count:a.length}}}
  }});
  B.register({id:'calendar',appId:'void-calendar',title:'Void Calendar',description:'أحداث التقويم المحلية.',actions:{
    list:{title:'قراءة أحداث التقويم',permission:'read',handler:()=>summary(arr('voidos_calendar_events_v1'),['id','date','title','created','details'])},
    search:{title:'البحث في أحداث التقويم',permission:'read',handler:p=>summary(arr('voidos_calendar_events_v1').filter(x=>norm(x.title+' '+x.details+' '+x.date).includes(norm(p.query))),['id','date','title','details']).map(x=>({...x,details:String(x.details||'').slice(0,400)}))},
    add:{title:'إضافة حدث',permission:'write',handler:p=>{const date=String(p.date||'');const title=String(p.title||'').trim().slice(0,240);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!title)throw Error('أدخل تاريخًا بصيغة YYYY-MM-DD وعنوانًا.');const a=arr('voidos_calendar_events_v1');a.push({id:'chaos_'+Date.now().toString(36),date,title,details:String(p.details||'').slice(0,1000),created:Date.now()});g.localStorage.setItem('voidos_calendar_events_v1',JSON.stringify(a.slice(-1000)));return{created:true,date,title,count:a.length}}}
  }});
})(window);
