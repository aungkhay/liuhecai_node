const db = require('../connections/Mysql');

const Banner = require('./Banner');
const ReferenceLink = require('./ReferenceLink');
const Config = require('./Config');
const User = require('./User');
const AomenRecord = require('./AomenRecord');
const HongKongRecord = require('./HongKongRecord');
const PlatformRecord = require('./PlatformRecord');
const ResultGuess = require('./ResultGuess');
const TouZiPingTe = require('./TouZiPingTe');
const DoubleColor = require('./DoubleColor');
const BetCategory = require('./BetCategory');
const BetSubCategory = require('./BetSubCategory');
const BetItem = require('./BetItem');
const BetItemNumber = require('./BetItemNumber');
const Bet = require('./Bet');

// ========== BetCategory ↔️ BetSubCategory ========== 
BetCategory.hasMany(BetSubCategory, { foreignKey: 'category_id', as: 'subCategories' });
BetSubCategory.belongsTo(BetCategory, { foreignKey: 'category_id', as: 'category' });

// ========== BetSubCategory ↔️ BetItem ========== 
BetSubCategory.hasMany(BetItem, { foreignKey: 'sub_category_id', as: 'betItems' });
BetItem.belongsTo(BetSubCategory, { foreignKey: 'sub_category_id', as: 'subCategory' });

// ========== BetItem ↔️ BetItemNumber ==========
BetItem.hasMany(BetItemNumber, { foreignKey: 'bet_item_id', as: 'betItemNumbers' });
BetItemNumber.belongsTo(BetItem, { foreignKey: 'bet_item_id', as: 'betItem' });

// ========== BetCategory & BetSubCategory ↔️ Bet ==========
BetCategory.hasMany(Bet, { foreignKey: 'category_id', as: 'bets' });
Bet.belongsTo(BetCategory, { foreignKey: 'category_id', as: 'category' });
BetSubCategory.hasMany(Bet, { foreignKey: 'sub_category_id', as: 'bets' });
Bet.belongsTo(BetSubCategory, { foreignKey: 'sub_category_id', as: 'subCategory' });

const models = {
    Banner,
    ReferenceLink,
    Config,
    User,
    AomenRecord,
    HongKongRecord,
    PlatformRecord,
    ResultGuess,
    TouZiPingTe,
    DoubleColor,
    BetCategory,
    BetSubCategory,
    BetItem,
    BetItemNumber,
    Bet,
};

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