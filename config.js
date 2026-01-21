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
        SUPPORT_PHONE: "+213 770 12 34 56",
        DESCRIPTION: "منصة التسوق الإلكتروني الرائدة في الجزائر",
        KEYWORDS: "تسوق, إلكتروني, الجزائر, منتجات, عروض, توصيل",
        DEFAULT_LANGUAGE: "ar",
        TIMEZONE: "Africa/Algiers"
    },

    // === إعدادات التصميم ===
    DESIGN: {
        PRIMARY_COLOR: "#2563eb",
        PRIMARY_DARK: "#1d4ed8",
        SECONDARY_COLOR: "#f59e0b",
        SECONDARY_DARK: "#d97706",
        SUCCESS_COLOR: "#10b981",
        DANGER_COLOR: "#ef4444",
        WARNING_COLOR: "#f59e0b",
        INFO_COLOR: "#3b82f6",
        DARK_COLOR: "#1e293b",
        LIGHT_COLOR: "#f8fafc",
        GRAY_COLOR: "#64748b",
        BORDER_COLOR: "#e2e8f0",
        FONT_FAMILY: "'Cairo', sans-serif",
        BORDER_RADIUS: "12px",
        BOX_SHADOW: "0 10px 25px rgba(0, 0, 0, 0.08)",
        TRANSITION: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        CONTAINER_MAX_WIDTH: "1400px"
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
            "جمال",
            "كتب",
            "قرطاسية",
            "أطفال",
            "سوبرماركت"
        ],
        MAX_IMAGES: 8,
        MIN_IMAGES: 1,
        DEFAULT_RATING: 4.5,
        MIN_RATING: 1,
        MAX_RATING: 5,
        MIN_PRICE: 100,
        MAX_PRICE: 10000000,
        CURRENCY: "دينار جزائري",
        CURRENCY_SYMBOL: "دج",
        CURRENCY_CODE: "DZD",
        DECIMAL_PLACES: 0,
        MIN_STOCK: 0,
        MAX_STOCK: 9999,
        FEATURES_MAX: 10,
        DESCRIPTION_MAX_LENGTH: 2000,
        NAME_MAX_LENGTH: 100,
        AUTO_GENERATE_TOKENS: true,
        TOKEN_PREFIX: "dz_",
        TOKEN_LENGTH: 16
    },

    // === إعدادات التوصيل ===
    SHIPPING: {
        FREE_SHIPPING_MIN: 50000,
        STANDARD_SHIPPING_COST: 1500,
        EXPRESS_SHIPPING_COST: 3000,
        ENABLE_FREE_SHIPPING: true,
        ENABLE_EXPRESS_SHIPPING: true,
        DELIVERY_DAYS: {
            ALGIERS: { min: 1, max: 2 },
            ORAN: { min: 2, max: 3 },
            CONSTANTINE: { min: 3, max: 4 },
            ANNABA: { min: 3, max: 4 },
            BLIDA: { min: 1, max: 2 },
            BEJAIA: { min: 4, max: 5 },
            SETIF: { min: 3, max: 4 },
            BATNA: { min: 4, max: 6 },
            OTHER: { min: 4, max: 7 }
        },
        STATES: [
            "الجزائر", "وهران", "قسنطينة", "عنابة", "بلعباس",
            "باتنة", "سطيف", "تيزي وزو", "بجاية", "بسكرة",
            "البليدة", "تيبازة", "الشلف", "غرداية", "تمنراست",
            "أدرار", "تندوف", "الوادي", "ورقلة", "الجلفة",
            "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "مستغانم",
            "المسيلة", "النعامة", "البيض", "اليزي", "برج بوعريريج",
            "بومرداس", "الطارف", "تسمسيلت", "الاغواط", "ام البواقي",
            "سوق اهراس", "تبسة", "ميلة", "عين الدفلى", "معسكر",
            "وادي سوف", "خنشلة", "سعيدة", "جيجل", "عين تموشنت"
        ],
        WORKING_HOURS: {
            START: "08:00",
            END: "22:00",
            DAYS: [0, 1, 2, 3, 4, 5, 6] // 0=الأحد
        },
        RETURN_POLICY_DAYS: 14,
        ENABLE_TRACKING: true
    },

    // === إعدادات الدفع ===
    PAYMENT: {
        METHODS: [
            { id: "redotpay", name: "Redotpay", online: true, fee: 0 },
            { id: "cash_on_delivery", name: "الدفع عند الاستلام", online: false, fee: 0 },
            { id: "ccp", name: "الحساب البريدي", online: false, fee: 100 },
            { id: "baridimob", name: "بريديموب", online: true, fee: 50 },
            { id: "bank_transfer", name: "التحويل البنكي", online: false, fee: 0 }
        ],
        REDOTPAY: {
            URL: "https://redotpay.com/pay",
            MERCHANT_ID: "",
            API_KEY: "",
            CALLBACK_URL: "/payment/callback"
        },
        CCP: {
            NUMBER: "12345678901234567890",
            NAME: "متجر ديجيتال الجزائر",
            BRANCH: "الجزائر المركز"
        },
        BARIDIMOB: {
            NUMBER: "0550123456",
            NAME: "متجر ديجيتال الجزائر"
        },
        BANK_TRANSFER: {
            BANK_NAME: "بنك الجزائر الخارجي",
            ACCOUNT_NUMBER: "007-1234567-89",
            ACCOUNT_NAME: "Digital Algeria Shop",
            IBAN: "DZ1234567890123456789012",
            BIC: "ALGDZALG"
        },
        INVOICE_PREFIX: "INV-",
        TAX_RATE: 0.19,
        TAX_INCLUDED: true,
        MINIMUM_ORDER: 1000,
        AUTO_CONFIRM_AFTER: 24 * 60 * 60 * 1000, // 24 ساعة
        PAYMENT_TIMEOUT: 30 * 60 * 1000 // 30 دقيقة
    },

    // === إعدادات البوت ===
    TELEGRAM: {
        BOT_TOKEN: "",
        BOT_USERNAME: "digital_algeria_bot",
        CHANNEL_ID: "@digital_algeria",
        SUPPORT_GROUP_ID: "@digital_algeria_support",
        ADMIN_IDS: [],
        WEBHOOK_URL: "",
        POLLING_INTERVAL: 1000,
        MAX_MESSAGE_LENGTH: 4096,
        COMMANDS: [
            { command: 'start', description: 'بدء استخدام البوت' },
            { command: 'menu', description: 'القائمة الرئيسية' },
            { command: 'products', description: 'عرض المنتجات' },
            { command: 'offers', description: 'العروض الحالية' },
            { command: 'categories', description: 'الأقسام' },
            { command: 'search', description: 'بحث عن منتج' },
            { command: 'orders', description: 'طلباتي' },
            { command: 'track', description: 'تتبع الطلب' },
            { command: 'cart', description: 'سلة التسوق' },
            { command: 'help', description: 'المساعدة' },
            { command: 'contact', description: 'التواصل مع الدعم' },
            { command: 'settings', description: 'الإعدادات' }
        ],
        KEYBOARDS: {
            MAIN: [
                ["📦 المنتجات", "🎁 العروض"],
                ["🛒 سلة التسوق", "📋 طلباتي"],
                ["📍 تتبع الطلب", "ℹ️ المساعدة"],
                ["⚙️ الإعدادات", "📞 اتصل بنا"]
            ],
            CATEGORIES: [
                ["📱 هواتف", "💻 لابتوبات"],
                ["🎧 سماعات", "⌚ ساعات"],
                ["🎮 ألعاب", "📺 إلكترونيات"],
                ["👕 ملابس", "🏠 منزلية"],
                ["🔙 رجوع"]
            ]
        },
        MESSAGES: {
            WELCOME: "مرحبا بك في متجر ديجيتال الجزائر! 🛍️\nاختر من القائمة:",
            PRODUCTS_LIST: "📦 **المنتجات المتاحة:**\n",
            ORDER_CONFIRMED: "✅ **تم تأكيد طلبك!**\nرقم الطلب: {orderId}\nسيتم التواصل معك قريباً.",
            ORDER_UPDATED: "🔄 **تم تحديث حالة طلبك:**\nالطلب: {orderId}\nالحالة: {status}",
            HELP: "📞 **الدعم الفني:**\nالهاتف: +213770123456\nالبريد: support@digital-algeria.dz\nالوقت: 8:00 - 22:00"
        }
    },

    // === إعدادات الأمان ===
    SECURITY: {
        ADMIN_PASSWORD: "admin2026",
        JWT_SECRET: "digital-algeria-secret-key-2026-update-me",
        JWT_EXPIRES_IN: "7d",
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
        MAX_LOGIN_ATTEMPTS: 5,
        BLOCK_TIME: 15 * 60 * 1000,
        PASSWORD_MIN_LENGTH: 8,
        PASSWORD_REQUIREMENTS: {
            UPPERCASE: true,
            LOWERCASE: true,
            NUMBERS: true,
            SPECIAL: false
        },
        ALLOWED_ORIGINS: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://digital-algeria.dz",
            "https://www.digital-algeria.dz"
        ],
        CSP: {
            DEFAULT_SRC: ["'self'"],
            SCRIPT_SRC: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            STYLE_SRC: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
            FONT_SRC: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
            IMG_SRC: ["'self'", "data:", "https:", "images.unsplash.com"],
            CONNECT_SRC: ["'self'", "https://redotpay.com"]
        },
        RATE_LIMIT: {
            WINDOW: 15 * 60 * 1000,
            MAX: 100,
            MESSAGE: "لقد تجاوزت الحد المسموح به من الطلبات"
        }
    },

    // === إعدادات التخزين ===
    STORAGE: {
        USE_INDEXEDDB: true,
        INDEXEDDB_VERSION: 3,
        INDEXEDDB_NAME: "DigitalAlgeriaDB",
        LOCALSTORAGE_PREFIX: "da_",
        BACKUP_INTERVAL: 60 * 60 * 1000,
        MAX_BACKUP_FILES: 10,
        AUTO_CLEANUP_DAYS: 30,
        MAX_PRODUCTS: 10000,
        MAX_ORDERS: 5000,
        MAX_USERS: 1000,
        COMPRESSION_ENABLED: true,
        ENCRYPTION_ENABLED: false,
        ENCRYPTION_KEY: ""
    },

    // === إعدادات API ===
    API: {
        BASE_URL: "http://localhost:3000/api/v1",
        VERSION: "1.0.0",
        ENABLED: true,
        ENDPOINTS: {
            PRODUCTS: "/products",
            PRODUCT: "/products/:id",
            CATEGORIES: "/categories",
            ORDERS: "/orders",
            ORDER: "/orders/:id",
            USERS: "/users",
            USER: "/users/:id",
            AUTH: "/auth",
            SEARCH: "/search",
            STATS: "/stats",
            SETTINGS: "/settings",
            UPLOAD: "/upload",
            PAYMENT: "/payment",
            SHIPPING: "/shipping",
            NOTIFICATIONS: "/notifications"
        },
        RATE_LIMIT: {
            WINDOW_MS: 15 * 60 * 1000,
            MAX_REQUESTS: 100,
            MESSAGE: "Too many requests, please try again later."
        },
        CACHE_TTL: 5 * 60 * 1000, // 5 دقائق
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3
    },

    // === إعدادات التحليلات ===
    ANALYTICS: {
        ENABLED: true,
        PROVIDER: "internal", // internal, google, mixpanel
        GOOGLE_ANALYTICS_ID: "",
        TRACK_EVENTS: [
            "page_view",
            "product_view",
            "add_to_cart",
            "remove_from_cart",
            "begin_checkout",
            "purchase",
            "search",
            "category_view",
            "filter_apply"
        ],
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30 دقيقة
        ANONYMIZE_IP: true,
        TRACK_USER_ID: false,
        SAVE_SEARCH_QUERIES: true,
        HEATMAP_ENABLED: false
    },

    // === إعدادات الإشعارات ===
    NOTIFICATIONS: {
        ENABLED: true,
        TYPES: ["push", "email", "sms", "telegram"],
        PUSH: {
            ENABLED: true,
            VAPID_PUBLIC_KEY: "",
            VAPID_PRIVATE_KEY: "",
            DEFAULT_TITLE: "ديجيتال الجزائر",
            DEFAULT_ICON: "/icon-192.png"
        },
        EMAIL: {
            ENABLED: false,
            PROVIDER: "smtp",
            SMTP_HOST: "smtp.gmail.com",
            SMTP_PORT: 587,
            SMTP_SECURE: false,
            SMTP_USER: "",
            SMTP_PASS: "",
            FROM_NAME: "متجر ديجيتال الجزائر",
            FROM_EMAIL: "noreply@digital-algeria.dz",
            TEMPLATES: {
                ORDER_CONFIRMATION: "order-confirmation",
                SHIPPING_UPDATE: "shipping-update",
                NEW_OFFER: "new-offer",
                WELCOME: "welcome"
            }
        },
        SMS: {
            ENABLED: false,
            PROVIDER: "twilio", // twilio, vonage, infobip
            ACCOUNT_SID: "",
            AUTH_TOKEN: "",
            FROM_NUMBER: "",
            API_KEY: "",
            API_SECRET: ""
        },
        TELEGRAM: {
            ENABLED: true,
            NOTIFY_NEW_ORDER: true,
            NOTIFY_ORDER_UPDATE: true,
            NOTIFY_LOW_STOCK: true,
            NOTIFY_NEW_PRODUCT: false
        }
    },

    // === إعدادات التطوير ===
    DEVELOPMENT: {
        DEBUG: true,
        LOG_LEVEL: "debug", // error, warn, info, debug
        CONSOLE_COLORS: true,
        HOT_RELOAD: true,
        DEV_TOOLS: true,
        MOCK_DATA: true,
        OFFLINE_MODE: false,
        CORS_ENABLED: true,
        CORS_ORIGINS: [
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://*.digital-algeria.dz"
        ]
    },

    // === إعدادات الصيانة ===
    MAINTENANCE: {
        MODE: false,
        MESSAGE: "نقوم حاليًا بإجراء تحسينات على الموقع. سنعود قريبًا!",
        SCHEDULE: {
            START: "",
            END: "",
            TIMEZONE: "Africa/Algiers"
        },
        ALLOWED_IPS: ["127.0.0.1", "::1"],
        ALLOWED_PATHS: ["/admin", "/api/health"]
    },

    // === إعدادات النسخ الاحتياطي ===
    BACKUP: {
        ENABLED: true,
        SCHEDULE: "0 2 * * *", // كل يوم في 2 صباحًا
        PROVIDER: "local", // local, s3, google-cloud
        LOCAL_PATH: "./backups",
        S3_BUCKET: "",
        S3_REGION: "",
        RETENTION_DAYS: 30,
        COMPRESS: true,
        ENCRYPT: false,
        NOTIFY_ON_SUCCESS: true,
        NOTIFY_ON_FAILURE: true
    }
};

