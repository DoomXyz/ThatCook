'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SanPham', {
      MASP: {
        type: Sequelize.CHAR(10)
      },
      TenSanPham: {
        type: Sequelize.STRING(50)
      },
      SLTon: {
        type: Sequelize.INTEGER
      },
      KhuyenMai: {
        type: Sequelize.FLOAT
      },
      GiaBan: {
        type: Sequelize.FLOAT
      },
      TinhTrang: {
        type: Sequelize.BOOLEAN
      },
      MoTa: {
        type: Sequelize.TEXT
      },
      HinhAnh: {
        type: Sequelize.STRING
      },
      MALOAISP: {
        type: Sequelize.CHAR(10)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SanPham');
  }
};