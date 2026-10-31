/* Additional explicitly-declared app adapters. No binary media or remote account data is read. */
(function (g) {
  'use strict';
  const B = g.CHAOSAppCapabilities;
  if (!B) return;
  const read = (key, fallback) => { try { const v = JSON.parse(g.localStorage?.getItem(key) ?? JSON.stringify(fallback)); return v ?? fallback; } catch { return fallback; } };
  const arr = key => { const v = read(key, []); return Array.isArray(v) ? v : []; };

  B.register({
    id: 'discovery', appId: 'void-discovery', title: 'Void Discovery',
    description: 'آخر عملية بحث خارجية مسجلة محليًا؛ لا يقرأ سجل الحسابات الخارجية.',
    actions: {
      lastSearch: { title: 'قراءة آخر بحث في المستكشف', permission: 'read', handler: () => {
        const x = read('voidos_discovery_last_external_v1', null);
        return x && typeof x === 'object' ? { provider: String(x.provider || '').slice(0, 80), query: String(x.query || '').slice(0, 300), at: x.at || null } : null;
      } }
    }
  });

  B.register({
    id: 'arcade', appId: 'void-arcade', title: 'Void Arcade',
    description: 'أفضل نتيجة محلية فقط؛ لا يقرأ سجل استخدام خارجي.',
    actions: {
      bestScore: { title: 'قراءة أفضل نتيجة محلية', permission: 'read', handler: () => ({ bestScore: Math.max(0, Math.min(100000000, Number(g.localStorage?.getItem('riftRunnerBest_v1') || 0) || 0)) }) }
    }
  });

  B.register({
    id: 'calculator-history', appId: 'void-calculator', title: 'Void Calculator',
    description: 'سجل حسابات محلي اختياري ومحدود؛ لا ينفذ التعبيرات خلال القراءة.',
    actions: {
      history: { title: 'قراءة سجل العمليات الحسابية', permission: 'read', handler: () => arr('voidos_calculator_history_v1').slice(0, 40).map(x => ({ expression: String(x.expr || '').slice(0, 120), result: String(x.result || '').slice(0, 100), at: Number(x.at) || null })) }
    }
  });

  B.register({
    id: 'gallery-local', appId: 'void-gallery', title: 'Void Gallery metadata',
    description: 'أسماء وخصائص الملفات التي اختارها المستخدم داخل المعرض؛ لا يقرأ الصور نفسها.',
    actions: {
      selections: { title: 'قراءة بيانات الصور المختارة', permission: 'read', handler: () => arr('voidos_apps_المعرض_v1').slice(0, 100).map(x => ({ name: String(x.name || '').slice(0, 180), type: String(x.type || '').slice(0, 100), size: Math.max(0, Number(x.size) || 0), lastModified: Number(x.lastModified) || null, selectedAt: Number(x.selectedAt) || null })) }
    }
  });

  B.register({
    id: 'camera-local', appId: 'void-camera', title: 'Void Camera metadata',
    description: 'سجل بيانات التقاط محلي (الوقت والأبعاد فقط)، دون تخزين أو قراءة بايتات الصور.',
    actions: {
      captures: { title: 'قراءة سجل الالتقاطات المحلي', permission: 'read', handler: () => arr('voidos_apps_الكاميرا_v1').slice(0, 100).map(x => ({ filename: String(x.filename || '').slice(0, 180), capturedAt: Number(x.capturedAt) || null, width: Math.max(0, Number(x.width) || 0), height: Math.max(0, Number(x.height) || 0), type: String(x.type || 'image/jpeg').slice(0, 40) })) }
    }
  });

  B.register({
    id: 'mail-local', appId: 'void-mail', title: 'Void Mail local drafts',
    description: 'مسودات بريد حفظها المستخدم داخل CHAOSOS؛ لا يقرأ صندوق بريد خارجي أو يرسل رسائل.',
    actions: {
      drafts: { title: 'قراءة ملخص مسودات البريد المحلية', permission: 'read', handler: () => arr('voidos_apps_البريد_v1').slice(0, 60).map(x => ({ id: String(x.id || '').slice(0, 100), to: String(x.to || '').slice(0, 180), subject: String(x.subject || '').slice(0, 180), preview: String(x.body || '').slice(0, 180), updatedAt: Number(x.updatedAt) || null })) },
      search: { title: 'البحث في مسودات البريد المحلية', permission: 'read', handler: p => { const q = String(p.query || '').trim().toLocaleLowerCase('ar'); if (!q) throw Error('اكتب كلمة بحث.'); return arr('voidos_apps_البريد_v1').filter(x => String((x.to || '') + ' ' + (x.subject || '') + ' ' + (x.body || '')).toLocaleLowerCase('ar').includes(q)).slice(0, 20).map(x => ({ id: String(x.id || '').slice(0, 100), to: String(x.to || '').slice(0, 180), subject: String(x.subject || '').slice(0, 180), excerpt: String(x.body || '').slice(0, 300), updatedAt: Number(x.updatedAt) || null })) } }
    }
  });
})(window);
