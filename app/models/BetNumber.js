const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');
const Bet = require('./Bet');

class BetNumber extends Model {}

BetNumber.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    bet_id: {
        type: DataTypes.BIGINT,
        references: {  
            model: Bet,
            key: 'id'
        },
        defaultValue: 0
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'BetNumber',
    tableName: 'bet_numbers',
})

module.exports = BetNumber
