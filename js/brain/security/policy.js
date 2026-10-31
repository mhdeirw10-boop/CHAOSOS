// CHAOS Security Policy — deny dangerous patterns; this is client-side defense-in-depth only.
(function(g){'use strict';
 const rules=[
  {id:'shell-destructive',re:/(?:\brm\s+-rf\b|\bformat\s+[a-z]:|\bdiskpart\b)/i,reason:'طلب يتضمن نمطًا تخريبيًا غير مسموح.'},
  {id:'sql-destructive',re:/\b(?:drop\s+database|drop\s+table|truncate\s+table)\b/i,reason:'طلب يتضمن نمطًا تخريبيًا لقواعد البيانات.'},
  {id:'privilege-override',re:/\boverride\s+root\s+access\b/i,reason:'محاولة تجاوز صلاحيات.'},
  {id:'remote-pipe-exec',re:/(?:curl|wget)\s+[^\n|]{0,500}\|\s*(?:sh|bash|zsh)\b/i,reason:'تنفيذ نص محمّل عن بعد مباشرةً غير مسموح من واجهة النظام.'},
  {id:'filesystem-format',re:/\bmkfs(?:\.[a-z0-9]+)?\b|\bdd\s+if=\S+\s+of=\/dev\//i,reason:'طلب قد يسبب تدميرًا مباشرًا لنظام الملفات.'},
  {id:'hidden-control',re:/[\u202A-\u202E\u2066-\u2069]/,reason:'أزيلت أو رُفضت محارف اتجاه خفية غير مسموحة.'}
 ];
 g.ChaosSecurityPolicy={version:'2.4.1',inspect(value){const text=String(value??'');if(text.length>12000)return{safe:false,code:'INPUT_TOO_LONG',reason:'النص أطول من الحد المسموح.'};for(const r of rules)if(r.re.test(text))return{safe:false,code:r.id,reason:r.reason};return{safe:true,code:null,reason:null}},canAccessArchive(name,level){if(!name)return false;return name!=='الأرشيف الغامض'||level==='FOUNDER'}};
})(window);
