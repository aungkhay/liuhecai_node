const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class HongKongRecord extends Model {
    toJSON() {
        let attributes = Object.assign({}, this.get())
        if (attributes.batch_number !== undefined) {
            // remove leading 2 characters if they are "20"
            if (attributes.batch_number.startsWith('20')) {
                attributes.batch_number = attributes.batch_number.substring(2);
            }
        }
        return attributes
    }
}

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