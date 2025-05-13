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
            { Type: 'ShippingStatus', Code: 'PEND_CANCEL', CodeValueVI: 'Chờ hủy', ExtraValue: null, CodeID: 32 },
            { Type: 'ShippingStatus', Code: 'CANCELED', CodeValueVI: 'Đã hủy', ExtraValue: null, CodeID: 33 },

            // ShippingMethod
            { Type: 'ShippingMethod', Code: 'FAST', CodeValueVI: 'Giao hàng chuyển phát nhanh', ExtraValue: 30000, CodeID: 34 },
            { Type: 'ShippingMethod', Code: 'ECO', CodeValueVI: 'Giao hàng tiết kiệm', ExtraValue: 15000, CodeID: 35 },
            { Type: 'ShippingMethod', Code: 'EXPRESS', CodeValueVI: 'Giao hàng hỏa tốc', ExtraValue: 40000, CodeID: 36 },

            // CouponStatus
            { Type: 'CouponStatus', Code: 'ACTIVE', CodeValueVI: 'Hoạt động', ExtraValue: null, CodeID: 37 },
            { Type: 'CouponStatus', Code: 'EXPIRED', CodeValueVI: 'Hết hạn', ExtraValue: null, CodeID: 38 },

            // DiscountType
            { Type: 'DiscountType', Code: 'PERC', CodeValueVI: 'Phần trăm', ExtraValue: null, CodeID: 39 },
            { Type: 'DiscountType', Code: 'FIXED', CodeValueVI: 'Cố định', ExtraValue: null, CodeID: 40 },

            // AppointmentStatus
            { Type: 'AppointmentStatus', Code: 'PEND', CodeValueVI: 'Chờ xác nhận', ExtraValue: null, CodeID: 41 },
            { Type: 'AppointmentStatus', Code: 'CONF', CodeValueVI: 'Đã xác nhận', ExtraValue: null, CodeID: 42 },
            { Type: 'AppointmentStatus', Code: 'COMP', CodeValueVI: 'Đã hoàn thành', ExtraValue: null, CodeID: 43 },
            { Type: 'AppointmentStatus', Code: 'PEND_CANCEL', CodeValueVI: 'Chờ hủy', ExtraValue: null, CodeID: 44 },
            { Type: 'AppointmentStatus', Code: 'CANCELED', CodeValueVI: 'Đã hủy', ExtraValue: null, CodeID: 45 },

            // FuAppointmentStatus
            { Type: 'FuAppointmentStatus', Code: 'CONF', CodeValueVI: 'Đã xác nhận', ExtraValue: null, CodeID: 46 },
            { Type: 'FuAppointmentStatus', Code: 'COMP', CodeValueVI: 'Đã hoàn thành', ExtraValue: null, CodeID: 47 },
            { Type: 'FuAppointmentStatus', Code: 'PEND_CANCEL', CodeValueVI: 'Chờ hủy', ExtraValue: null, CodeID: 48 },
            { Type: 'FuAppointmentStatus', Code: 'CANCELED', CodeValueVI: 'Đã hủy', ExtraValue: null, CodeID: 49 },

            // BannerStatus
            { Type: 'BannerStatus', Code: 'SHOW', CodeValueVI: 'Hiển thị', ExtraValue: null, CodeID: 50 },
            { Type: 'BannerStatus', Code: 'HIDE', CodeValueVI: 'Ẩn', ExtraValue: null, CodeID: 51 },

            //CancelReason
            { Type: 'CancelReason', Code: 'OTHER', CodeValueVI: 'Khác', ExtraValue: null, CodeID: 52 },
            { Type: 'CancelReason', Code: 'CHANGE_MIND', CodeValueVI: 'Đổi ý không muốn mua nữa', ExtraValue: null, CodeID: 53 },
            { Type: 'CancelReason', Code: 'BETTER_PRICE', CodeValueVI: 'Tìm thấy giá tốt hơn ở nơi khác', ExtraValue: null, CodeID: 54 },
            { Type: 'CancelReason', Code: 'NOT_NEEDED', CodeValueVI: 'Sản phẩm không còn cần thiết', ExtraValue: null, CodeID: 55 },
            { Type: 'CancelReason', Code: 'ORDER_ERROR', CodeValueVI: 'Lỗi trong quá trình đặt hàng', ExtraValue: null, CodeID: 56 },
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('ALLCODES', null, {});
    }
};