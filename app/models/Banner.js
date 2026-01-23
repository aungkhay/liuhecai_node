const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class Banner extends Model {}

Banner.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Banner',
    tableName: 'banners'
})

module.exports = Banner
