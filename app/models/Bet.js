const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');
const BetCategory = require('./BetCategory');
const BetSubCategory = require('./BetSubCategory');
const PlatformRecord = require('./PlatformRecord');
const User = require('./User');

class Bet extends Model {}

Bet.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    category_id: {
        type: DataTypes.BIGINT,
        references: {  
            model: BetCategory,
            key: 'id'
        },
        defaultValue: 0
    },
    sub_category_id: {
        type: DataTypes.BIGINT,
        references: {  
            model: BetSubCategory,
            key: 'id'
        },
        defaultValue: 0
    },
    record_id: {
        type: DataTypes.BIGINT,
        references: {
            model: PlatformRecord,
            key: 'id'
        },
        defaultValue: null
    },
    batch_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_group_bet: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    group_name: {
        type: DataTypes.TEXT('medium'),
        allowNull: true,
    },
    item_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    odds: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    bet_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    remark: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_calculated: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    is_win: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '0: 未结算, 1: 输, 2: 赢, 3: 和'
    },
    win_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
    },
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        },
        defaultValue: null
    }
}, {
    sequelize,
    modelName: 'Bet',
    tableName: 'bets',
    indexes: [
        { fields: ['remark'] },
        { fields: ['item_code'] },
        { fields: ['is_group_bet'] },
        { fields: ['is_calculated'] }
    ]
})

module.exports = Bet
