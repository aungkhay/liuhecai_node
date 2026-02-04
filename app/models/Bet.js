const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');
const BetCategory = require('./BetCategory');
const BetSubCategory = require('./BetSubCategory');

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
}, {
    sequelize,
    modelName: 'Bet',
    tableName: 'bets',
    indexes: [
        { fields: ['remark'] },
    ]
})

module.exports = Bet
