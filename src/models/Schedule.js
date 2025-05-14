'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {}

  Schedule.init(
    {
      ScheduleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      VeterinarianID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      AppointmentID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Schedule',
      tableName: 'Schedule',
      timestamps: false,
    }
  );

  return Schedule;
};
