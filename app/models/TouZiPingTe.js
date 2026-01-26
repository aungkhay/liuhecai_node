const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class TouZiPingTe extends Model {}

TouZiPingTe.init({
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
    batch_start: {
        type: DataTypes.INTEGER,     
        allowNull: false,
    },
    batch_end: {
        type: DataTypes.INTEGER,     
        allowNull: false,
    },
    zodiac_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    open_count : {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    is_finished: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
}, {
    sequelize,
    modelName: 'TouZiPingTe',
    tableName: 'tou_zi_ping_te'
})

module.exports = TouZiPingTe
