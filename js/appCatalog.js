/* CHAOSOS application catalog v2.5.0 — local metadata only; no fabricated online facts. */
(function(g){'use strict';
const apps=[
  {
    "id": "terminal",
    "title": "CHAOS SYSTEM / الطرفية",
    "category": "system",
    "path": "terminal/index.html",
    "description": "طرفية المحادثة المحلية لـ CHAOS SYSTEM داخل CHAOSOS مع نواة لغة عربية محلية تضم مئات الأنماط، وسجل جلسات وأوامر وذاكرة وبحث ويب صريح عبر وحدات المشروع.",
    "features": [
      "المحادثة اليومية دون اتصال عبر قواعد واسترجاع محلي",
      "فكاهة سوداء ونكات رعب كرتونية قابلة للاختيار",
      "سجل محلي منفصل",
      "أوامر مساعدة",
      "ذاكرة محلية وبحث ويب من مصادر عامة عند اتصال الشبكة."
    ],
    "permissions": [
      "storage",
      "network"
    ],
    "limitations": "نواة اللغة تعتمد على قواعد واسترجاع محلي وليست LLM عصبيًا؛ البحث الخارجي لا يعمل إلا بطلب صريح ويتأثر بالشبكة والمصادر.",
    "tags": [
      "CHAOS",
      "الطرفية",
      "أوامر",
      "محادثة",
      "ذاكرة"
    ]
  },
  {
    "id": "characters",
    "title": "أرشيف الشخصيات",
    "category": "content",
    "path": "characters.html",
    "description": "عرض وإدارة صفحات الشخصيات ضمن عالم Eye of Chaos.",
    "features": [
      "استعراض بيانات الشخصيات وتفاصيلها المحلية."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "المحتوى يأتي من ملفات المشروع المحلية.",
    "tags": [
      "شخصيات",
      "أرشيف",
      "قصة"
    ]
  },
  {
    "id": "chapters",
    "title": "أرشيف الفصول",
    "category": "content",
    "path": "chapters.html",
    "description": "واجهة فصول ومواد سردية ضمن عالم Eye of Chaos.",
    "features": [
      "تصفح الفصول والمحتوى السردي المضمّن."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "لا يمثل قارئ كتب عامًّا أو مزامنة سحابية.",
    "tags": [
      "الفصول",
      "قصة",
      "رواية"
    ]
  },
  {
    "id": "settings",
    "title": "إعدادات النظام",
    "category": "system",
    "path": "settings.html",
    "description": "إعدادات CHAOSOS وCHAOS SYSTEM والخصوصية والذاكرة والنسخ الاحتياطي والواجهة المشتركة.",
    "features": [
      "المظهر",
      "إعدادات محلية",
      "إدارة الذاكرة والسجل",
      "تشخيص وتصدير واستيراد."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "الإعدادات محلية ولا تتم مزامنتها مع خادم.",
    "tags": [
      "إعدادات",
      "مظهر",
      "خصوصية",
      "نسخ احتياطي"
    ]
  },
  {
    "id": "chaos-lab",
    "title": "CHAOS Lab",
    "category": "ai-tools",
    "path": "apps/chaos-lab/index.html",
    "description": "مختبر تجارب لمحرّك اللغة المحلي وأدوات CHAOS SYSTEM.",
    "features": [
      "تجارب لغوية محلية وأدوات تعليمية محدودة."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "ليس تدريبًا لنموذج عصبي كبير ولا ذكاء اصطناعي عامًا.",
    "tags": [
      "مختبر",
      "لغة",
      "تعلم",
      "ذكاء"
    ]
  },
  {
    "id": "void-arcade",
    "title": "Void Arcade",
    "category": "games",
    "path": "apps/void-arcade/index.html",
    "description": "حزمة ألعاب ويب تجريبية تشمل تجربة Rift Runner.",
    "features": [
      "تشغيل اللعبة داخل واجهة الويب."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "توافق الأداء يعتمد على المتصفح والجهاز.",
    "tags": [
      "ألعاب",
      "لعبة",
      "Rift Runner"
    ]
  },
  {
    "id": "voidtube",
    "title": "VoidTube",
    "category": "media",
    "path": "apps/voidtube/index.html",
    "description": "واجهة فيديو محلية تجريبية ضمن منظومة CHAOSOS.",
    "features": [
      "تصفح محتوى الفيديو المحلي وميزات المنصة التجريبية."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "ليست خدمة فيديو سحابية عامة؛ وظائف الشبكة تعتمد على التنفيذ الحالي.",
    "tags": [
      "فيديو",
      "مقاطع",
      "اشتراكات"
    ]
  },
  {
    "id": "void-store",
    "title": "Void Store",
    "category": "system",
    "path": "apps/void-store/index.html",
    "description": "متجر محلي تجريبي لتطبيقات CHAOSOS وحزمها.",
    "features": [
      "كتالوج محلي وتجارب حساب/تطبيقات ضمن المشروع."
    ],
    "permissions": [
      "storage",
      "network"
    ],
    "limitations": "الحساب تجريبي ومحلي؛ تنزيلات APK وتثبيتها ليست متجر أندرويد معتمدًا.",
    "tags": [
      "متجر",
      "APK",
      "تطبيقات"
    ]
  },
  {
    "id": "void-notes",
    "title": "Void Notes",
    "category": "productivity",
    "path": "apps/void-notes/index.html",
    "description": "تطبيق ملاحظات محلي.",
    "features": [
      "كتابة وحفظ الملاحظات محليًا."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "لا توجد مزامنة سحابية افتراضية.",
    "tags": [
      "ملاحظات",
      "كتابة",
      "نصوص"
    ]
  },
  {
    "id": "void-calculator",
    "title": "Void Calculator",
    "category": "tools",
    "path": "apps/void-calculator/index.html",
    "description": "حاسبة داخل منظومة CHAOSOS.",
    "features": [
      "إجراء الحسابات المدعومة في الواجهة."
    ],
    "permissions": [],
    "limitations": "ليست خدمة رياضية متصلة بالإنترنت.",
    "tags": [
      "حاسبة",
      "حساب",
      "رياضيات"
    ]
  },
  {
    "id": "void-planner",
    "title": "Void Planner",
    "category": "productivity",
    "path": "apps/void-planner/index.html",
    "description": "منظم للمهام والتخطيط اليومي.",
    "features": [
      "إدارة قوائم المهام محليًا."
    ],
    "permissions": [
      "storage",
      "notifications"
    ],
    "limitations": "التنبيهات داخل الواجهة وقد لا تعمل كإشعارات أندرويد أصلية.",
    "tags": [
      "مهام",
      "تخطيط",
      "قائمة"
    ]
  },
  {
    "id": "void-files",
    "title": "Void Files",
    "category": "tools",
    "path": "apps/void-files/index.html",
    "description": "واجهة لإدارة عناصر وملفات ضمن مساحة التطبيق.",
    "features": [
      "استعراض وظائف الملفات المدعومة في المشروع."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "لا تمنح وصولًا عامًا إلى كامل نظام ملفات Android من دون منتقي/إذن أصلي.",
    "tags": [
      "ملفات",
      "مدير الملفات",
      "مستندات"
    ]
  },
  {
    "id": "void-calendar",
    "title": "Void Calendar",
    "category": "productivity",
    "path": "apps/void-calendar/index.html",
    "description": "تقويم وأحداث محلية.",
    "features": [
      "إدارة أحداث وتواريخ مخزنة محليًا."
    ],
    "permissions": [
      "storage",
      "notifications"
    ],
    "limitations": "ليس تقويم Google ولا يتزامن مع الحسابات الخارجية تلقائيًا.",
    "tags": [
      "تقويم",
      "مواعيد",
      "تاريخ"
    ]
  },
  {
    "id": "void-browserx",
    "title": "VoidBrowserX",
    "category": "internet",
    "path": "apps/void-browserx/index.html",
    "description": "متصفح وباحث ويب داخل منظومة CHAOSOS.",
    "features": [
      "بحث من مصادر عامة متاحة",
      "علامات مرجعية وسجل محلي",
      "فتح روابط خارجية."
    ],
    "permissions": [
      "network",
      "storage"
    ],
    "limitations": "سياسات CORS وتضمين المواقع قد تمنع بعض الصفحات؛ بعض النتائج تعتمد على API عام.",
    "tags": [
      "متصفح",
      "ويب",
      "بحث",
      "روابط"
    ]
  },
  {
    "id": "void-manager",
    "title": "مدير التطبيقات",
    "category": "system",
    "path": "apps/void-manager/index.html",
    "description": "إدارة فهرس التطبيقات وحالتها وصلاحياتها داخل طبقة CHAOSOS.",
    "features": [
      "تفعيل/تعطيل بعض التطبيقات",
      "إدارة المنح المسجلة",
      "تشخيص وتصدير."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "طبقة صلاحيات ويب، وليست عزلًا أمنيًا أصليًا من Android.",
    "tags": [
      "مدير",
      "صلاحيات",
      "تطبيقات"
    ]
  },
  {
    "id": "void-phone",
    "title": "الهاتف",
    "category": "communication",
    "path": "apps/void-phone/index.html",
    "description": "واجهة تجريبية للاتصال وجهات اتصال محلية.",
    "features": [
      "فتح معالج الاتصال عبر روابط tel عند دعم الجهاز."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "لا يقرأ سجل المكالمات أو جهات اتصال Android تلقائيًا.",
    "tags": [
      "اتصال",
      "مكالمات",
      "جهة اتصال"
    ]
  },
  {
    "id": "void-messages",
    "title": "الرسائل",
    "category": "communication",
    "path": "apps/void-messages/index.html",
    "description": "إعداد مسودات الرسائل وفتح تطبيق SMS الخارجي.",
    "features": [
      "مسودات محلية وروابط sms."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "لا يقرأ الرسائل الواردة أو يرسل SMS خفية.",
    "tags": [
      "SMS",
      "رسائل",
      "نصية"
    ]
  },
  {
    "id": "void-mail",
    "title": "البريد",
    "category": "communication",
    "path": "apps/void-mail/index.html",
    "description": "إنشاء رسالة بريد وفتح معالج البريد عبر mailto.",
    "features": [
      "صياغة مسودة بريد."
    ],
    "permissions": [],
    "limitations": "إرسال الرسالة يتم في تطبيق البريد الذي يختاره المستخدم.",
    "tags": [
      "بريد",
      "email",
      "إلكتروني"
    ]
  },
  {
    "id": "void-camera",
    "title": "الكاميرا",
    "category": "media",
    "path": "apps/void-camera/index.html",
    "description": "واجهة كاميرا ويب تطلب الإذن لالتقاط صورة.",
    "features": [
      "معاينة كاميرا والتقاط صورة عبر واجهات الويب عند دعمها."
    ],
    "permissions": [
      "camera",
      "storage"
    ],
    "limitations": "قد تتطلب HTTPS/localhost وقيود iframe؛ لم تُختبر على الجهاز في هذه الحزمة.",
    "tags": [
      "كاميرا",
      "تصوير",
      "صورة"
    ]
  },
  {
    "id": "void-gallery",
    "title": "المعرض",
    "category": "media",
    "path": "apps/void-gallery/index.html",
    "description": "معرض لعرض الصور التي يختارها المستخدم يدويًا.",
    "features": [
      "منتقي ملفات ومعاينة صور."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "لا يملك وصولًا شاملًا إلى معرض Android؛ المستخدم يختار الملفات.",
    "tags": [
      "معرض",
      "صور",
      "صورة"
    ]
  },
  {
    "id": "void-downloads",
    "title": "التنزيلات",
    "category": "tools",
    "path": "apps/void-downloads/index.html",
    "description": "قائمة تنزيلات محلية داخل التطبيق.",
    "features": [
      "تسجيل روابط/أسماء وتصدير قائمة JSON."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "لا يقرأ مجلد Downloads الحقيقي بالكامل تلقائيًا.",
    "tags": [
      "Download",
      "تنزيل",
      "تحميل"
    ]
  },
  {
    "id": "void-discovery",
    "title": "مستكشف التطبيقات والويب",
    "category": "internet",
    "path": "apps/void-discovery/index.html",
    "description": "دليل تفصيلي للتطبيقات المحلية مع البحث عبر المصادر العامة وروابط البحث المفتوح.",
    "features": [
      "بحث في تطبيقات CHAOSOS",
      "بطاقة تفاصيل",
      "استعلام ويب",
      "GitHub وGoogle Play وروابط محركات البحث."
    ],
    "permissions": [
      "network",
      "storage"
    ],
    "limitations": "النتائج على الويب قد تكون ناقصة أو تخص تطبيقًا آخر بالاسم نفسه؛ افحص المصدر.",
    "tags": [
      "مستكشف",
      "بحث التطبيقات",
      "تفاصيل",
      "اكتشاف"
    ]
  },
  {
    "id": "chaos-commands",
    "title": "مركز أوامر CHAOS",
    "category": "system",
    "path": "chaos-commands.html",
    "description": "لوحة منفصلة لأوامر واختصارات CHAOS SYSTEM لتبقى الطرفية مركزة.",
    "features": [
      "أوامر مساعدة وتشخيص وذاكرة وأدوات محلية."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "الأوامر لا تعني امتلاك صلاحيات نظام أندرويد.",
    "tags": [
      "مركز الأوامر",
      "أدوات",
      "مساعدة"
    ]
  },
  {
    "id": "chaosai-center",
    "title": "مركز إدراك CHAOSAI",
    "category": "system",
    "path": "apps/chaosai-center/index.html",
    "description": "لوحة تجريبية للنواة المعرفية، والتفضيلات الصريحة، وقياس أداء المسارات، ومدير المهام والخدمات، وبوابة سحابية اختيارية.",
    "features": [
      "تحليل نية قابل للتفسير وخطة توجيه قابلة للتدقيق",
      "تعلّم محلي محدود من نتائج إجمالية وتقييمات المستخدم الصريحة",
      "إدارة طابور مهام وخدمات بنطاقات وصلاحيات منفصلة",
      "بوابة AI اختيارية تتطلب موافقة لكل طلب"
    ],
    "permissions": ["storage", "network"],
    "limitations": "ليس نموذجًا عصبيًا مستقلًا؛ الاتصال السحابي متوقف افتراضيًا والخادم غير منشور. لا يتحكم بعمليات Android الأصلية.",
    "tags": ["CHAOSAI", "ذكاء اصطناعي", "مهام", "خدمات", "سحابة", "نواة"]
  },
  {
    "id": "diagnostics",
    "title": "تشخيص المشروع",
    "category": "system",
    "path": "diagnostics.html",
    "description": "صفحة تشخيص محلية لوحدات ومعلومات المشروع المتاحة.",
    "features": [
      "فحوصات محلية وتقرير عند الدعم."
    ],
    "permissions": [
      "storage"
    ],
    "limitations": "نتائج التشخيص لا تثبت نجاح البناء أو عمل الجهاز الفعلي.",
    "tags": [
      "تشخيص",
      "اختبار",
      "حالة النظام"
    ]
  },
  {
    "id": "void-game-manager",
    "title": "Void Game Manager — مدير الألعاب",
    "category": "games",
    "path": "apps/void-game-manager/index.html",
    "description": "مدير محلي لألعاب الويب مع مفضلة وترتيب محلي واستيراد HTML مستقل معزول، وتصدير إحصاءات.",
    "features": ["قائمة ألعاب المشروع", "تسجيل مرات التشغيل ووقت اللعب", "مفضلة وترتيب حسب الاسم والاستخدام", "استيراد HTML مستقل معزول إلى IndexedDB", "تصدير الإحصاءات"],
    "permissions": ["storage"],
    "limitations": "لا يثبت APK ولا يقرأ ملفات الألعاب الأخرى دون اختيار المستخدم؛ استيراد HTML يشغّل الشيفرة داخل إطار معزول.",
    "tags": ["مدير الألعاب", "ألعاب", "Game Manager", "Rift Runner", "استيراد لعبة"]
  },
];
function norm(v){return String(v||'').normalize('NFKC').toLocaleLowerCase('ar').replace(/[ً-ٰٟ]/g,'').replace(/[ـ]/g,'').replace(/[^\p{L}\p{N}./_-]+/gu,' ').trim()}
function get(id){const k=norm(id);return apps.find(a=>norm(a.id)===k||norm(a.path)===k||norm(a.title)===k)||null}
function byPath(path){return apps.find(a=>a.path===String(path||''))||null}
function search(query,limit=12){const q=norm(query);if(!q)return apps.slice(0,limit);const terms=q.split(/\s+/).filter(Boolean);return apps.map(a=>{const hay=norm([a.id,a.title,a.path,a.category,a.description,a.features.join(' '),a.tags.join(' '),a.permissions.join(' ')].join(' '));const words=terms.reduce((n,t)=>n+(hay.includes(t)?1:0),0);const exact=[a.id,a.title,a.path].some(x=>norm(x)===q);const prefix=norm(a.title).startsWith(q)||norm(a.id).startsWith(q);return {app:a,score:exact?100:prefix?30+words:words*10}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.min(30,limit))).map(x=>x.app)}
function externalLinks(query,app){const q=String(query||app?.title||'CHAOSOS application').trim().slice(0,300);const enc=encodeURIComponent(q);return [{label:'بحث ويب كامل',provider:'Google',url:'https://www.google.com/search?q='+enc},{label:'DuckDuckGo',provider:'DuckDuckGo',url:'https://duckduckgo.com/?q='+enc},{label:'Google Play',provider:'Google Play',url:'https://play.google.com/store/search?q='+enc+'&c=apps'},{label:'مستودعات GitHub',provider:'GitHub',url:'https://github.com/search?q='+enc+'&type=repositories'}]}
g.VoidAppCatalog={version:'3.1.0',apps,get,byPath,search,externalLinks};
})(window);
