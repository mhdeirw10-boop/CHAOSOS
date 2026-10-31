// Chaos AI Adaptive Memory Engine - نظام الذاكرة الحية والتطور الذاتي المتقدم
const ChaosMemory = {
    storage: {
        learnedResponses: {},
        interactionHistory: [],
        version: "1.0"
    },

    // حفظ واستيعاب الاستعلام مع تنظيف الحشو ودمج التكرار
    saveInteraction: function(userQuery, aiResponse) {
        if (!userQuery) return;
        
        const cleanKey = userQuery.toLowerCase().trim();
        
        // 1. تنظيف الحشو: تجاهل الكلمات القصيرة جداً أو غير المفيدة لتخفيف الذاكرة
        if (cleanKey.length < 2) return;

        // 2. دمج الأسئلة المتكررة: تحديث الرد مباشرة إذا كان السؤال موجوداً مسبقاً بدلاً من تكراره
        this.storage.learnedResponses[cleanKey] = aiResponse;
        
        // التحقق من عدم تكرار السجل التاريخي حرفياً
        const existingIndex = this.storage.interactionHistory.findIndex(item => item.query === cleanKey);
        if (existingIndex !== -1) {
            // تحديث الطابع الزمني والرد للسؤال الموجود مسبقاً
            this.storage.interactionHistory[existingIndex].response = aiResponse;
            this.storage.interactionHistory[existingIndex].timestamp = Date.now();
        } else {
            // إضافة سجل جديد إذا كان فريداً
            this.storage.interactionHistory.push({
                query: cleanKey,
                response: aiResponse,
                timestamp: Date.now()
            });
        }

        // 3. التنظيف التلقائي الذاتي: إذا تجاوز التاريخ 50 مدخل، يتم حذف الأقدم غير المفيد أو الزائد للحفاظ على خفة وسرعة النظام
        if (this.storage.interactionHistory.length > 50) {
            this.storage.interactionHistory.shift(); // يحذف أقدم مدخل
        }

        // 4. ترقية إصدار الذاكرة تلقائياً كلما زادت التفاعلات المفيدة
        if (this.storage.interactionHistory.length % 5 === 0) {
            let currentVer = parseFloat(this.storage.version);
            this.storage.version = (currentVer + 0.1).toFixed(1);
        }
    },

    // استرجاع الذاكرة والبحث بمرونة عالية
    getLearnedResponse: function(userQuery) {
        if (!userQuery) return null;
        const cleanKey = userQuery.toLowerCase().trim();
        
        if (this.storage.learnedResponses[cleanKey]) {
            return "[ADAPTIVE MEMORY v" + this.storage.version + "]: " + this.storage.learnedResponses[cleanKey];
        }
        return null;
    },

    // تنظيف شامل وإعادة ضبط الذاكرة
    clearMemory: function() {
        this.storage.learnedResponses = {};
        this.storage.interactionHistory = [];
        this.storage.version = "1.0";
        return "MEMORY_RESET: تم تطهير الذاكرة بالكامل وإعادة ضبط خوارزميات التعلم.";
    }
};
