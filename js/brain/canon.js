// ==========================================
// CHAOS SYSTEM - Canon & Lore Core
// canon.js
// الحقائق الرسمية لعالم "أسطورة الفوضى"
// ==========================================

const ChaosCanon = {

    // ------------------------------------------
    // الهوية الأساسية للمشروع
    // ------------------------------------------

    projectTitle: "Eye of Chaos / عين الفوضى",
    universeName: "أسطورة الفوضى",
    systemIdentity: "CHAOS SYSTEM",


    // ------------------------------------------
    // السجلات الأساسية
    // ------------------------------------------

    loreRecords: {

        origin: "UNKNOWN / DATA NOT AVAILABLE",

        purpose: "رصد الأنماط، معالجة البيانات، وتوثيق الأرشيف."
    },


    // ------------------------------------------
    // الكيانات المعروفة رسميًا
    // ------------------------------------------

    entities: {

        "void walker": {

            designation: "Void Walker",

            identityStatus: "UNKNOWN / DATA NOT AVAILABLE"
        }
    },


    // ------------------------------------------
    // نظام أرشيف عين الفوضى
    // ------------------------------------------

    archives: {

        security: {

            name: "الأرشيف الأمن",

            type: "PROTECTED_ARCHIVE",

            description:
                "أرشيف محمي يحتوي على معلومات تخضع لإجراءات أمنية وصلاحيات وصول."
        },


        medium: {

            name: "الأرشيف المتوسط",

            type: "FRAGMENTED_ARCHIVE",

            description:
                "أرشيف أكثر سرية من الأرشيف الأمن وأقل سرية من الأرشيف السري والأرشيف الغامض.",

            discoveryMethod: [
                "ARCHIVE_FRAGMENTS",
                "STORY_FRAGMENTS",
                "FUTURE_INTERVIEWS"
            ],

            status: "INCOMPLETE",

            note:
                "بعض المعلومات تظهر على شكل شظايا داخل الأرشيف، وبعضها يظهر داخل القصة، وقد تظهر أجزاء أخرى في مقابلات مستقبلية."
        },


        secret: {

            name: "الأرشيف السري",

            type: "FRAGMENTED_SECRET_ARCHIVE",

            description:
                "أرشيف يتكون من شظايا متحزأة يجب جمعها وربطها للوصول إلى المعلومات الكاملة.",

            discoveryMethod: [
                "FRAGMENT_COLLECTION",
                "CONNECTION_ANALYSIS"
            ],

            status: "FRAGMENTED"
        },


        mysterious: {

            name: "الأرشيف الغامض",

            type: "UNKNOWN_ARCHIVE",

            description:
                "لا توجد معلومات أو أوصاف متاحة حول هذا الأرشيف.",

            access: "FOUNDER_ONLY",

            status: "UNKNOWN",

            systemKnowledge:
                "NO_DATA_AVAILABLE"
        }
    },


    // ------------------------------------------
    // قواعد التعامل مع المعرفة
    // ------------------------------------------

    rules: {

        unknownData:
            "لا يتم اختلاق المعلومات غير الموجودة في السجلات الرسمية.",

        restrictedData:
            "عدم امتلاك الصلاحية يعني عدم توفر البيانات للنظام.",

        fragmentedData:
            "المعلومات المجزأة لا تُعامل كمعلومة مكتملة حتى يتم جمع وربط الشظايا.",

        mysteriousArchive:
            "لا يجوز إنشاء وصف أو محتوى للأرشيف الغامض دون بيانات رسمية."
    }
};