/* Manifest-scoped read-only project file adapter. Requires explicit app consent and Void Files' local read toggle. */
(function (g) {
  'use strict';
  const B = g.CHAOSAppCapabilities;
  if (!B) return;
  B.register({
    id: 'project-files', appId: 'void-files', title: 'Void Files / Project Workspace',
    description: 'بحث وقراءة محدودة لملفات نصية ضمن فهرس المشروع المعلن، للقراءة فقط.',
    actions: {
      manifest: {
        title: 'قراءة فهرس مسارات المشروع', permission: 'read',
        handler: async () => {
          if (!g.ChaosProjectFiles) throw Error('خدمة ملفات المشروع غير محمّلة في هذا السياق.');
          return (await g.ChaosProjectFiles.manifest()).slice(0, 100);
        }
      },
      search: {
        title: 'البحث في ملفات المشروع النصية', permission: 'read',
        handler: async p => {
          if (!g.ChaosProjectFiles) throw Error('خدمة ملفات المشروع غير محمّلة في هذا السياق.');
          const q = String(p.query || '').trim();
          if (!q) throw Error('اذكر اسم ملف أو موضوعًا للبحث.');
          const out = await g.ChaosProjectFiles.search(q, 5);
          if (!out?.ok) throw Error(out?.message || 'تعذّر البحث في ملفات المشروع.');
          return { readOnly: true, queryLength: q.length, scanned: out.scanned, results: (out.results || []).map(x => ({ path: x.path, name: x.name, score: x.score, excerpt: String(x.excerpt || '').slice(0, 520) })), cloudSent: false };
        }
      }
    }
  });
})(window);
