const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

class ReferenceImage extends Model {}

ReferenceImage.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '-'
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'ReferenceImage',
    tableName: 'reference_images',
})

module.exports = ReferenceImage
