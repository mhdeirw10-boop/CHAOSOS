/* System/catalog connectors: metadata and diagnostics only; no shell command execution. */
(function (g) {
  'use strict';
  const B = g.CHAOSAppCapabilities;
  if (!B) return;

  B.register({
    id: 'system',
    appId: 'terminal',
    title: 'CHAOSOS System',
    description: 'فهرس التطبيقات والخدمات ومؤشرات النواة.',
    actions: {
      apps: {
        title: 'قراءة سجل التطبيقات',
        permission: 'read',
        handler: () => {
          const rows = g.VoidAppCatalog?.apps || g.VoidAppManager?.list?.() || [];
          return rows.slice(0, 100).map(x => ({
            id: x.id, title: x.title, path: x.path, category: x.category,
            permissions: x.permissions || [], limitations: x.limitations || ''
          }));
        }
      },
      services: {
        title: 'قراءة حالة الخدمات',
        permission: 'read',
        handler: () => ({
          services: g.VoidServiceSupervisor?.list?.() || g.VoidServiceRegistry?.list?.() || [],
          diagnostics: g.VoidKernelDiagnostics?.snapshot?.() || null
        })
      },
      inspect: {
        title: 'فحص واجهات تطبيق مسجل',
        permission: 'read',
        handler: p => {
          const id = String(p.appId || '').slice(0, 100);
          const app = (g.VoidAppCatalog?.apps || []).find(x => String(x.id).toLowerCase() === id.toLowerCase());
          if (!app) throw Error('معرّف التطبيق غير موجود في السجل.');
          return {
            app: { id: app.id, title: app.title, path: app.path, category: app.category, permissions: app.permissions || [] },
            declaredConnectors: B.list().filter(c => c.appId === app.id).map(c => ({
              id: c.id, title: c.title,
              actions: c.actions.map(a => ({ id: a.id, title: a.title, permission: a.permission, description: a.description }))
            })),
            boundary: 'المعلومات المعروضة هي واجهات معلنة فقط؛ لا يجري فحص بيانات مخفية أو ملفات نظام Android.'
          };
        }
      }
    }
  });
})(window);
