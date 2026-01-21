// 📁 api-server.js
// سيرفر API مبسط للمتجر (للاستخدام في Node.js)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

class ApiServer {
    constructor(port = 3000) {
        this.app = express();
        this.port = port;
        this.dataPath = path.join(__dirname, 'data');
        this.stats = {
            requests: 0,
            products: 0,
            orders: 0,
            started: new Date()
        };
        
        this.initialize();
    }
    
    async initialize() {
        // إنشاء مجلد البيانات إذا لم يكن موجوداً
        await this.ensureDataDirectory();
        
        // تحميل البيانات
        await this.loadData();
        
        // إعداد middleware
        this.setupMiddleware();
        
        // إعداد المسارات
        this.setupRoutes();
        
        // بدء السيرفر
        this.start();
    }
    
    async ensureDataDirectory() {
        try {
            await fs.access(this.dataPath);
        } catch {
            await fs.mkdir(this.dataPath, { recursive: true });
            console.log('تم إنشاء مجلد البيانات');
        }
    }
    
    async loadData() {
        try {
            // تحميل المنتجات
            const productsData = await fs.readFile(
                path.join(this.dataPath, 'products.json'),
                'utf8'
            );
            this.products = JSON.parse(productsData);
        } catch (error) {
            // إذا لم تكن البيانات موجودة، ننشئ بيانات أولية
            this.products = this.getInitialProducts();
            await this.saveProducts();
        }
        
        try {
            // تحميل الطلبات
            const ordersData = await fs.readFile(
                path.join(this.dataPath, 'orders.json'),
                'utf8'
            );
            this.orders = JSON.parse(ordersData);
        } catch {
            this.orders = [];
            await this.saveOrders();
        }
        
        try {
            // تحميل الإعدادات
            const settingsData = await fs.readFile(
                path.join(this.dataPath, 'settings.json'),
                'utf8'
            );
            this.settings = JSON.parse(settingsData);
        } catch {
            this.settings = {};
            await this.saveSettings();
        }
        
        this.updateStats();
    }
    
    getInitialProducts() {
        return [
            {
                id: "prod_1",
                token: "dz_iphone_14",
                name: "هاتف آيفون 14 برو",
                category: "هواتف ذكية",
                price: 125000,
                originalPrice: 140000,
                discount: 11,
                images: [
                    "https://images.unsplash.com/photo-1670272498380-eb330b61f3cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                rating: 4.8,
                ratingCount: 342,
                description: "هاتف آيفون 14 برو بشاشة 6.1 بوصة، كاميرا متطورة، معالج A16 بايونيك.",
                features: ["شاشة 6.1 بوصة", "كاميرا 48 ميجابكسل", "معالج A16"],
                inStock: true,
                stock: 15,
                shipping: "توصيل مجاني",
                deliveryTime: "2-4 أيام",
                colors: ["أسود", "فضي", "ذهبي"],
                storage: ["128 جيجابايت", "256 جيجابايت"],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: "prod_2",
                token: "dz_macbook_air",
                name: "ماك بوك إير M2",
                category: "لابتوبات",
                price: 185000,
                originalPrice: 210000,
                discount: 12,
                images: [
                    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                rating: 4.9,
                ratingCount: 156,
                description: "ماك بوك إير بشاشة 13.6 بوصة، معالج Apple M2، بطارية طويلة الأمد.",
                features: ["شاشة 13.6 بوصة", "معالج M2", "بطارية 18 ساعة"],
                inStock: true,
                stock: 8,
                shipping: "توصيل مجاني",
                deliveryTime: "5-7 أيام",
                colors: ["فضي", "ذهبي"],
                storage: ["256 جيجابايت", "512 جيجابايت"],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }
    
    setupMiddleware() {
        // CORS
        this.app.use(cors({
            origin: CONFIG.SECURITY.ALLOWED_ORIGINS,
            credentials: true
        }));
        
        // Body parser
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        
        // Logging
        this.app.use((req, res, next) => {
            this.stats.requests++;
            console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
            next();
        });
        
        // الأمان الأساسي
        this.app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next();
        });
    }
    
    setupRoutes() {
        // === مسارات API ===
        
        // الصفحة الرئيسية
        this.app.get('/', (req, res) => {
            res.json({
                app: CONFIG.APP.NAME,
                version: CONFIG.APP.VERSION,
                status: 'online',
                stats: this.stats
            });
        });
        
        // الحالة الصحية
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });
        
        // === المنتجات ===
        
        // الحصول على جميع المنتجات
        this.app.get('/api/products', (req, res) => {
            try {
                const { 
                    category, 
                    minPrice, 
                    maxPrice,
                    inStock,
                    search,
                    sort = 'newest',
                    page = 1,
                    limit = 20 
                } = req.query;
                
                let filteredProducts = [...this.products];
                
                // التصفية
                if (category) {
                    filteredProducts = filteredProducts.filter(p => p.category === category);
                }
                
                if (minPrice) {
                    filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice));
                }
                
                if (maxPrice) {
                    filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice));
                }
                
