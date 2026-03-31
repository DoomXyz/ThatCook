'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Review', {
      ReviewID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      AccountID: {
        type: Sequelize.STRING(42),
        allowNull: false,
        references: { model: 'Account', key: 'AccountID' },
        onDelete: 'CASCADE'
      },
      ProductID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Product', key: 'ProductID' },
        onDelete: 'CASCADE'
      },
      Rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      Comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ReviewImages: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      CreatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    }, {
      indexes: [
        { fields: ['AccountID'], name: 'index_review_account_id' },
        { fields: ['ProductID'], name: 'index_review_product_id' },
        { unique: true, fields: ['AccountID', 'ProductID'], name: 'unique_account_product_review' }
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Review');
  }
};
