'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('TaiKhoan', [
      {
        MATK: '832025ad1',
        Email: 'admin@gmail.com',
        Password: '123456',
        HoTen: 'Administrator',
        GioiTinh: 1,
        SDT: '0919094097',
        DiaChi: 'Internet',
        MALOAITK: 'AD',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
