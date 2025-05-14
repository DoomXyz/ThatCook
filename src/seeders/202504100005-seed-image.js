'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Image',
      [
        // P000000001: Thức ăn khô Royal Canin 5kg (3 hình ảnh phụ)
        {
          ImageID: 1,
          Image: 'https://example.com/images/product_1_1.jpg',
          ProductID: 'P000000001',
          AppointmentID: null,
        },
        {
          ImageID: 2,
          Image: 'https://example.com/images/product_1_2.jpg',
          ProductID: 'P000000001',
          AppointmentID: null,
        },
        {
          ImageID: 3,
          Image: 'https://example.com/images/product_1_3.jpg',
          ProductID: 'P000000001',
          AppointmentID: null,
        },
        // P000000002: Thức ăn ướt Whiskas 1kg (4 hình ảnh phụ)
        {
          ImageID: 4,
          Image: 'https://example.com/images/product_2_1.jpg',
          ProductID: 'P000000002',
          AppointmentID: null,
        },
        {
          ImageID: 5,
          Image: 'https://example.com/images/product_2_2.jpg',
          ProductID: 'P000000002',
          AppointmentID: null,
        },
        {
          ImageID: 6,
          Image: 'https://example.com/images/product_2_3.jpg',
          ProductID: 'P000000002',
          AppointmentID: null,
        },
        {
          ImageID: 7,
          Image: 'https://example.com/images/product_2_4.jpg',
          ProductID: 'P000000002',
          AppointmentID: null,
        },
        // P000000003: Cát vệ sinh Petkit 5kg (3 hình ảnh phụ)
        {
          ImageID: 8,
          Image: 'https://example.com/images/product_3_1.jpg',
          ProductID: 'P000000003',
          AppointmentID: null,
        },
        {
          ImageID: 9,
          Image: 'https://example.com/images/product_3_2.jpg',
          ProductID: 'P000000003',
          AppointmentID: null,
        },
        {
          ImageID: 10,
          Image: 'https://example.com/images/product_3_3.jpg',
          ProductID: 'P000000003',
          AppointmentID: null,
        },
        // P000000004: Vòng cổ chống ve rận Seresto (4 hình ảnh phụ)
        {
          ImageID: 11,
          Image: 'https://example.com/images/product_4_1.jpg',
          ProductID: 'P000000004',
          AppointmentID: null,
        },
        {
          ImageID: 12,
          Image: 'https://example.com/images/product_4_2.jpg',
          ProductID: 'P000000004',
          AppointmentID: null,
        },
        {
          ImageID: 13,
          Image: 'https://example.com/images/product_4_3.jpg',
          ProductID: 'P000000004',
          AppointmentID: null,
        },
        {
          ImageID: 14,
          Image: 'https://example.com/images/product_4_4.jpg',
          ProductID: 'P000000004',
          AppointmentID: null,
        },
        // P000000005: Bóng cao su Kong (3 hình ảnh phụ)
        {
          ImageID: 15,
          Image: 'https://example.com/images/product_5_1.jpg',
          ProductID: 'P000000005',
          AppointmentID: null,
        },
        {
          ImageID: 16,
          Image: 'https://example.com/images/product_5_2.jpg',
          ProductID: 'P000000005',
          AppointmentID: null,
        },
        {
          ImageID: 17,
          Image: 'https://example.com/images/product_5_3.jpg',
          ProductID: 'P000000005',
          AppointmentID: null,
        },
        // P000000006: Dây dắt nylon Petkit (3 hình ảnh phụ)
        {
          ImageID: 18,
          Image: 'https://example.com/images/product_6_1.jpg',
          ProductID: 'P000000006',
          AppointmentID: null,
        },
        {
          ImageID: 19,
          Image: 'https://example.com/images/product_6_2.jpg',
          ProductID: 'P000000006',
          AppointmentID: null,
        },
        {
          ImageID: 20,
          Image: 'https://example.com/images/product_6_3.jpg',
          ProductID: 'P000000006',
          AppointmentID: null,
        },
        // P000000007: Bàn chải lông Furminator (4 hình ảnh phụ)
        {
          ImageID: 21,
          Image: 'https://example.com/images/product_7_1.jpg',
          ProductID: 'P000000007',
          AppointmentID: null,
        },
        {
          ImageID: 22,
          Image: 'https://example.com/images/product_7_2.jpg',
          ProductID: 'P000000007',
          AppointmentID: null,
        },
        {
          ImageID: 23,
          Image: 'https://example.com/images/product_7_3.jpg',
          ProductID: 'P000000007',
          AppointmentID: null,
        },
        {
          ImageID: 24,
          Image: 'https://example.com/images/product_7_4.jpg',
          ProductID: 'P000000007',
          AppointmentID: null,
        },
        // P000000008: Thức ăn khô Pedigree 3kg (3 hình ảnh phụ)
        {
          ImageID: 25,
          Image: 'https://example.com/images/product_8_1.jpg',
          ProductID: 'P000000008',
          AppointmentID: null,
        },
        {
          ImageID: 26,
          Image: 'https://example.com/images/product_8_2.jpg',
          ProductID: 'P000000008',
          AppointmentID: null,
        },
        {
          ImageID: 27,
          Image: 'https://example.com/images/product_8_3.jpg',
          ProductID: 'P000000008',
          AppointmentID: null,
        },
        // P000000009: Cát hữu cơ Cat’s Best 10kg (3 hình ảnh phụ)
        {
          ImageID: 28,
          Image: 'https://example.com/images/product_9_1.jpg',
          ProductID: 'P000000009',
          AppointmentID: null,
        },
        {
          ImageID: 29,
          Image: 'https://example.com/images/product_9_2.jpg',
          ProductID: 'P000000009',
          AppointmentID: null,
        },
        {
          ImageID: 30,
          Image: 'https://example.com/images/product_9_3.jpg',
          ProductID: 'P000000009',
          AppointmentID: null,
        },
        // P000000010: Vòng cổ da Petkit (4 hình ảnh phụ)
        {
          ImageID: 31,
          Image: 'https://example.com/images/product_10_1.jpg',
          ProductID: 'P000000010',
          AppointmentID: null,
        },
        {
          ImageID: 32,
          Image: 'https://example.com/images/product_10_2.jpg',
          ProductID: 'P000000010',
          AppointmentID: null,
        },
        {
          ImageID: 33,
          Image: 'https://example.com/images/product_10_3.jpg',
          ProductID: 'P000000010',
          AppointmentID: null,
        },
        {
          ImageID: 34,
          Image: 'https://example.com/images/product_10_4.jpg',
          ProductID: 'P000000010',
          AppointmentID: null,
        },
        // P000000011: Dây dắt tự động Flexi M (3 hình ảnh phụ)
        {
          ImageID: 35,
          Image: 'https://example.com/images/product_11_1.jpg',
          ProductID: 'P000000011',
          AppointmentID: null,
        },
        {
          ImageID: 36,
          Image: 'https://example.com/images/product_11_2.jpg',
          ProductID: 'P000000011',
          AppointmentID: null,
        },
        {
          ImageID: 37,
          Image: 'https://example.com/images/product_11_3.jpg',
          ProductID: 'P000000011',
          AppointmentID: null,
        },
        // P000000012: Cần câu lông vũ Trixie (3 hình ảnh phụ)
        {
          ImageID: 38,
          Image: 'https://example.com/images/product_12_1.jpg',
          ProductID: 'P000000012',
          AppointmentID: null,
        },
        {
          ImageID: 39,
          Image: 'https://example.com/images/product_12_2.jpg',
          ProductID: 'P000000012',
          AppointmentID: null,
        },
        {
          ImageID: 40,
          Image: 'https://example.com/images/product_12_3.jpg',
          ProductID: 'P000000012',
          AppointmentID: null,
        },
        // P000000013: Lược chải lông Trixie (4 hình ảnh phụ)
        {
          ImageID: 41,
          Image: 'https://example.com/images/product_13_1.jpg',
          ProductID: 'P000000013',
          AppointmentID: null,
        },
        {
          ImageID: 42,
          Image: 'https://example.com/images/product_13_2.jpg',
          ProductID: 'P000000013',
          AppointmentID: null,
        },
        {
          ImageID: 43,
          Image: 'https://example.com/images/product_13_3.jpg',
          ProductID: 'P000000013',
          AppointmentID: null,
        },
        {
          ImageID: 44,
          Image: 'https://example.com/images/product_13_4.jpg',
          ProductID: 'P000000013',
          AppointmentID: null,
        },
        // P000000014: Thức ăn khô BioPet 2kg (3 hình ảnh phụ)
        {
          ImageID: 45,
          Image: 'https://example.com/images/product_14_1.jpg',
          ProductID: 'P000000014',
          AppointmentID: null,
        },
        {
          ImageID: 46,
          Image: 'https://example.com/images/product_14_2.jpg',
          ProductID: 'P000000014',
          AppointmentID: null,
        },
        {
          ImageID: 47,
          Image: 'https://example.com/images/product_14_3.jpg',
          ProductID: 'P000000014',
          AppointmentID: null,
        },
        // P000000015: Cát bentonite Sanicat 5kg (3 hình ảnh phụ)
        {
          ImageID: 48,
          Image: 'https://example.com/images/product_15_1.jpg',
          ProductID: 'P000000015',
          AppointmentID: null,
        },
        {
          ImageID: 49,
          Image: 'https://example.com/images/product_15_2.jpg',
          ProductID: 'P000000015',
          AppointmentID: null,
        },
        {
          ImageID: 50,
          Image: 'https://example.com/images/product_15_3.jpg',
          ProductID: 'P000000015',
          AppointmentID: null,
        },
        // P000000016: Vòng cổ phản quang Trixie (4 hình ảnh phụ)
        {
          ImageID: 51,
          Image: 'https://example.com/images/product_16_1.jpg',
          ProductID: 'P000000016',
          AppointmentID: null,
        },
        {
          ImageID: 52,
          Image: 'https://example.com/images/product_16_2.jpg',
          ProductID: 'P000000016',
          AppointmentID: null,
        },
        {
          ImageID: 53,
          Image: 'https://example.com/images/product_16_3.jpg',
          ProductID: 'P000000016',
          AppointmentID: null,
        },
        {
          ImageID: 54,
          Image: 'https://example.com/images/product_16_4.jpg',
          ProductID: 'P000000016',
          AppointmentID: null,
        },
        // P000000017: Xương gặm nylon Petkit (3 hình ảnh phụ)
        {
          ImageID: 55,
          Image: 'https://example.com/images/product_17_1.jpg',
          ProductID: 'P000000017',
          AppointmentID: null,
        },
        {
          ImageID: 56,
          Image: 'https://example.com/images/product_17_2.jpg',
          ProductID: 'P000000017',
          AppointmentID: null,
        },
        {
          ImageID: 57,
          Image: 'https://example.com/images/product_17_3.jpg',
          ProductID: 'P000000017',
          AppointmentID: null,
        },
        // P000000018: Dây dắt da Trixie (3 hình ảnh phụ)
        {
          ImageID: 58,
          Image: 'https://example.com/images/product_18_1.jpg',
          ProductID: 'P000000018',
          AppointmentID: null,
        },
        {
          ImageID: 59,
          Image: 'https://example.com/images/product_18_2.jpg',
          ProductID: 'P000000018',
          AppointmentID: null,
        },
        {
          ImageID: 60,
          Image: 'https://example.com/images/product_18_3.jpg',
          ProductID: 'P000000018',
          AppointmentID: null,
        },
        // P000000019: Máy cắt móng Petkit (4 hình ảnh phụ)
        {
          ImageID: 61,
          Image: 'https://example.com/images/product_19_1.jpg',
          ProductID: 'P000000019',
          AppointmentID: null,
        },
        {
          ImageID: 62,
          Image: 'https://example.com/images/product_19_2.jpg',
          ProductID: 'P000000019',
          AppointmentID: null,
        },
        {
          ImageID: 63,
          Image: 'https://example.com/images/product_19_3.jpg',
          ProductID: 'P000000019',
          AppointmentID: null,
        },
        {
          ImageID: 64,
          Image: 'https://example.com/images/product_19_4.jpg',
          ProductID: 'P000000019',
          AppointmentID: null,
        },
        // P000000020: Thức ăn ướt Me-O 400g (3 hình ảnh phụ)
        {
          ImageID: 65,
          Image: 'https://example.com/images/product_20_1.jpg',
          ProductID: 'P000000020',
          AppointmentID: null,
        },
        {
          ImageID: 66,
          Image: 'https://example.com/images/product_20_2.jpg',
          ProductID: 'P000000020',
          AppointmentID: null,
        },
        {
          ImageID: 67,
          Image: 'https://example.com/images/product_20_3.jpg',
          ProductID: 'P000000020',
          AppointmentID: null,
        },
        // P000000021: Cát vệ sinh Petkit 10kg (3 hình ảnh phụ)
        {
          ImageID: 68,
          Image: 'https://example.com/images/product_21_1.jpg',
          ProductID: 'P000000021',
          AppointmentID: null,
        },
        {
          ImageID: 69,
          Image: 'https://example.com/images/product_21_2.jpg',
          ProductID: 'P000000021',
          AppointmentID: null,
        },
        {
          ImageID: 70,
          Image: 'https://example.com/images/product_21_3.jpg',
          ProductID: 'P000000021',
          AppointmentID: null,
        },
        // P000000022: Vòng cổ chống ve rận Seresto (4 hình ảnh phụ)
        {
          ImageID: 71,
          Image: 'https://example.com/images/product_22_1.jpg',
          ProductID: 'P000000022',
          AppointmentID: null,
        },
        {
          ImageID: 72,
          Image: 'https://example.com/images/product_22_2.jpg',
          ProductID: 'P000000022',
          AppointmentID: null,
        },
        {
          ImageID: 73,
          Image: 'https://example.com/images/product_22_3.jpg',
          ProductID: 'P000000022',
          AppointmentID: null,
        },
        {
          ImageID: 74,
          Image: 'https://example.com/images/product_22_4.jpg',
          ProductID: 'P000000022',
          AppointmentID: null,
        },
        // P000000023: Đồ chơi phát âm thanh Petstages (3 hình ảnh phụ)
        {
          ImageID: 75,
          Image: 'https://example.com/images/product_23_1.jpg',
          ProductID: 'P000000023',
          AppointmentID: null,
        },
        {
          ImageID: 76,
          Image: 'https://example.com/images/product_23_2.jpg',
          ProductID: 'P000000023',
          AppointmentID: null,
        },
        {
          ImageID: 77,
          Image: 'https://example.com/images/product_23_3.jpg',
          ProductID: 'P000000023',
          AppointmentID: null,
        },
        // P000000024: Dây dắt tự động Flexi S (3 hình ảnh phụ)
        {
          ImageID: 78,
          Image: 'https://example.com/images/product_24_1.jpg',
          ProductID: 'P000000024',
          AppointmentID: null,
        },
        {
          ImageID: 79,
          Image: 'https://example.com/images/product_24_2.jpg',
          ProductID: 'P000000024',
          AppointmentID: null,
        },
        {
          ImageID: 80,
          Image: 'https://example.com/images/product_24_3.jpg',
          ProductID: 'P000000024',
          AppointmentID: null,
        },
        // P000000025: Bàn chải lông Furminator (4 hình ảnh phụ)
        {
          ImageID: 81,
          Image: 'https://example.com/images/product_25_1.jpg',
          ProductID: 'P000000025',
          AppointmentID: null,
        },
        {
          ImageID: 82,
          Image: 'https://example.com/images/product_25_2.jpg',
          ProductID: 'P000000025',
          AppointmentID: null,
        },
        {
          ImageID: 83,
          Image: 'https://example.com/images/product_25_3.jpg',
          ProductID: 'P000000025',
          AppointmentID: null,
        },
        {
          ImageID: 84,
          Image: 'https://example.com/images/product_25_4.jpg',
          ProductID: 'P000000025',
          AppointmentID: null,
        },
        // P000000026: Thức ăn khô Royal Canin 2kg (3 hình ảnh phụ)
        {
          ImageID: 85,
          Image: 'https://example.com/images/product_26_1.jpg',
          ProductID: 'P000000026',
          AppointmentID: null,
        },
        {
          ImageID: 86,
          Image: 'https://example.com/images/product_26_2.jpg',
          ProductID: 'P000000026',
          AppointmentID: null,
        },
        {
          ImageID: 87,
          Image: 'https://example.com/images/product_26_3.jpg',
          ProductID: 'P000000026',
          AppointmentID: null,
        },
        // P000000027: Cát hữu cơ Cat’s Best 5kg (3 hình ảnh phụ)
        {
          ImageID: 88,
          Image: 'https://example.com/images/product_27_1.jpg',
          ProductID: 'P000000027',
          AppointmentID: null,
        },
        {
          ImageID: 89,
          Image: 'https://example.com/images/product_27_2.jpg',
          ProductID: 'P000000027',
          AppointmentID: null,
        },
        {
          ImageID: 90,
          Image: 'https://example.com/images/product_27_3.jpg',
          ProductID: 'P000000027',
          AppointmentID: null,
        },
        // P000000028: Vòng cổ da Petkit (4 hình ảnh phụ)
        {
          ImageID: 91,
          Image: 'https://example.com/images/product_28_1.jpg',
          ProductID: 'P000000028',
          AppointmentID: null,
        },
        {
          ImageID: 92,
          Image: 'https://example.com/images/product_28_2.jpg',
          ProductID: 'P000000028',
          AppointmentID: null,
        },
        {
          ImageID: 93,
          Image: 'https://example.com/images/product_28_3.jpg',
          ProductID: 'P000000028',
          AppointmentID: null,
        },
        {
          ImageID: 94,
          Image: 'https://example.com/images/product_28_4.jpg',
          ProductID: 'P000000028',
          AppointmentID: null,
        },
        // P000000029: Bóng cao su Kong (3 hình ảnh phụ)
        {
          ImageID: 95,
          Image: 'https://example.com/images/product_29_1.jpg',
          ProductID: 'P000000029',
          AppointmentID: null,
        },
        {
          ImageID: 96,
          Image: 'https://example.com/images/product_29_2.jpg',
          ProductID: 'P000000029',
          AppointmentID: null,
        },
        {
          ImageID: 97,
          Image: 'https://example.com/images/product_29_3.jpg',
          ProductID: 'P000000029',
          AppointmentID: null,
        },
        // P000000030: Dây dắt nylon Trixie (3 hình ảnh phụ)
        {
          ImageID: 98,
          Image: 'https://example.com/images/product_30_1.jpg',
          ProductID: 'P000000030',
          AppointmentID: null,
        },
        {
          ImageID: 99,
          Image: 'https://example.com/images/product_30_2.jpg',
          ProductID: 'P000000030',
          AppointmentID: null,
        },
        {
          ImageID: 100,
          Image: 'https://example.com/images/product_30_3.jpg',
          ProductID: 'P000000030',
          AppointmentID: null,
        },
        // P000000031: Lược chải lông Trixie (4 hình ảnh phụ)
        {
          ImageID: 101,
          Image: 'https://example.com/images/product_31_1.jpg',
          ProductID: 'P000000031',
          AppointmentID: null,
        },
        {
          ImageID: 102,
          Image: 'https://example.com/images/product_31_2.jpg',
          ProductID: 'P000000031',
          AppointmentID: null,
        },
        {
          ImageID: 103,
          Image: 'https://example.com/images/product_31_3.jpg',
          ProductID: 'P000000031',
          AppointmentID: null,
        },
        {
          ImageID: 104,
          Image: 'https://example.com/images/product_31_4.jpg',
          ProductID: 'P000000031',
          AppointmentID: null,
        },
        // P000000032: Thức ăn khô Pedigree 5kg (3 hình ảnh phụ)
        {
          ImageID: 105,
          Image: 'https://example.com/images/product_32_1.jpg',
          ProductID: 'P000000032',
          AppointmentID: null,
        },
        {
          ImageID: 106,
          Image: 'https://example.com/images/product_32_2.jpg',
          ProductID: 'P000000032',
          AppointmentID: null,
        },
        {
          ImageID: 107,
          Image: 'https://example.com/images/product_32_3.jpg',
          ProductID: 'P000000032',
          AppointmentID: null,
        },
        // P000000033: Cát bentonite Sanicat 10kg (3 hình ảnh phụ)
        {
          ImageID: 108,
          Image: 'https://example.com/images/product_33_1.jpg',
          ProductID: 'P000000033',
          AppointmentID: null,
        },
        {
          ImageID: 109,
          Image: 'https://example.com/images/product_33_2.jpg',
          ProductID: 'P000000033',
          AppointmentID: null,
        },
        {
          ImageID: 110,
          Image: 'https://example.com/images/product_33_3.jpg',
          ProductID: 'P000000033',
          AppointmentID: null,
        },
        // P000000034: Vòng cổ phản quang Trixie (4 hình ảnh phụ)
        {
          ImageID: 111,
          Image: 'https://example.com/images/product_34_1.jpg',
          ProductID: 'P000000034',
          AppointmentID: null,
        },
        {
          ImageID: 112,
          Image: 'https://example.com/images/product_34_2.jpg',
          ProductID: 'P000000034',
          AppointmentID: null,
        },
        {
          ImageID: 113,
          Image: 'https://example.com/images/product_34_3.jpg',
          ProductID: 'P000000034',
          AppointmentID: null,
        },
        {
          ImageID: 114,
          Image: 'https://example.com/images/product_34_4.jpg',
          ProductID: 'P000000034',
          AppointmentID: null,
        },
        // P000000035: Đồ chơi phát âm thanh Petstages (3 hình ảnh phụ)
        {
          ImageID: 115,
          Image: 'https://example.com/images/product_35_1.jpg',
          ProductID: 'P000000035',
          AppointmentID: null,
        },
        {
          ImageID: 116,
          Image: 'https://example.com/images/product_35_2.jpg',
          ProductID: 'P000000035',
          AppointmentID: null,
        },
        {
          ImageID: 117,
          Image: 'https://example.com/images/product_35_3.jpg',
          ProductID: 'P000000035',
          AppointmentID: null,
        },
        // P000000036: Dây dắt tự động Flexi L (3 hình ảnh phụ)
        {
          ImageID: 118,
          Image: 'https://example.com/images/product_36_1.jpg',
          ProductID: 'P000000036',
          AppointmentID: null,
        },
        {
          ImageID: 119,
          Image: 'https://example.com/images/product_36_2.jpg',
          ProductID: 'P000000036',
          AppointmentID: null,
        },
        {
          ImageID: 120,
          Image: 'https://example.com/images/product_36_3.jpg',
          ProductID: 'P000000036',
          AppointmentID: null,
        },
        // P000000037: Máy cắt móng Petkit (4 hình ảnh phụ)
        {
          ImageID: 121,
          Image: 'https://example.com/images/product_37_1.jpg',
          ProductID: 'P000000037',
          AppointmentID: null,
        },
        {
          ImageID: 122,
          Image: 'https://example.com/images/product_37_2.jpg',
          ProductID: 'P000000037',
          AppointmentID: null,
        },
        {
          ImageID: 123,
          Image: 'https://example.com/images/product_37_3.jpg',
          ProductID: 'P000000037',
          AppointmentID: null,
        },
        {
          ImageID: 124,
          Image: 'https://example.com/images/product_37_4.jpg',
          ProductID: 'P000000037',
          AppointmentID: null,
        },
        // P000000038: Thức ăn ướt Me-O 800g (3 hình ảnh phụ)
        {
          ImageID: 125,
          Image: 'https://example.com/images/product_38_1.jpg',
          ProductID: 'P000000038',
          AppointmentID: null,
        },
        {
          ImageID: 126,
          Image: 'https://example.com/images/product_38_2.jpg',
          ProductID: 'P000000038',
          AppointmentID: null,
        },
        {
          ImageID: 127,
          Image: 'https://example.com/images/product_38_3.jpg',
          ProductID: 'P000000038',
          AppointmentID: null,
        },
        // P000000039: Cát vệ sinh Petkit 2kg (3 hình ảnh phụ)
        {
          ImageID: 128,
          Image: 'https://example.com/images/product_39_1.jpg',
          ProductID: 'P000000039',
          AppointmentID: null,
        },
        {
          ImageID: 129,
          Image: 'https://example.com/images/product_39_2.jpg',
          ProductID: 'P000000039',
          AppointmentID: null,
        },
        {
          ImageID: 130,
          Image: 'https://example.com/images/product_39_3.jpg',
          ProductID: 'P000000039',
          AppointmentID: null,
        },
        // P000000040: Vòng cổ da Trixie (4 hình ảnh phụ)
        {
          ImageID: 131,
          Image: 'https://example.com/images/product_40_1.jpg',
          ProductID: 'P000000040',
          AppointmentID: null,
        },
        {
          ImageID: 132,
          Image: 'https://example.com/images/product_40_2.jpg',
          ProductID: 'P000000040',
          AppointmentID: null,
        },
        {
          ImageID: 133,
          Image: 'https://example.com/images/product_40_3.jpg',
          ProductID: 'P000000040',
          AppointmentID: null,
        },
        {
          ImageID: 134,
          Image: 'https://example.com/images/product_40_4.jpg',
          ProductID: 'P000000040',
          AppointmentID: null,
        },
        // P000000041: Xương gặm nylon Petkit (3 hình ảnh phụ)
        {
          ImageID: 135,
          Image: 'https://example.com/images/product_41_1.jpg',
          ProductID: 'P000000041',
          AppointmentID: null,
        },
        {
          ImageID: 136,
          Image: 'https://example.com/images/product_41_2.jpg',
          ProductID: 'P000000041',
          AppointmentID: null,
        },
        {
          ImageID: 137,
          Image: 'https://example.com/images/product_41_3.jpg',
          ProductID: 'P000000041',
          AppointmentID: null,
        },
        // P000000042: Dây dắt nylon Petkit (3 hình ảnh phụ)
        {
          ImageID: 138,
          Image: 'https://example.com/images/product_42_1.jpg',
          ProductID: 'P000000042',
          AppointmentID: null,
        },
        {
          ImageID: 139,
          Image: 'https://example.com/images/product_42_2.jpg',
          ProductID: 'P000000042',
          AppointmentID: null,
        },
        {
          ImageID: 140,
          Image: 'https://example.com/images/product_42_3.jpg',
          ProductID: 'P000000042',
          AppointmentID: null,
        },
        // P000000043: Bàn chải lông Trixie (4 hình ảnh phụ)
        {
          ImageID: 141,
          Image: 'https://example.com/images/product_43_1.jpg',
          ProductID: 'P000000043',
          AppointmentID: null,
        },
        {
          ImageID: 142,
          Image: 'https://example.com/images/product_43_2.jpg',
          ProductID: 'P000000043',
          AppointmentID: null,
        },
        {
          ImageID: 143,
          Image: 'https://example.com/images/product_43_3.jpg',
          ProductID: 'P000000043',
          AppointmentID: null,
        },
        {
          ImageID: 144,
          Image: 'https://example.com/images/product_43_4.jpg',
          ProductID: 'P000000043',
          AppointmentID: null,
        },
        // P000000044: Thức ăn khô BioPet 5kg (3 hình ảnh phụ)
        {
          ImageID: 145,
          Image: 'https://example.com/images/product_44_1.jpg',
          ProductID: 'P000000044',
          AppointmentID: null,
        },
        {
          ImageID: 146,
          Image: 'https://example.com/images/product_44_2.jpg',
          ProductID: 'P000000044',
          AppointmentID: null,
        },
        {
          ImageID: 147,
          Image: 'https://example.com/images/product_44_3.jpg',
          ProductID: 'P000000044',
          AppointmentID: null,
        },
        // P000000045: Cát hữu cơ Cat’s Best 2kg (3 hình ảnh phụ)
        {
          ImageID: 148,
          Image: 'https://example.com/images/product_45_1.jpg',
          ProductID: 'P000000045',
          AppointmentID: null,
        },
        {
          ImageID: 149,
          Image: 'https://example.com/images/product_45_2.jpg',
          ProductID: 'P000000045',
          AppointmentID: null,
        },
        {
          ImageID: 150,
          Image: 'https://example.com/images/product_45_3.jpg',
          ProductID: 'P000000045',
          AppointmentID: null,
        },
        // P000000046: Vòng cổ chống ve rận Seresto (4 hình ảnh phụ)
        {
          ImageID: 151,
          Image: 'https://example.com/images/product_46_1.jpg',
          ProductID: 'P000000046',
          AppointmentID: null,
        },
        {
          ImageID: 152,
          Image: 'https://example.com/images/product_46_2.jpg',
          ProductID: 'P000000046',
          AppointmentID: null,
        },
        {
          ImageID: 153,
          Image: 'https://example.com/images/product_46_3.jpg',
          ProductID: 'P000000046',
          AppointmentID: null,
        },
        {
          ImageID: 154,
          Image: 'https://example.com/images/product_46_4.jpg',
          ProductID: 'P000000046',
          AppointmentID: null,
        },
        // P000000047: Cần câu lông vũ Trixie (3 hình ảnh phụ)
        {
          ImageID: 155,
          Image: 'https://example.com/images/product_47_1.jpg',
          ProductID: 'P000000047',
          AppointmentID: null,
        },
        {
          ImageID: 156,
          Image: 'https://example.com/images/product_47_2.jpg',
          ProductID: 'P000000047',
          AppointmentID: null,
        },
        {
          ImageID: 157,
          Image: 'https://example.com/images/product_47_3.jpg',
          ProductID: 'P000000047',
          AppointmentID: null,
        },
        // P000000048: Dây dắt da Trixie (3 hình ảnh phụ)
        {
          ImageID: 158,
          Image: 'https://example.com/images/product_48_1.jpg',
          ProductID: 'P000000048',
          AppointmentID: null,
        },
        {
          ImageID: 159,
          Image: 'https://example.com/images/product_48_2.jpg',
          ProductID: 'P000000048',
          AppointmentID: null,
        },
        {
          ImageID: 160,
          Image: 'https://example.com/images/product_48_3.jpg',
          ProductID: 'P000000048',
          AppointmentID: null,
        },
        // P000000049: Lược chải lông Trixie (4 hình ảnh phụ)
        {
          ImageID: 161,
          Image: 'https://example.com/images/product_49_1.jpg',
          ProductID: 'P000000049',
          AppointmentID: null,
        },
        {
          ImageID: 162,
          Image: 'https://example.com/images/product_49_2.jpg',
          ProductID: 'P000000049',
          AppointmentID: null,
        },
        {
          ImageID: 163,
          Image: 'https://example.com/images/product_49_3.jpg',
          ProductID: 'P000000049',
          AppointmentID: null,
        },
        {
          ImageID: 164,
          Image: 'https://example.com/images/product_49_4.jpg',
          ProductID: 'P000000049',
          AppointmentID: null,
        },
        // P000000050: Thức ăn khô Royal Canin 10kg (3 hình ảnh phụ)
        {
          ImageID: 165,
          Image: 'https://example.com/images/product_50_1.jpg',
          ProductID: 'P000000050',
          AppointmentID: null,
        },
        {
          ImageID: 166,
          Image: 'https://example.com/images/product_50_2.jpg',
          ProductID: 'P000000050',
          AppointmentID: null,
        },
        {
          ImageID: 167,
          Image: 'https://example.com/images/product_50_3.jpg',
          ProductID: 'P000000050',
          AppointmentID: null,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Image', null, {});
  },
};
