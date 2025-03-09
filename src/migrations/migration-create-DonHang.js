'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('DonHang', {
            MADH: {
                type: Sequelize.CHAR(10)
            },
            MAKH: {
                type: Sequelize.STRING(10)
            },
            NgayLapDonHang: {
                type: Sequelize.DATE
            },
            DiaChiNhanHang: {
                type: Sequelize.TEXT
            },
            LoiNhan: {
                type: Sequelize.TEXT
            },
            TongTien: {
                type: Sequelize.FLOAT
            },
            TrangThai: {
                type: Sequelize.BOOLEAN
            },
            MALOAITT: {
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
        await queryInterface.dropTable('DonHang');
    }
};