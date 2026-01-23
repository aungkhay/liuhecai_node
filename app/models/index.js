const db = require('../connections/Mysql');

const Banner = require('./Banner');
const Config = require('./Config');
const User = require('./User');
const AomenRecord = require('./AomenRecord');
const HongKongRecord = require('./HongKongRecord');
const PlatformRecord = require('./PlatformRecord');

const models = {
    Banner,
    Config,
    User,
    AomenRecord,
    HongKongRecord,
    PlatformRecord,
}

// Export models + db connection
module.exports = {
    ...models,
    db,
    connect: async () => {
        try {
            await db.authenticate();
            console.log('\x1b[32m[DB]\x1b[0m', 'Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    },
    syncDB: async () => {
        try {
            await db.sync(); // use { force: true } to drop & recreate tables
            console.log('\x1b[36m[DB]\x1b[0m Tables synchronized successfully.');
        } catch (err) {
            console.error('Error synchronizing database:', err);
        }
    }
};