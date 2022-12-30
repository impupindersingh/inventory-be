'use strict';

module.exports = (sequelize, DataTypes) => {
    let users = sequelize.define('users', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4
        },
        name: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
        created_at: { type: DataTypes.DATE },
        type: { type: DataTypes.ENUM('ADMIN', 'SUPER-ADMIN') }
    }, {
        freezeTableName: true,
        timestamps: false
    }, {
        underscored: true
    });
    return users;
};
