// 📁 database.js
// نظام قاعدة البيانات المتقدم مع IndexedDB

class AdvancedDatabase {
    constructor(dbName = 'DigitalAlgeriaDB', version = 2) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        this.isInitialized = false;
        this.listeners = {
            onProductUpdate: [],
            onOrderUpdate: [],
            onBackup: []
        };
    }

    // === تهيئة قاعدة البيانات ===
    async initialize() {
        return new Promise((resolve, reject) => {
            if (!window.index
