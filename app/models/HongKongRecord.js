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
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    batch_number: {
        type: DataTypes.STRING,     
        allowNull: false,
    },
    num1: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num1_desc: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'zodiac|wuxing|color',
    },
    num2: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num2_desc: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'zodiac|wuxing|color',
    },
    num3: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num3_desc: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'zodiac|wuxing|color',
    },
    num4: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num4_desc: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'zodiac|wuxing|color',
    },
    num5: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num5_desc: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'zodiac|wuxing|color',
    },
    num6: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num6_desc: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'zodiac|wuxing|color',
    },
    num7: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    num7_desc: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'zodiac|wuxing|color',
    },
    draw_date: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: true,
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