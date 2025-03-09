'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ChiTietDonHang', {
            MADH: {
                type: Sequelize.CHAR(10)
            },
            MASP: {
                type: Sequelize.STRING(10)
            },
            SoLuong: {
                type: Sequelize.INTEGER
            },
            GiaBanRa: {
                type: Sequelize.FLOAT
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
        await queryInterface.dropTable('ChiTietDonHang');
    }
};