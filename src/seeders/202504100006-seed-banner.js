'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Banner',
      [
        // Banner 1: Quảng bá P000000001 (Thức ăn khô Royal Canin 5kg)
        {
          BannerID: 1,
          BannerImage: 'https://example.com/images/banner_1.jpg',
          CreatedAt: new Date('2023-01-20'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000001',
        },
        // Banner 2: Quảng bá P000000010 (Vòng cổ da Petkit)
        {
          BannerID: 2,
          BannerImage: 'https://example.com/images/banner_2.jpg',
          CreatedAt: new Date('2023-03-15'),
          HiddenAt: new Date('2024-01-10'),
          BannerStatus: 'HIDE',
          ProductID: 'P000000010',
        },
        // Banner 3: Quảng bá P000000020 (Thức ăn ướt Me-O 400g)
        {
          BannerID: 3,
          BannerImage: 'https://example.com/images/banner_3.jpg',
          CreatedAt: new Date('2023-06-01'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000020',
        },
        // Banner 4: Quảng bá P000000030 (Dây dắt nylon Trixie)
        {
          BannerID: 4,
          BannerImage: 'https://example.com/images/banner_4.jpg',
          CreatedAt: new Date('2023-09-10'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000030',
        },
        // Banner 5: Quảng bá P000000040 (Vòng cổ da Trixie)
        {
          BannerID: 5,
          BannerImage: 'https://example.com/images/banner_5.jpg',
          CreatedAt: new Date('2024-01-05'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000040',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Banner', null, {});
  },
};
