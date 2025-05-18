'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Image',
      [
        // P000000001: Thức ăn khô Royal Canin 5kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_1_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000001',
        },
        {
          Image: 'https://example.com/images/product_1_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000001',
        },
        {
          Image: 'https://example.com/images/product_1_back.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000001',
        },
        // P000000002: Thức ăn ướt Whiskas 1kg (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_2_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000002',
        },
        {
          Image: 'https://example.com/images/product_2_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000002',
        },
        {
          Image: 'https://example.com/images/product_2_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000002',
        },
        {
          Image: 'https://example.com/images/product_2_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000002',
        },
        // P000000003: Cát vệ sinh Petkit 5kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_3_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000003',
        },
        {
          Image: 'https://example.com/images/product_3_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000003',
        },
        {
          Image: 'https://example.com/images/product_3_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000003',
        },
        // P000000004: Vòng cổ chống ve rận Seresto (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_4_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000004',
        },
        {
          Image: 'https://example.com/images/product_4_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000004',
        },
        {
          Image: 'https://example.com/images/product_4_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000004',
        },
        {
          Image: 'https://example.com/images/product_4_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000004',
        },
        // P000000005: Bóng cao su Kong (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_5_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000005',
        },
        {
          Image: 'https://example.com/images/product_5_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000005',
        },
        {
          Image: 'https://example.com/images/product_5_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000005',
        },
        // P000000006: Dây dắt nylon Petkit (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_6_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000006',
        },
        {
          Image: 'https://example.com/images/product_6_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000006',
        },
        {
          Image: 'https://example.com/images/product_6_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000006',
        },
        // P000000007: Bàn chải lông Furminator (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_7_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000007',
        },
        {
          Image: 'https://example.com/images/product_7_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000007',
        },
        {
          Image: 'https://example.com/images/product_7_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000007',
        },
        {
          Image: 'https://example.com/images/product_7_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000007',
        },
        // P000000008: Thức ăn khô Pedigree 3kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_8_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000008',
        },
        {
          Image: 'https://example.com/images/product_8_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000008',
        },
        {
          Image: 'https://example.com/images/product_8_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000008',
        },
        // P000000009: Cát hữu cơ Cat’s Best 10kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_9_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000009',
        },
        {
          Image: 'https://example.com/images/product_9_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000009',
        },
        {
          Image: 'https://example.com/images/product_9_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000009',
        },
        // P000000010: Vòng cổ da Petkit (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_10_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000010',
        },
        {
          Image: 'https://example.com/images/product_10_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000010',
        },
        {
          Image: 'https://example.com/images/product_10_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000010',
        },
        {
          Image: 'https://example.com/images/product_10_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000010',
        },
        // P000000011: Dây dắt tự động Flexi M (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_11_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000011',
        },
        {
          Image: 'https://example.com/images/product_11_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000011',
        },
        {
          Image: 'https://example.com/images/product_11_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000011',
        },
        // P000000012: Cần câu lông vũ Trixie (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_12_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000012',
        },
        {
          Image: 'https://example.com/images/product_12_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000012',
        },
        {
          Image: 'https://example.com/images/product_12_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000012',
        },
        // P000000013: Lược chải lông Trixie (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_13_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000013',
        },
        {
          Image: 'https://example.com/images/product_13_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000013',
        },
        {
          Image: 'https://example.com/images/product_13_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000013',
        },
        {
          Image: 'https://example.com/images/product_13_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000013',
        },
        // P000000014: Thức ăn khô BioPet 2kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_14_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000014',
        },
        {
          Image: 'https://example.com/images/product_14_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000014',
        },
        {
          Image: 'https://example.com/images/product_14_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000014',
        },
        // P000000015: Cát bentonite Sanicat 5kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_15_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000015',
        },
        {
          Image: 'https://example.com/images/product_15_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000015',
        },
        {
          Image: 'https://example.com/images/product_15_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000015',
        },
        // P000000016: Vòng cổ phản quang Trixie (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_16_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000016',
        },
        {
          Image: 'https://example.com/images/product_16_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000016',
        },
        {
          Image: 'https://example.com/images/product_16_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000016',
        },
        {
          Image: 'https://example.com/images/product_16_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000016',
        },
        // P000000017: Xương gặm nylon Petkit (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_17_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000017',
        },
        {
          Image: 'https://example.com/images/product_17_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000017',
        },
        {
          Image: 'https://example.com/images/product_17_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000017',
        },
        // P000000018: Dây dắt da Trixie (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_18_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000018',
        },
        {
          Image: 'https://example.com/images/product_18_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000018',
        },
        {
          Image: 'https://example.com/images/product_18_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000018',
        },
        // P000000019: Máy cắt móng Petkit (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_19_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000019',
        },
        {
          Image: 'https://example.com/images/product_19_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000019',
        },
        {
          Image: 'https://example.com/images/product_19_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000019',
        },
        {
          Image: 'https://example.com/images/product_19_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000019',
        },
        // P000000020: Thức ăn ướt Me-O 400g (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_20_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000020',
        },
        {
          Image: 'https://example.com/images/product_20_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000020',
        },
        {
          Image: 'https://example.com/images/product_20_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000020',
        },
        // P000000021: Cát vệ sinh Petkit 10kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_21_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000021',
        },
        {
          Image: 'https://example.com/images/product_21_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000021',
        },
        {
          Image: 'https://example.com/images/product_21_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000021',
        },
        // P000000022: Vòng cổ chống ve rận Seresto (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_22_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000022',
        },
        {
          Image: 'https://example.com/images/product_22_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000022',
        },
        {
          Image: 'https://example.com/images/product_22_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000022',
        },
        {
          Image: 'https://example.com/images/product_22_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000022',
        },
        // P000000023: Đồ chơi phát âm thanh Petstages (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_23_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000023',
        },
        {
          Image: 'https://example.com/images/product_23_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000023',
        },
        {
          Image: 'https://example.com/images/product_23_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000023',
        },
        // P000000024: Dây dắt tự động Flexi S (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_24_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000024',
        },
        {
          Image: 'https://example.com/images/product_24_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000024',
        },
        {
          Image: 'https://example.com/images/product_24_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000024',
        },
        // P000000025: Bàn chải lông Furminator (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_25_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000025',
        },
        {
          Image: 'https://example.com/images/product_25_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000025',
        },
        {
          Image: 'https://example.com/images/product_25_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000025',
        },
        {
          Image: 'https://example.com/images/product_25_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000025',
        },
        // P000000026: Thức ăn khô Royal Canin 2kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_26_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000026',
        },
        {
          Image: 'https://example.com/images/product_26_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000026',
        },
        {
          Image: 'https://example.com/images/product_26_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000026',
        },
        // P000000027: Cát hữu cơ Cat’s Best 5kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_27_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000027',
        },
        {
          Image: 'https://example.com/images/product_27_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000027',
        },
        {
          Image: 'https://example.com/images/product_27_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000027',
        },
        // P000000028: Vòng cổ da Petkit (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_28_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000028',
        },
        {
          Image: 'https://example.com/images/product_28_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000028',
        },
        {
          Image: 'https://example.com/images/product_28_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000028',
        },
        {
          Image: 'https://example.com/images/product_28_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000028',
        },
        // P000000029: Bóng cao su Kong (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_29_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000029',
        },
        {
          Image: 'https://example.com/images/product_29_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000029',
        },
        {
          Image: 'https://example.com/images/product_29_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000029',
        },
        // P000000030: Dây dắt nylon Trixie (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_30_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000030',
        },
        {
          Image: 'https://example.com/images/product_30_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000030',
        },
        {
          Image: 'https://example.com/images/product_30_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000030',
        },
        // P000000031: Lược chải lông Trixie (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_31_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000031',
        },
        {
          Image: 'https://example.com/images/product_31_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000031',
        },
        {
          Image: 'https://example.com/images/product_31_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000031',
        },
        {
          Image: 'https://example.com/images/product_31_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000031',
        },
        // P000000032: Thức ăn khô Pedigree 5kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_32_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000032',
        },
        {
          Image: 'https://example.com/images/product_32_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000032',
        },
        {
          Image: 'https://example.com/images/product_32_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000032',
        },
        // P000000033: Cát bentonite Sanicat 10kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_33_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000033',
        },
        {
          Image: 'https://example.com/images/product_33_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000033',
        },
        {
          Image: 'https://example.com/images/product_33_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000033',
        },
        // P000000034: Vòng cổ phản quang Trixie (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_34_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000034',
        },
        {
          Image: 'https://example.com/images/product_34_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000034',
        },
        {
          Image: 'https://example.com/images/product_34_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000034',
        },
        {
          Image: 'https://example.com/images/product_34_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000034',
        },
        // P000000035: Đồ chơi phát âm thanh Petstages (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_35_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000035',
        },
        {
          Image: 'https://example.com/images/product_35_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000035',
        },
        {
          Image: 'https://example.com/images/product_35_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000035',
        },
        // P000000036: Dây dắt tự động Flexi L (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_36_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000036',
        },
        {
          Image: 'https://example.com/images/product_36_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000036',
        },
        {
          Image: 'https://example.com/images/product_36_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000036',
        },
        // P000000037: Máy cắt móng Petkit (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_37_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000037',
        },
        {
          Image: 'https://example.com/images/product_37_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000037',
        },
        {
          Image: 'https://example.com/images/product_37_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000037',
        },
        {
          Image: 'https://example.com/images/product_37_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000037',
        },
        // P000000038: Thức ăn ướt Me-O 800g (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_38_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000038',
        },
        {
          Image: 'https://example.com/images/product_38_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000038',
        },
        {
          Image: 'https://example.com/images/product_38_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000038',
        },
        // P000000039: Cát vệ sinh Petkit 2kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_39_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000039',
        },
        {
          Image: 'https://example.com/images/product_39_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000039',
        },
        {
          Image: 'https://example.com/images/product_39_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000039',
        },
        // P000000040: Vòng cổ da Trixie (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_40_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000040',
        },
        {
          Image: 'https://example.com/images/product_40_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000040',
        },
        {
          Image: 'https://example.com/images/product_40_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000040',
        },
        {
          Image: 'https://example.com/images/product_40_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000040',
        },
        // P000000041: Xương gặm nylon Petkit (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_41_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000041',
        },
        {
          Image: 'https://example.com/images/product_41_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000041',
        },
        {
          Image: 'https://example.com/images/product_41_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000041',
        },
        // P000000042: Dây dắt nylon Petkit (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_42_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000042',
        },
        {
          Image: 'https://example.com/images/product_42_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000042',
        },
        {
          Image: 'https://example.com/images/product_42_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000042',
        },
        // P000000043: Bàn chải lông Trixie (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_43_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000043',
        },
        {
          Image: 'https://example.com/images/product_43_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000043',
        },
        {
          Image: 'https://example.com/images/product_43_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000043',
        },
        {
          Image: 'https://example.com/images/product_43_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000043',
        },
        // P000000044: Thức ăn khô BioPet 5kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_44_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000044',
        },
        {
          Image: 'https://example.com/images/product_44_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000044',
        },
        {
          Image: 'https://example.com/images/product_44_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000044',
        },
        // P000000045: Cát hữu cơ Cat’s Best 2kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_45_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000045',
        },
        {
          Image: 'https://example.com/images/product_45_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000045',
        },
        {
          Image: 'https://example.com/images/product_45_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000045',
        },
        // P000000046: Vòng cổ chống ve rận Seresto (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_46_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000046',
        },
        {
          Image: 'https://example.com/images/product_46_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000046',
        },
        {
          Image: 'https://example.com/images/product_46_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000046',
        },
        {
          Image: 'https://example.com/images/product_46_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000046',
        },
        // P000000047: Cần câu lông vũ Trixie (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_47_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000047',
        },
        {
          Image: 'https://example.com/images/product_47_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000047',
        },
        {
          Image: 'https://example.com/images/product_47_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000047',
        },
        // P000000048: Dây dắt da Trixie (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_48_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000048',
        },
        {
          Image: 'https://example.com/images/product_48_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000048',
        },
        {
          Image: 'https://example.com/images/product_48_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000048',
        },
        // P000000049: Lược chải lông Trixie (4 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_49_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000049',
        },
        {
          Image: 'https://example.com/images/product_49_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000049',
        },
        {
          Image: 'https://example.com/images/product_49_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000049',
        },
        {
          Image: 'https://example.com/images/product_49_detail.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000049',
        },
        // P000000050: Thức ăn khô Royal Canin 10kg (3 hình ảnh phụ)
        {
          Image: 'https://example.com/images/product_50_side.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000050',
        },
        {
          Image: 'https://example.com/images/product_50_front.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000050',
        },
        {
          Image: 'https://example.com/images/product_50_top.jpg',
          ReferenceType: 'Product',
          ReferenceID: 'P000000050',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Image', null, {});
  },
};