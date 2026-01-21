// 📁 telegram-bot.js
// نظام بوت تليجرام الكامل للمتجر

class TelegramBotManager {
    constructor() {
        this.bot = null;
        this.isConnected = false;
        this.webhookUrl = '';
        this.userStates = new Map(); // لتتبع حالة المستخدمين
        this.userCarts = new Map(); // سلة التسوق لكل مستخدم
        this.lastMessages = new Map(); // آخر الرسائل
        this.commands = CONFIG.TELEGRAM.COMMANDS;
        this.keyboards = CONFIG.TELEGRAM.KEYBOARDS;
        this.messages = CONFIG.TELEGRAM.MESSAGES;
        
        this.initialize();
    }
    
    // === التهيئة ===
    initialize() {
        // تحميل التوكن من الإعدادات
        this.loadToken();
        
        // إعداد معالجات الأحداث
        this.setupEventListeners();
        
        // بدء البوت إذا كان التوكن موجوداً
        if (this.token) {
            this.connect();
        }
    }
    
    // === تحميل التوكن ===
    loadToken() {
        this.token = CONFIG.TELEGRAM.BOT_TOKEN;
        if (!this.token && typeof window !== 'undefined') {
            // محاولة الحصول من localStorage
            this.token = localStorage.getItem('telegram_bot_token');
        }
    }
    
