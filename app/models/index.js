const db = require('../connections/Mysql');

const Role = require('./Role');
const Permission = require('./Permission');
const Banner = require('./Banner');
const ReferenceLink = require('./ReferenceLink');
const Config = require('./Config');
const User = require('./User');
const AdminLog = require('./AdminLog');
const AomenRecord = require('./AomenRecord');
const HongKongRecord = require('./HongKongRecord');
const PlatformRecord = require('./PlatformRecord');
const ResultGuess = require('./ResultGuess');
const TouZiPingTe = require('./TouZiPingTe');
const DoubleColor = require('./DoubleColor');
const BetCategory = require('./BetCategory');
const BetSubCategory = require('./BetSubCategory');
const BetItem = require('./BetItem');
const BetNumber = require('./BetNumber');
const Bet = require('./Bet');

// ========== Role ↔️ Permission ========== 
Role.belongsToMany(Permission, { as: 'permissions', through: 'role_has_permissions', foreignKey: 'RoleId' });
Permission.belongsToMany(Role, { through: 'role_has_permissions', foreignKey: 'PermissionId' });

// Admin ↔️ Role
User.belongsToMany(Role, { as: 'roles', through: 'admin_has_roles', foreignKey: 'AdminId' });
Role.belongsToMany(User, { through: 'admin_has_roles', foreignKey: 'RoleId' });

// ========== USER ↔️ ADMIN_LOG (1:N) ==========
User.hasMany(AdminLog, { foreignKey: 'admin_id', as: 'logs', onDelete: 'CASCADE' });
AdminLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin', onDelete: 'CASCADE' });

// ========== BetCategory ↔️ BetSubCategory ========== 
BetCategory.hasMany(BetSubCategory, { foreignKey: 'category_id', as: 'subCategories' });
BetSubCategory.belongsTo(BetCategory, { foreignKey: 'category_id', as: 'category' });

// ========== BetSubCategory ↔️ BetItem ========== 
BetSubCategory.hasMany(BetItem, { foreignKey: 'sub_category_id', as: 'betItems' });
BetItem.belongsTo(BetSubCategory, { foreignKey: 'sub_category_id', as: 'subCategory' });

// ========== Bet ↔️ BetNumber ==========
Bet.hasMany(BetNumber, { foreignKey: 'bet_id', as: 'bet_numbers' });
BetNumber.belongsTo(Bet, { foreignKey: 'bet_id', as: 'bet' });

// ========== BetCategory & BetSubCategory ↔️ Bet ==========
BetCategory.hasMany(Bet, { foreignKey: 'category_id', as: 'bets' });
Bet.belongsTo(BetCategory, { foreignKey: 'category_id', as: 'category' });
BetSubCategory.hasMany(Bet, { foreignKey: 'sub_category_id', as: 'bets' });
Bet.belongsTo(BetSubCategory, { foreignKey: 'sub_category_id', as: 'subCategory' });
PlatformRecord.hasMany(Bet, { foreignKey: 'record_id', as: 'bets' });
Bet.belongsTo(PlatformRecord, { foreignKey: 'record_id', as: 'record' });

// ========== User ↔️ PlatformRecord ==========
User.hasMany(PlatformRecord, { foreignKey: 'admin_id', as: 'platformRecords' });
PlatformRecord.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

const models = {
    Role,
    Permission,
    Banner,
    ReferenceLink,
    Config,
    User,
    AdminLog,
    AomenRecord,
    HongKongRecord,
    PlatformRecord,
    ResultGuess,
    TouZiPingTe,
    DoubleColor,
    BetCategory,
    BetSubCategory,
    BetItem,
    BetNumber,
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