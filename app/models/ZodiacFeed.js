const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class ZodiacFeed extends Model {}

ZodiacFeed.init({
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
    result_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    result_zodiac_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    feed_one: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '1 => 草:牛羊马兔 | 2 => 肉:虎蛇龙狗 | 3 => 菜:猪鼠鸡猴'
    },
    feed_two: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '1 => 草:牛羊马兔 | 2 => 肉:虎蛇龙狗 | 3 => 菜:猪鼠鸡猴'
    },
}, {
    sequelize,
    modelName: 'ZodiacFeed',
    tableName: 'zodiac_feeds',
    indexes: [
        { fields: ['batch_number']}
    ]
})

module.exports = ZodiacFeed
