// CHAOS SYSTEM Diagnostics — local browser capability and module checks.
(function () {
  'use strict';
  const keys = [
    'chaos_chat_history', 'chaos_current_session', 'chaos_saved_memories_v1',
    'chaos_persistent_long_term', 'chaos_short_term_buffer', 'chaos_web_memory',
    'chaosMemoryEnabled', 'chaosTheme', 'chaos_lang_model', 'chaos_haunting_state_v1'
  ];
  function checkStorage() {
    try {
      const key = '__chaos_diagnostic_test__'; localStorage.setItem(key, 'ok');
      const works = localStorage.getItem(key) === 'ok'; localStorage.removeItem(key); return works;
    } catch (_) { return false; }
  }
  function safeSize(value) { try { return new Blob([value || '']).size; } catch (_) { return String(value || '').length; } }
  function report() {
    const lines = ['CHAOS SYSTEM // تقرير تشخيصي', 'الوقت: ' + new Date().toLocaleString(), ''];
    const storageOK = checkStorage();
    lines.push((storageOK ? '[OK]' : '[FAIL]') + ' التخزين المحلي: ' + (storageOK ? 'متاح' : 'غير متاح'));
    lines.push((navigator.onLine ? '[INFO] الاتصال' : '[WARN] الاتصال') + ': ' + (navigator.onLine ? 'المتصفح يبلّغ عن اتصال؛ هذا لا يضمن الوصول لكل موقع' : 'غير متصل حسب المتصفح'));
    const hasScript = path => Array.from(document.scripts).some(script => (script.getAttribute('src') || '').includes(path));
    const modules = [
      ['مدير المحادثات', !!document.getElementById('historyList'), hasScript('js/app.js')],
      ['نواة اللغة المحلية', !!window.CHAOSLocalLanguage, hasScript('dailyLanguage.js')],
      ['طبقة الأمان المشتركة', !!window.ChaosSecurity, hasScript('security/index.js')],
      ['نواة CHAOS', !!window.ChaosCore, hasScript('coreEngine.js')],
      ['موجّه التطبيقات', typeof window.CHAOS?.routeIntent === 'function', hasScript('chaos-layer.js')],
      ['الأوامر المحلية', typeof window.ChaosCommands !== 'undefined', hasScript('words/commands.js')],
      ['الذاكرة اليدوية', !!window.ChaosSavedMemory, hasScript('savedMemory.js')],
      ['ذاكرة الويب', !!(window.ChaosWebMemory || (typeof ChaosWebMemory !== 'undefined' ? ChaosWebMemory : null)), hasScript('webMemory.js')],
      ['محرك البحث', !!(window.ChaosWebSearch || (typeof ChaosWebSearch !== 'undefined' ? ChaosWebSearch : null)), hasScript('webSearch.js')],
      ['إعدادات اللغة', !!window.ChaosTerminalLanguage, hasScript('terminalLanguage.js')],
      ['تحليل المشاعر', !!window.EmotionEngine, hasScript('emotions.js')],
      ['مخزن الأنماط المحلي', !!window.ChaosTextEngine, hasScript('textEngine.js')],
      ['سياق المحادثة', typeof window.ChaosContext !== 'undefined', hasScript('context.js')],
      ['شخصية الرعب المحلية', !!window.ChaosHauntingPersona, hasScript('hauntingPersona.js')],
      ['فيزياء الاصطدام', typeof window.PhysicsAndCollisionsEngine !== 'undefined', hasScript('Physics')],
      ['محلل GDScript', typeof window.GDScriptAnalyzerEngine !== 'undefined', hasScript('GDScript')],
      ['حالات حلقة اللعبة', typeof window.GameLoopAndStatesEngine !== 'undefined', hasScript('Game Loop')],
      ['حركة العقد', typeof window.NodesAndMovementEngine !== 'undefined', hasScript('Nodes & Movement')]
    ];
    lines.push('', 'الوحدات:');
    modules.forEach(([name, ok, expected]) => lines.push((ok ? '[OK] ' : expected ? '[WARN] ' : '[N/A] ') + name + (ok ? ' — متاح' : expected ? ' — متوقع لكنه غير متصل' : ' — غير محمّل في هذه الصفحة')));
    let total = 0;
    const auditCount = window.ChaosSecurity?.getAuditLog?.().length || 0;
    lines.push('', 'سجل الأمان المحلي: ' + auditCount + ' حدثًا (حد أقصى 100)', 'بيانات التخزين (حجم تقريبي بالبايت):');
    keys.forEach(key => { let value = ''; try { value = localStorage.getItem(key) || ''; } catch (_) {} const size = safeSize(value); total += size; lines.push('• ' + key + ': ' + (value ? size : 'فارغ')); });
    lines.push('الإجمالي التقريبي للمفاتيح المفحوصة: ' + total + ' بايت');
    const localModel = window.CHAOSLocalLanguage?.report?.();
    if (localModel) lines.push('', 'نواة اللغة المحلية:', '• العبارات/الأنماط: ' + localModel.phraseCount, '• عدد النكات: ' + (localModel.jokeCounts?.total || 0), '• نكات خفيفة: ' + (localModel.jokeCounts?.light || 0), '• رعب أسود: ' + (localModel.jokeCounts?.dark || 0), '• دموي كرتوني: ' + (localModel.jokeCounts?.blood || 0), '• الوضع: دون اتصال تلقائي', '• المحرك: قواعد واسترجاع ومولّد إحصائي اختياري، وليس LLM عصبيًا', '• أسلوب الفكاهة: ' + localModel.humorStyle, '• مولّد N-gram: ' + (localModel.localTextModel?.ready ? 'جاهز من أمثلة محلية صريحة' : 'غير جاهز؛ يتطلب أمثلة تدريب محلية'));
    const securityLayers = window.ChaosSecurity?.layers?.();
    if (securityLayers) lines.push('', 'طبقات الحماية المحلية:', ...Object.entries(securityLayers).map(([k,v]) => (v ? '[OK] ' : '[WARN] ') + k));
    lines.push('', 'الحدود المعروفة:',
      '• لا يوجد خادم خلفي أو مزامنة بين الأجهزة في هذه النسخة.',
      '• المحادثات والذكريات مرتبطة ببيانات المتصفح/أصل الموقع الحالي.',
      '• نواة اللغة المحلية تستخدم مطابقة واسترجاعًا وقواعد عربية وقائمة ردود مخزنة، وليست نموذجًا عصبيًا عامًا.',
      '• لا يجري أي إرسال تلقائي للرسائل إلى خدمة سحابية؛ البحث الخارجي يحتاج طلبًا صريحًا واتصالًا.',
      '• التعلم اللغوي المحلي اختياري ومحدود الحجم، ولا يحدث تلقائيًا عند إرسال الرسائل.',
      '• شخصية الرعب سرد محلي يعتمد على عدد الزيارات والتفاعلات، لا على مراقبة الجهاز أو وعي مستقل.',
      '• بحث الويب يعتمد على واجهة ويكيبيديا واتصال المتصفح؛ قد يفشل بسبب الشبكة أو قيود المتصفح.');
    return lines.join('\n');
  }
  window.ChaosDiagnostics = { report, checkStorage };
})();
