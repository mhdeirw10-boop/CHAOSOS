// ==========================================
// CHAOS SYSTEM: NPC Memory & Integration Engine
// مسار الحفظ والتكامل مع الشخصيات غير القابلة للعب (NPCs)
// ==========================================

const NPCMemoryEngine = {
    module: "NPC Memory Core",
    status: "ACTIVE",

    // تخزين ذاكرة الشخصيات بشكل هيكلي
    npcMemoryRegistry: {},

    // تهيئة أو استرجاع ذاكرة شخصية محددة
    getOrInitMemory: function(npcId) {
        if (!this.npcMemoryRegistry[npcId]) {
            this.npcMemoryRegistry[npcId] = {
                shortTerm: [], // الأحداث الحالية والتفاعلات السريعة
                longTerm: [],  // القرارات المصيرية والتحالفات أو العداوات الثابتة
                emotionalState: "NEUTRAL",
                lastInteraction: null
            };
        }
        return this.npcMemoryRegistry[npcId];
    },

    // حفظ تفاعل جديد ودمجه مع الذاكرة
    saveInteraction: function(npcId, interactionData) {
        const memory = this.getOrInitMemory(npcId);
        
        // إضافة الحدث للذاكرة قصيرة المدى
        memory.shortTerm.push({
            timestamp: Date.now(),
            action: interactionData.action,
            context: interactionData.context || "none"
        });

        // تقييد حجم الذاكرة قصيرة المدى لعدم تضخم البيانات
        if (memory.shortTerm.length > 20) {
            memory.shortTerm.shift();
        }

        memory.lastInteraction = interactionData;
        return `تم حفظ تفاعل الشخصية (${npcId}) بنجاح وتحديث الوعي العصبي.`;
    },

    // نقل الأحداث المهمة للذاكرة طويلة المدى بناءً على الأهمية
    consolidateToLongTerm: function(npcId, significantEvent) {
        const memory = this.getOrInitMemory(npcId);
        memory.longTerm.push({
            event: significantEvent,
            recordedAt: Date.now()
        });
        return `تم ترسيخ الحدث في الذاكرة طويلة المدى للكيان (${npcId}).`;
    },

    // واجهة التكامل مع نظام الألعاب (تزويد الـ NPC بالقرارات بناءً على الذاكرة)
    exportContextForGameEngine: function(npcId) {
        const memory = this.getOrInitMemory(npcId);
        return {
            targetNPC: npcId,
            currentEmotion: memory.emotionalState,
            recentMemories: memory.shortTerm,
            coreValues: memory.longTerm,
            integrationStatus: "SYNCHRONIZED_WITH_GAMES_MODULE"
        };
    }
};

// تصدير الوحدة لنظام الذاكرة والربط مع محرك الألعاب
if (typeof module !== 'undefined') {
    module.exports = NPCMemoryEngine;
}
