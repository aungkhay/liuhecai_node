const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class BetCategory extends Model {}

BetCategory.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
}, {
    sequelize,
    modelName: 'BetCategory',
    tableName: 'bet_categories',
})

module.exports = BetCategory
