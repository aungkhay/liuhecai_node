const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class ReferenceLink extends Model {}

ReferenceLink.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'ReferenceLink',
    tableName: 'reference_links',
})

module.exports = ReferenceLink
