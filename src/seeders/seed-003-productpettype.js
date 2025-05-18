'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ProductPetType',
      [
        // P000000001: Thức ăn khô Royal Canin 5kg (cho chó và mèo)
        { ProductID: 'P000000001', PetType: 'DOG' },
        { ProductID: 'P000000001', PetType: 'CAT' },
        // P000000002: Thức ăn ướt Whiskas 1kg (cho mèo)
        { ProductID: 'P000000002', PetType: 'CAT' },
        // P000000003: Cát vệ sinh Petkit 5kg (cho mèo)
        { ProductID: 'P000000003', PetType: 'CAT' },
        // P000000004: Vòng cổ chống ve rận Seresto (cho chó và mèo)
        { ProductID: 'P000000004', PetType: 'DOG' },
        { ProductID: 'P000000004', PetType: 'CAT' },
        // P000000005: Bóng cao su Kong (cho chó)
        { ProductID: 'P000000005', PetType: 'DOG' },
        // P000000006: Dây dắt nylon Petkit (cho chó)
        { ProductID: 'P000000006', PetType: 'DOG' },
        // P000000007: Bàn chải lông Furminator (cho chó và mèo)
        { ProductID: 'P000000007', PetType: 'DOG' },
        { ProductID: 'P000000007', PetType: 'CAT' },
        // P000000008: Thức ăn khô Pedigree 3kg (cho chó)
        { ProductID: 'P000000008', PetType: 'DOG' },
        // P000000009: Cát hữu cơ Cat’s Best 10kg (cho mèo)
        { ProductID: 'P000000009', PetType: 'CAT' },
        // P000000010: Vòng cổ da Petkit (cho chó và mèo)
        { ProductID: 'P000000010', PetType: 'DOG' },
        { ProductID: 'P000000010', PetType: 'CAT' },
        // P000000011: Dây dắt tự động Flexi M (cho chó)
        { ProductID: 'P000000011', PetType: 'DOG' },
        // P000000012: Cần câu lông vũ Trixie (cho mèo)
        { ProductID: 'P000000012', PetType: 'CAT' },
        // P000000013: Lược chải lông Trixie (cho chó và mèo)
        { ProductID: 'P000000013', PetType: 'DOG' },
        { ProductID: 'P000000013', PetType: 'CAT' },
        // P000000014: Thức ăn khô BioPet 2kg (cho chó và mèo)
        { ProductID: 'P000000014', PetType: 'DOG' },
        { ProductID: 'P000000014', PetType: 'CAT' },
        // P000000015: Cát bentonite Sanicat 5kg (cho mèo)
        { ProductID: 'P000000015', PetType: 'CAT' },
        // P000000016: Vòng cổ phản quang Trixie (cho chó)
        { ProductID: 'P000000016', PetType: 'DOG' },
        // P000000017: Xương gặm nylon Petkit (cho chó)
        { ProductID: 'P000000017', PetType: 'DOG' },
        // P000000018: Dây dắt da Trixie (cho chó)
        { ProductID: 'P000000018', PetType: 'DOG' },
        // P000000019: Máy cắt móng Petkit (cho chó và mèo)
        { ProductID: 'P000000019', PetType: 'DOG' },
        { ProductID: 'P000000019', PetType: 'CAT' },
        // P000000020: Thức ăn ướt Me-O 400g (cho mèo)
        { ProductID: 'P000000020', PetType: 'CAT' },
        // P000000021: Cát vệ sinh Petkit 10kg (cho mèo)
        { ProductID: 'P000000021', PetType: 'CAT' },
        // P000000022: Vòng cổ chống ve rận Seresto (cho chó và mèo)
        { ProductID: 'P000000022', PetType: 'DOG' },
        { ProductID: 'P000000022', PetType: 'CAT' },
        // P000000023: Đồ chơi phát âm thanh Petstages (cho chó)
        { ProductID: 'P000000023', PetType: 'DOG' },
        // P000000024: Dây dắt tự động Flexi S (cho chó)
        { ProductID: 'P000000024', PetType: 'DOG' },
        // P000000025: Bàn chải lông Furminator (cho chó)
        { ProductID: 'P000000025', PetType: 'DOG' },
        // P000000026: Thức ăn khô Royal Canin 2kg (cho chó và mèo)
        { ProductID: 'P000000026', PetType: 'DOG' },
        { ProductID: 'P000000026', PetType: 'CAT' },
        // P000000027: Cát hữu cơ Cat’s Best 5kg (cho mèo)
        { ProductID: 'P000000027', PetType: 'CAT' },
        // P000000028: Vòng cổ da Petkit (cho chó)
        { ProductID: 'P000000028', PetType: 'DOG' },
        // P000000029: Bóng cao su Kong (cho chó)
        { ProductID: 'P000000029', PetType: 'DOG' },
        // P000000030: Dây dắt nylon Trixie (cho chó)
        { ProductID: 'P000000030', PetType: 'DOG' },
        // P000000031: Lược chải lông Trixie (cho chó và mèo)
        { ProductID: 'P000000031', PetType: 'DOG' },
        { ProductID: 'P000000031', PetType: 'CAT' },
        // P000000032: Thức ăn khô Pedigree 5kg (cho chó)
        { ProductID: 'P000000032', PetType: 'DOG' },
        // P000000033: Cát bentonite Sanicat 10kg (cho mèo)
        { ProductID: 'P000000033', PetType: 'CAT' },
        // P000000034: Vòng cổ phản quang Trixie (cho chó và mèo)
        { ProductID: 'P000000034', PetType: 'DOG' },
        { ProductID: 'P000000034', PetType: 'CAT' },
        // P000000035: Đồ chơi phát âm thanh Petstages (cho chó và mèo)
        { ProductID: 'P000000035', PetType: 'DOG' },
        { ProductID: 'P000000035', PetType: 'CAT' },
        // P000000036: Dây dắt tự động Flexi L (cho chó)
        { ProductID: 'P000000036', PetType: 'DOG' },
        // P000000037: Máy cắt móng Petkit (cho chó và mèo)
        { ProductID: 'P000000037', PetType: 'DOG' },
        { ProductID: 'P000000037', PetType: 'CAT' },
        // P000000038: Thức ăn ướt Me-O 800g (cho mèo)
        { ProductID: 'P000000038', PetType: 'CAT' },
        // P000000039: Cát vệ sinh Petkit 2kg (cho mèo)
        { ProductID: 'P000000039', PetType: 'CAT' },
        // P000000040: Vòng cổ da Trixie (cho chó)
        { ProductID: 'P000000040', PetType: 'DOG' },
        // P000000041: Xương gặm nylon Petkit (cho chó)
        { ProductID: 'P000000041', PetType: 'DOG' },
        // P000000042: Dây dắt nylon Petkit (cho chó)
        { ProductID: 'P000000042', PetType: 'DOG' },
        // P000000043: Bàn chải lông Trixie (cho chó)
        { ProductID: 'P000000043', PetType: 'DOG' },
        // P000000044: Thức ăn khô BioPet 5kg (cho chó và mèo)
        { ProductID: 'P000000044', PetType: 'DOG' },
        { ProductID: 'P000000044', PetType: 'CAT' },
        // P000000045: Cát hữu cơ Cat’s Best 2kg (cho mèo)
        { ProductID: 'P000000045', PetType: 'CAT' },
        // P000000046: Vòng cổ chống ve rận Seresto (cho chó và mèo)
        { ProductID: 'P000000046', PetType: 'DOG' },
        { ProductID: 'P000000046', PetType: 'CAT' },
        // P000000047: Cần câu lông vũ Trixie (cho mèo)
        { ProductID: 'P000000047', PetType: 'CAT' },
        // P000000048: Dây dắt da Trixie (cho chó)
        { ProductID: 'P000000048', PetType: 'DOG' },
        // P000000049: Lược chải lông Trixie (cho chó và mèo)
        { ProductID: 'P000000049', PetType: 'DOG' },
        { ProductID: 'P000000049', PetType: 'CAT' },
        // P000000050: Thức ăn khô Royal Canin 10kg (cho chó và mèo)
        { ProductID: 'P000000050', PetType: 'DOG' },
        { ProductID: 'P000000050', PetType: 'CAT' },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ProductPetType', null, {});
  },
};