const { Model, DataTypes } = require('sequelize');
const sequelize = require('../connections/Mysql');

const PROTECTED_ATTRIBUTES = ['password', 'deletedAt'];
class User extends Model {
    toJSON() {
        let attributes = Object.assign({}, this.get())
        for (let a of PROTECTED_ATTRIBUTES) {
            delete attributes[a]
        }
        if (attributes.balance !== undefined)
            attributes.balance = Number(attributes.balance);
        return attributes
    }
}

User.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.INTEGER,
        defaultValue: '2',
        comment: '1 => Admin | 2 => User'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone_number: {
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: true,
        validate: {
            is: /^\d{11}$/,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    relation: {
        type: DataTypes.STRING(333),
        allowNull: true,
        comment: 'Full invitation chain path',
    },
    balance: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: '余额'
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        comment: '0 => Disabled | 1 => Enabled'
    },
    profile_picture: {
        type: DataTypes.STRING,
        allowNull: true
    },
    login_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    indexes: [
        { fields: ['relation'] },
    ]
})

module.exports = User;