                if (inStock === 'true') {
                    filteredProducts = filteredProducts.filter(p => p.inStock);
                }
                
                if (search) {
                    const searchTerm = search.toLowerCase();
                    filteredProducts = filteredProducts.filter(p => 
                        p.name.toLowerCase().includes(searchTerm) ||
                        p.description.toLowerCase().includes(searchTerm) ||
                        p.category.toLowerCase().includes(searchTerm)
                    );
                }
                
                // الترتيب
                if (sort === 'price_asc') {
                    filteredProducts.sort((a, b) => a.price - b.price);
                } else if (sort === 'price_desc') {
                    filteredProducts.sort((a, b) => b.price - a.price);
                } else if (sort === 'newest') {
                    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                } else if (sort === 'rating') {
                    filteredProducts.sort((a, b) => b.rating - a.rating);
                }
                
                // التقسيم
                const start = (page - 1) * limit;
                const end = start + parseInt(limit);
                const paginated = filteredProducts.slice(start, end);
                
                res.json({
                    success: true,
                    data: paginated,
                    pagination: {
                        total: filteredProducts.length,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(filteredProducts.length / limit)
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // الحصول على منتج بواسطة المعرف
        this.app.get('/api/products/:id', (req, res) => {
            try {
                const product = this.products.find(p => p.id === req.params.id);
                
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        error: 'المنتج غير موجود'
                    });
                }
                
                res.json({
                    success: true,
                    data: product
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // الحصول على منتج بواسطة التوكن
        this.app.get('/api/products/token/:token', (req, res) => {
            try {
                const product = this.products.find(p => p.token === req.params.token);
                
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        error: 'المنتج غير موجود'
                    });
                }
                
                res.json({
                    success: true,
                    data: product
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // إنشاء منتج جديد
        this.app.post('/api/products', (req, res) => {
            try {
                const product = req.body;
                
                // التحقق من البيانات
                if (!product.name || !product.price) {
                    return res.status(400).json({
                        success: false,
                        error: 'الاسم والسعر مطلوبان'
                    });
                }
                
                // إنشاء معرف فريد
                product.id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                product.token = product.token || `dz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                product.createdAt = new Date().toISOString();
                product.updatedAt = new Date().toISOString();
                
                this.products.push(product);
                this.saveProducts();
                this.updateStats();
                
                res.json({
                    success: true,
                    data: product
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // تحديث منتج
        this.app.put('/api/products/:id', (req, res) => {
            try {
                const index = this.products.findIndex(p => p.id === req.params.id);
                
                if (index === -1) {
                    return res.status(404).json({
                        success: false,
                        error: 'المنتج غير موجود'
                    });
                }
                
                this.products[index] = {
                    ...this.products[index],
                    ...req.body,
                    updatedAt: new Date().toISOString()
                };
                
                this.saveProducts();
                
                res.json({
                    success: true,
                    data: this.products[index]
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // حذف منتج
        this.app.delete('/api/products/:id', (req, res) => {
            try {
                const index = this.products.findIndex(p => p.id === req.params.id);
                
                if (index === -1) {
                    return res.status(404).json({
                        success: false,
                        error: 'المنتج غير موجود'
                    });
                }
                
                this.products.splice(index, 1);
                this.saveProducts();
                this.updateStats();
                
                res.json({
                    success: true,
                    message: 'تم حذف المنتج بنجاح'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // === الطلبات ===
        
        // الحصول على جميع الطلبات
        this.app.get('/api/orders', (req, res) => {
            try {
                const { status, phone, sort = 'newest', limit } = req.query;
                
                let filteredOrders = [...this.orders];
                
                // التصفية
                if (status) {
                    filteredOrders = filteredOrders.filter(o => o.status === status);
                }
                
                if (phone) {
                    filteredOrders = filteredOrders.filter(o => o.customerPhone === phone);
                }
                
                // الترتيب
                if (sort === 'newest') {
                    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
                } else if (sort === 'oldest') {
                    filteredOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
                }
                
                // الحد
                if (limit) {
                    filteredOrders = filteredOrders.slice(0, parseInt(limit));
                }
                
                res.json({
                    success: true,
                    data: filteredOrders
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // الحصول على طلب بواسطة المعرف
        this.app.get('/api/orders/:id', (req, res) => {
            try {
                const order = this.orders.find(o => o.id === req.params.id);
                
                if (!order) {
                    return res.status(404).json({
                        success: false,
                        error: 'الطلب غير موجود'
                    });
                }
                
                res.json({
                    success: true,
                    data: order
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // إنشاء طلب جديد
        this.app.post('/api/orders', (req, res) => {
            try {
                const order = req.body;
                
                // التحقق من البيانات
                if (!order.productId || !order.customerName || !order.customerPhone) {
                    return res.status(400).json({
                        success: false,
                        error: 'بيانات الطلب غير مكتملة'
                    });
                }
                
                // إنشاء معرف فريد
                order.id = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                order.date = new Date().toISOString();
                order.status = order.status || 'pending';
                order.paymentStatus = order.paymentStatus || 'pending';
                
                this.orders.push(order);
                this.saveOrders();
                this.updateStats();
                
                res.json({
                    success: true,
                    data: order
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // تحديث حالة الطلب
        this.app.put('/api/orders/:id/status', (req, res) => {
            try {
                const { status, notes } = req.body;
                const index = this.orders.findIndex(o => o.id === req.params.id);
                
                if (index === -1) {
                    return res.status(404).json({
                        success: false,
                        error: 'الطلب غير موجود'
                    });
                }
                
                this.orders[index].status = status;
                this.orders[index].updatedAt = new Date().toISOString();
                
                if (notes) {
                    this.orders[index].notes = notes;
                }
                
                this.saveOrders();
                
                res.json({
                    success: true,
                    data: this.orders[index]
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // === الإحصائيات ===
        
        this.app.get('/api/stats', (req, res) => {
            try {
                const stats = {
                    products: this.products.length,
                    orders: this.orders.length,
                    totalRevenue: this.orders.reduce((sum, order) => sum + (order.total || order.price || 0), 0),
                    pendingOrders: this.orders.filter(o => o.status === 'pending').length,
                    categories: [...new Set(this.products.map(p => p.category))],
                    dailyOrders: this.getDailyStats(),
                    server: this.stats
                };
                
                res.json({
                    success: true,
                    data: stats
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // === التحميل ===
        
        this.app.post('/api/upload', (req, res) => {
            try {
                // في التطبيق الحقيقي، نتعامل مع رفع الملفات
                res.json({
                    success: true,
                    message: 'التحميل غير مفعل في النسخة الحالية'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // === الدفع ===
        
        this.app.post('/api/payment/create', (req, res) => {
            try {
                const { orderId, amount, method } = req.body;
                
                // إنشاء رابط دفع
                const paymentLink = CONFIG.helpers.createPaymentLink(orderId, amount, method);
                
                res.json({
                    success: true,
                    data: {
                        paymentLink,
                        orderId,
                        amount,
                        method
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // رد استدعاء الدفع
        this.app.post('/api/payment/callback', (req, res) => {
            try {
                const { orderId, status, transactionId } = req.body;
                
                // تحديث حالة الطلب
                const orderIndex = this.orders.findIndex(o => o.id === orderId);
                if (orderIndex !== -1) {
                    this.orders[orderIndex].paymentStatus = status;
                    this.orders[orderIndex].transactionId = transactionId;
                    this.orders[orderIndex].updatedAt = new Date().toISOString();
                    
                    if (status === 'paid') {
                        this.orders[orderIndex].status = 'processing';
                    }
                    
                    this.saveOrders();
                }
                
                res.json({
                    success: true,
                    message: 'تم تحديث حالة الدفع'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // === معالجة الأخطاء ===
        
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'المسار غير موجود'
            });
        });
        
        this.app.use((error, req, res, next) => {
            console.error('خطأ في السيرفر:', error);
            res.status(500).json({
                success: false,
                error: 'خطأ داخلي في السيرفر'
            });
        });
    }
    
    getDailyStats() {
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(order => 
            new Date(order.date).toDateString() === today
        );
        
        return {
            date: today,
            orders: todayOrders.length,
            revenue: todayOrders.reduce((sum, order) => sum + (order.total || order.price || 0), 0),
            averageOrder: todayOrders.length > 0 ? 
                todayOrders.reduce((sum, order) => sum + (order.total || order.price || 0), 0) / todayOrders.length : 0
        };
    }
    
    updateStats() {
        this.stats.products = this.products.length;
        this.stats.orders = this.orders.length;
    }
    
    async saveProducts() {
        try {
            await fs.writeFile(
                path.join(this.dataPath, 'products.json'),
                JSON.stringify(this.products, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('خطأ في حفظ المنتجات:', error);
        }
    }
    
    async saveOrders() {
        try {
            await fs.writeFile(
                path.join(this.dataPath, 'orders.json'),
                JSON.stringify(this.orders, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('خطأ في حفظ الطلبات:', error);
        }
    }
    
    async saveSettings() {
        try {
            await fs.writeFile(
                path.join(this.dataPath, 'settings.json'),
                JSON.stringify(this.settings, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('خطأ في حفظ الإعدادات:', error);
        }
    }
    
    start() {
        this.app.listen(this.port, () => {
            console.log(`✅ سيرفر API يعمل على http://localhost:${this.port}`);
            console.log(`📊 ${this.products.length} منتج، ${this.orders.length} طلب`);
            console.log(`🔧 الوضع: ${CONFIG.DEVELOPMENT.DEBUG ? 'تطوير' : 'إنتاج'}`);
        });
    }
    
    stop() {
        if (this.server) {
            this.server.close();
            console.log('⏹️  تم إيقاف سيرفر API');
        }
    }
}

// === تصدير ===
if (require.main === module) {
    // إذا تم تشغيل الملف مباشرة
    const server = new ApiServer(process.env.PORT || 3000);
} else {
    // إذا تم استيراده كوحدة
    module.exports = ApiServer;
}
