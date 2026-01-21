// 📁 config.js
// إعدادات نظام المتجر الكامل 2026

const CONFIG = {
    // === إعدادات عامة ===
    APP: {
        NAME: "ديجيتال الجزائر",
        VERSION: "2.0.0",
        YEAR: 2026,
        AUTHOR: "فريق ديجيتال الجزائر",
        SUPPORT_EMAIL: "support@digital-algeria.dz",
        SUPPORT_PHONE: "+213 770 12 34 56"
    },

    // === إعدادات التصميم ===
    DESIGN: {
        PRIMARY_COLOR: "#2563eb",
        SECONDARY_COLOR: "#f59e0b",
        SUCCESS_COLOR: "#10b981",
        DANGER_COLOR: "#ef4444",
        DARK_COLOR: "#1e293b",
        LIGHT_COLOR: "#f8fafc",
        FONT_FAMILY: "'Cairo', sans-serif",
        BORDER_RADIUS: "12px",
        BOX_SHADOW: "0 10px 25px rgba(0, 0, 0, 0.08)"
    },

    // === إعدادات المنتجات ===
    PRODUCTS: {
        DEFAULT_CATEGORIES: [
            "هواتف ذكية",
            "لابتوبات",
            "سماعات",
            "ساعات ذكية",
            "ألعاب",
            "إلكترونيات",
            "ملابس",
            "أحذية",
            "أثاث",
            "أجهزة منزلية",
            "رياضة",
            "جمال"
        ],
        MAX_IMAGES: 5,
        DEFAULT_RATING: 4.5,
        MIN_PRICE: 100,
        MAX_PRICE: 1000000,
        CURRENCY: "دج",
        CURRENCY_SYMBOL: "DZD"
    },

    // === إعدادات التوصيل ===
    SHIPPING: {
        FREE_SHIPPING_MIN: 50000, // الحد الأدنى للتوصيل المجاني
        SHIPPING_COST: 1500, // تكلفة التوصيل العادي
        DELIVERY_DAYS: {
            ALGIERS: [1, 2],
            ORAN: [2, 3],
            CONSTANTINE: [3, 4],
            OTHER: [4, 7]
        },
        STATES: [
            "الجزائر", "وهران", "قسنطينة", "عنابة", "بلعباس",
            "باتنة", "سطيف", "تيزي وزو", "بجاية", "بسكرة",
            "البليدة", "تيبازة", "الشلف", "غرداية", "تمنراست",
            "أدرار", "تندوف", "الوادي", "ورقلة", "الجلفة"
        ]
    },

    // === إعدادات الدفع ===
    PAYMENT: {
        METHODS: ["redotpay", "cash_on_delivery", "ccp", "baridimob"],
        REDOTPAY_URL: "https://redotpay.com/pay",
        CCP_NUMBER: "12345678901234567890",
        BARIDIMOB_NUMBER: "0550123456",
        INVOICE_PREFIX: "INV-",
        TAX_RATE: 0.19 // 19% ضريبة القيمة المضافة
    },

    // === إعدادات البوت ===
    TELEGRAM: {
        BOT_TOKEN: process.env.BOT_TOKEN || "",
        CHANNEL_ID: process.env.CHANNEL_ID || "",
        ADMIN_IDS: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [],
        WEBHOOK_URL: process.env.WEBHOOK_URL || "",
        COMMANDS: [
            { command: 'start', description: 'بدء استخدام البوت' },
            { command: 'products', description: 'عرض المنتجات' },
            { command: 'offers', description: 'العروض الحالية' },
            { command: 'orders', description: 'طلباتي' },
            { command: 'help', description: 'المساعدة' },
            { command: 'contact', description: 'التواصل مع الدعم' }
        ]
    },

    // === إعدادات الأمان ===
    SECURITY: {
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin2026",
        JWT_SECRET: process.env.JWT_SECRET || "digital-algeria-secret-2026",
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 ساعة
        MAX_LOGIN_ATTEMPTS: 5,
        BLOCK_TIME: 15 * 60 * 1000 // 15 دقيقة
    },

    // === إعدادات التخزين ===
    STORAGE: {
        USE_INDEXEDDB: true,
        BACKUP_INTERVAL: 60 * 60 * 1000, // ساعة واحدة
        MAX_BACKUP_FILES: 10,
        AUTO_CLEANUP_DAYS: 30
    },

    // === إعدادات API ===
    API: {
        BASE_URL: process.env.API_URL || "http://localhost:3000/api",
        ENDPOINTS: {
            PRODUCTS: "/products",
            ORDERS: "/orders",
            USERS: "/users",
            CATEGORIES: "/categories",
            OFFERS: "/offers"
        },
        RATE_LIMIT: {
            WINDOW_MS: 15 * 60 * 1000, // 15 دقيقة
            MAX_REQUESTS: 100
        }
    },

    // === إعدادات التحليلات ===
    ANALYTICS: {
        ENABLED: true,
        TRACK_PRODUCT_VIEWS: true,
        TRACK_ORDERS: true,
        TRACK_USER_BEHAVIOR: true,
        SAVE_SEARCH_QUERIES: true
    },

    // === إعدادات الإشعارات ===
    NOTIFICATIONS: {
        EMAIL: {
            ENABLED: false,
            SMTP_HOST: "",
            SMTP_PORT: 587,
            SMTP_USER: "",
            SMTP_PASS: ""
        },
        SMS: {
            ENABLED: false,
            PROVIDER: "",
            API_KEY: ""
        },
        PUSH: {
            ENABLED: true,
            VAPID_PUBLIC_KEY: "",
            VAPID_PRIVATE_KEY: ""
        }
    },

    // === إعدادات التطوير ===
    DEVELOPMENT: {
        DEBUG: process.env.NODE_ENV !== 'production',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        CORS_ORIGINS: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://digital-algeria.dz"
        ]
    }
};

