'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('ALLCODES', [
            // AccountType
            { Type: 'AccountType', Code: 'A', CodeValueVI: 'Quản trị viên', ExtraValue: null, CodeID: 1 },
            { Type: 'AccountType', Code: 'O', CodeValueVI: 'Chủ cửa hàng', ExtraValue: null, CodeID: 2 },
            { Type: 'AccountType', Code: 'V', CodeValueVI: 'Bác sĩ thú y', ExtraValue: null, CodeID: 3 },
            { Type: 'AccountType', Code: 'C', CodeValueVI: 'Khách hàng', ExtraValue: null, CodeID: 4 },

            // AccountStatus
            { Type: 'AccountStatus', Code: 'ACT', CodeValueVI: 'Kích hoạt', ExtraValue: null, CodeID: 5 },
            { Type: 'AccountStatus', Code: 'DIS', CodeValueVI: 'Đã khóa', ExtraValue: null, CodeID: 6 },

            // Gender
            { Type: 'Gender', Code: 'M', CodeValueVI: 'Nam', ExtraValue: null, CodeID: 7 },
            { Type: 'Gender', Code: 'F', CodeValueVI: 'Nữ', ExtraValue: null, CodeID: 8 },
            { Type: 'Gender', Code: 'O', CodeValueVI: 'Khác', ExtraValue: null, CodeID: 9 },

            // PetType
            { Type: 'PetType', Code: 'DOG', CodeValueVI: 'Chó', ExtraValue: null, CodeID: 10 },
            { Type: 'PetType', Code: 'CAT', CodeValueVI: 'Mèo', ExtraValue: null, CodeID: 11 },

            // PetGender
            { Type: 'PetGender', Code: 'M', CodeValueVI: 'Đực', ExtraValue: null, CodeID: 12 },
            { Type: 'PetGender', Code: 'F', CodeValueVI: 'Cái', ExtraValue: null, CodeID: 13 },

            // WorkingStatus
            { Type: 'WorkingStatus', Code: 'WORK', CodeValueVI: 'Đang làm việc', ExtraValue: null, CodeID: 14 },
            { Type: 'WorkingStatus', Code: 'LEAVE', CodeValueVI: 'Tạm nghỉ', ExtraValue: null, CodeID: 15 },

            // ProductType
            { Type: 'ProductType', Code: 'FOOD', CodeValueVI: 'Thức ăn', ExtraValue: null, CodeID: 16 },
            { Type: 'ProductType', Code: 'LITTER', CodeValueVI: 'Cát vệ sinh', ExtraValue: null, CodeID: 17 },
            { Type: 'ProductType', Code: 'COLLAR', CodeValueVI: 'Vòng cổ', ExtraValue: null, CodeID: 18 },
            { Type: 'ProductType', Code: 'LEASH', CodeValueVI: 'Dây dắt', ExtraValue: null, CodeID: 19 },
            { Type: 'ProductType', Code: 'TOY', CodeValueVI: 'Đồ chơi', ExtraValue: null, CodeID: 20 },
            { Type: 'ProductType', Code: 'GROOM', CodeValueVI: 'Dụng cụ chải lông', ExtraValue: null, CodeID: 21 },

            // DetailStatus
            { Type: 'DetailStatus', Code: 'AVAIL', CodeValueVI: 'Còn hàng', ExtraValue: null, CodeID: 22 },
            { Type: 'DetailStatus', Code: 'OUT', CodeValueVI: 'Hết hàng', ExtraValue: null, CodeID: 23 },
            { Type: 'DetailStatus', Code: 'DISC', CodeValueVI: 'Ngừng kinh doanh', ExtraValue: null, CodeID: 24 },

            // PaymentType
            { Type: 'PaymentType', Code: 'CASH', CodeValueVI: 'Thanh toán trực tiếp', ExtraValue: null, CodeID: 25 },
            { Type: 'PaymentType', Code: 'CARD', CodeValueVI: 'Thanh toán bằng thẻ', ExtraValue: null, CodeID: 26 },

            // PaymentStatus
            { Type: 'PaymentStatus', Code: 'PEND', CodeValueVI: 'Chờ thanh toán', ExtraValue: null, CodeID: 27 },
            { Type: 'PaymentStatus', Code: 'PAID', CodeValueVI: 'Đã thanh toán', ExtraValue: null, CodeID: 28 },
            { Type: 'PaymentStatus', Code: 'FAIL', CodeValueVI: 'Thanh toán thất bại', ExtraValue: null, CodeID: 29 },

            // ShippingStatus
            { Type: 'ShippingStatus', Code: 'PEND', CodeValueVI: 'Chờ giao hàng', ExtraValue: null, CodeID: 30 },
            { Type: 'ShippingStatus', Code: 'DELI', CodeValueVI: 'Đã nhận hàng', ExtraValue: null, CodeID: 31 },
            { Type: 'ShippingStatus', Code: 'CANCEL', CodeValueVI: 'Đã hủy', ExtraValue: null, CodeID: 32 },

            // ShippingMethod
            { Type: 'ShippingMethod', Code: 'FAST', CodeValueVI: 'Giao hàng chuyển phát nhanh', ExtraValue: 30000, CodeID: 33 },
            { Type: 'ShippingMethod', Code: 'ECO', CodeValueVI: 'Giao hàng tiết kiệm', ExtraValue: 15000, CodeID: 34 },
            { Type: 'ShippingMethod', Code: 'EXPRESS', CodeValueVI: 'Giao hàng hỏa tốc', ExtraValue: 40000, CodeID: 35 },

            // CouponStatus
            { Type: 'CouponStatus', Code: 'ACTIVE', CodeValueVI: 'Hoạt động', ExtraValue: null, CodeID: 36 },
            { Type: 'CouponStatus', Code: 'EXPIRED', CodeValueVI: 'Hết hạn', ExtraValue: null, CodeID: 37 },

            // DiscountType
            { Type: 'DiscountType', Code: 'PERC', CodeValueVI: 'Phần trăm', ExtraValue: null, CodeID: 38 },
            { Type: 'DiscountType', Code: 'FIXED', CodeValueVI: 'Cố định', ExtraValue: null, CodeID: 39 },

            // AppointmentStatus
            { Type: 'AppointmentStatus', Code: 'PEND', CodeValueVI: 'Chờ xác nhận', ExtraValue: null, CodeID: 40 },
            { Type: 'AppointmentStatus', Code: 'CONF', CodeValueVI: 'Đã xác nhận', ExtraValue: null, CodeID: 41 },
            { Type: 'AppointmentStatus', Code: 'COMP', CodeValueVI: 'Đã hoàn thành', ExtraValue: null, CodeID: 42 },
            { Type: 'AppointmentStatus', Code: 'CANCEL', CodeValueVI: 'Đã hủy', ExtraValue: null, CodeID: 43 },

            // FuAppointment (FuAppointmentStatus)
            { Type: 'FuAppointment', Code: 'CONF', CodeValueVI: 'Đã xác nhận', ExtraValue: null, CodeID: 44 },
            { Type: 'FuAppointment', Code: 'COMP', CodeValueVI: 'Đã hoàn thành', ExtraValue: null, CodeID: 45 },
            { Type: 'FuAppointment', Code: 'CANCEL', CodeValueVI: 'Đã hủy', ExtraValue: null, CodeID: 46 },

            // BannerStatus
            { Type: 'BannerStatus', Code: 'SHOW', CodeValueVI: 'Hiển thị', ExtraValue: null, CodeID: 47 },
            { Type: 'BannerStatus', Code: 'HIDE', CodeValueVI: 'Ẩn', ExtraValue: null, CodeID: 48 },
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('ALLCODES', null, {});
    }
};