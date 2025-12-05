'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn(
        'AppointmentBill', // Tên table chính xác (check model.tableName)
        'PaymentType',
        {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        { transaction: t }
      );
      await queryInterface.addColumn(
        'AppointmentBill',
        'PaymentStatus',
        {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'PEND',
        },
        { transaction: t }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn('AppointmentBill', 'PaymentType', { transaction: t });
      await queryInterface.removeColumn('AppointmentBill', 'PaymentStatus', { transaction: t });
    });
  },
};
