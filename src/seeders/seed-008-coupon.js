'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Coupon',
      [
        // Coupon 1: Khuyến mãi khai trương
        {
          CouponCode: 'GRANDOPEN',
          CouponDescription: 'Khuyến mãi khai trương, giảm 10% cho đơn hàng lớn',
          MinOrderValue: 500000.00,
          DiscountValue: 10.00,
          MaxDiscount: 30000.00,
          StartDate: new Date('2025-05-01'),
          EndDate: new Date('2025-06-30'),
          CreatedAt: new Date('2025-05-01'),
          DiscountType: 'PERC',
          CouponStatus: 'ACTIVE',
        },
        // Coupon 2: Ưu đãi đặc biệt cửa hàng
        {
          CouponCode: 'PETSHOP25',
          CouponDescription: 'Ưu đãi đặc biệt, giảm 10000 VND cho mọi đơn hàng',
          MinOrderValue: 0.00,
          DiscountValue: 10000.00,
          MaxDiscount: 10000.00,
          StartDate: new Date('2025-05-01'),
          EndDate: new Date('2025-06-30'),
          CreatedAt: new Date('2025-05-02'),
          DiscountType: 'FIXED',
          CouponStatus: 'ACTIVE',
        },
        // Coupon 3: Giảm giá cho sinh viên Hutech
        {
          CouponCode: 'HUTECH5',
          CouponDescription: 'Giảm 5% cho sinh viên Hutech, tối đa 10000 VND',
          MinOrderValue: 0.00,
          DiscountValue: 5.00,
          MaxDiscount: 10000.00,
          StartDate: new Date('2025-04-01'),
          EndDate: new Date('2025-04-30'),
          CreatedAt: new Date('2025-04-17'),
          DiscountType: 'PERC',
          CouponStatus: 'EXPIRED',
        },
        // Coupon 4: Chào đón khách mới
        {
          CouponCode: 'WELCOME10',
          CouponDescription: 'Giảm 10000 VND cho khách hàng mới',
          MinOrderValue: 0.00,
          DiscountValue: 10000.00,
          MaxDiscount: 10000.00,
          StartDate: new Date('2025-05-10'),
          EndDate: new Date('2025-07-31'),
          CreatedAt: new Date('2025-04-16'),
          DiscountType: 'FIXED',
          CouponStatus: 'ACTIVE',
        },
        // Coupon 5: Khuyến mãi dịp lễ
        {
          CouponCode: 'SUMMER25',
          CouponDescription: 'Giảm 15% cho đơn hàng từ 300000 VND dịp lễ',
          MinOrderValue: 300000.00,
          DiscountValue: 15.00,
          MaxDiscount: 50000.00,
          StartDate: new Date('2025-05-15'),
          EndDate: new Date('2025-06-15'),
          CreatedAt: new Date('2025-04-15'),
          DiscountType: 'PERC',
          CouponStatus: 'ACTIVE',
        },
        // Coupon 6: Giảm giá thức ăn (hết hạn gần đây)
        {
          CouponCode: 'PETFOOD20',
          CouponDescription: 'Giảm 20000 VND cho các sản phẩm thức ăn',
          MinOrderValue: 100000.00,
          DiscountValue: 20000.00,
          MaxDiscount: 20000.00,
          StartDate: new Date('2025-04-15'),
          EndDate: new Date('2025-05-15'),
          CreatedAt: new Date('2025-04-15'),
          DiscountType: 'FIXED',
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