'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Banner',
      [
        // Banner 1: Quảng bá P000000001 (Thức ăn khô Royal Canin 5kg)
        {
          BannerImage: 'https://example.com/images/banner_royal_canin_promo.jpg',
          CreatedAt: new Date('2025-04-01'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000001',
        },
        // Banner 2: Quảng bá P000000010 (Vòng cổ da Petkit)
        {
          BannerImage: 'https://example.com/images/banner_petkit_collar_promo.jpg',
          CreatedAt: new Date('2025-04-05'),
          HiddenAt: new Date('2025-05-01'),
          BannerStatus: 'HIDE',
          ProductID: 'P000000010',
        },
        // Banner 3: Quảng bá P000000020 (Thức ăn ướt Me-O 400g)
        {
          BannerImage: 'https://example.com/images/banner_meo_food_promo.jpg',
          CreatedAt: new Date('2025-04-10'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000020',
        },
        // Banner 4: Quảng bá P000000030 (Dây dắt nylon Trixie)
        {
          BannerImage: 'https://example.com/images/banner_trixie_leash_promo.jpg',
          CreatedAt: new Date('2025-04-15'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000030',
        },
        // Banner 5: Quảng bá P000000040 (Vòng cổ da Trixie)
        {
          BannerImage: 'https://example.com/images/banner_trixie_collar_promo.jpg',
          CreatedAt: new Date('2025-04-20'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000040',
        },
        // Banner 6: Quảng bá P000000009 (Cát hữu cơ Cat’s Best 10kg)
        {
          BannerImage: 'https://example.com/images/banner_catsbest_litter_promo.jpg',
          CreatedAt: new Date('2025-04-25'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000009',
        },
        // Banner 7: Quảng bá P000000012 (Cần câu lông vũ Trixie)
        {
          BannerImage: 'https://example.com/images/banner_trixie_toy_promo.jpg',
          CreatedAt: new Date('2025-05-01'),
          HiddenAt: null,
          BannerStatus: 'SHOW',
          ProductID: 'P000000012',
        },
        // Banner 8: Quảng bá P000000007 (Bàn chải lông Furminator)
        {
          BannerImage: 'https://example.com/images/banner_furminator_groom_promo.jpg',
          CreatedAt: new Date('2025-05-10'),
          HiddenAt: new Date('2025-05-15'),
          BannerStatus: 'HIDE',
          ProductID: 'P000000007',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Banner', null, {});
  },
};