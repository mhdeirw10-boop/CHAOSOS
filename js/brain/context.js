// ==========================================
// CHAOS SYSTEM - Context Core
// context.js
// إدارة سياق النظام والجلسة الحالية
// ==========================================

const ChaosContext = {

    // ------------------------------------------
    // السياق الحالي
    // ------------------------------------------

    current: {
        page: null,
        section: null,
        archive: null,
        action: null,
        lastQuery: null,
        lastResponse: null
    },


    // ------------------------------------------
    // تحديث السياق
    // ------------------------------------------

    set: function(data) {

        if (!data || typeof data !== "object") {
            return;
        }

        Object.assign(this.current, data);
    },


    // ------------------------------------------
    // قراءة قيمة من السياق
    // ------------------------------------------

    get: function(key) {

        if (!key) {
            return null;
        }

        return this.current[key] ?? null;
    },


    // ------------------------------------------
    // تحديث الصفحة الحالية
    // ------------------------------------------

    setPage: function(page) {

        this.current.page = page || null;
    },


    // ------------------------------------------
    // تحديث القسم الحالي
    // ------------------------------------------

    setSection: function(section) {

        this.current.section = section || null;
    },


    // ------------------------------------------
    // تحديث الأرشيف الحالي
    // ------------------------------------------

    setArchive: function(archive) {

        this.current.archive = archive || null;
    },


    // ------------------------------------------
    // تسجيل آخر استعلام
    // ------------------------------------------

    setLastQuery: function(query) {

        this.current.lastQuery = query || null;
    },


    // ------------------------------------------
    // تسجيل آخر استجابة
    // ------------------------------------------

    setLastResponse: function(response) {

        this.current.lastResponse = response || null;
    },


    // ------------------------------------------
    // تسجيل آخر إجراء
    // ------------------------------------------

    setAction: function(action) {

        this.current.action = action || null;
    },


    // ------------------------------------------
    // الحصول على نسخة من السياق
    // ------------------------------------------

    getSnapshot: function() {

        return {
            ...this.current
        };
    },


    // ------------------------------------------
    // مسح السياق الحالي
    // ------------------------------------------

    clear: function() {

        this.current = {
            page: null,
            section: null,
            archive: null,
            action: null,
            lastQuery: null,
            lastResponse: null
        };
    }
};
if (typeof window !== 'undefined') window.ChaosContext = ChaosContext;
