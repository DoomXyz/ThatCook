'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      Account.hasMany(models.Pet, { foreignKey: 'AccountID' });
      Account.hasMany(models.Appointment, { foreignKey: 'AccountID' });
      Account.hasMany(models.Appointment, { foreignKey: 'VeterinarianID' });
      Account.hasMany(models.Schedule, { foreignKey: 'VeterinarianID' });
      Account.hasOne(models.VeterinarianInfo, { foreignKey: 'AccountID' });
      Account.hasMany(models.Invoice, { foreignKey: 'AccountID' });
      Account.hasMany(models.CartItem, { foreignKey: 'AccountID' });
      Account.hasMany(models.VeterinarianService, { foreignKey: 'VeterinarianID' });
    }
  }

  Account.init(
    {
      AccountID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      AccountName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        collate: 'utf8mb4_bin',
      },
      Email: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      UserName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      UserImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Phone: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      Address: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Gender: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'Gender')
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
        allowNull: false,
      },
      AccountStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'AccountStatus')
      },
      AccountType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'AccountType')
      },
    },
    {
      sequelize,
      modelName: 'Account',
      tableName: 'Account',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['Email'], name: 'unique_email' },
        { fields: ['Phone'], name: 'index_phone' },
        { fields: ['UserName'], name: 'index_username' },
      ],
    }
  );

  return Account;
};