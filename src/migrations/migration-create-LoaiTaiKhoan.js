'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('LoaiTaiKhoan', {
            MALOAITK: {
                type: Sequelize.CHAR(10)
            },
            TenLoaiTK: {
                type: Sequelize.STRING(50)
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
        await queryInterface.dropTable('LoaiTaiKhoan');
    }
};