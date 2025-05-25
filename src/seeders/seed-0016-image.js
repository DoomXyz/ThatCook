'use strict';

const imageLinks = [
  'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558124/byc7mrjoarwcgyrtea0r.jpg',
  'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558125/ls9e3xebscd1bmaneny8.jpg',
  'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558126/fsbxdr20pi2pjxebxrht.jpg'
];

const getRandomImage = () => imageLinks[Math.floor(Math.random() * imageLinks.length)];
const getRandomImageCount = () => Math.floor(Math.random() * 3) + 1; // Random từ 1 đến 3

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const images = [
      // P000000001: Thức ăn khô Royal Canin 5kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000001' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000001' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000001' },
      // P000000002: Thức ăn ướt Whiskas 1kg (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000002' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000002' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000002' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000002' },
      // P000000003: Cát vệ sinh Petkit 5kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000003' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000003' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000003' },
      // P000000004: Vòng cổ chống ve rận Seresto (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000004' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000004' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000004' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000004' },
      // P000000005: Bóng cao su Kong (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000005' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000005' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000005' },
      // P000000006: Dây dắt nylon Petkit (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000006' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000006' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000006' },
      // P000000007: Bàn chải lông Furminator (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000007' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000007' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000007' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000007' },
      // P000000008: Thức ăn khô Pedigree 3kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000008' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000008' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000008' },
      // P000000009: Cát hữu cơ Cat’s Best 10kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000009' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000009' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000009' },
      // P000000010: Vòng cổ da Petkit (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000010' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000010' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000010' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000010' },
      // P000000011: Dây dắt tự động Flexi M (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000011' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000011' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000011' },
      // P000000012: Cần câu lông vũ Trixie (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000012' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000012' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000012' },
      // P000000013: Lược chải lông Trixie (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000013' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000013' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000013' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000013' },
      // P000000014: Thức ăn khô BioPet 2kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000014' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000014' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000014' },
      // P000000015: Cát bentonite Sanicat 5kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000015' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000015' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000015' },
      // P000000016: Vòng cổ phản quang Trixie (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000016' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000016' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000016' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000016' },
      // P000000017: Xương gặm nylon Petkit (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000017' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000017' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000017' },
      // P000000018: Dây dắt da Trixie (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000018' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000018' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000018' },
      // P000000019: Máy cắt móng Petkit (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000019' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000019' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000019' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000019' },
      // P000000020: Thức ăn ướt Me-O 400g (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000020' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000020' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000020' },
      // P000000021: Cát vệ sinh Petkit 10kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000021' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000021' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000021' },
      // P000000022: Vòng cổ chống ve rận Seresto (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000022' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000022' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000022' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000022' },
      // P000000023: Đồ chơi phát âm thanh Petstages (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000023' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000023' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000023' },
      // P000000024: Dây dắt tự động Flexi S (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000024' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000024' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000024' },
      // P000000025: Bàn chải lông Furminator (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000025' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000025' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000025' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000025' },
      // P000000026: Thức ăn khô Royal Canin 2kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000026' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000026' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000026' },
      // P000000027: Cát hữu cơ Cat’s Best 5kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000027' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000027' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000027' },
      // P000000028: Vòng cổ da Petkit (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000028' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000028' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000028' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000028' },
      // P000000029: Bóng cao su Kong (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000029' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000029' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000029' },
      // P000000030: Dây dắt nylon Trixie (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000030' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000030' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000030' },
      // P000000031: Lược chải lông Trixie (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000031' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000031' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000031' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000031' },
      // P000000032: Thức ăn khô Pedigree 5kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000032' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000032' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000032' },
      // P000000033: Cát bentonite Sanicat 10kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000033' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000033' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000033' },
      // P000000034: Vòng cổ phản quang Trixie (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000034' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000034' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000034' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000034' },
      // P000000035: Đồ chơi phát âm thanh Petstages (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000035' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000035' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000035' },
      // P000000036: Dây dắt tự động Flexi L (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000036' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000036' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000036' },
      // P000000037: Máy cắt móng Petkit (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000037' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000037' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000037' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000037' },
      // P000000038: Thức ăn ướt Me-O 800g (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000038' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000038' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000038' },
      // P000000039: Cát vệ sinh Petkit 2kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000039' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000039' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000039' },
      // P000000040: Vòng cổ da Trixie (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000040' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000040' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000040' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000040' },
      // P000000041: Xương gặm nylon Petkit (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000041' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000041' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000041' },
      // P000000042: Dây dắt nylon Petkit (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000042' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000042' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000042' },
      // P000000043: Bàn chải lông Trixie (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000043' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000043' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000043' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000043' },
      // P000000044: Thức ăn khô BioPet 5kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000044' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000044' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000044' },
      // P000000045: Cát hữu cơ Cat’s Best 2kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000045' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000045' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000045' },
      // P000000046: Vòng cổ chống ve rận Seresto (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000046' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000046' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000046' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000046' },
      // P000000047: Cần câu lông vũ Trixie (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000047' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000047' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000047' },
      // P000000048: Dây dắt da Trixie (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000048' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000048' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000048' },
      // P000000049: Lược chải lông Trixie (4 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000049' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000049' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000049' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000049' },
      // P000000050: Thức ăn khô Royal Canin 10kg (3 hình ảnh phụ)
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000050' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000050' },
      { Image: getRandomImage(), ReferenceType: 'Product', ReferenceID: 'P000000050' },
    ];

    // Thêm ảnh cho Appointment từ L00000001 đến L00000024
    for (let i = 1; i <= 24; i++) {
      const referenceID = `L${String(i).padStart(8, '0')}`;
      const imageCount = getRandomImageCount();

      for (let j = 0; j < imageCount; j++) {
        images.push({
          Image: getRandomImage(),
          ReferenceType: 'Appointment',
          ReferenceID: referenceID,
        });
      }
    }

    await queryInterface.bulkInsert('Image', images, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Image', null, {});
  },
};