// === دوال مساعدة ===
CONFIG.helpers = {
    // تنسيق السعر
    formatPrice: (price) => {
        const formatted = new Intl.NumberFormat('ar-DZ', {
            minimumFractionDigits: CONFIG.PRODUCTS.DECIMAL_PLACES,
            maximumFractionDigits: CONFIG.PRODUCTS.DECIMAL_PLACES
        }).format(price);
        
        return `${formatted} ${CONFIG.PRODUCTS.CURRENCY_SYMBOL}`;
    },

    // حساب تكلفة التوصيل
    calculateShipping: (total, state, express = false) => {
        if (CONFIG.SHIPPING.ENABLE_FREE_SHIPPING && total >= CONFIG.SHIPPING.FREE_SHIPPING_MIN) {
            return 0;
        }
        
        let cost = CONFIG.SHIPPING.STANDARD_SHIPPING_COST;
        
        // خصم لبعض الولايات
        const discountStates = ['الجزائر', 'البليدة', 'تيبازة', 'بومرداس'];
        if (discountStates.includes(state)) {
            cost = Math.round(cost / 2);
        }
        
        if (express && CONFIG.SHIPPING.ENABLE_EXPRESS_SHIPPING) {
            cost += CONFIG.SHIPPING.EXPRESS_SHIPPING_COST;
        }
        
        return cost;
    },

    // الحصول على أيام التوصيل
    getDeliveryDays: (state, express = false) => {
        let days = CONFIG.SHIPPING.DELIVERY_DAYS.OTHER;
        
        if (CONFIG.SHIPPING.DELIVERY_DAYS[state]) {
            days = CONFIG.SHIPPING.DELIVERY_DAYS[state];
        } else {
            // البحث عن الولاية في المفاتيح
            for (const [key, value] of Object.entries(CONFIG.SHIPPING.DELIVERY_DAYS)) {
                if (state.includes(key) || key.includes(state)) {
                    days = value;
                    break;
                }
            }
        }
        
        if (express) {
            return {
                min: Math.max(1, days.min - 1),
                max: Math.max(2, days.max - 2)
            };
        }
        
        return days;
    },

    // إنشاء معرف فريد
    generateId: (prefix = '') => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        const prefixPart = prefix ? `${prefix}_` : '';
        return `${prefixPart}${timestamp}_${random}`.toUpperCase();
    },

    // إنشاء توكن منتج
    generateProductToken: () => {
        const prefix = CONFIG.PRODUCTS.TOKEN_PREFIX;
        const length = CONFIG.PRODUCTS.TOKEN_LENGTH;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = prefix;
        
        for (let i = 0; i < length - prefix.length; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return token;
    },

    // التحقق من رقم الهاتف
    isValidPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        const regex = /^(05|06|07)[0-9]{8}$/;
        return regex.test(cleaned);
    },

    // تنسيق رقم الهاتف
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        }
        return phone;
    },

    // إنشاء رابط دفع
    createPaymentLink: (orderId, amount, method = 'redotpay', options = {}) => {
        const params = new URLSearchParams({
            order_id: orderId,
            amount: amount,
            currency: CONFIG.PRODUCTS.CURRENCY_CODE,
            callback_url: window.location.origin + CONFIG.PAYMENT.REDOTPAY.CALLBACK_URL,
            ...options
        });
        
        switch(method) {
            case 'redotpay':
                return `${CONFIG.PAYMENT.REDOTPAY.URL}?${params.toString()}`;
            case 'ccp':
                return `ccp://payment?${params.toString()}`;
            case 'baridimob':
                return `baridimob://payment?${params.toString()}`;
            default:
                return null;
        }
    },

    // حساب الضريبة
    calculateTax: (amount) => {
        if (CONFIG.PAYMENT.TAX_INCLUDED) {
            return Math.round(amount * CONFIG.PAYMENT.TAX_RATE / (1 + CONFIG.PAYMENT.TAX_RATE));
        }
        return Math.round(amount * CONFIG.PAYMENT.TAX_RATE);
    },

    // الحصول على المجموع النهائي
    calculateTotal: (subtotal, shipping, tax = null) => {
        if (tax === null) {
            tax = CONFIG.helpers.calculateTax(subtotal);
        }
        
        if (CONFIG.PAYMENT.TAX_INCLUDED) {
            return subtotal + shipping;
        }
        
        return subtotal + shipping + tax;
    },

    // التحقق من تاريخ الصلاحية
    isValidDate: (date) => {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    },

    // تنسيق التاريخ
    formatDate: (date, format = 'long') => {
        const d = new Date(date);
        const options = {
            long: {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit'
            },
            short: {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            },
            time: {
                hour: '2-digit',
                minute: '2-digit'
            }
        };
        
        return d.toLocaleDateString('ar-DZ', options[format] || options.short);
    },

    // تقصير النص
    truncateText: (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // إنشاء كود خصم
    generateDiscountCode: (length = 8) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return code;
    },

    // التحقق من البريد الإلكتروني
    isValidEmail: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // تحويل الكائن إلى params
    objectToParams: (obj) => {
        return Object.keys(obj)
            .filter(key => obj[key] !== undefined && obj[key] !== null)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join('&');
    },

    // فك تشفير params
    paramsToObject: (params) => {
        const obj = {};
        const searchParams = new URLSearchParams(params);
        
        for (const [key, value] of searchParams.entries()) {
            obj[key] = value;
        }
        
        return obj;
    },

    // تنزيل الملف
    downloadFile: (filename, content, type = 'text/plain') => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // نسخ للنصوص
    copyToClipboard: (text) => {
        return navigator.clipboard.writeText(text);
    },

    // قراءة ملف
    readFile: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    },

    // التحقق من الصلاحية الكاملة
    validateConfig: () => {
        const errors = [];
        const warnings = [];
        
        // التحقق من كلمة مرور المدير
        if (CONFIG.SECURITY.ADMIN_PASSWORD === 'admin2026') {
            warnings.push('يجب تغيير كلمة مرور المدير الافتراضية في الإنتاج');
        }
        
        // التحقق من JWT secret
        if (CONFIG.SECURITY.JWT_SECRET.includes('update-me')) {
            errors.push('يجب تغيير JWT_SECRET في الإنتاج');
        }
        
        // التحقق من إعدادات البريد
        if (CONFIG.NOTIFICATIONS.EMAIL.ENABLED) {
            if (!CONFIG.NOTIFICATIONS.EMAIL.SMTP_USER || !CONFIG.NOTIFICATIONS.EMAIL.SMTP_PASS) {
                errors.push('إعدادات SMTP غير مكتملة');
            }
        }
        
        // التحقق من إعدادات SMS
        if (CONFIG.NOTIFICATIONS.SMS.ENABLED) {
            if (!CONFIG.NOTIFICATIONS.SMS.API_KEY) {
                errors.push('مفتاح API لخدمة SMS غير موجود');
            }
        }
        
        // التحقق من توكن البوت
        if (CONFIG.TELEGRAM.BOT_TOKEN) {
            if (CONFIG.TELEGRAM.BOT_TOKEN.length < 30) {
                errors.push('توكن البوت غير صالح');
            }
        }
        
        // التحقق من إعدادات الدفع
        if (CONFIG.PAYMENT.REDOTPAY.MERCHANT_ID === '') {
            warnings.push('معرف التاجر في Redotpay غير مضبوط');
        }
        
        return { errors, warnings };
    }
};

// === تحديث إعدادات الوقت الفعلي ===
CONFIG.updateRuntime = (updates) => {
    Object.keys(updates).forEach(key => {
        if (CONFIG[key] !== undefined) {
            if (typeof CONFIG[key] === 'object' && CONFIG[key] !== null) {
                CONFIG[key] = { ...CONFIG[key], ...updates[key] };
            } else {
                CONFIG[key] = updates[key];
            }
        }
    });
};

// === تصدير الإعدادات ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}

// === تهيئة الإعدادات ===
document.addEventListener('DOMContentLoaded', () => {
    // تحميل الإعدادات من localStorage إن وجدت
    const savedConfig = localStorage.getItem('da_config');
    if (savedConfig) {
        try {
            const parsed = JSON.parse(savedConfig);
            CONFIG.updateRuntime(parsed);
        } catch (e) {
            console.warn('خطأ في تحميل الإعدادات المحفوظة:', e);
        }
    }
    
    // التحقق من الصلاحية
    const validation = CONFIG.helpers.validateConfig();
    if (validation.errors.length > 0) {
        console.error('أخطاء في الإعدادات:', validation.errors);
    }
    if (validation.warnings.length > 0) {
        console.warn('تحذيرات في الإعدادات:', validation.warnings);
    }
});
