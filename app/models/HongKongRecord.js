const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class HongKongRecord extends Model {}

HongKongRecord.init({
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
    num1: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num2: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num3: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num4: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num5: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num6: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num7: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    draw_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'HongKongRecord',
    tableName: 'hongkong_records',
    timestamps: true,
    indexes: [
        {
            name: 'idx_draw_date',
            fields: ['draw_date'],
        }
    ],
})

module.exports = HongKongRecord;