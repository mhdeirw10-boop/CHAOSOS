/**
 * ==========================================
 * EYE OF CHAOS - Characters Database
 * characters.js
 *
 * مسؤول عن:
 * - بيانات الشخصيات
 * - معلومات الشخصيات الرسمية
 * - الصور
 * - التصنيفات
 * - الوصف
 *
 * لا يحتوي على:
 * - واجهة المستخدم
 * - CHAOS SYSTEM
 * - الذاكرة
 * - ARG
 * - أسرار المشروع
 * ==========================================
 */

const CharactersData = {

    /* =========================================
       إعدادات قاعدة الشخصيات
       ========================================= */

    meta: {
        project: "Eye of Chaos",
        universe: "أسطورة الفوضى",
        version: "1.0",
        status: "ACTIVE"
    },


    /* =========================================
       الشخصيات
       ========================================= */

    characters: {

        /* -----------------------------------------
           سائر الفراغ
           ----------------------------------------- */

        sair: {

            id: "sair",

            name: "سائر الفراغ",

            aliases: [],

            type: "شخصية",

            status: "UNKNOWN",

            image:
                "images/characters/sair-al-faragh.webp",

            shortDescription:
                "وصف مختصر للشخصية يُضاف من السجل الرسمي.",

            description:
                "الوصف الكامل للشخصية يُضاف هنا من الـCanon الرسمي.",

            appearance: [],

            abilities: [],

            relationships: [],

            chapters: [],

            tags: [],

            canon: true

        },


        /* -----------------------------------------
           ياسين
           ----------------------------------------- */

        yasin: {

            id: "yasin",

            name: "ياسين",

            aliases: [],

            type: "شخصية",

            status: "UNKNOWN",

            image:
                "images/characters/yasin.webp",

            shortDescription:
                "وصف مختصر للشخصية يُضاف من السجل الرسمي.",

            description:
                "الوصف الكامل للشخصية يُضاف هنا من الـCanon الرسمي.",

            appearance: [],

            abilities: [],

            relationships: [],

            chapters: [],

            tags: [],

            canon: true

        }

    },


    /* =========================================
       الحصول على شخصية بواسطة ID
       ========================================= */

    getById: function(id) {

        if (!id) {
            return null;
        }

        return this.characters[id] || null;
    },


    /* =========================================
       الحصول على جميع الشخصيات
       ========================================= */

    getAll: function() {

        return Object.values(this.characters);

    },


    /* =========================================
       البحث عن شخصية بالاسم
       ========================================= */

    search: function(query) {

        if (!query) {
            return [];
        }

        const cleanQuery =
            query
                .trim()
                .toLowerCase();

        if (!cleanQuery) {
            return [];
        }

        return this.getAll().filter(function(character) {

            const name =
                character.name
                    .toLowerCase();

            const aliases =
                Array.isArray(character.aliases)
                    ? character.aliases
                    : [];

            const aliasMatch =
                aliases.some(function(alias) {

                    return alias
                        .toLowerCase()
                        .includes(cleanQuery);

                });

            return (
                name.includes(cleanQuery) ||
                aliasMatch
            );

        });

    },


    /* =========================================
       الحصول على الشخصيات حسب النوع
       ========================================= */

    getByType: function(type) {

        if (!type) {
            return [];
        }

        const cleanType =
            type
                .trim()
                .toLowerCase();

        return this.getAll().filter(function(character) {

            return character.type
                .toLowerCase() === cleanType;

        });

    },


    /* =========================================
       الحصول على الشخصيات حسب الوسم
       ========================================= */

    getByTag: function(tag) {

        if (!tag) {
            return [];
        }

        const cleanTag =
            tag
                .trim()
                .toLowerCase();

        return this.getAll().filter(function(character) {

            if (!Array.isArray(character.tags)) {
                return false;
            }

            return character.tags.some(function(item) {

                return item
                    .toLowerCase() === cleanTag;

            });

        });

    },


    /* =========================================
       التحقق من وجود الشخصية
       ========================================= */

    exists: function(id) {

        return Boolean(
            id &&
            this.characters[id]
        );

    },


    /* =========================================
       عدد الشخصيات
       ========================================= */

    count: function() {

        return Object.keys(
            this.characters
        ).length;

    }

};


/* ==========================================
   اختصار اختياري للوصول للبيانات
   ========================================== */

const Characters = CharactersData;