"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("../services/init");
async function main() {
    try {
        const adminUserId = await (0, init_1.initializeAdminUser)();
        console.log('Admin user initialized successfully with ID:', adminUserId);
    }
    catch (error) {
        console.error('Failed to initialize admin user:', error);
        process.exit(1);
    }
}
main();
