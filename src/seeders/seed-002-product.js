'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const images = [
      'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558124/byc7mrjoarwcgyrtea0r.jpg',
      'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558125/ls9e3xebscd1bmaneny8.jpg',
      'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558126/fsbxdr20pi2pjxebxrht.jpg',
    ];

    await queryInterface.bulkInsert(
      'Product',
      [
        {
          ProductID: 'P000000001',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn khô Royal Canin Maxi Adult 5kg',
          ProductPrice: 750000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn khô cao cấp, hỗ trợ tiêu hóa và sức khỏe lông.',
        },
        {
          ProductID: 'P000000002',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn ướt Whiskas Tuna 1kg',
          ProductPrice: 120000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn ướt giàu dinh dưỡng, phù hợp cho mọi lứa tuổi.',
        },
        {
          ProductID: 'P000000003',
          ProductType: 'LITTER',
          ProductName: 'Cát vệ sinh Petkit Clumping 5kg',
          ProductPrice: 200000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Cát vệ sinh vón cục, khử mùi hiệu quả.',
        },
        {
          ProductID: 'P000000004',
          ProductType: 'COLLAR',
          ProductName: 'Vòng cổ Seresto Flea & Tick',
          ProductPrice: 450000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Vòng cổ chống ve rận hiệu quả trong 8 tháng.',
        },
        {
          ProductID: 'P000000005',
          ProductType: 'TOY',
          ProductName: 'Bóng cao su Kong Classic',
          ProductPrice: 150000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Đồ chơi bóng bền, phù hợp cho các hoạt động năng động.',
        },
        {
          ProductID: 'P000000006',
          ProductType: 'LEASH',
          ProductName: 'Dây dắt nylon Petkit Standard',
          ProductPrice: 100000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Dây dắt chắc chắn, phù hợp cho mọi kích thước.',
        },
        {
          ProductID: 'P000000007',
          ProductType: 'GROOM',
          ProductName: 'Bàn chải lông Furminator Long Hair',
          ProductPrice: 300000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Bàn chải giảm rụng lông hiệu quả.',
        },
        {
          ProductID: 'P000000008',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn khô Pedigree Adult 3kg',
          ProductPrice: 250000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn khô cân bằng dinh dưỡng cho giai đoạn trưởng thành.',
        },
        {
          ProductID: 'P000000009',
          ProductType: 'LITTER',
          ProductName: 'Cát hữu cơ Cat’s Best Original 10kg',
          ProductPrice: 350000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Cát vệ sinh hữu cơ, thân thiện với môi trường.',
        },
        {
          ProductID: 'P000000010',
          ProductType: 'COLLAR',
          ProductName: 'Vòng cổ da Petkit Premium',
          ProductPrice: 180000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Vòng cổ da thời trang, an toàn và bền.',
        },
        {
          ProductID: 'P000000011',
          ProductType: 'LEASH',
          ProductName: 'Dây dắt tự động Flexi Medium',
          ProductPrice: 280000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Dây dắt tự động tiện lợi, phù hợp cho kích thước vừa.',
        },
        {
          ProductID: 'P000000012',
          ProductType: 'TOY',
          ProductName: 'Cần câu lông vũ Trixie Cat',
          ProductPrice: 90000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Đồ chơi kích thích vận động và săn mồi.',
        },
        {
          ProductID: 'P000000013',
          ProductType: 'GROOM',
          ProductName: 'Lược chải lông Trixie Long',
          ProductPrice: 120000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Lược chải lông hiệu quả, phù hợp cho lông dài.',
        },
        {
          ProductID: 'P000000014',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn khô BioPet Puppy 2kg',
          ProductPrice: 180000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn khô hữu cơ, an toàn và lành mạnh.',
        },
        {
          ProductID: 'P000000015',
          ProductType: 'LITTER',
          ProductName: 'Cát bentonite Sanicat Classic 5kg',
          ProductPrice: 150000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Cát vệ sinh giá rẻ, khử mùi tốt.',
        },
        {
          ProductID: 'P000000016',
          ProductType: 'COLLAR',
          ProductName: 'Vòng cổ phản quang Trixie Night',
          ProductPrice: 110000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Vòng cổ phản quang, an toàn khi đi đêm.',
        },
        {
          ProductID: 'P000000017',
          ProductType: 'TOY',
          ProductName: 'Xương gặm nylon Petkit Dental',
          ProductPrice: 130000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Xương gặm bền, hỗ trợ vệ sinh răng miệng.',
        },
        {
          ProductID: 'P000000018',
          ProductType: 'LEASH',
          ProductName: 'Dây dắt da Trixie Premium',
          ProductPrice: 200000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Dây dắt da cao cấp, bền đẹp.',
        },
        {
          ProductID: 'P000000019',
          ProductType: 'GROOM',
          ProductName: 'Máy cắt móng Petkit Safe',
          ProductPrice: 250000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Máy cắt móng an toàn, dễ sử dụng.',
        },
        {
          ProductID: 'P000000020',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn ướt Me-O Salmon 400g',
          ProductPrice: 60000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn ướt giá rẻ, giàu dinh dưỡng.',
        },
        {
          ProductID: 'P000000021',
          ProductType: 'LITTER',
          ProductName: 'Cát vệ sinh Petkit Ultra 10kg',
          ProductPrice: 320000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Cát vệ sinh vón cục, tiết kiệm lâu dài.',
        },
        {
          ProductID: 'P000000022',
          ProductType: 'COLLAR',
          ProductName: 'Vòng cổ Seresto Anti-Flea',
          ProductPrice: 400000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Vòng cổ chống ve rận hiệu quả trong 8 tháng.',
        },
        {
          ProductID: 'P000000023',
          ProductType: 'TOY',
          ProductName: 'Đồ chơi âm thanh Petstages Squeak',
          ProductPrice: 140000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Đồ chơi phát âm thanh, thu hút sự chú ý.',
        },
        {
          ProductID: 'P000000024',
          ProductType: 'LEASH',
          ProductName: 'Dây dắt tự động Flexi Small',
          ProductPrice: 260000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Dây dắt tự động, phù hợp cho kích thước nhỏ.',
        },
        {
          ProductID: 'P000000025',
          ProductType: 'GROOM',
          ProductName: 'Bàn chải lông Furminator Short Hair',
          ProductPrice: 320000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Bàn chải giảm rụng lông hiệu quả.',
        },
        {
          ProductID: 'P000000026',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn khô Royal Canin Renal 2kg',
          ProductPrice: 400000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn khô cao cấp, hỗ trợ sức khỏe thận.',
        },
        {
          ProductID: 'P000000027',
          ProductType: 'LITTER',
          ProductName: 'Cát hữu cơ Cat’s Best Eco 5kg',
          ProductPrice: 220000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Cát vệ sinh hữu cơ, dễ phân hủy.',
        },
        {
          ProductID: 'P000000028',
          ProductType: 'COLLAR',
          ProductName: 'Vòng cổ da Petkit Classic',
          ProductPrice: 190000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Vòng cổ da bền, thời trang.',
        },
        {
          ProductID: 'P000000029',
          ProductType: 'TOY',
          ProductName: 'Bóng cao su Kong Puppy',
          ProductPrice: 110000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Đồ chơi bóng nhỏ, phù hợp cho các hoạt động nhẹ.',
        },
        {
          ProductID: 'P000000030',
          ProductType: 'LEASH',
          ProductName: 'Dây dắt nylon Trixie Light',
          ProductPrice: 90000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Dây dắt nhẹ, dễ sử dụng.',
        },
        {
          ProductID: 'P000000031',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn khô Hill’s Science Diet 3kg',
          ProductPrice: 420000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn khô hỗ trợ sức khỏe tiêu hóa và miễn dịch.'
        },
        {
          ProductID: 'P000000032',
          ProductType: 'LITTER',
          ProductName: 'Cát vệ sinh Ever Clean 8kg',
          ProductPrice: 280000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Cát vệ sinh vón cục, khử mùi vượt trội.'
        },
        {
          ProductID: 'P000000033',
          ProductType: 'COLLAR',
          ProductName: 'Vòng cổ nylon PetSafe Glow',
          ProductPrice: 140000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Vòng cổ nylon phát sáng, an toàn ban đêm.'
        },
        {
          ProductID: 'P000000034',
          ProductType: 'LEASH',
          ProductName: 'Dây dắt vải PetSafe Comfort',
          ProductPrice: 110000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Dây dắt vải mềm, thoải mái cho thú cưng.'
        },
        {
          ProductID: 'P000000035',
          ProductType: 'TOY',
          ProductName: 'Đồ chơi nhai Nylabone Power',
          ProductPrice: 160000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Đồ chơi nhai bền, hỗ trợ sức khỏe răng miệng.'
        },
        {
          ProductID: 'P000000036',
          ProductType: 'GROOM',
          ProductName: 'Kéo cắt lông Petkit Precision',
          ProductPrice: 200000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Kéo cắt lông sắc bén, an toàn cho thú cưng.'
        },
        {
          ProductID: 'P000000037',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn ướt Sheba Chicken 400g',
          ProductPrice: 70000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn ướt vị gà, hấp dẫn và bổ dưỡng.'
        },
        {
          ProductID: 'P000000038',
          ProductType: 'LITTER',
          ProductName: 'Cát vệ sinh Arm & Hammer 6kg',
          ProductPrice: 240000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Cát vệ sinh khử mùi mạnh, vón cục nhanh.'
        },
        {
          ProductID: 'P000000039',
          ProductType: 'COLLAR',
          ProductName: 'Vòng cổ vải PetSafe Sport',
          ProductPrice: 130000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Vòng cổ vải nhẹ, phù hợp cho vận động ngoài trời.'
        },
        {
          ProductID: 'P000000040',
          ProductType: 'LEASH',
          ProductName: 'Dây dắt dây dù PetSafe Trek',
          ProductPrice: 150000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Dây dắt dây dù bền, lý tưởng cho đi bộ dài.'
        },
        {
          ProductID: 'P000000041',
          ProductType: 'TOY',
          ProductName: 'Đồ chơi chuột giả Catnip Trixie',
          ProductPrice: 100000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Đồ chơi chuột chứa catnip, kích thích mèo.'
        },
        {
          ProductID: 'P000000042',
          ProductType: 'GROOM',
          ProductName: 'Găng tay chải lông Petkit Soft',
          ProductPrice: 170000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Găng tay chải lông tiện lợi, giảm rụng lông.'
        },
        {
          ProductID: 'P000000043',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn khô Purina Pro Plan 4kg',
          ProductPrice: 460000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn khô cao cấp, hỗ trợ sức khỏe toàn diện.'
        },
        {
          ProductID: 'P000000044',
          ProductType: 'LITTER',
          ProductName: 'Cát vệ sinh World’s Best 7kg',
          ProductPrice: 300000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Cát vệ sinh tự nhiên, an toàn và khử mùi.'
        },
        {
          ProductID: 'P000000045',
          ProductType: 'COLLAR',
          ProductName: 'Vòng cổ da Petkit Luxury',
          ProductPrice: 220000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Vòng cổ da cao cấp, sang trọng và bền.'
        },
        {
          ProductID: 'P000000046',
          ProductType: 'LEASH',
          ProductName: 'Dây dắt tự động PetSafe Pro',
          ProductPrice: 320000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Dây dắt tự động cao cấp, điều khiển dễ dàng.'
        },
        {
          ProductID: 'P000000047',
          ProductType: 'TOY',
          ProductName: 'Bóng tennis Petstages Active',
          ProductPrice: 120000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Bóng tennis bền, lý tưởng cho chơi ném.'
        },
        {
          ProductID: 'P000000048',
          ProductType: 'GROOM',
          ProductName: 'Máy sấy lông Petkit Quiet',
          ProductPrice: 350000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Máy sấy lông êm, an toàn cho thú cưng.'
        },
        {
          ProductID: 'P000000049',
          ProductType: 'FOOD',
          ProductName: 'Thức ăn ướt Cesar Beef 400g',
          ProductPrice: 80000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Thức ăn ướt vị bò, thơm ngon và bổ dưỡng.'
        },
        {
          ProductID: 'P000000050',
          ProductType: 'LITTER',
          ProductName: 'Cát vệ sinh Fresh Step 5kg',
          ProductPrice: 260000.0,
          ProductImage: images[Math.floor(Math.random() * images.length)],
          ProductDescription: 'Cát vệ sinh vón cục, khử mùi tối ưu.'
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Product', null, {});
  },
};