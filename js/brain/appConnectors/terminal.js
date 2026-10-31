/* Terminal connector: only user's own local records; full reads require explicit permission. */
(function (g) {
  'use strict'; const B = g.CHAOSAppCapabilities; if (!B) return;
  const read = key => { try { return JSON.parse(g.localStorage?.getItem(key) || '[]'); } catch { return []; } };
  const norm = value => String(value ?? '').toLocaleLowerCase('ar');
  B.register({
    id: 'terminal-data', appId: 'terminal', title: 'CHAOS SYSTEM Terminal Data',
    description: 'سجل المحادثات والذكريات المحلية، مع اختصار النتائج.',
    actions: {
      history: {
        title: 'قراءة ملخص سجل المحادثات', permission: 'read',
        handler: () => {
          const sessions = read('chaos_chat_history');
          return Array.isArray(sessions) ? sessions.slice(0, 30).map(s => ({ id: s.id, title: s.title, createdAt: s.createdAt, updatedAt: s.updatedAt, messageCount: Array.isArray(s.messages) ? s.messages.length : 0 })) : [];
        }
      },
      search: {
        title: 'البحث في سجل المحادثات', permission: 'read',
        handler: p => {
          const q = norm(p.query); if (!q) throw Error('اكتب كلمة بحث.');
          const out = [];
          for (const s of read('chaos_chat_history')) {
            for (const m of (Array.isArray(s.messages) ? s.messages : [])) {
              if (norm(m.content).includes(q)) {
                out.push({ sessionTitle: s.title, role: m.role, time: m.timestamp, excerpt: String(m.content || '').slice(0, 420) });
                if (out.length >= 20) return out;
              }
            }
          }
          return out;
        }
      },
      memories: {
        title: 'قراءة ذكريات CHAOS المشتركة', permission: 'read',
        handler: () => read('voidos_chaos_layer_memory_v1').slice(0, 60).map(x => ({ id: x.id, text: String(x.text || '').slice(0, 500), time: x.time }))
      }
    }
  });
})(window);
