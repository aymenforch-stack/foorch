const express = require('express');
const path = require('path');

const app = express();

// خدمة الملفات الثابتة
app.use(express.static(__dirname));

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// جميع المسارات الأخرى ترجع الصفحة الرئيسية
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// بدء الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 التطبيق يعمل على: http://localhost:${PORT}`);
    console.log('='.repeat(50));
    console.log('\n🎯 المميزات:');
    console.log('✅ دخول → شاشة مباشرة');
    console.log('✅ لا يوجد أزرار إضافية');
    console.log('✅ مشاركة تلقائية');
    console.log('✅ مشاهدة فورية');
    console.log('='.repeat(50));
});