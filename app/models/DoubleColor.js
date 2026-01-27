const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class DoubleColor extends Model {}

DoubleColor.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    batch_number: {
        type: DataTypes.INTEGER,     
        allowNull: false,
    },
    color_one: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    color_two: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    result_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    zodiac_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    match_color: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'DoubleColor',
    tableName: 'double_colors',
})

module.exports = DoubleColor
