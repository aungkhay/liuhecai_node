const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');
const BetSubCategory = require('./BetSubCategory');

class BetItem extends Model {}

BetItem.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    sub_category_id: {
        type: DataTypes.BIGINT,
        references: {  
            model: BetSubCategory,
            key: 'id'
        },
        defaultValue: 0
    },
    sub_group: {
        type: DataTypes.STRING(50),
        allowNull: true,
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
    odds: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    item_type: {
        type: DataTypes.ENUM('simple', 'number_group'),
        allowNull: false,
        defaultValue: 'simple',
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
    modelName: 'BetItem',
    tableName: 'bet_items',
    indexes: [
        {
            name: 'idx_category_subcategory',
            fields: ['category_id', 'sub_category_id']
        }
    ]
})

module.exports = BetItem
