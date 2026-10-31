// ==========================================
// CHAOS SYSTEM - Global Configuration
// config.js
// الإعدادات المركزية وثوابت النظام العامة
// ==========================================

const ChaosConfig = {

    // ------------------------------------------
    // هوية النظام
    // ------------------------------------------

    projectName: "Eye of Chaos / CHAOSOS by Void Walker",
    systemIdentity: "CHAOSOS",
    version: "2.5.0",


    // ------------------------------------------
    // وضع التطوير
    // ------------------------------------------

    // false = الوضع الطبيعي
    // true  = عرض معلومات وأدوات التطوير
    debugMode: false,


    // ------------------------------------------
    // اللغة الافتراضية
    // ------------------------------------------

    language: "ar",


    // ------------------------------------------
    // مفاتيح التخزين
    // ------------------------------------------

    // جميع مفاتيح localStorage تُعرّف هنا
    // لمنع اختلاف الأسماء أو تضاربها بين الوحدات.

    storageKeys: {

        memoryEnabled: "chaosMemoryEnabled",

        longTermStorage: "chaos_persistent_long_term",

        shortTermBuffer: "chaos_short_term_buffer",

        webMemory: "chaos_web_memory"
    }
};