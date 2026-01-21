// 📁 payment-gateway.js
// نظام بوابة الدفع المتقدم للمتجر

class PaymentGateway {
    constructor() {
        this.gateways = {
            redotpay: this.redotpayGateway.bind(this),
            cash_on_delivery: this.cashOnDeliveryGateway.bind(this),
            ccp: this.ccpGateway.bind(this),
            baridimob: this.baridimobGateway.bind(this),
            bank_transfer: this.bankTransferGateway.bind(this)
        };
        
        this.transactions = new Map();
        this.webhooks = new Map();
        this.callbacks = new Map();
        
        this.initialize();
    }
    
    initialize() {
        // تحميل المعاملات المحفوظة
        this.loadTransactions();
        
        // تنظيف المعاملات القديمة
        this.cleanupOldTransactions();
        
        // إعداد تنظيف دوري
        setInterval(() => this.cleanupOldTransactions(), 60 * 60 * 1000); // كل ساعة
    }
    
    // === بوابة Redotpay ===
    async redotpayGateway(paymentData) {
        const {
            orderId,
            amount,
            currency = 'DZD',
            customerName,
            customerEmail,
            customerPhone,
            description = 'شراء من متجر ديجيتال الجزائر',
            returnUrl,
            callbackUrl
        } = paymentData;
        
        try {
            // إنشاء معرف معاملة
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // في التطبيق الحقيقي، نتواصل مع API Redotpay
            // هذا تنفيذ محاكاة
            
            const paymentData = {
                merchant_id: CONFIG.PAYMENT.REDOTPAY.MERCHANT_ID || 'DEMO_MERCHANT',
                order_id: orderId,
                amount: amount,
                currency: currency,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                description: description,
                return_url: returnUrl || `${window.location.origin}/payment/success`,
                callback_url: callbackUrl || `${window.location.origin}/api/payment/callback`,
                timestamp: Date.now(),
                signature: this.generateSignature(orderId, amount)
            };
            
            // حفظ المعاملة
            const transaction = {
                id: transactionId,
                orderId,
                amount,
                currency,
                method: 'redotpay',
                status: 'pending',
                data: paymentData,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + CONFIG.PAYMENT.PAYMENT_TIMEOUT).toISOString()
            };
            
            this.saveTransaction(transaction);
            
            // إرجاع رابط الدفع
            const paymentUrl = this.generateRedotpayUrl(paymentData);
            
            return {
                success: true,
                transactionId,
                paymentUrl,
                qrCode: this.generateQRCode(paymentUrl),
                instructions: [
                    '1. انقر على رابط الدفع أو امسح QR Code',
                    '2. أكمل عملية الدفع في صفحة Redotpay الآمنة',
                    '3. سيتم توجيهك تلقائياً بعد اكتمال الدفع',
                    '4. احفظ رقم المعاملة للمتابعة: ' + transactionId
                ]
            };
        } catch (error) {
            console.error('خطأ في بوابة Redotpay:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    generateRedotpayUrl(paymentData) {
        const baseUrl = CONFIG.PAYMENT.REDOTPAY.URL;
        const params = new URLSearchParams();
        
        Object.entries(paymentData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value);
            }
        });
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    // === بوابة الدفع عند الاستلام ===
    async cashOnDeliveryGateway(paymentData) {
        const {
            orderId,
            amount,
            customerName,
            customerPhone,
            customerAddress
        } = paymentData;
        
        try {
            const transactionId = `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const transaction = {
                id: transactionId,
                orderId,
                amount,
                method: 'cash_on_delivery',
                status: 'pending',
                data: {
                    customerName,
                    customerPhone,
                    customerAddress
                },
                createdAt: new Date().toISOString(),
                instructions: [
                    '✅ تم تأكيد طلبك بنجاح',
                    '💰 ستدفع نقداً عند استلام المنتج',
                    '📞 سيتم التواصل معك على: ' + customerPhone,
                    '📍 سيتم التوصيل إلى: ' + customerAddress,
                    '⏰ مدة التوصيل: 2-5 أيام عمل',
                    '📞 للاستفسار: ' + CONFIG.APP.SUPPORT_PHONE
                ]
            };
            
            this.saveTransaction(transaction);
            
            return {
                success: true,
                transactionId,
                instructions: transaction.instructions,
                nextSteps: [
                    'انتظار مكالمة مندوب التوصيل',
                    'تأكد من توفر المبلغ النقدي',
                    'افحص المنتج قبل الدفع',
                    'اطلب فاتورة شراء'
                ]
            };
        } catch (error) {
            console.error('خطأ في بوابة الدفع عند الاستلام:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // === بوابة الحساب البريدي (CCP) ===
    async ccpGateway(paymentData) {
        const {
            orderId,
            amount,
            customerName
        } = paymentData;
        
        try {
            const transactionId = `ccp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const transaction = {
                id: transactionId,
                orderId,
                amount,
                method: 'ccp',
                status: 'pending',
                data: {
                    ccpNumber: CONFIG.PAYMENT.CCP.NUMBER,
                    ccpName: CONFIG.PAYMENT.CCP.NAME,
                    ccpBranch: CONFIG.PAYMENT.CCP.BRANCH,
                    customerName
                },
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 أيام
                instructions: [
                    '💰 *طريقة الدفع عبر الحساب البريدي:*',
                    '1. اذهب إلى أي مكتب بريدي',
                    '2. قدم رقم الحساب البريدي: ' + CONFIG.PAYMENT.CCP.NUMBER,
                    '3. اسم المستفيد: ' + CONFIG.PAYMENT.CCP.NAME,
                    '4. المبلغ: ' + CONFIG.helpers.formatPrice(amount) + ' دج',
                    '5. الفرع: ' + CONFIG.PAYMENT.CCP.BRANCH,
                    '6. اذكر رقم الطلب: ' + orderId,
                    '',
                    '📋 *بعد الدفع:*',
                    '- احفظ إيصال الدفع',
                    '- أرسل صورة الإيصال إلى الدعم',
                    '- سيتم تفعيل طلبك خلال 24 ساعة'
                ]
            };
            
            this.saveTransaction(transaction);
            
            return {
                success: true,
                transactionId,
                instructions: transaction.instructions,
                ccpDetails: {
                    number: CONFIG.PAYMENT.CCP.NUMBER,
                    name: CONFIG.PAYMENT.CCP.NAME,
                    branch: CONFIG.PAYMENT.CCP.BRANCH
                }
            };
        } catch (error) {
            console.error('خطأ في بوابة CCP:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // === بوابة بريديموب ===
    async baridimobGateway(paymentData) {
        const {
            orderId,
            amount,
            customerPhone
        } = paymentData;
        
        try {
            const transactionId = `brm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // توليد رمز دفع فريد
            const paymentCode = Math.random().toString().substr(2, 6);
            
            const transaction = {
                id: transactionId,
                orderId,
                amount,
                method: 'baridimob',
                status: 'pending',
                data: {
                    recipientNumber: CONFIG.PAYMENT.BARIDIMOB.NUMBER,
                    recipientName: CONFIG.PAYMENT.BARIDIMOB.NAME,
                    paymentCode,
                    customerPhone
                },
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 ساعة
                instructions: [
                    '📱 *طريقة الدفع عبر بريديموب:*',
                    '1. افتح تطبيق بريديموب على هاتفك',
                    '2. اختر "تحويل أموال"',
                    '3. أدخل رقم المحفظة: ' + CONFIG.PAYMENT.BARIDIMOB.NUMBER,
                    '4. اسم المستفيد: ' + CONFIG.PAYMENT.BARIDIMOB.NAME,
                    '5. المبلغ: ' + CONFIG.helpers.formatPrice(amount) + ' دج',
                    '6. في خانة الملاحظات اكتب: ' + paymentCode,
                    '7. أكمل عملية التحويل',
                    '',
                    '✅ *بعد التحويل:*',
                    '- سيتم التحقق تلقائياً خلال دقائق',
                    '- احفظ رقم العملية',
                    '- للاستفسار: ' + CONFIG.APP.SUPPORT_PHONE
                ]
            };
            
            this.saveTransaction(transaction);
            
            return {
                success: true,
                transactionId,
                paymentCode,
                instructions: transaction.instructions,
                recipient: {
                    number: CONFIG.PAYMENT.BARIDIMOB.NUMBER,
                    name: CONFIG.PAYMENT.BARIDIMOB.NAME
                }
            };
        } catch (error) {
            console.error('خطأ في بوابة بريديموب:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // === بوابة التحويل البنكي ===
    async bankTransferGateway(paymentData) {
        const {
            orderId,
            amount,
            customerName
        } = paymentData;
        
        try {
            const transactionId = `bnk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const transaction = {
                id: transactionId,
                orderId,
                amount,
                method: 'bank_transfer',
                status: 'pending',
                data: {
                    bankName: CONFIG.PAYMENT.BANK_TRANSFER.BANK_NAME,
                    accountNumber: CONFIG.PAYMENT.BANK_TRANSFER.ACCOUNT_NUMBER,
                    accountName: CONFIG.PAYMENT.BANK_TRANSFER.ACCOUNT_NAME,
                    iban: CONFIG.PAYMENT.BANK_TRANSFER.IBAN,
                    bic: CONFIG.PAYMENT.BANK_TRANSFER.BIC,
                    reference: `DA-${orderId}`
                },
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 أيام
                instructions: [
                    '🏦 *طريقة الدفع عبر التحويل البنكي:*',
                    '1. اذهب إلى أي فرع لبنك ' + CONFIG.PAYMENT.BANK_TRANSFER.BANK_NAME,
                    '2. قدم معلومات الحساب التالية:',
                    '   - رقم الحساب: ' + CONFIG.PAYMENT.BANK_TRANSFER.ACCOUNT_NUMBER,
                    '   - اسم الحساب: ' + CONFIG.PAYMENT.BANK_TRANSFER.ACCOUNT_NAME,
                    '   - IBAN: ' + CONFIG.PAYMENT.BANK_TRANSFER.IBAN,
                    '   - BIC: ' + CONFIG.PAYMENT.BANK_TRANSFER.BIC,
                    '3. المبلغ: ' + CONFIG.helpers.formatPrice(amount) + ' دج',
                    '4. في خانة المرجع اكتب: DA-' + orderId,
                    '5. أكمل عملية التحويل',
                    '',
                    '📧 *بعد التحويل:*',
                    '- أرسل صورة إيصال التحويل إلى: ' + CONFIG.APP.SUPPORT_EMAIL,
                    '- اذكر رقم الطلب: ' + orderId,
                    '- سيتم تفعيل طلبك خلال 24 ساعة عمل'
                ]
            };
            
            this.saveTransaction(transaction);
            
            return {
                success: true,
                transactionId,
                instructions: transaction.instructions,
                bankDetails: {
                    bank: CONFIG.PAYMENT.BANK_TRANSFER.BANK_NAME,
                    accountNumber: CONFIG.PAYMENT.BANK_TRANSFER.ACCOUNT_NUMBER,
                    accountName: CONFIG.PAYMENT.BANK_TRANSFER.ACCOUNT_NAME,
                    iban: CONFIG.PAYMENT.BANK_TRANSFER.IBAN,
                    reference: `DA-${orderId}`
                }
            };
        } catch (error) {
            console.error('خطأ في بوابة التحويل البنكي:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // === الدوال الأساسية ===
    
    async processPayment(paymentData) {
        const { method } = paymentData;
        
        if (!this.gateways[method]) {
            return {
                success: false,
                error: `طريقة الدفع ${method} غير مدعومة`
            };
        }
        
        try {
            const result = await this.gateways[method](paymentData);
            
            // إذا نجحت العملية، إرسال إشعار
            if (result.success) {
                this.emit('paymentInitiated', {
                    transactionId: result.transactionId,
                    method,
                    amount: paymentData.amount,
                    orderId: paymentData.orderId
                });
            }
            
            return result;
        } catch (error) {
            console.error(`خطأ في معالجة الدفع عبر ${method}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async verifyPayment(transactionId, verificationData = {}) {
        const transaction = this.transactions.get(transactionId);
        
        if (!transaction) {
            return {
                success: false,
                error: 'المعاملة غير موجودة'
            };
        }
        
        // التحقق من انتهاء الصلاحية
        if (transaction.expiresAt && new Date(transaction.expiresAt) < new Date()) {
            transaction.status = 'expired';
            this.saveTransaction(transaction);
            
            return {
                success: false,
                error: 'انتهت صلاحية المعاملة'
            };
        }
        
        // حسب طريقة الدفع
        switch(transaction.method) {
            case 'redotpay':
                return await this.verifyRedotpayPayment(transaction, verificationData);
            case 'baridimob':
                return await this.verifyBaridimobPayment(transaction, verificationData);
            case 'ccp':
            case 'bank_transfer':
                return await this.verifyManualPayment(transaction, verificationData);
            case 'cash_on_delivery':
                // الدفع عند الاستلام يتم التحقق منه يدوياً
                return {
                    success: true,
                    status: 'pending_delivery',
                    transaction
                };
            default:
                return {
                    success: false,
                    error: 'طريقة التحقق غير مدعومة'
                };
        }
    }
    
    async verifyRedotpayPayment(transaction, verificationData) {
        // في التطبيق الحقيقي، نتواصل مع API Redotpay للتحقق
        // هذا تنفيذ محاكاة
        
        const { status = 'paid', transactionId: gatewayTransactionId } = verificationData;
        
        transaction.status = status;
        transaction.gatewayTransactionId = gatewayTransactionId;
        transaction.verifiedAt = new Date().toISOString();
        
        this.saveTransaction(transaction);
        
        this.emit('paymentVerified', {
            transactionId: transaction.id,
            status,
            orderId: transaction.orderId
        });
        
        return {
            success: true,
            status,
            transaction
        };
    }
    
    async verifyBaridimobPayment(transaction, verificationData) {
        const { paymentCode } = verificationData;
        
        if (!paymentCode || paymentCode !== transaction.data.paymentCode) {
            return {
                success: false,
                error: 'رمز الدفع غير صحيح'
            };
        }
        
        transaction.status = 'paid';
        transaction.verifiedAt = new Date().toISOString();
        
        this.saveTransaction(transaction);
        
        this.emit('paymentVerified', {
            transactionId: transaction.id,
            status: 'paid',
            orderId: transaction.orderId
        });
        
        return {
            success: true,
            status: 'paid',
            transaction
        };
    }
    
    async verifyManualPayment(transaction, verificationData) {
        const { receiptImage, receiptNumber, notes } = verificationData;
        
        // في التطبيق الحقيقي، نتحقق من الإيصال
        transaction.status = 'pending_verification';
        transaction.verificationData = {
            receiptImage,
            receiptNumber,
            notes,
            submittedAt: new Date().toISOString()
        };
        
        this.saveTransaction(transaction);
        
        this.emit('paymentVerificationSubmitted', {
            transactionId: transaction.id,
            orderId: transaction.orderId,
            method: transaction.method
        });
        
        return {
            success: true,
            status: 'pending_verification',
            message: 'تم استلام إيصال الدفع، جاري المراجعة',
            transaction
        };
    }
    
    async confirmManualPayment(transactionId, confirmed = true, adminNotes = '') {
        const transaction = this.transactions.get(transactionId);
        
        if (!transaction) {
            return {
                success: false,
                error: 'المعاملة غير موجودة'
            };
        }
        
        if (confirmed) {
            transaction.status = 'paid';
            transaction.confirmedAt = new Date().toISOString();
            transaction.adminNotes = adminNotes;
            
            this.emit('paymentConfirmed', {
                transactionId,
                orderId: transaction.orderId,
                method: transaction.method
            });
        } else {
            transaction.status = 'rejected';
            transaction.rejectedAt = new Date().toISOString();
            transaction.rejectionReason = adminNotes;
            
            this.emit('paymentRejected', {
                transactionId,
                orderId: transaction.orderId,
                reason: adminNotes
            });
        }
        
        this.saveTransaction(transaction);
        
        return {
            success: true,
            status: transaction.status,
            transaction
        };
    }
    
    // === إدارة المعاملات ===
    
    saveTransaction(transaction) {
        this.transactions.set(transaction.id, transaction);
        
        // حفظ في localStorage
        if (typeof window !== 'undefined') {
            const transactions = JSON.parse(localStorage.getItem('da_transactions') || '{}');
            transactions[transaction.id] = transaction;
            localStorage.setItem('da_transactions', JSON.stringify(transactions));
        }
    }
    
    loadTransactions() {
        if (typeof window !== 'undefined') {
            const transactions = JSON.parse(localStorage.getItem('da_transactions') || '{}');
            Object.values(transactions).forEach(transaction => {
                this.transactions.set(transaction.id, transaction);
            });
        }
    }
    
    getTransaction(transactionId) {
        return this.transactions.get(transactionId);
    }
    
    getOrderTransactions(orderId) {
        const transactions = [];
        
        for (const [id, transaction] of this.transactions) {
            if (transaction.orderId === orderId) {
                transactions.push(transaction);
            }
        }
        
        return transactions;
    }
    
    cleanupOldTransactions() {
        const now = new Date();
        let deleted = 0;
        
        for (const [id, transaction] of this.transactions) {
            // حذف المعاملات المنتهية منذ أكثر من 30 يوم
            const createdAt = new Date(transaction.createdAt);
            const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
            
            if (ageInDays > 30) {
                this.transactions.delete(id);
                deleted++;
            }
        }
        
        if (deleted > 0) {
            console.log(`تم تنظيف ${deleted} معاملة قديمة`);
            this.saveAllTransactions();
        }
    }
    
    saveAllTransactions() {
        if (typeof window !== 'undefined') {
            const transactions = {};
            for (const [id, transaction] of this.transactions) {
                transactions[id] = transaction;
            }
            localStorage.setItem('da_transactions', JSON.stringify(transactions));
        }
    }
    
    // === دوال مساعدة ===
    
    generateSignature(orderId, amount) {
        const secret = CONFIG.SECURITY.JWT_SECRET;
        const data = `${orderId}:${amount}:${Date.now()}`;
        
        // توليد توقيع بسيط
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data.charCodeAt(i);
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36);
    }
    
    generateQRCode(text) {
        // في التطبيق الحقيقي، نستخدم مكتبة QR Code
        // هذا رابط محاكاة
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    }
    
    getPaymentMethods() {
        return CONFIG.PAYMENT.METHODS.map(method => ({
            id: method.id,
            name: method.name,
            online: method.online,
            fee: method.fee,
            description: this.getMethodDescription(method.id),
            instructions: this.getMethodInstructions(method.id)
        }));
    }
    
    getMethodDescription(methodId) {
        const descriptions = {
            redotpay: 'الدفع الآمن عبر البطاقات الإلكترونية',
            cash_on_delivery: 'الدفع نقداً عند استلام المنتج',
            ccp: 'الدفع عبر الحساب البريدي',
            baridimob: 'الدفع عبر تطبيق بريديموب',
            bank_transfer: 'التحويل البنكي المباشر'
        };
        
        return descriptions[methodId] || 'طريقة دفع';
    }
    
    getMethodInstructions(methodId) {
        const instructions = {
            redotpay: ['سريع وآمن', 'يدعم جميع البطاقات', 'تأكيد فوري'],
            cash_on_delivery: ['لا حاجة لدفع مقدم', 'دفع عند التسليم', 'للسوق الجزائري فقط'],
            ccp: ['متوفر في جميع المكاتب البريدية', 'يتطلب زيارة المكتب', 'إيصال ورقي'],
            baridimob: ['سريع عبر التطبيق', 'تحويل فوري', 'يتطلب حساب بريديموب'],
            bank_transfer: ['آمن ومضمون', 'للمبالغ الكبيرة', 'يتطلب زيارة البنك']
        };
        
        return instructions[methodId] || [];
    }
    
    calculateFee(amount, methodId) {
        const method = CONFIG.PAYMENT.METHODS.find(m => m.id === methodId);
        if (!method) return 0;
        
        return method.fee;
    }
    
    getTotalWithFee(amount, methodId) {
        const fee = this.calculateFee(amount, methodId);
        return amount + fee;
    }
    
    // === Webhooks ===
    
    async handleWebhook(method, data) {
        const webhookKey = `${method}_webhook`;
        
        if (this.webhooks.has(webhookKey)) {
            const handlers = this.webhooks.get(webhookKey);
            
            for (const handler of handlers) {
                try {
                    await handler(data);
                } catch (error) {
                    console.error(`خطأ في معالج Webhook لـ ${method}:`, error);
                }
            }
        }
    }
    
    registerWebhook(method, handler) {
        const webhookKey = `${method}_webhook`;
        
        if (!this.webhooks.has(webhookKey)) {
            this.webhooks.set(webhookKey, []);
        }
        
        this.webhooks.get(webhookKey).push(handler);
    }
    
    // === Callbacks ===
    
    registerCallback(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        
        this.callbacks.get(event).push(callback);
    }
    
    emit(event, data) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`خطأ في معالج الحدث ${event}:`, error);
                }
            });
        }
    }
    
    // === إحصائيات ===
    
    getStats() {
        const transactions = Array.from(this.transactions.values());
        
        const stats = {
            total: transactions.length,
            byMethod: {},
            byStatus: {},
            totalAmount: 0,
            successfulAmount: 0
        };
        
        transactions.forEach(transaction => {
            // حسب الطريقة
            stats.byMethod[transaction.method] = (stats.byMethod[transaction.method] || 0) + 1;
            
            // حسب الحالة
            stats.byStatus[transaction.status] = (stats.byStatus[transaction.status] || 0) + 1;
            
            // المجاميع
            stats.totalAmount += transaction.amount || 0;
            
            if (transaction.status === 'paid') {
                stats.successfulAmount += transaction.amount || 0;
            }
        });
        
        return stats;
    }
    
    // === تصدير واستيراد ===
    
    exportTransactions() {
        const transactions = Array.from(this.transactions.values());
        return JSON.stringify(transactions, null, 2);
    }
    
    importTransactions(data) {
        try {
            const transactions = JSON.parse(data);
            
            transactions.forEach(transaction => {
                this.transactions.set(transaction.id, transaction);
            });
            
            this.saveAllTransactions();
            
            return {
                success: true,
                count: transactions.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// === إنشاء وتصدير نسخة من بوابة الدفع ===
let paymentGatewayInstance = null;

const getPaymentGateway = () => {
    if (!paymentGatewayInstance) {
        paymentGatewayInstance = new PaymentGateway();
    }
    return paymentGatewayInstance;
};

// التصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PaymentGateway, getPaymentGateway };
} else {
    window.getPaymentGateway = getPaymentGateway;
}
