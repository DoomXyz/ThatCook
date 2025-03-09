'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('TaiKhoans', {
            MATK: {
                type: Sequelize.CHAR(10)
            },
            Email: {
                type: Sequelize.STRING(100)
            },
            Password: {
                type: Sequelize.STRING(30)
            },
            HoTen: {
                type: Sequelize.STRING(100)
            },
            GioiTinh: {
                type: Sequelize.BOOLEAN
            },
            SDT: {
                type: Sequelize.CHAR(11)
            },
            DiaChi: {
                type: Sequelize.TEXT
            },
            MALOAITK: {
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
        await queryInterface.dropTable('TaiKhoans');
    }
};