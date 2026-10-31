// ==========================================
// HIPPOCAMPUS: Short-Term Memory Engine (shortTerm.js)
// مسؤول عن الذاكرة المؤقتة، المحادثات السريعة، والسياق الحالي المتطاير
// ==========================================

const ShortTermMemory = {
    // مصفوفة الذاكرة المؤقتة (تتواجد في الذاكرة الحية للجلسة الحالية)
    buffer: [],
    maxSize: 5, // الحد الأقصى للاحتفاظ بآخر التفاعلات الفورية لضمان سرعة الاستجابة

    // إضافة تفاعل جديد للذاكرة المؤقتة
    push: function(userQuery, aiResponse) {
        if (!userQuery) return;

        this.buffer.push({
            query: userQuery,
            response: aiResponse,
            timestamp: Date.now()
        });

        // الحفاظ على حجم نافذة السياق الفوري ضمن الحد المحدد
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift(); // إزالة أقدم تفاعل مؤقت تلقائياً
        }
    },

    // استرجاع السياق الفوري الحالي لمساعدة الكيان في فهم الحوار الجاري
    getContext: function() {
        return this.buffer;
    },

    // تفريغ الذاكرة المؤقتة فوراً (تُستعمل عند إعادة ضبط الجلسة أو يدوياً)
    clear: function() {
        this.buffer = [];
        return "SHORT_TERM_RESET: تم مسح الذاكرة المؤقتة والفورية بنجاح.";
    }
};
