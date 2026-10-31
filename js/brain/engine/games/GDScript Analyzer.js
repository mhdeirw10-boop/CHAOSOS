// CHAOS SYSTEM — static, heuristic GDScript checker. Not a Godot compiler.
const GDScriptAnalyzerEngine = {
  module:'GDScript Analyzer', status:'ACTIVE',
  syntaxRules:{extendsKeyword:'extends يحدد الصنف الأب.',variableDeclaration:'var/const تعرّف متغيرًا أو ثابتًا.',functions:'func تعرّف دالة.',typing:'الأنواع الاختيارية تحسن الفحص.'},
  analyzeScript(rawCode) {
    if (typeof rawCode !== 'string' || !rawCode.trim()) return {ok:false,error:'لا يوجد كود لتحليله.'};
    const lines=rawCode.replace(/\r/g,'').split('\n'); const findings=[]; const functions=[]; const variables=[];
    let hasExtends=false, hasClassName=false, hasSignals=false;
    lines.forEach((line,index)=>{
      const n=index+1, trimmed=line.trim(); if (!trimmed || trimmed.startsWith('#')) return;
      if (/^extends\s+[A-Za-z_][\w.]*/.test(trimmed)) hasExtends=true;
      if (/^class_name\s+\w+/.test(trimmed)) hasClassName=true;
      if (/^signal\s+\w+/.test(trimmed)) hasSignals=true;
      const fn=trimmed.match(/^func\s+([A-Za-z_]\w*)\s*\((.*)\)\s*(?:->\s*[^:]+)?\s*:/); if(fn) functions.push({name:fn[1],line:n,parameters:fn[2].trim()});
      const variable=trimmed.match(/^(?:@export\s+)?(var|const)\s+([A-Za-z_]\w*)/); if(variable) variables.push({kind:variable[1],name:variable[2],line:n});
      if (/^func\s+[^(:]+\s*\(/.test(trimmed) && !/^func\s+[A-Za-z_]\w*\s*\(/.test(trimmed)) findings.push({line:n,severity:'error',message:'اسم الدالة غير صالح أو مفقود.'});
      if (/^(?:var|const)\s*=/.test(trimmed)) findings.push({line:n,severity:'error',message:'تعريف المتغير يفتقد الاسم.'});
      if (/^if\b.*[^:]$/.test(trimmed) || /^(?:elif|else|for|while|match|func|class|extends)\b.*[^:]$/.test(trimmed) && !trimmed.endsWith(':') && !trimmed.startsWith('extends ')) findings.push({line:n,severity:'warning',message:'تحقق من النقطتين : في نهاية بنية التحكم أو تعريف الدالة.'});
      if (/\t+ +| +\t+/.test(line)) findings.push({line:n,severity:'warning',message:'خلط المسافات وعلامات الجدولة قد يسبب مشكلة في المسافة البادئة.'});
      if (/\bTODO\b|pass\s*(?:#.*)?$/.test(trimmed)) findings.push({line:n,severity:'info',message:'يوجد TODO أو pass؛ تحقق مما إذا كان التنفيذ غير مكتمل.'});
    });
    if(!hasExtends) findings.push({line:1,severity:'info',message:'لم يُعثر على extends؛ قد يكون السكريبت مستقلًا أو أداة.'});
    return {ok:true,syntaxType:'GDScript',analyzedLines:lines.length,componentsDetected:{hasExtends,hasClassName,hasSignals,functions: functions.length,variables:variables.length},functions,variables,findings,summary:{errors:findings.filter(x=>x.severity==='error').length,warnings:findings.filter(x=>x.severity==='warning').length,notes:findings.filter(x=>x.severity==='info').length},limitation:'هذا فاحص ساكن تقريبي، وليس مترجم Godot؛ لا يثبت أن السكريبت قابل للتشغيل.'};
  }
};
if (typeof module !== 'undefined') module.exports = GDScriptAnalyzerEngine;

if (typeof window !== 'undefined') window.GDScriptAnalyzerEngine = GDScriptAnalyzerEngine;
