/**
 * ==========================================
 * EYE OF CHAOS - Chapters Database
 * chapters.js
 *
 * مسؤول عن:
 * - بيانات الفصول
 * - عناوين الفصول
 * - وصف الفصول
 * - صفحات المانجا
 * - ترتيب الصفحات
 *
 * لا يحتوي على:
 * - واجهة المستخدم
 * - CHAOS SYSTEM
 * - الذاكرة
 * - ARG
 * - الأسرار
 * ==========================================
 */

const ChaptersData = {

    /* =========================================
       معلومات قاعدة الفصول
       ========================================= */

    meta: {
        project: "Eye of Chaos",
        universe: "أسطورة الفوضى",
        version: "1.0",
        status: "ACTIVE"
    },


    /* =========================================
       الفصول
       ========================================= */

    chapters: {

        /* -----------------------------------------
           الفصل الأول
           ----------------------------------------- */

        chapter01: {

            id: "chapter01",

            number: 1,

            title: "عنوان الفصل الأول",

            description:
                "وصف مختصر للفصل يوضع هنا.",

            status: "AVAILABLE",

            pages: [

                {
                    number: 1,
                    image:
                        "images/manga/chapter-01/page-01.webp"
                },

                {
                    number: 2,
                    image:
                        "images/manga/chapter-01/page-02.webp"
                },

                {
                    number: 3,
                    image:
                        "images/manga/chapter-01/page-03.webp"
                }

            ]

        },


        /* -----------------------------------------
           الفصل الثاني
           ----------------------------------------- */

        chapter02: {

            id: "chapter02",

            number: 2,

            title: "عنوان الفصل الثاني",

            description:
                "وصف مختصر للفصل يوضع هنا.",

            status: "AVAILABLE",

            pages: [

                {
                    number: 1,
                    image:
                        "images/manga/chapter-02/page-01.webp"
                },

                {
                    number: 2,
                    image:
                        "images/manga/chapter-02/page-02.webp"
                }

            ]

        }

    },


    /* =========================================
       الحصول على فصل بواسطة ID
       ========================================= */

    getById: function(id) {

        if (!id) {
            return null;
        }

        return this.chapters[id] || null;

    },


    /* =========================================
       الحصول على جميع الفصول
       ========================================= */

    getAll: function() {

        return Object.values(this.chapters);

    },


    /* =========================================
       الحصول على فصل بواسطة رقمه
       ========================================= */

    getByNumber: function(number) {

        if (number === undefined || number === null) {
            return null;
        }

        return this.getAll().find(
            function(chapter) {

                return chapter.number === number;

            }
        ) || null;

    },


    /* =========================================
       الحصول على صفحات فصل معين
       ========================================= */

    getPages: function(id) {

        const chapter =
            this.getById(id);

        if (!chapter) {
            return [];

        }

        return Array.isArray(chapter.pages)
            ? chapter.pages
            : [];

    },


    /* =========================================
       عدد الفصول
       ========================================= */

    count: function() {

        return Object.keys(
            this.chapters
        ).length;

    },


    /* =========================================
       عدد صفحات فصل معين
       ========================================= */

    pageCount: function(id) {

        const pages =
            this.getPages(id);

        return pages.length;

    },


    /* =========================================
       التحقق من وجود فصل
       ========================================= */

    exists: function(id) {

        return Boolean(
            id &&
            this.chapters[id]
        );

    }

};


/* ==========================================
   اختصار اختياري
   ========================================== */

const Chapters = ChaptersData;