    // === الاتصال بالبوت ===
    async connect(token = null) {
        try {
            if (token) {
                this.token = token;
                CONFIG.TELEGRAM.BOT_TOKEN = token;
                
                // حفظ في localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('telegram_bot_token', token);
                }
            }
            
            if (!this.token) {
                throw new Error('لم يتم توفير توكن البوت');
            }
            
            console.log('جاري الاتصال ببوت تليجرام...');
            
            // في بيئة المتصفح، نستخدم Webhooks أو Long Polling عبر Proxy
            if (typeof window !== 'undefined') {
                await this.connectInBrowser();
            } else {
                // في بيئة Node.js
                await this.connectInNode();
            }
            
            this.isConnected = true;
            this.emit('connected', { token: this.token });
            console.log('تم الاتصال ببوت تليجرام بنجاح!');
            
            return true;
        } catch (error) {
            console.error('خطأ في الاتصال بالبوت:', error);
            this.emit('error', error);
            this.isConnected = false;
            return false;
        }
    }
    
    // === الاتصال في المتصفح ===
    async connectInBrowser() {
        // في المتصفح، نستخدم Webhooks عبر خدمة وسيطة
        // هذا تنفيذ محاكاة للتوضيح
        this.bot = {
            token: this.token,
            sendMessage: this.mockSendMessage.bind(this),
            editMessageText: this.mockEditMessageText.bind(this),
            answerCallbackQuery: this.mockAnswerCallbackQuery.bind(this),
            sendPhoto: this.mockSendPhoto.bind(this),
            sendInvoice: this.mockSendInvoice.bind(this)
        };
        
        // محاكاة استقبال الرسائل
        this.setupMockPolling();
    }
    
    // === إعداد Webhook ===
    async setupWebhook(url) {
        if (!url) {
            console.warn('لم يتم توفير عنوان Webhook');
            return false;
        }
        
        this.webhookUrl = url;
        
        try {
            // في بيئة حقيقية، نرسل طلب لتحديث Webhook
            const response = await fetch(`https://api.telegram.org/bot${this.token}/setWebhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: this.webhookUrl,
                    max_connections: 100,
                    allowed_updates: ['message', 'callback_query']
                })
            });
            
            const data = await response.json();
            
            if (data.ok) {
                console.log('تم إعداد Webhook بنجاح:', this.webhookUrl);
                return true;
            } else {
                throw new Error(data.description);
            }
        } catch (error) {
            console.error('خطأ في إعداد Webhook:', error);
            return false;
        }
    }
    
    // === معالجة الرسائل ===
    async handleUpdate(update) {
        try {
            if (update.message) {
                await this.handleMessage(update.message);
            } else if (update.callback_query) {
                await this.handleCallbackQuery(update.callback_query);
            }
        } catch (error) {
            console.error('خطأ في معالجة التحديث:', error);
        }
    }
    
    // === معالجة الرسائل النصية ===
    async handleMessage(message) {
        const chatId = message.chat.id;
        const text = message.text || '';
        const userId = message.from.id;
        const username = message.from.username || message.from.first_name;
        
        // حفظ آخر رسالة
        this.lastMessages.set(userId, {
            chatId,
            messageId: message.message_id,
            text,
            timestamp: new Date()
        });
        
        // معالجة الأوامر
        if (text.startsWith('/')) {
            await this.handleCommand(chatId, text, userId, username);
            return;
        }
        
        // معالجة الحالة الحالية للمستخدم
        const userState = this.userStates.get(userId);
        if (userState) {
            await this.handleUserState(chatId, text, userId, userState);
            return;
        }
        
        // رد افتراضي
        await this.sendMainMenu(chatId);
    }
    
    // === معالجة الأوامر ===
    async handleCommand(chatId, command, userId, username) {
        const cmd = command.split(' ')[0].toLowerCase();
        const args = command.split(' ').slice(1);
        
        console.log(`معالجة الأمر: ${cmd} من ${username}`);
        
        switch(cmd) {
            case '/start':
                await this.handleStart(chatId, userId, username);
                break;
                
            case '/menu':
                await this.sendMainMenu(chatId);
                break;
                
            case '/products':
                await this.showProducts(chatId, userId, args[0]);
                break;
                
            case '/offers':
                await this.showOffers(chatId);
                break;
                
            case '/categories':
                await this.showCategories(chatId);
                break;
                
            case '/search':
                if (args.length > 0) {
                    await this.searchProducts(chatId, args.join(' '));
                } else {
                    await this.askForSearchQuery(chatId, userId);
                }
                break;
                
            case '/orders':
                await this.showUserOrders(chatId, userId);
                break;
                
            case '/track':
                await this.askForOrderId(chatId, userId);
                break;
                
            case '/cart':
                await this.showCart(chatId, userId);
                break;
                
            case '/help':
                await this.sendHelp(chatId);
                break;
                
            case '/contact':
                await this.sendContactInfo(chatId);
                break;
                
            case '/settings':
                await this.showSettings(chatId, userId);
                break;
                
            default:
                await this.sendMessage(chatId, '⚠️ الأمر غير معروف. استخدم /menu للقائمة الرئيسية.');
        }
    }
    
    // === معالجة حالة المستخدم ===
    async handleUserState(chatId, text, userId, state) {
        switch(state.type) {
            case 'awaiting_search':
                await this.searchProducts(chatId, text);
                this.userStates.delete(userId);
                break;
                
            case 'awaiting_order_id':
                await this.trackOrder(chatId, text, userId);
                this.userStates.delete(userId);
                break;
                
            case 'awaiting_quantity':
                await this.addToCartFromState(chatId, text, userId, state.data);
                this.userStates.delete(userId);
                break;
                
            case 'awaiting_contact':
                await this.saveContactInfo(chatId, text, userId);
                this.userStates.delete(userId);
                break;
        }
    }
    
    // === معالجة استعلامات Callback ===
    async handleCallbackQuery(callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const userId = callbackQuery.from.id;
        const data = callbackQuery.data;
        const messageId = callbackQuery.message.message_id;
        
        try {
            // فصل البيانات
            const [action, ...params] = data.split(':');
            
            switch(action) {
                case 'category':
                    await this.showCategoryProducts(chatId, params[0]);
                    break;
                    
                case 'product':
                    await this.showProductDetails(chatId, params[0], messageId);
                    break;
                    
                case 'add_to_cart':
                    await this.askForQuantity(chatId, params[0], userId);
                    break;
                    
                case 'cart_action':
                    await this.handleCartAction(chatId, params[0], userId, messageId);
                    break;
                    
                case 'order':
                    await this.showOrderDetails(chatId, params[0]);
                    break;
                    
                case 'checkout':
                    await this.startCheckout(chatId, userId);
                    break;
                    
                case 'menu':
                    await this.sendMainMenu(chatId);
                    break;
                    
                case 'back':
                    await this.editMessage(chatId, messageId, 'رجوع...');
                    // حسب السياق
                    break;
            }
            
            // الإجابة على Callback Query
            await this.answerCallbackQuery(callbackQuery.id);
        } catch (error) {
            console.error('خطأ في معالجة Callback Query:', error);
            await this.answerCallbackQuery(callbackQuery.id, '⚠️ حدث خطأ، يرجى المحاولة مرة أخرى.');
        }
    }
    
    // === أوامر البوت الأساسية ===
    
    async handleStart(chatId, userId, username) {
        const welcomeMessage = `🎉 *مرحباً ${username}!* 🎉

مرحباً بك في *${CONFIG.APP.NAME}* - منصة التسوق الإلكتروني الرائدة في الجزائر.

🌟 *مميزات البوت:*
• تصفح المنتجات والعروض
• إدارة سلة التسوق
• تتبع طلباتك
• طلب مباشر
• دعم فني مباشر

استخدم الأوامر التالية:
/start - بدء الاستخدام
/menu - القائمة الرئيسية
/products - عرض المنتجات
/offers - العروض الحالية
/search - البحث عن منتج
/orders - طلباتي
/cart - سلة التسوق
/help - المساعدة

أو استخدم الأزرار أدناه 👇`;

        await this.sendMessage(chatId, welcomeMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🛒 ابدأ التسوق', callback_data: 'menu' }],
                    [{ text: '🎁 العروض', callback_data: 'offers' }],
                    [{ text: '📞 الدعم', url: `https://t.me/${CONFIG.TELEGRAM.BOT_USERNAME}` }]
                ]
            }
        });
    }
    
    async sendMainMenu(chatId) {
        const message = this.messages.WELCOME;
        
        await this.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: this.keyboards.MAIN.map(row =>
                    row.map(button => ({ text: button }))
                ),
                resize_keyboard: true,
                one_time_keyboard: false
            }
        });
    }
    
    async showProducts(chatId, userId, category = null) {
        try {
            const db = getDatabase();
            let products;
            
            if (category) {
                products = await db.getAllProducts({
                    filter: { category },
                    sort: 'newest',
                    paginate: { page: 1, limit: 10 }
                });
            } else {
                products = await db.getAllProducts({
                    sort: 'newest',
                    paginate: { page: 1, limit: 10 }
                });
            }
            
            if (!products.data || products.data.length === 0) {
                await this.sendMessage(chatId, '⚠️ لا توجد منتجات متاحة حالياً.');
                return;
            }
            
            let message = '📦 *المنتجات المتاحة:*\n\n';
            const keyboard = [];
            
            products.data.forEach((product, index) => {
                message += `${index + 1}. *${product.name}*\n`;
                message += `   💰 ${CONFIG.helpers.formatPrice(product.price)}\n`;
                if (product.discount > 0) {
                    message += `   🎯 خصم ${product.discount}%\n`;
                }
                message += `   📍 ${product.category}\n`;
                message += `   🔗 /product_${product.id}\n\n`;
                
                keyboard.push([
                    {
                        text: `${index + 1}. ${product.name.substring(0, 20)}...`,
                        callback_data: `product:${product.id}`
                    }
                ]);
            });
            
            // إضافة أزرار التنقل
            keyboard.push([
                { text: '◀️ السابق', callback_data: 'products:prev' },
                { text: 'التالي ▶️', callback_data: 'products:next' }
            ]);
            
            keyboard.push([
                { text: '🔙 القائمة الرئيسية', callback_data: 'menu' }
            ]);
            
            await this.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
        } catch (error) {
            console.error('خطأ في عرض المنتجات:', error);
            await this.sendMessage(chatId, '⚠️ حدث خطأ في جلب المنتجات. يرجى المحاولة لاحقاً.');
        }
    }
    
    async showProductDetails(chatId, productId, messageId = null) {
        try {
            const db = getDatabase();
            const product = await db.getProduct(productId);
            
            if (!product) {
                await this.sendMessage(chatId, '⚠️ المنتج غير موجود.');
                return;
            }
            
            const message = `📱 *${product.name}*

${product.description}

*التفاصيل:*
💰 السعر: ${CONFIG.helpers.formatPrice(product.price)}
${product.discount > 0 ? `🎯 السعر الأصلي: ${CONFIG.helpers.formatPrice(product.originalPrice)} (خصم ${product.discount}%)\n` : ''}
⭐ التقييم: ${product.rating}/5 (${product.ratingCount} تقييم)
📦 المخزون: ${product.inStock ? `متوفر (${product.stock} قطعة)` : 'غير متوفر'}
🚚 التوصيل: ${product.shipping} - ${product.deliveryTime}
🏷️ القسم: ${product.category}

*المميزات:*
${product.features.map(f => `• ${f}`).join('\n')}`;

            const keyboard = [
                [
                    {
                        text: product.inStock ? '🛒 إضافة إلى السلة' : '⏳ غير متوفر',
                        callback_data: product.inStock ? `add_to_cart:${product.id}` : 'unavailable'
                    }
                ],
                [
                    { text: '🔙 رجوع', callback_data: 'products' },
                    { text: '🏠 الرئيسية', callback_data: 'menu' }
                ]
            ];
            
            if (messageId) {
                await this.editMessage(chatId, messageId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: keyboard }
                });
            } else {
                await this.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: keyboard }
                });
            }
        } catch (error) {
            console.error('خطأ في عرض تفاصيل المنتج:', error);
            await this.sendMessage(chatId, '⚠️ حدث خطأ في عرض تفاصيل المنتج.');
        }
    }
    
    async askForQuantity(chatId, productId, userId) {
        try {
            const db = getDatabase();
            const product = await db.getProduct(productId);
            
            if (!product) {
                await this.sendMessage(chatId, '⚠️ المنتج غير موجود.');
                return;
            }
            
            await this.sendMessage(chatId, `كمية ${product.name} التي تريد إضافتها إلى السلة؟\n(الحد الأقصى: ${product.stock})`);
            
            // حفظ حالة المستخدم
            this.userStates.set(userId, {
                type: 'awaiting_quantity',
                data: { productId, maxQuantity: product.stock }
            });
        } catch (error) {
            console.error('خطأ في طلب الكمية:', error);
        }
    }
    
    async addToCartFromState(chatId, text, userId, stateData) {
        try {
            const quantity = parseInt(text);
            const { productId, maxQuantity } = stateData;
            
            if (isNaN(quantity) || quantity < 1 || quantity > maxQuantity) {
                await this.sendMessage(chatId, `⚠️ كمية غير صالحة. يرجى إدخال عدد بين 1 و ${maxQuantity}`);
                return;
            }
            
            // إضافة إلى سلة المستخدم
            let cart = this.userCarts.get(userId) || [];
            const existingItemIndex = cart.findIndex(item => item.productId === productId);
            
            if (existingItemIndex !== -1) {
                cart[existingItemIndex].quantity += quantity;
            } else {
                const db = getDatabase();
                const product = await db.getProduct(productId);
                
                cart.push({
                    productId,
                    productToken: product.token,
                    productName: product.name,
                    price: product.price,
                    quantity,
                    image: product.images[0]
                });
            }
            
            this.userCarts.set(userId, cart);
            
            await this.sendMessage(chatId, `✅ تمت إضافة ${quantity} من المنتج إلى سلة التسوق.`);
            await this.showCart(chatId, userId);
        } catch (error) {
            console.error('خطأ في إضافة المنتج إلى السلة:', error);
            await this.sendMessage(chatId, '⚠️ حدث خطأ في إضافة المنتج إلى السلة.');
        }
    }
    
    async showCart(chatId, userId) {
        try {
            const cart = this.userCarts.get(userId) || [];
            
            if (cart.length === 0) {
                await this.sendMessage(chatId, '🛒 سلة التسوق فارغة.\nاستخدم /products لعرض المنتجات.');
                return;
            }
            
            let message = '🛒 *سلة التسوق*\n\n';
            let total = 0;
            
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                message += `${index + 1}. *${item.productName}*\n`;
                message += `   💰 ${CONFIG.helpers.formatPrice(item.price)} × ${item.quantity} = ${CONFIG.helpers.formatPrice(itemTotal)}\n\n`;
            });
            
            message += `*المجموع: ${CONFIG.helpers.formatPrice(total)}*`;
            
            const keyboard = [
                [
                    { text: '✅ إنهاء الطلب', callback_data: 'checkout' },
                    { text: '🗑️ تفريغ السلة', callback_data: 'cart_action:clear' }
                ]
            ];
            
            // أزرار تعديل كل عنصر
            cart.forEach((item, index) => {
                keyboard.push([
                    { text: `✏️ تعديل ${index + 1}`, callback_data: `cart_action:edit:${index}` },
                    { text: `🗑️ حذف ${index + 1}`, callback_data: `cart_action:remove:${index}` }
                ]);
            });
            
            keyboard.push([
                { text: '🔙 رجوع', callback_data: 'products' },
                { text: '🏠 الرئيسية', callback_data: 'menu' }
            ]);
            
            await this.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: keyboard }
            });
        } catch (error) {
            console.error('خطأ في عرض سلة التسوق:', error);
            await this.sendMessage(chatId, '⚠️ حدث خطأ في عرض سلة التسوق.');
        }
    }
    
    async handleCartAction(chatId, action, userId, messageId) {
        const [actionType, ...params] = action.split(':');
        
        switch(actionType) {
            case 'clear':
                this.userCarts.delete(userId);
                await this.editMessage(chatId, messageId, '🗑️ تم تفريغ سلة التسوق.', {
                    reply_markup: { inline_keyboard: [[{ text: '🏠 الرئيسية', callback_data: 'menu' }]] }
                });
                break;
                
            case 'remove':
                const indexToRemove = parseInt(params[0]);
                let cart = this.userCarts.get(userId) || [];
                if (indexToRemove >= 0 && indexToRemove < cart.length) {
                    cart.splice(indexToRemove, 1);
                    this.userCarts.set(userId, cart);
                    await this.showCart(chatId, userId);
                }
                break;
                
            case 'edit':
                // تنفيذ تعديل العنصر
                break;
        }
    }
    
    async startCheckout(chatId, userId) {
        try {
            const cart = this.userCarts.get(userId) || [];
            
            if (cart.length === 0) {
                await this.sendMessage(chatId, '⚠️ سلة التسوق فارغة.');
                return;
            }
            
            await this.sendMessage(chatId, '📝 *إنهاء الطلب*\n\nيرجى إرسال معلوماتك لتأكيد الطلب:\n\nالاسم الكامل:');
            
            this.userStates.set(userId, {
                type: 'awaiting_contact',
                data: { cart, step: 'name' }
            });
        } catch (error) {
            console.error('خطأ في بدء الطلب:', error);
        }
    }
    
    async saveContactInfo(chatId, text, userId) {
        try {
            const state = this.userStates.get(userId);
            if (!state || state.type !== 'awaiting_contact') return;
            
            const { cart, step, ...contactInfo } = state.data;
            
            switch(step) {
                case 'name':
                    contactInfo.name = text;
                    await this.sendMessage(chatId, '📞 رقم الهاتف:');
                    this.userStates.set(userId, {
                        type: 'awaiting_contact',
                        data: { cart, step: 'phone', ...contactInfo }
                    });
                    break;
                    
                case 'phone':
                    if (!CONFIG.helpers.isValidPhone(text)) {
                        await this.sendMessage(chatId, '⚠️ رقم الهاتف غير صالح. يرجى إدخال رقم جزائري صحيح (مثال: 0550123456):');
                        return;
                    }
                    contactInfo.phone = text;
                    await this.sendMessage(chatId, '📍 العنوان (الولاية، البلدية، الشارع):');
                    this.userStates.set(userId, {
                        type: 'awaiting_contact',
                        data: { cart, step: 'address', ...contactInfo }
                    });
                    break;
                    
                case 'address':
                    contactInfo.address = text;
                    await this.sendMessage(chatId, 'اختر طريقة الدفع:', {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '💳 Redotpay', callback_data: 'payment:redotpay' }],
                                [{ text: '💰 الدفع عند الاستلام', callback_data: 'payment:cash' }],
                                [{ text: '🏦 تحويل بنكي', callback_data: 'payment:bank' }]
                            ]
                        }
                    });
                    this.userStates.set(userId, {
                        type: 'awaiting_contact',
                        data: { cart, step: 'payment', ...contactInfo }
                    });
                    break;
                    
                case 'payment':
                    contactInfo.paymentMethod = text;
                    await this.confirmOrder(chatId, userId, contactInfo);
                    break;
            }
        } catch (error) {
            console.error('خطأ في حفظ معلومات الاتصال:', error);
        }
    }
    
    async confirmOrder(chatId, userId, contactInfo) {
        try {
            const db = getDatabase();
            const cart = contactInfo.cart;
            
            // حساب المجموع
            let subtotal = 0;
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
            });
            
            // إنشاء طلب لكل منتج
            const orderPromises = cart.map(async (item) => {
                const order = {
                    productId: item.productId,
                    productToken: item.productToken,
                    productName: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                    customerName: contactInfo.name,
                    customerPhone: contactInfo.phone,
                    customerAddress: contactInfo.address,
                    paymentMethod: contactInfo.paymentMethod,
                    status: 'pending',
                    source: 'telegram'
                };
                
                return await db.saveOrder(order);
            });
            
            const orders = await Promise.all(orderPromises);
            
            // تفريغ سلة التسوق
            this.userCarts.delete(userId);
            this.userStates.delete(userId);
            
            // إرسال تأكيد
            const orderNumbers = orders.map(o => o.id.substring(0, 8)).join(', ');
            const message = `✅ *تم تأكيد طلبك بنجاح!*\n\n` +
                          `📦 *أرقام الطلبات:* ${orderNumbers}\n` +
                          `👤 *الاسم:* ${contactInfo.name}\n` +
                          `📞 *الهاتف:* ${contactInfo.phone}\n` +
                          `📍 *العنوان:* ${contactInfo.address}\n` +
                          `💳 *طريقة الدفع:* ${contactInfo.paymentMethod}\n\n` +
                          `سيتم التواصل معك خلال 24 ساعة لتأكيد الطلب وتحديد موعد التوصيل.\n\n` +
                          `شكراً لاختيارك ${CONFIG.APP.NAME}! 🛍️`;
            
            await this.sendMessage(chatId, message, {
                parse_mode: 'Markdown'
            });
            
            // إرسال إشعار للمسؤول
            await this.notifyAdminNewOrder(orders, contactInfo);
        } catch (error) {
            console.error('خطأ في تأكيد الطلب:', error);
            await this.sendMessage(chatId, '⚠️ حدث خطأ في تأكيد الطلب. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.');
        }
    }
    
    async notifyAdminNewOrder(orders, contactInfo) {
        try {
            const adminIds = CONFIG.TELEGRAM.ADMIN_IDS;
            if (!adminIds || adminIds.length === 0) return;
            
            const message = `🛒 *طلب جديد من البوت*\n\n` +
                          `👤 العميل: ${contactInfo.name}\n` +
                          `📞 الهاتف: ${contactInfo.phone}\n` +
                          `📍 العنوان: ${contactInfo.address}\n` +
                          `💳 الدفع: ${contactInfo.paymentMethod}\n` +
                          `📦 عدد المنتجات: ${orders.length}\n` +
                          `🔢 أرقام الطلبات: ${orders.map(o => o.id).join(', ')}`;
            
            for (const adminId of adminIds) {
                await this.sendMessage(adminId, message, {
                    parse_mode: 'Markdown'
                });
            }
        } catch (error) {
            console.error('خطأ في إرسال إشعار للمسؤول:', error);
        }
    }
    
    async showOffers(chatId) {
        try {
            const db = getDatabase();
            const products = await db.getAllProducts({
                filter: { onDiscount: true },
                sort: 'newest',
                paginate: { page: 1, limit: 10 }
            });
            
            if (!products.data || products.data.length === 0) {
                await this.sendMessage(chatId, '🎯 *لا توجد عروض حالياً*\n\nتابعنا للاطلاع على أحدث العروض!');
                return;
            }
            
            let message = '🎁 *العروض الحالية*\n\n';
            
            products.data.forEach((product, index) => {
                message += `${index + 1}. *${product.name}*\n`;
                message += `   💰 ${CONFIG.helpers.formatPrice(product.price)} `;
                message += `~~${CONFIG.helpers.formatPrice(product.originalPrice)}~~\n`;
                message += `   🎯 وفر ${CONFIG.helpers.formatPrice(product.originalPrice - product.price)} (${product.discount}%)\n`;
                message += `   🔗 /product_${product.id}\n\n`;
            });
            
            await this.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🛒 التسوق الآن', callback_data: 'products' }],
                        [{ text: '🔙 الرئيسية', callback_data: 'menu' }]
                    ]
                }
            });
        } catch (error) {
            console.error('خطأ في عرض العروض:', error);
            await this.sendMessage(chatId, '⚠️ حدث خطأ في عرض العروض.');
        }
    }
    
    async showCategories(chatId) {
        try {
            const db = getDatabase();
            const categories = await db.getCategories();
            
            if (!categories || categories.length === 0) {
                // استخدام الفئات الافتراضية
                const defaultCategories = CONFIG.PRODUCTS.DEFAULT_CATEGORIES.slice(0, 12);
                
                const keyboard = [];
                for (let i = 0; i < defaultCategories.length; i += 2) {
                    const row = defaultCategories.slice(i, i + 2).map(category => ({
                        text: category,
                        callback_data: `category:${category}`
                    }));
                    keyboard.push(row);
                }
                
                keyboard.push([{ text: '🔙 رجوع', callback_data: 'menu' }]);
                
                await this.sendMessage(chatId, '📂 *الأقسام*\n\nاختر القسم:', {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: keyboard }
                });
            }
        } catch (error) {
            console.error('خطأ في عرض الأقسام:', error);
        }
    }
    
    async showCategoryProducts(chatId, category) {
        await this.showProducts(chatId, null, category);
    }
    
    async searchProducts(chatId, query) {
        try {
            const db = getDatabase();
            const products = await db.getAllProducts({
                filter: { search: query },
                sort: 'newest',
                paginate: { page: 1, limit: 10 }
            });
            
            if (!products.data || products.data.length === 0) {
                await this.sendMessage(chatId, `🔍 *نتائج البحث عن: "${query}"*\n\nلم يتم العثور على منتجات تطابق بحثك.\n\nجرب:\n• استخدام كلمات مختلفة\n• البحث باللغة العربية\n• تقصير عبارة البحث`);
                return;
            }
            
            let message = `🔍 *نتائج البحث عن: "${query}"*\n\n`;
            
            products.data.forEach((product, index) => {
                message += `${index + 1}. *${product.name}*\n`;
                message += `   💰 ${CONFIG.helpers.formatPrice(product.price)}\n`;
                message += `   📍 ${product.category}\n`;
                message += `   🔗 /product_${product.id}\n\n`;
            });
            
            const keyboard = products.data.map((product, index) => [
                {
                    text: `${index + 1}. ${product.name.substring(0, 20)}...`,
                    callback_data: `product:${product.id}`
                }
            ]);
            
            keyboard.push([
                { text: '🔙 بحث جديد', callback_data: 'search' },
                { text: '🏠 الرئيسية', callback_data: 'menu' }
            ]);
            
            await this.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: keyboard }
            });
        } catch (error) {
            console.error('خطأ في البحث:', error);
            await this.sendMessage(chatId, '⚠️ حدث خطأ في البحث. يرجى المحاولة مرة أخرى.');
        }
    }
    
    async askForSearchQuery(chatId, userId) {
        await this.sendMessage(chatId, '🔍 *البحث عن منتج*\n\nأدخل كلمات البحث:');
        this.userStates.set(userId, { type: 'awaiting_search' });
    }
    
    async showUserOrders(chatId, userId) {
        try {
            // في نموذج محاكاة، نستخدم هاتف وهمي
            // في التطبيق الحقيقي، سنربط حساب تليجرام برقم الهاتف
            const mockPhone = '0550000000';
            const db = getDatabase();
            const orders = await db.getCustomerOrders(mockPhone);
            
            if (!orders || orders.length === 0) {
                await this.sendMessage(chatId, '📋 *لا توجد طلبات سابقة*\n\nاستخدم /products لبدء التسوق!');
                return;
            }
            
            let message = '📋 *طلباتي*\n\n';
            
            orders.slice(0, 10).forEach((order, index) => {
                message += `${index + 1}. *${order.productName}*\n`;
                message += `   📅 ${CONFIG.helpers.formatDate(order.date, 'short')}\n`;
                message += `   💰 ${CONFIG.helpers.formatPrice(order.total)}\n`;
                message += `   📦 ${this.getStatusEmoji(order.status)} ${this.getStatusText(order.status)}\n`;
                message += `   🔢 ${order.id.substring(0, 8)}\n\n`;
            });
            
            if (orders.length > 10) {
                message += `\nعرض ${orders.length} طلباً\nاستخدم /track لمتابعة طلب معين`;
            }
            
            const keyboard = [
                [
                    { text: '📍 تتبع طلب', callback_data: 'track' },
                    { text: '🛒 تسوق جديد', callback_data: 'products' }
                ],
                [{ text: '🏠 الرئيسية', callback_data: 'menu' }]
            ];
            
            await this.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: keyboard }
            });
        } catch (error) {
            console.error('خطأ في عرض الطلبات:', error);
            await this.sendMessage(chatId, '⚠️ حدث خطأ في عرض الطلبات.');
        }
    }
    
    async askForOrderId(chatId, userId) {
        await this.sendMessage(chatId, '📍 *تتبع الطلب*\n\nأدخل رقم الطلب (الموجود في فاتورتك أو رسالة التأكيد):');
        this.userStates.set(userId, { type: 'awaiting_order_id' });
    }
    
    async trackOrder(chatId, orderId, userId) {
        try {
            const db = getDatabase();
            const order = await db.getOrder(orderId);
            
            if (!order) {
                await this.sendMessage(chatId, `⚠️ لم يتم العثور على طلب برقم: ${orderId}\n\nتأكد من رقم الطلب وحاول مرة أخرى.`);
                return;
            }
            
            const message = `📦 *تتبع الطلب*\n\n` +
                          `🔢 *رقم الطلب:* ${order.id}\n` +
                          `📱 *المنتج:* ${order.productName}\n` +
                          `📅 *تاريخ الطلب:* ${CONFIG.helpers.formatDate(order.date, 'short')}\n` +
                          `💰 *المبلغ:* ${CONFIG.helpers.formatPrice(order.total)}\n` +
                          `🚚 *حالة الطلب:* ${this.getStatusEmoji(order.status)} ${this.getStatusText(order.status)}\n` +
                          `💳 *طريقة الدفع:* ${order.paymentMethod}\n\n`;
            
            let estimatedDelivery = '';
            if (order.estimatedDelivery) {
                estimatedDelivery = `📅 *موعد التوصيل المتوقع:* ${CONFIG.helpers.formatDate(order.estimatedDelivery, 'short')}\n`;
            }
            
            let trackingInfo = '';
            if (order.trackingNumber) {
                trackingInfo = `📮 *رقم التتبع:* ${order.trackingNumber}\n`;
            }
            
            const finalMessage = message + estimatedDelivery + trackingInfo;
            
            await this.sendMessage(chatId, finalMessage, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 رجوع', callback_data: 'orders' }]]
                }
            });
        } catch (error) {
            console.error('خطأ في تتبع الطلب:', error);
            await this.sendMessage(chatId, '⚠️ حدث خطأ في تتبع الطلب.');
        }
    }
    
    async sendHelp(chatId) {
        const message = `🆘 *المساعدة والدعم*\n\n` +
                      `*الدعم الفني:*\n` +
                      `📞 الهاتف: ${CONFIG.APP.SUPPORT_PHONE}\n` +
                      `📧 البريد: ${CONFIG.APP.SUPPORT_EMAIL}\n` +
                      `⏰ الوقت: ${CONFIG.SHIPPING.WORKING_HOURS.START} - ${CONFIG.SHIPPING.WORKING_HOURS.END}\n\n` +
                      `*الأوامر المتاحة:*\n` +
                      `/start - بدء الاستخدام\n` +
                      `/menu - القائمة الرئيسية\n` +
                      `/products - المنتجات\n` +
                      `/offers - العروض\n` +
                      `/search - البحث\n` +
                      `/orders - طلباتي\n` +
                      `/track - تتبع طلب\n` +
                      `/cart - سلة التسوق\n` +
                      `/help - هذه الرسالة\n` +
                      `/contact - التواصل معنا`;
        
        await this.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📞 اتصل بنا', url: `https://t.me/${CONFIG.TELEGRAM.BOT_USERNAME}` }],
                    [{ text: '🏠 الرئيسية', callback_data: 'menu' }]
                ]
            }
        });
    }
    
    async sendContactInfo(chatId) {
        const message = `📞 *معلومات التواصل*\n\n` +
                      `*الدعم الفني:*\n` +
                      `📱 ${CONFIG.APP.SUPPORT_PHONE}\n` +
                      `✉️ ${CONFIG.APP.SUPPORT_EMAIL}\n\n` +
                      `*ساعات العمل:*\n` +
                      `يومياً من ${CONFIG.SHIPPING.WORKING_HOURS.START} إلى ${CONFIG.SHIPPING.WORKING_HOURS.END}\n\n` +
                      `*العنوان:*\n` +
                      `الجزائر العاصمة، الجزائر`;
        
        await this.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📱 اتصل الآن', url: `tel:${CONFIG.APP.SUPPORT_PHONE.replace('+', '')}` }],
                    [{ text: '📧 أرسل بريد', url: `mailto:${CONFIG.APP.SUPPORT_EMAIL}` }],
                    [{ text: '🔙 رجوع', callback_data: 'menu' }]
                ]
            }
        });
    }
    
    async showSettings(chatId, userId) {
        const message = `⚙️ *الإعدادات*\n\n` +
                      `*إعدادات الإشعارات:*\n` +
                      `✅ مفعلة - ستتلقى إشعارات عن طلباتك وعروضنا\n\n` +
                      `*اللغة:* العربية\n\n` +
                      `*معلومات حسابك:*\n` +
                      `معرف المستخدم: ${userId}\n` +
                      `الطلبات: ${this.userCarts.get(userId)?.length || 0} في السلة`;
        
        const keyboard = [
            [
                { text: '🔔 إدارة الإشعارات', callback_data: 'settings:notifications' },
                { text: '🌐 اللغة', callback_data: 'settings:language' }
            ],
            [
                { text: '🗑️ حذف الحساب', callback_data: 'settings:delete' },
                { text: '📋 بياناتي', callback_data: 'settings:info' }
            ],
            [{ text: '🔙 رجوع', callback_data: 'menu' }]
        ];
        
        await this.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: keyboard }
        });
    }
    
    // === دوال مساعدة ===
    
    getStatusEmoji(status) {
        switch(status) {
            case 'pending': return '⏳';
            case 'processing': return '🔄';
            case 'shipped': return '🚚';
            case 'delivered': return '✅';
            case 'cancelled': return '❌';
            default: return '📝';
        }
    }
    
    getStatusText(status) {
        switch(status) {
            case 'pending': return 'قيد الانتظار';
            case 'processing': return 'قيد المعالجة';
            case 'shipped': return 'تم الشحن';
            case 'delivered': return 'تم التوصيل';
            case 'cancelled': return 'ملغي';
            default: return status;
        }
    }
    
    // === دوال إرسال الرسائل (محاكاة) ===
    
    async sendMessage(chatId, text, options = {}) {
        console.log(`[BOT] إرسال إلى ${chatId}:`, text.substring(0, 100) + '...');
        
        // في التطبيق الحقيقي، نستخدم API تليجرام
        if (this.bot && this.bot.sendMessage) {
            return this.bot.sendMessage(chatId, text, options);
        }
        
        // محاكاة
        return { message_id: Date.now(), chat: { id: chatId } };
    }
    
    async editMessage(chatId, messageId, text, options = {}) {
        console.log(`[BOT] تعديل رسالة ${messageId} في ${chatId}`);
        
        if (this.bot && this.bot.editMessageText) {
            return this.bot.editMessageText(text, {
                chat_id: chatId,
                message_id: messageId,
                ...options
            });
        }
        
        return true;
    }
    
    async answerCallbackQuery(callbackQueryId, text = '') {
        console.log(`[BOT] الإجابة على callback ${callbackQueryId}`);
        
        if (this.bot && this.bot.answerCallbackQuery) {
            return this.bot.answerCallbackQuery(callbackQueryId, { text, show_alert: !!text });
        }
        
        return true;
    }
    
    async sendPhoto(chatId, photoUrl, caption = '', options = {}) {
        console.log(`[BOT] إرسال صورة إلى ${chatId}`);
        
        if (this.bot && this.bot.sendPhoto) {
            return this.bot.sendPhoto(chatId, photoUrl, { caption, ...options });
        }
        
        return { message_id: Date.now() };
    }
    
    // === محاكاة Long Polling ===
    
    setupMockPolling() {
        // هذه مجرد محاكاة للتوضيح
        console.log('[BOT] بدأ استقبال الرسائل (محاكاة)');
        
        // محاكاة رسائل واردة كل 30 ثانية
        setInterval(() => {
            this.mockIncomingMessage();
        }, 30000);
    }
    
    mockIncomingMessage() {
        // توليد رسائل وهمية للاختبار
        const mockMessages = [
            { text: '/start', from: { id: 123456, first_name: 'مستخدم' } },
            { text: 'مرحبا', from: { id: 123456, first_name: 'مستخدم' } },
            { text: '/products', from: { id: 123456, first_name: 'مستخدم' } }
        ];
        
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        const chatId = randomMessage.from.id;
        
        // محاكاة استقبال الرسالة
        this.handleMessage({
            chat: { id: chatId },
            from: randomMessage.from,
            text: randomMessage.text,
            message_id: Date.now()
        });
    }
    
    mockSendMessage(chatId, text, options = {}) {
        return Promise.resolve({
            message_id: Date.now(),
            chat: { id: chatId },
            text,
            options
        });
    }
    
    mockEditMessageText(text, options = {}) {
        return Promise.resolve(true);
    }
    
    mockAnswerCallbackQuery(callbackQueryId, options = {}) {
        return Promise.resolve(true);
    }
    
    mockSendPhoto(chatId, photo, options = {}) {
        return Promise.resolve({
            message_id: Date.now(),
            chat: { id: chatId }
        });
    }
    
    mockSendInvoice(chatId, invoice, options = {}) {
        return Promise.resolve({
            message_id: Date.now(),
            chat: { id: chatId }
        });
    }
    
    // === إدارة الأحداث ===
    
    setupEventListeners() {
        // يمكن إضافة مستمعي الأحداث هنا
    }
    
    on(event, callback) {
        if (!this.listeners) this.listeners = {};
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }
    
    off(event, callback) {
        if (this.listeners && this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.listeners && this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`خطأ في معالج الحدث ${event}:`, error);
                }
            });
        }
    }
    
    // === إدارة البوت ===
    
    disconnect() {
        this.isConnected = false;
        this.bot = null;
        this.emit('disconnected');
        console.log('تم قطع الاتصال بالبوت');
    }
    
    getBotInfo() {
        return {
            isConnected: this.isConnected,
            token: this.token ? this.token.substring(0, 10) + '...' : null,
            webhook: this.webhookUrl,
            userStates: this.userStates.size,
            userCarts: this.userCarts.size
        };
    }
    
    // === إرسال إشعارات ===
    
    async sendBroadcast(message, options = {}) {
        if (!this.isConnected) {
            throw new Error('البوت غير متصل');
        }
        
        try {
            // في التطبيق الحقيقي، نرسل للمشتركين
            console.log('[BROADCAST]', message.substring(0, 100));
            return true;
        } catch (error) {
            console.error('خطأ في إرسال البث:', error);
            throw error;
        }
    }
    
    async publishOffer(productId) {
        try {
            const db = getDatabase();
            const product = await db.getProduct(productId);
            
            if (!product) {
                throw new Error('المنتج غير موجود');
            }
            
            const message = `🎁 *عرض جديد!* 🎁\n\n` +
                          `*${product.name}*\n\n` +
                          `💰 السعر: ${CONFIG.helpers.formatPrice(product.price)}\n` +
                          `🎯 خصم ${product.discount}%\n\n` +
                          `${product.description.substring(0, 100)}...\n\n` +
                          `سارع بالطلب الآن! ⏰`;
            
            await this.sendBroadcast(message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🛒 طلب الآن', callback_data: `product:${product.id}` }]
                    ]
                }
            });
            
            return true;
        } catch (error) {
            console.error('خطأ في نشر العرض:', error);
            throw error;
        }
    }
}

// === إنشاء وتصدير نسخة من مدير البوت ===
let botInstance = null;

const getTelegramBot = () => {
    if (!botInstance) {
        botInstance = new TelegramBotManager();
    }
    return botInstance;
};

// التصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TelegramBotManager, getTelegramBot };
} else {
    window.getTelegramBot = getTelegramBot;
}
