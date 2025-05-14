'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Coupon',
      [
        {
          CouponCode: 'grandopen',
          CouponDescription: 'Grand opening discount',
          MinOrderValue: 500000,
          DiscountValue: 10,
          MaxDiscount: 30000,
          StartDate: new Date('2025-05-01'),
          EndDate: new Date('2025-06-30'),
          DiscountType: 'PERC',
          CouponStatus: 'ACTIVE',
        },
        {
          CouponCode: 'petshopthatcook',
          CouponDescription: 'Pet shop special offer',
          MinOrderValue: 0,
          DiscountValue: 10000,
          MaxDiscount: 10000,
          StartDate: new Date('2025-05-01'),
          EndDate: new Date('2025-06-30'),
          DiscountType: 'FIXED',
          CouponStatus: 'ACTIVE',
        },
        {
          CouponCode: 'hutech',
          CouponDescription: 'Hutech student discount',
          MinOrderValue: 0,
          DiscountValue: 5,
          MaxDiscount: 10000,
          StartDate: new Date('2025-04-01'),
          EndDate: new Date('2025-04-30'),
          DiscountType: 'PERC',
          CouponStatus: 'EXPIRED',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Coupon', null, {});
  },
};
