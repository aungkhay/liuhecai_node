const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class MustWin3Batch extends Model {}

MustWin3Batch.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    batch_one: {
        type: DataTypes.STRING,     
        allowNull: false,
    },
    batch_two: {
        type: DataTypes.STRING,     
        allowNull: false,
    },
    batch_three: {
        type: DataTypes.STRING,     
        allowNull: false,
    },
    zodiac_one: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    zodiac_two: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    zodiac_three: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    result_number_one: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    result_number_two: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    result_number_three: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    result_zodiac_one: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    result_zodiac_two: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    result_zodiac_three: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    is_finished: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
}, {
    sequelize,
    modelName: 'MustWin3Batch',
    tableName: 'must_win_3_batch'
})

module.exports = MustWin3Batch
