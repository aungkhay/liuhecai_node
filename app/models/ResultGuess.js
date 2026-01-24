const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class ResultGuess extends Model {}

ResultGuess.init({
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
    zodiac_attr: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    result_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    zodiac_name: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    result_match: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '0 => normal | 1 => match | 2 => not match',
    },
}, {
    sequelize,
    modelName: 'ResultGuess',
    tableName: 'result_guesses'
})

module.exports = ResultGuess
