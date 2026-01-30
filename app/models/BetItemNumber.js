const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');
const BetItem = require('./BetItem');

class BetItemNumber extends Model {}

BetItemNumber.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    bet_item_id: {
        type: DataTypes.BIGINT,
        references: {  
            model: BetItem,
            key: 'id'
        },
        defaultValue: 0
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'BetItemNumber',
    tableName: 'bet_item_numbers',
})

module.exports = BetItemNumber