// === دوال مساعدة ===
CONFIG.helpers = {
    // تنسيق السعر
    formatPrice: (price) => {
        return new Intl.NumberFormat('ar-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    },

    // حساب تكلفة التوصيل
    calculateShipping: (total, state) => {
        if (total >= CONFIG.SHIPPING.FREE_SHIPPING_MIN) {
            return 0;
        }
        
        if (['الجزائر', 'البليدة', 'تيبازة'].includes(state)) {
            return CONFIG.SHIPPING.SHIPPING_COST / 2;
        }
        
        return CONFIG.SHIPPING.SHIPPING_COST;
    },

    // إنشاء معرف فريد
    generateId: (prefix = '') => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}${timestamp}_${random}`;
    },

    // التحقق من رقم الهاتف الجزائري
    isValidPhone: (phone) => {
        const regex = /^(05|06|07)[0-9]{8}$/;
        return regex.test(phone);
    },

    // الحصول على مدة التوصيل
    getDeliveryDays: (state) => {
        if (state === 'الجزائر') return CONFIG.SHIPPING.DELIVERY_DAYS.ALGIERS;
        if (state === 'وهران') return CONFIG.SHIPPING.DELIVERY_DAYS.ORAN;
        if (state === 'قسنطينة') return CONFIG.SHIPPING.DELIVERY_DAYS.CONSTANTINE;
        return CONFIG.SHIPPING.DELIVERY_DAYS.OTHER;
    },

    // إنشاء رابط دفع
    createPaymentLink: (orderId, amount, method = 'redotpay') => {
        if (method === 'redotpay') {
            return `${CONFIG.PAYMENT.REDOTPAY_URL}/${orderId}?amount=${amount}&currency=DZD`;
        }
        return null;
    },

    // التحقق من الصلاحية
    validateConfig: () => {
        const errors = [];
        
        if (!CONFIG.SECURITY.ADMIN_PASSWORD || CONFIG.SECURITY.ADMIN_PASSWORD === 'admin2026') {
            errors.push('يجب تغيير كلمة مرور المدير الافتراضية');
        }
        
        if (CONFIG.TELEGRAM.BOT_TOKEN && CONFIG.TELEGRAM.BOT_TOKEN.length < 30) {
            errors.push('توكن البوت غير صالح');
        }
        
        return errors;
    }
};

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
