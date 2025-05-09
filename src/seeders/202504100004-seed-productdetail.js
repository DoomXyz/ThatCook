'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('ProductDetail', [
            // P000000001: Thức ăn khô Royal Canin 5kg (DOG, CAT)
            { ProductDetailID: 1, DetailName: 'Hương gà', Stock: 50, SoldCount: 20, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-01-15'), DetailStatus: 'AVAIL', ProductID: 'P000000001' },
            { ProductDetailID: 2, DetailName: 'Hương cá', Stock: 30, SoldCount: 15, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-01-15'), DetailStatus: 'AVAIL', ProductID: 'P000000001' },
            { ProductDetailID: 3, DetailName: 'Hương bò', Stock: 10, SoldCount: 5, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2023-01-15'), DetailStatus: 'OUT', ProductID: 'P000000001' },
            // P000000002: Thức ăn ướt Whiskas 1kg (CAT)
            { ProductDetailID: 4, DetailName: 'Hương cá ngừ', Stock: 60, SoldCount: 25, ExtraPrice: 0.00, Promotion: 0.15, CreatedAt: new Date('2023-02-10'), DetailStatus: 'AVAIL', ProductID: 'P000000002' },
            { ProductDetailID: 5, DetailName: 'Hương thịt gà', Stock: 40, SoldCount: 10, ExtraPrice: 5000.00, Promotion: 0.00, CreatedAt: new Date('2023-02-10'), DetailStatus: 'AVAIL', ProductID: 'P000000002' },
            // P000000003: Cát vệ sinh Petkit 5kg (CAT)
            { ProductDetailID: 6, DetailName: 'Hương tự nhiên', Stock: 100, SoldCount: 30, ExtraPrice: 0.00, Promotion: 0.20, CreatedAt: new Date('2023-03-05'), DetailStatus: 'AVAIL', ProductID: 'P000000003' },
            { ProductDetailID: 7, DetailName: 'Hương lavender', Stock: 20, SoldCount: 5, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-03-05'), DetailStatus: 'AVAIL', ProductID: 'P000000003' },
            { ProductDetailID: 8, DetailName: 'Hương trà xanh', Stock: 15, SoldCount: 2, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-03-05'), DetailStatus: 'AVAIL', ProductID: 'P000000003' },
            // P000000004: Vòng cổ chống ve rận Seresto (DOG, CAT)
            { ProductDetailID: 9, DetailName: 'Màu xám', Stock: 15, SoldCount: 8, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2023-04-12'), DetailStatus: 'AVAIL', ProductID: 'P000000004' },
            { ProductDetailID: 10, DetailName: 'Màu xanh', Stock: 10, SoldCount: 3, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2023-04-12'), DetailStatus: 'AVAIL', ProductID: 'P000000004' },
            // P000000005: Bóng cao su Kong (DOG)
            { ProductDetailID: 11, DetailName: 'Kích thước S', Stock: 25, SoldCount: 12, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-05-20'), DetailStatus: 'AVAIL', ProductID: 'P000000005' },
            { ProductDetailID: 12, DetailName: 'Kích thước M', Stock: 20, SoldCount: 8, ExtraPrice: 20000.00, Promotion: 0.00, CreatedAt: new Date('2023-05-20'), DetailStatus: 'AVAIL', ProductID: 'P000000005' },
            // P000000006: Dây dắt nylon Petkit (DOG)
            { ProductDetailID: 13, DetailName: 'Màu đỏ', Stock: 30, SoldCount: 15, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2023-06-01'), DetailStatus: 'AVAIL', ProductID: 'P000000006' },
            { ProductDetailID: 14, DetailName: 'Màu xanh', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2023-06-01'), DetailStatus: 'AVAIL', ProductID: 'P000000006' },
            // P000000007: Bàn chải lông Furminator (CAT)
            { ProductDetailID: 15, DetailName: 'Loại mềm', Stock: 20, SoldCount: 5, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-07-10'), DetailStatus: 'AVAIL', ProductID: 'P000000007' },
            { ProductDetailID: 16, DetailName: 'Loại cứng', Stock: 15, SoldCount: 3, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2023-07-10'), DetailStatus: 'AVAIL', ProductID: 'P000000007' },
            // P000000008: Thức ăn khô Pedigree 3kg (DOG)
            { ProductDetailID: 17, DetailName: 'Hương thịt bò', Stock: 40, SoldCount: 20, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-08-15'), DetailStatus: 'AVAIL', ProductID: 'P000000008' },
            { ProductDetailID: 18, DetailName: 'Hương gà', Stock: 30, SoldCount: 12, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-08-15'), DetailStatus: 'AVAIL', ProductID: 'P000000008' },
            // P000000009: Cát hữu cơ Cat’s Best 10kg (CAT)
            { ProductDetailID: 19, DetailName: 'Hương tự nhiên', Stock: 50, SoldCount: 15, ExtraPrice: 0.00, Promotion: 0.15, CreatedAt: new Date('2023-09-01'), DetailStatus: 'AVAIL', ProductID: 'P000000009' },
            { ProductDetailID: 20, DetailName: 'Hương gỗ thông', Stock: 20, SoldCount: 5, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2023-09-01'), DetailStatus: 'AVAIL', ProductID: 'P000000009' },
            // P000000010: Vòng cổ da Petkit (CAT)
            { ProductDetailID: 21, DetailName: 'Màu nâu', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2023-10-05'), DetailStatus: 'AVAIL', ProductID: 'P000000010' },
            { ProductDetailID: 22, DetailName: 'Màu đen', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2023-10-05'), DetailStatus: 'AVAIL', ProductID: 'P000000010' },
            // P000000011: Dây dắt tự động Flexi M (DOG)
            { ProductDetailID: 23, DetailName: 'Màu đen', Stock: 30, SoldCount: 12, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-11-01'), DetailStatus: 'AVAIL', ProductID: 'P000000011' },
            { ProductDetailID: 24, DetailName: 'Màu xanh', Stock: 25, SoldCount: 10, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-11-01'), DetailStatus: 'AVAIL', ProductID: 'P000000011' },
            // P000000012: Cần câu lông vũ Trixie (CAT)
            { ProductDetailID: 25, DetailName: 'Màu đỏ', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2023-12-10'), DetailStatus: 'AVAIL', ProductID: 'P000000012' },
            { ProductDetailID: 26, DetailName: 'Màu xanh', Stock: 15, SoldCount: 5, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2023-12-10'), DetailStatus: 'AVAIL', ProductID: 'P000000012' },
            // P000000013: Lược chải lông Trixie (DOG)
            { ProductDetailID: 27, DetailName: 'Loại mềm', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-01-15'), DetailStatus: 'AVAIL', ProductID: 'P000000013' },
            { ProductDetailID: 28, DetailName: 'Loại cứng', Stock: 20, SoldCount: 8, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-01-15'), DetailStatus: 'AVAIL', ProductID: 'P000000013' },
            // P000000014: Thức ăn khô BioPet 2kg (DOG, CAT)
            { ProductDetailID: 29, DetailName: 'Hương cá', Stock: 40, SoldCount: 15, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-02-01'), DetailStatus: 'AVAIL', ProductID: 'P000000014' },
            { ProductDetailID: 30, DetailName: 'Hương gà', Stock: 30, SoldCount: 12, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-02-01'), DetailStatus: 'AVAIL', ProductID: 'P000000014' },
            // P000000015: Cát bentonite Sanicat 5kg (CAT)
            { ProductDetailID: 31, DetailName: 'Hương tự nhiên', Stock: 50, SoldCount: 20, ExtraPrice: 0.00, Promotion: 0.15, CreatedAt: new Date('2024-03-05'), DetailStatus: 'AVAIL', ProductID: 'P000000015' },
            { ProductDetailID: 32, DetailName: 'Hương lavender', Stock: 25, SoldCount: 10, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-03-05'), DetailStatus: 'AVAIL', ProductID: 'P000000015' },
            // P000000016: Vòng cổ phản quang Trixie (DOG)
            { ProductDetailID: 33, DetailName: 'Màu vàng', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2024-04-01'), DetailStatus: 'AVAIL', ProductID: 'P000000016' },
            { ProductDetailID: 34, DetailName: 'Màu xanh', Stock: 15, SoldCount: 5, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2024-04-01'), DetailStatus: 'AVAIL', ProductID: 'P000000016' },
            // P000000017: Xương gặm nylon Petkit (DOG)
            { ProductDetailID: 35, DetailName: 'Kích thước S', Stock: 30, SoldCount: 12, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-05-10'), DetailStatus: 'AVAIL', ProductID: 'P000000017' },
            { ProductDetailID: 36, DetailName: 'Kích thước M', Stock: 25, SoldCount: 10, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2024-05-10'), DetailStatus: 'AVAIL', ProductID: 'P000000017' },
            // P000000018: Dây dắt da Trixie (DOG)
            { ProductDetailID: 37, DetailName: 'Màu nâu', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2024-06-15'), DetailStatus: 'AVAIL', ProductID: 'P000000018' },
            { ProductDetailID: 38, DetailName: 'Màu đen', Stock: 15, SoldCount: 5, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-06-15'), DetailStatus: 'AVAIL', ProductID: 'P000000018' },
            // P000000019: Máy cắt móng Petkit (DOG, CAT)
            { ProductDetailID: 39, DetailName: 'Loại nhỏ', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-07-01'), DetailStatus: 'AVAIL', ProductID: 'P000000019' },
            { ProductDetailID: 40, DetailName: 'Loại lớn', Stock: 20, SoldCount: 8, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2024-07-01'), DetailStatus: 'AVAIL', ProductID: 'P000000019' },
            // P000000020: Thức ăn ướt Me-O 400g (CAT)
            { ProductDetailID: 41, DetailName: 'Hương cá thu', Stock: 50, SoldCount: 20, ExtraPrice: 0.00, Promotion: 0.15, CreatedAt: new Date('2024-08-05'), DetailStatus: 'AVAIL', ProductID: 'P000000020' },
            { ProductDetailID: 42, DetailName: 'Hương gà', Stock: 40, SoldCount: 15, ExtraPrice: 5000.00, Promotion: 0.00, CreatedAt: new Date('2024-08-05'), DetailStatus: 'AVAIL', ProductID: 'P000000020' },
            // P000000021: Cát vệ sinh Petkit 10kg (CAT)
            { ProductDetailID: 43, DetailName: 'Hương tự nhiên', Stock: 60, SoldCount: 25, ExtraPrice: 0.00, Promotion: 0.20, CreatedAt: new Date('2024-09-01'), DetailStatus: 'AVAIL', ProductID: 'P000000021' },
            { ProductDetailID: 44, DetailName: 'Hương lavender', Stock: 30, SoldCount: 10, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2024-09-01'), DetailStatus: 'AVAIL', ProductID: 'P000000021' },
            // P000000022: Vòng cổ chống ve rận Seresto (CAT)
            { ProductDetailID: 45, DetailName: 'Màu xám', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2024-10-10'), DetailStatus: 'AVAIL', ProductID: 'P000000022' },
            { ProductDetailID: 46, DetailName: 'Màu xanh', Stock: 15, SoldCount: 5, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2024-10-10'), DetailStatus: 'AVAIL', ProductID: 'P000000022' },
            // P000000023: Đồ chơi phát âm thanh Petstages (DOG)
            { ProductDetailID: 47, DetailName: 'Hình xương', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-11-15'), DetailStatus: 'AVAIL', ProductID: 'P000000023' },
            { ProductDetailID: 48, DetailName: 'Hình bóng', Stock: 20, SoldCount: 8, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-11-15'), DetailStatus: 'AVAIL', ProductID: 'P000000023' },
            // P000000024: Dây dắt tự động Flexi S (DOG)
            { ProductDetailID: 49, DetailName: 'Màu đỏ', Stock: 30, SoldCount: 12, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2024-12-01'), DetailStatus: 'AVAIL', ProductID: 'P000000024' },
            { ProductDetailID: 50, DetailName: 'Màu đen', Stock: 25, SoldCount: 10, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-12-01'), DetailStatus: 'AVAIL', ProductID: 'P000000024' },
            // P000000025: Bàn chải lông Furminator (DOG)
            { ProductDetailID: 51, DetailName: 'Loại mềm', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2025-01-05'), DetailStatus: 'AVAIL', ProductID: 'P000000025' },
            { ProductDetailID: 52, DetailName: 'Loại cứng', Stock: 15, SoldCount: 5, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2025-01-05'), DetailStatus: 'AVAIL', ProductID: 'P000000025' },
            // P000000026: Thức ăn khô Royal Canin 2kg (CAT)
            { ProductDetailID: 53, DetailName: 'Hương cá', Stock: 40, SoldCount: 15, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-01-20'), DetailStatus: 'AVAIL', ProductID: 'P000000026' },
            { ProductDetailID: 54, DetailName: 'Hương gà', Stock: 30, SoldCount: 12, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-01-20'), DetailStatus: 'AVAIL', ProductID: 'P000000026' },
            // P000000027: Cát hữu cơ Cat’s Best 5kg (CAT)
            { ProductDetailID: 55, DetailName: 'Hương tự nhiên', Stock: 50, SoldCount: 20, ExtraPrice: 0.00, Promotion: 0.15, CreatedAt: new Date('2023-02-15'), DetailStatus: 'AVAIL', ProductID: 'P000000027' },
            { ProductDetailID: 56, DetailName: 'Hương gỗ thông', Stock: 25, SoldCount: 10, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-02-15'), DetailStatus: 'AVAIL', ProductID: 'P000000027' },
            // P000000028: Vòng cổ da Petkit (DOG)
            { ProductDetailID: 57, DetailName: 'Màu nâu', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2023-03-01'), DetailStatus: 'AVAIL', ProductID: 'P000000028' },
            { ProductDetailID: 58, DetailName: 'Màu đen', Stock: 15, SoldCount: 5, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2023-03-01'), DetailStatus: 'AVAIL', ProductID: 'P000000028' },
            // P000000029: Bóng cao su Kong (CAT)
            { ProductDetailID: 59, DetailName: 'Kích thước S', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-04-05'), DetailStatus: 'AVAIL', ProductID: 'P000000029' },
            { ProductDetailID: 60, DetailName: 'Kích thước M', Stock: 20, SoldCount: 8, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-04-05'), DetailStatus: 'AVAIL', ProductID: 'P000000029' },
            // P000000030: Dây dắt nylon Trixie (CAT)
            { ProductDetailID: 61, DetailName: 'Màu đỏ', Stock: 30, SoldCount: 12, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2023-05-10'), DetailStatus: 'AVAIL', ProductID: 'P000000030' },
            { ProductDetailID: 62, DetailName: 'Màu xanh', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2023-05-10'), DetailStatus: 'AVAIL', ProductID: 'P000000030' },
            // P000000031: Lược chải lông Trixie (CAT)
            { ProductDetailID: 63, DetailName: 'Loại mềm', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-06-15'), DetailStatus: 'AVAIL', ProductID: 'P000000031' },
            { ProductDetailID: 64, DetailName: 'Loại cứng', Stock: 15, SoldCount: 5, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-06-15'), DetailStatus: 'AVAIL', ProductID: 'P000000031' },
            // P000000032: Thức ăn khô Pedigree 5kg (DOG)
            { ProductDetailID: 65, DetailName: 'Hương thịt bò', Stock: 40, SoldCount: 20, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-07-01'), DetailStatus: 'AVAIL', ProductID: 'P000000032' },
            { ProductDetailID: 66, DetailName: 'Hương gà', Stock: 30, SoldCount: 15, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-07-01'), DetailStatus: 'AVAIL', ProductID: 'P000000032' },
            // P000000033: Cát bentonite Sanicat 10kg (CAT)
            { ProductDetailID: 67, DetailName: 'Hương tự nhiên', Stock: 50, SoldCount: 20, ExtraPrice: 0.00, Promotion: 0.15, CreatedAt: new Date('2023-08-05'), DetailStatus: 'AVAIL', ProductID: 'P000000033' },
            { ProductDetailID: 68, DetailName: 'Hương lavender', Stock: 25, SoldCount: 10, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-08-05'), DetailStatus: 'AVAIL', ProductID: 'P000000033' },
            // P000000034: Vòng cổ phản quang Trixie (CAT)
            { ProductDetailID: 69, DetailName: 'Màu vàng', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2023-09-10'), DetailStatus: 'AVAIL', ProductID: 'P000000034' },
            { ProductDetailID: 70, DetailName: 'Màu xanh', Stock: 15, SoldCount: 5, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2023-09-10'), DetailStatus: 'AVAIL', ProductID: 'P000000034' },
            // P000000035: Đồ chơi phát âm thanh Petstages (CAT)
            { ProductDetailID: 71, DetailName: 'Hình chuột', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-10-15'), DetailStatus: 'AVAIL', ProductID: 'P000000035' },
            { ProductDetailID: 72, DetailName: 'Hình cá', Stock: 20, SoldCount: 8, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-10-15'), DetailStatus: 'AVAIL', ProductID: 'P000000035' },
            // P000000036: Dây dắt tự động Flexi L (DOG)
            { ProductDetailID: 73, DetailName: 'Màu đen', Stock: 30, SoldCount: 12, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2023-11-01'), DetailStatus: 'AVAIL', ProductID: 'P000000036' },
            { ProductDetailID: 74, DetailName: 'Màu xanh', Stock: 25, SoldCount: 10, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2023-11-01'), DetailStatus: 'AVAIL', ProductID: 'P000000036' },
            // P000000037: Máy cắt móng Petkit (CAT)
            { ProductDetailID: 75, DetailName: 'Loại nhỏ', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2023-12-05'), DetailStatus: 'AVAIL', ProductID: 'P000000037' },
            { ProductDetailID: 76, DetailName: 'Loại lớn', Stock: 15, SoldCount: 5, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2023-12-05'), DetailStatus: 'AVAIL', ProductID: 'P000000037' },
            // P000000038: Thức ăn ướt Me-O 800g (CAT)
            { ProductDetailID: 77, DetailName: 'Hương cá thu', Stock: 50, SoldCount: 20, ExtraPrice: 0.00, Promotion: 0.15, CreatedAt: new Date('2024-01-10'), DetailStatus: 'AVAIL', ProductID: 'P000000038' },
            { ProductDetailID: 78, DetailName: 'Hương gà', Stock: 40, SoldCount: 15, ExtraPrice: 5000.00, Promotion: 0.00, CreatedAt: new Date('2024-01-10'), DetailStatus: 'AVAIL', ProductID: 'P000000038' },
            // P000000039: Cát vệ sinh Petkit 2kg (CAT)
            { ProductDetailID: 79, DetailName: 'Hương tự nhiên', Stock: 50, SoldCount: 20, ExtraPrice: 0.00, Promotion: 0.15, CreatedAt: new Date('2024-02-15'), DetailStatus: 'AVAIL', ProductID: 'P000000039' },
            { ProductDetailID: 80, DetailName: 'Hương lavender', Stock: 25, SoldCount: 10, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-02-15'), DetailStatus: 'AVAIL', ProductID: 'P000000039' },
            // P000000040: Vòng cổ da Trixie (DOG)
            { ProductDetailID: 81, DetailName: 'Màu nâu', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2024-03-01'), DetailStatus: 'AVAIL', ProductID: 'P000000040' },
            { ProductDetailID: 82, DetailName: 'Màu đen', Stock: 15, SoldCount: 5, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2024-03-01'), DetailStatus: 'AVAIL', ProductID: 'P000000040' },
            // P000000041: Xương gặm nylon Petkit (DOG)
            { ProductDetailID: 83, DetailName: 'Kích thước S', Stock: 30, SoldCount: 12, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-04-05'), DetailStatus: 'AVAIL', ProductID: 'P000000041' },
            { ProductDetailID: 84, DetailName: 'Kích thước M', Stock: 25, SoldCount: 10, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2024-04-05'), DetailStatus: 'AVAIL', ProductID: 'P000000041' },
            // P000000042: Dây dắt nylon Petkit (CAT)
            { ProductDetailID: 85, DetailName: 'Màu đỏ', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2024-05-10'), DetailStatus: 'AVAIL', ProductID: 'P000000042' },
            { ProductDetailID: 86, DetailName: 'Màu xanh', Stock: 15, SoldCount: 5, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2024-05-10'), DetailStatus: 'AVAIL', ProductID: 'P000000042' },
            // P000000043: Bàn chải lông Trixie (DOG)
            { ProductDetailID: 87, DetailName: 'Loại mềm', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-06-15'), DetailStatus: 'AVAIL', ProductID: 'P000000043' },
            { ProductDetailID: 88, DetailName: 'Loại cứng', Stock: 20, SoldCount: 8, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-06-15'), DetailStatus: 'AVAIL', ProductID: 'P000000043' },
            // P000000044: Thức ăn khô BioPet 5kg (DOG, CAT)
            { ProductDetailID: 89, DetailName: 'Hương cá', Stock: 40, SoldCount: 15, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-07-01'), DetailStatus: 'AVAIL', ProductID: 'P000000044' },
            { ProductDetailID: 90, DetailName: 'Hương gà', Stock: 30, SoldCount: 12, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-07-01'), DetailStatus: 'AVAIL', ProductID: 'P000000044' },
            // P000000045: Cát hữu cơ Cat’s Best 2kg (CAT)
            { ProductDetailID: 91, DetailName: 'Hương tự nhiên', Stock: 50, SoldCount: 20, ExtraPrice: 0.00, Promotion: 0.15, CreatedAt: new Date('2024-08-05'), DetailStatus: 'AVAIL', ProductID: 'P000000045' },
            { ProductDetailID: 92, DetailName: 'Hương gỗ thông', Stock: 25, SoldCount: 10, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-08-05'), DetailStatus: 'AVAIL', ProductID: 'P000000045' },
            // P000000046: Vòng cổ chống ve rận Seresto (DOG)
            { ProductDetailID: 93, DetailName: 'Màu xám', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2024-09-10'), DetailStatus: 'AVAIL', ProductID: 'P000000046' },
            { ProductDetailID: 94, DetailName: 'Màu xanh', Stock: 15, SoldCount: 5, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2024-09-10'), DetailStatus: 'AVAIL', ProductID: 'P000000046' },
            // P000000047: Cần câu lông vũ Trixie (CAT)
            { ProductDetailID: 95, DetailName: 'Màu đỏ', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-10-15'), DetailStatus: 'AVAIL', ProductID: 'P000000047' },
            { ProductDetailID: 96, DetailName: 'Màu xanh', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 0.00, CreatedAt: new Date('2024-10-15'), DetailStatus: 'AVAIL', ProductID: 'P000000047' },
            // P000000048: Dây dắt da Trixie (DOG)
            { ProductDetailID: 97, DetailName: 'Màu nâu', Stock: 20, SoldCount: 8, ExtraPrice: 0.00, Promotion: 5, CreatedAt: new Date('2024-11-01'), DetailStatus: 'AVAIL', ProductID: 'P000000048' },
            { ProductDetailID: 98, DetailName: 'Màu đen', Stock: 15, SoldCount: 5, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-11-01'), DetailStatus: 'AVAIL', ProductID: 'P000000048' },
            // P000000049: Lược chải lông Trixie (DOG)
            { ProductDetailID: 99, DetailName: 'Loại mềm', Stock: 25, SoldCount: 10, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2024-12-05'), DetailStatus: 'AVAIL', ProductID: 'P000000049' },
            { ProductDetailID: 100, DetailName: 'Loại cứng', Stock: 20, SoldCount: 8, ExtraPrice: 10000.00, Promotion: 0.00, CreatedAt: new Date('2024-12-05'), DetailStatus: 'AVAIL', ProductID: 'P000000049' },
            // P000000050: Thức ăn khô Royal Canin 10kg (DOG, CAT)
            { ProductDetailID: 101, DetailName: 'Hương gà', Stock: 50, SoldCount: 20, ExtraPrice: 0.00, Promotion: 10, CreatedAt: new Date('2025-01-10'), DetailStatus: 'AVAIL', ProductID: 'P000000050' },
            { ProductDetailID: 102, DetailName: 'Hương cá', Stock: 40, SoldCount: 15, ExtraPrice: 15000.00, Promotion: 0.00, CreatedAt: new Date('2025-01-10'), DetailStatus: 'AVAIL', ProductID: 'P000000050' },
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('ProductDetail', null, {});
    }
};