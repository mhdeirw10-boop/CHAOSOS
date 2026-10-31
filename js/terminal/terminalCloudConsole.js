/* CHAOSOS v2.8.0 terminal cloud console. Local-first; never handles provider secrets. */
(function (g) {
  'use strict';
  function byId(id) { return document.getElementById(id); }
  function write(message) { var out=byId('chaosCloudDetails'); if(out) out.textContent=String(message); }
  function state(message) { var node=byId('chaosCloudState'); if(node) node.textContent=message; }
  function current() { return g.CHAOSCloud && g.CHAOSCloud.status ? g.CHAOSCloud.status() : {enabled:false,configured:false,mode:'client-unavailable'}; }
  function refresh() {
    var s=current();
    state(s.enabled && s.configured ? 'الاتصال مفعّل — لم يُفحص الخادم بعد' : 'محلي أولًا — السحابة غير متصلة');
    if(byId('chaosCloudUrl') && !byId('chaosCloudUrl').value) byId('chaosCloudUrl').value=s.baseUrl||'';
    if(byId('chaosCloudTimeout')) byId('chaosCloudTimeout').value=String(s.timeoutMs||7000);
    write(JSON.stringify({mode:s.mode,enabled:s.enabled,configured:s.configured,baseUrl:s.baseUrl||'',timeoutMs:s.timeoutMs||7000,aiGateway:g.CHAOSAIGateway?.status?.()||{available:false}},null,2));
  }
  function config(enabled) {
    if(!g.CHAOSCloud || !g.CHAOSCloud.configure){write('وحدة السحابة غير محمّلة.');return;}
    var url=(byId('chaosCloudUrl')?.value||'').trim();
    var timeout=Number(byId('chaosCloudTimeout')?.value||7000);
    if(enabled && !url){write('أدخل عنوان HTTPS للخادم أولًا. لن يُفعّل الاتصال.');return;}
    if(enabled && !g.confirm('تأكيد تفعيل الاتصالات بالخادم الذي أدخلته؟ لن يُرسل سجل المحادثة تلقائيًا.')) return;
    var result=g.CHAOSCloud.configure({baseUrl:url,timeoutMs:Math.max(1000,Math.min(30000,timeout||7000)),enabled:!!enabled});
    write(result.ok?'تم حفظ الإعدادات المحلية.\n'+JSON.stringify(result.config||result,null,2):String(result.message||'تعذّر حفظ الإعدادات.'));
    refresh();
  }
  async function health() {
    if(!g.CHAOSCloud){write('وحدة السحابة غير متاحة.');return;}
    state('جارٍ فحص الخادم…');write('جارٍ الاتصال بـ /health.');
    var result=await g.CHAOSCloud.health();
    if(result.ok){state('الخادم يستجيب');write('نجح فحص الصحة:\n'+JSON.stringify(result.data,null,2));}
    else {state('لم ينجح الاتصال');write('فشل فحص الصحة: '+String(result.message||result.code||'خطأ غير معروف')+'\nلم تُرسل أي محادثة.');}
  }
  function init(){
    if(!byId('chaosCloudConsole')) return;
    byId('chaosCloudSave')?.addEventListener('click',function(){config(false);});
    byId('chaosCloudEnable')?.addEventListener('click',function(){config(true);});
    byId('chaosCloudDisable')?.addEventListener('click',function(){config(false);});
    byId('chaosCloudHealth')?.addEventListener('click',health);
    g.addEventListener('chaosos:cloud-config',refresh);
    refresh();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  g.CHAOSTerminalCloudConsole={refresh:refresh,health:health};
})(window);
 
