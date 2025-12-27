const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// تخزين الغرف والاتصالات
const rooms = new Map();

// خدمة الملفات الثابتة
app.use(express.static(__dirname));

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// صفحة الغرفة
app.get('/room.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'room.html'));
});

// معالج WebSocket
wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = url.searchParams.get('room') || 'default';
    const userId = generateUserId();
    
    console.log(`🔗 مستخدم جديد: ${userId} في غرفة ${roomId}`);
    
    // إنشاء غرفة إذا لم تكن موجودة
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
    }
    
    const room = rooms.get(roomId);
    room.set(userId, ws);
    
    // إرسال معلومات الاتصال
    ws.send(JSON.stringify({
        type: 'connected',
        userId: userId,
        roomId: roomId
    }));
    
    // إعلام الآخرين بانضمام مستخدم جديد
    broadcastToRoom(roomId, userId, {
        type: 'user-joined',
        userId: userId
    });
    
    // استقبال الرسائل
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            message.from = userId;
            
            // توجيه الرسائل حسب النوع
            switch(message.type) {
                case 'offer':
                case 'answer':
                case 'ice-candidate':
                    // توجيه رسائل WebRTC مباشرة
                    if (message.to) {
                        sendToUser(roomId, message.to, message);
                    } else {
                        broadcastToRoom(roomId, userId, message);
                    }
                    break;
                    
                case 'control-request':
                case 'control-response':
                    // توجيه رسائل التحكم
                    if (message.to) {
                        sendToUser(roomId, message.to, message);
                    }
                    break;
                    
                default:
                    // بث عام للرسائل الأخرى
                    broadcastToRoom(roomId, userId, message);
            }
            
        } catch (error) {
            console.error('❌ خطأ في معالجة الرسالة:', error);
        }
    });
    
    // عند إغلاق الاتصال
    ws.on('close', () => {
        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            room.delete(userId);
            
            // إعلام الآخرين
            broadcastToRoom(roomId, userId, {
                type: 'user-left',
                userId: userId
            });
            
            // حذف الغرفة الفارغة
            if (room.size === 0) {
                rooms.delete(roomId);
                console.log(`🗑️ حذفت غرفة ${roomId}`);
            }
        }
        
        console.log(`👋 غادر: ${userId} من غرفة ${roomId}`);
    });
});

// دالة البث للغرفة
function broadcastToRoom(roomId, senderId, message) {
    if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.forEach((client, userId) => {
            if (userId !== senderId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}

// إرسال رسالة لمستخدم معين
function sendToUser(roomId, targetUserId, message) {
    if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        const client = room.get(targetUserId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
}

// توليد معرف مستخدم فريد
function generateUserId() {
    return Math.random().toString(36).substr(2, 9);
}

// إعادة توجيه جميع المسارات للصفحة الرئيسية
app.get('*', (req, res) => {
    res.redirect('/');
});

// بدء الخادم
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 الخادم يعمل على: http://localhost:${PORT}`);
    console.log('='.repeat(50));
    console.log('\n✨ المميزات:');
    console.log('✅ خاص 100% - لا توجد أطراف ثالثة');
    console.log('✅ لا يوجد تسجيل دخول');
    console.log('✅ لا يوجد تخزين بيانات');
    console.log('✅ تشفير من نظير لنظير');
    console.log('='.repeat(50));
});

// إيقاف نظيف عند إغلاق الخادم
process.on('SIGINT', () => {
    console.log('\n🛑 إيقاف الخادم...');
    wss.close();
    server.close(() => {
        console.log('✅ تم إيقاف الخادم');
        process.exit(0);
    });
});