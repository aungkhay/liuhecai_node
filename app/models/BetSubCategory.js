const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');
const BetCategory = require('./BetCategory');

class BetSubCategory extends Model {}

BetSubCategory.init({
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
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    limit_bet_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    odds: {
        type: DataTypes.JSON,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'BetSubCategory',
    tableName: 'bet_sub_categories',
})

module.exports = BetSubCategory
