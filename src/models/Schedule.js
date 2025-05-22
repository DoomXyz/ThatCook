'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {
      Schedule.belongsTo(models.Account, { foreignKey: 'VeterinarianID' });
      Schedule.belongsTo(models.Appointment, { foreignKey: 'AppointmentID' });
    }
  }

  Schedule.init(
    {
      ScheduleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      VeterinarianID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      AppointmentID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      Date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      StartTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      EndTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      ScheduleStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'ScheduleStatus')

      },
    },
    {
      sequelize,
      modelName: 'Schedule',
      tableName: 'Schedule',
      timestamps: false,
      indexes: [
        { fields: ['VeterinarianID'], name: 'index_veterinarian_id' },
        { fields: ['Date'], name: 'index_date' },
      ],
    }
  );

  return Schedule;
};