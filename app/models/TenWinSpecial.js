const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class TenWinSpecial extends Model {}

TenWinSpecial.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    batch_number: {
        type: DataTypes.STRING,     
        allowNull: false,
    },
    numbers: {
        type: DataTypes.STRING,
        defaultValue: '0-0-0-0-0-0-0-0-0-0', // ten numbers
    },
    result_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    result_zodiac: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    is_matched: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
}, {
    sequelize,
    modelName: 'TenWinSpecial',
    tableName: 'ten_win_specials',
    indexes: [
        { fields: ['batch_number']}
    ]
})

module.exports = TenWinSpecial
