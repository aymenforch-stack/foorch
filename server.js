const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// تخزين الغرف
const rooms = new Map();

// خدمة الملفات الثابتة
app.use(express.static(__dirname));

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API بسيط لإنشاء غرفة
app.get('/api/create-room', (req, res) => {
    const roomId = generateRoomId();
    rooms.set(roomId, { users: [], created: Date.now() });
    
    res.json({
        success: true,
        roomId: roomId,
        link: `http://${req.headers.host}/?room=${roomId}`
    });
});

// API للانضمام للغرفة
app.get('/api/join/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    
    if (rooms.has(roomId)) {
        res.json({
            success: true,
            roomId: roomId,
            exists: true
        });
    } else {
        res.json({
            success: false,
            message: 'الغرفة غير موجودة'
        });
    }
});

// WebSocket للاتصال المباشر
wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = url.searchParams.get('room');
    
    if (!roomId) {
        ws.close();
        return;
    }
    
    // إنشاء غرفة إذا لم تكن موجودة
    if (!rooms.has(roomId)) {
        rooms.set(roomId, { users: [], created: Date.now() });
    }
    
    const room = rooms.get(roomId);
    const userId = generateUserId();
    
    // إضافة المستخدم للغرفة
    room.users.push({ id: userId, ws: ws });
    
    console.log(`👤 ${userId} انضم لغرفة ${roomId} (${room.users.length} مستخدم)`);
    
    // إرسال تأكيد الاتصال
    ws.send(JSON.stringify({
        type: 'connected',
        roomId: roomId,
        userId: userId
    }));
    
    // إعلام الآخرين بانضمام مستخدم جديد
    room.users.forEach(user => {
        if (user.id !== userId && user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(JSON.stringify({
                type: 'user-joined',
                userId: userId,
                roomId: roomId
            }));
        }
    });
    
    // استقبال الرسائل
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            data.sender = userId;
            
            // توجيه الرسالة لجميع المستخدمين في الغرفة
            room.users.forEach(user => {
                if (user.id !== userId && user.ws.readyState === WebSocket.OPEN) {
                    user.ws.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('خطأ في معالجة الرسالة:', error);
        }
    });
    
    // عند إغلاق الاتصال
    ws.on('close', () => {
        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            room.users = room.users.filter(user => user.id !== userId);
            
            // إعلام الآخرين بخروج المستخدم
            room.users.forEach(user => {
                if (user.ws.readyState === WebSocket.OPEN) {
                    user.ws.send(JSON.stringify({
                        type: 'user-left',
                        userId: userId
                    }));
                }
            });
            
            // حذف الغرفة الفارغة
            if (room.users.length === 0) {
                rooms.delete(roomId);
                console.log(`🗑️ حذفت غرفة ${roomId}`);
            }
        }
    });
});

// توليد كود غرفة
function generateRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// توليد معرف مستخدم
function generateUserId() {
    return Math.random().toString(36).substring(2, 9);
}

// بدء الخادم
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`✅ الخادم يعمل على: http://localhost:${PORT}`);
    console.log('='.repeat(50));
    console.log('\n🎯 طريقة الاستخدام:');
    console.log('1. افتح الموقع ← ينشئ غرفة تلقائياً');
    console.log('2. اضغط "نعم" ← تبدأ مشاركة الشاشة فوراً');
    console.log('3. أرسل الرابط لصديقك ← يرى شاشتك مباشرة');
    console.log('='.repeat(50));
});