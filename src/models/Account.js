'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Account extends Model {}

  Account.init(
    {
      AccountID: {
        type: DataTypes.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
      AccountName: {
        type: DataTypes.CHAR(50),
        allowNull: false,
      },
      Email: {
        type: DataTypes.CHAR(100),
        allowNull: false,
      },
      Password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      UserName: {
        type: DataTypes.CHAR(50),
        allowNull: false,
      },
      UserImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Phone: {
        type: DataTypes.CHAR(11),
        allowNull: true,
      },
      Address: {
        type: DataTypes.CHAR(100),
        allowNull: true,
      },
      Gender: {
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'Gender')
        allowNull: true,
      },
      LoginAttempt: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      LockUntil: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      AccountStatus: {
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'AccountStatus')
        allowNull: true,
      },
      AccountType: {
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'AccountType')
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Account',
      tableName: 'Account',
      timestamps: false,
    }
  );

  return Account;
};
