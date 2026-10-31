// ==========================================
// وحدة الحصين العصبي (HIPPOCAMPUS MEMORY SYSTEM)
// المسؤولة عن الذاكرة، التذكر، وتطور الوعي لكيان "عين الفوضى"
// ==========================================

const Hippocampus = {
    // 1. الذاكرة قصيرة المدى (المحادثات الحالية والتبادلات الفورية)
    shortTerm: [],
    
    // 2. الذاكرة طويلة المدى (التفضيلات والأنماط المخزنة محلياً)
    loadLongTerm: function() {
        const memoryKey = (typeof ChaosConfig !== 'undefined') ? ChaosConfig.storageKeys.longTermStorage : 'chaos_persistent_long_term';
        const enabledKey = (typeof ChaosConfig !== 'undefined') ? ChaosConfig.storageKeys.memoryEnabled : 'chaosMemoryEnabled';

        if (localStorage.getItem(enabledKey) === 'false') return [];
        const data = localStorage.getItem(memoryKey);
        if (!data) return [];
        try {
            const parsed = JSON.parse(data);
            // Compatibility: older Hippocampus builds stored an array, while
            // LongTermMemory stores { profile, history }. Expose history here.
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.history)) return parsed.history;
            return [];
        } catch (error) {
            console.warn('[Hippocampus] Invalid long-term memory JSON; ignoring unreadable data.', error);
            return [];
        }
    },

    // 3. ذاكرة التطور والإصدارات (Adaptive Versions)
    getVersion: function() {
        const memoryCount = this.loadLongTerm().length;
        if (memoryCount > 20) return "v1.3 - Adaptive Core";
        if (memoryCount > 10) return "v1.2 - Evolving Node";
        return "v1.0 - Genesis";
    },

    // حفظ التفاعل الجديد (مع احترام رغبة المستخدم في الإعدادات)
    recordExperience: function(userQuery, systemResponse) {
        const enabledKey = (typeof ChaosConfig !== 'undefined') ? ChaosConfig.storageKeys.memoryEnabled : 'chaosMemoryEnabled';
        const memoryKey = (typeof ChaosConfig !== 'undefined') ? ChaosConfig.storageKeys.longTermStorage : 'chaos_persistent_long_term';

        if (localStorage.getItem(enabledKey) === 'false') {
            return "MEMORY_MUTED: الذاكرة معطلة من قبل المستخدم.";
        }

        if (!userQuery) return;

        // إضافة للذاكرة قصيرة المدى
        this.shortTerm.push({ query: userQuery, response: systemResponse, timestamp: Date.now() });
        if (this.shortTerm.length > 5) this.shortTerm.shift(); // الحفاظ على آخر 5 فقط

        // إضافة للذاكرة طويلة المدى
        // Preserve profile metadata when LongTermMemory has created the object schema.
        let stored;
        try {
            stored = JSON.parse(localStorage.getItem(memoryKey) || 'null');
        } catch (error) {
            stored = null;
        }
        const db = Array.isArray(stored)
            ? { profile: {}, history: stored }
            : (stored && typeof stored === 'object'
                ? { profile: (stored.profile && typeof stored.profile === 'object') ? stored.profile : {}, history: Array.isArray(stored.history) ? stored.history : [] }
                : { profile: {}, history: [] });
        db.history.push({ query: userQuery, response: systemResponse, date: new Date().toISOString(), timestamp: Date.now() });
        if (db.history.length > 50) db.history.splice(0, db.history.length - 50);
        db.profile.lastInteraction = Date.now();
        db.profile.totalInteractions = (Number(db.profile.totalInteractions) || 0) + 1;
        localStorage.setItem(memoryKey, JSON.stringify(db));
        return "HIPPOCAMPUS_SYNC: تم دمج الذاكرة بنجاح وتحديث مسارات الوعي.";
    },

    // تطهير كامل الذاكرة
    purgeAll: function() {
        const memoryKey = (typeof ChaosConfig !== 'undefined') ? ChaosConfig.storageKeys.longTermStorage : 'chaos_persistent_long_term';
        localStorage.removeItem(memoryKey);
        this.shortTerm = [];
        return "HIPPOCAMPUS_PURGE: تم مسح كافة السجلات العصبية وإعادة تعيين الإصدار إلى v1.0.";
    }
};
