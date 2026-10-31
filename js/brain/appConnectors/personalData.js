/* Explicitly consent-gated local records. Does not query native Android contacts or SMS. */
(function (g) {
  'use strict';
  const B = g.CHAOSAppCapabilities;
  if (!B) return;
  const arr = key => { try { const v = JSON.parse(g.localStorage?.getItem(key) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  const obj = key => { try { const v = JSON.parse(g.localStorage?.getItem(key) || '{}'); return v && typeof v === 'object' ? v : {}; } catch { return {}; } };

  B.register({
    id: 'phone-local', appId: 'void-phone', title: 'Void Phone local contacts',
    description: 'جهات الاتصال المحلية فقط إن وُجدت في تخزين التطبيق؛ لا يقرأ دفتر Android الأصلي.',
    actions: {
      contacts: {
        title: 'قراءة جهات الاتصال المحلية', permission: 'read',
        handler: () => arr('voidos_phone_contacts_v1').slice(0, 100).map(x => ({
          id: x.id, name: String(x.name || x.displayName || '').slice(0, 160),
          phone: String(x.phone || x.number || x.num || '').slice(0, 80), email: String(x.email || '').slice(0, 160)
        }))
      }
    }
  });

  B.register({
    id: 'messages-local', appId: 'void-messages', title: 'Void Messages local drafts',
    description: 'مسودات محلية في التطبيق فقط؛ لا يقرأ الرسائل النصية الحقيقية في Android.',
    actions: {
      drafts: {
        title: 'قراءة مسودات الرسائل المحلية', permission: 'read',
        handler: () => {
          const v = obj('voidos_message_drafts_v1');
          if (Array.isArray(v)) return v.slice(0, 60).map(x => ({ id: x.id, to: x.to || '', text: String(x.text || x.body || '').slice(0, 350), updatedAt: x.updatedAt || x.createdAt }));
          return Object.entries(v).slice(0, 60).map(([id, x]) => ({ id, to: x?.to || '', text: String(x?.text || x?.body || '').slice(0, 350) }));
        }
      }
    }
  });

  B.register({
    id: 'settings-local', appId: 'settings', title: 'CHAOSOS Settings',
    description: 'قيم الإعدادات المعروفة والمسموح بها فقط، دون مفاتيح أو رموز مصادقة.',
    actions: {
      summary: {
        title: 'قراءة ملخص الإعدادات المحلية', permission: 'read',
        handler: () => {
          const keys = ['voidos_shell_settings_v1', 'voidos_global_settings_v1', 'chaosos_local_language_v1', 'voidos_ai_gateway_preferences_v1', 'chaosos_chaosai_project_read'];
          const out = {};
          const redact = (value, depth = 0) => {
            if (depth > 3) return '[تم الاختصار]';
            if (Array.isArray(value)) return value.slice(0, 40).map(x => redact(x, depth + 1));
            if (value && typeof value === 'object') {
              const row = {};
              for (const [k, v] of Object.entries(value).slice(0, 80)) {
                if (/(key|token|secret|password|credential|authorization|api.?key|private)/i.test(k)) { row[k] = '[محجوب]'; continue; }
                row[k] = redact(v, depth + 1);
              }
              return row;
            }
            return typeof value === 'string' ? value.slice(0, 500) : value;
          };
          for (const key of keys) {
            const raw = g.localStorage?.getItem(key);
            if (raw === null || raw === undefined) continue;
            try { out[key] = redact(JSON.parse(raw)); } catch { out[key] = String(raw).slice(0, 500); }
          }
          return out;
        }
      }
    }
  });
})(window);
