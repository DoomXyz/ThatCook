'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'AllCodes',
      [
        // AccountType
        { Type: 'AccountType', Code: 'A', CodeValueVI: 'Quản trị viên', ExtraValue: null },
        { Type: 'AccountType', Code: 'O', CodeValueVI: 'Chủ cửa hàng', ExtraValue: null },
        { Type: 'AccountType', Code: 'V', CodeValueVI: 'Bác sĩ thú y', ExtraValue: null },
        { Type: 'AccountType', Code: 'C', CodeValueVI: 'Khách hàng', ExtraValue: null },

        // AccountStatus
        { Type: 'AccountStatus', Code: 'ACT', CodeValueVI: 'Kích hoạt', ExtraValue: null },
        { Type: 'AccountStatus', Code: 'DIS', CodeValueVI: 'Đã khóa', ExtraValue: null },

        // Gender
        { Type: 'Gender', Code: 'M', CodeValueVI: 'Nam', ExtraValue: null },
        { Type: 'Gender', Code: 'F', CodeValueVI: 'Nữ', ExtraValue: null },
        { Type: 'Gender', Code: 'O', CodeValueVI: 'Khác', ExtraValue: null },

        // PetType
        { Type: 'PetType', Code: 'DOG', CodeValueVI: 'Chó', ExtraValue: null },
        { Type: 'PetType', Code: 'CAT', CodeValueVI: 'Mèo', ExtraValue: null },

        // PetGender
        { Type: 'PetGender', Code: 'M', CodeValueVI: 'Đực', ExtraValue: null },
        { Type: 'PetGender', Code: 'F', CodeValueVI: 'Cái', ExtraValue: null },

        // WorkingStatus
        { Type: 'WorkingStatus', Code: 'WORK', CodeValueVI: 'Đang làm việc', ExtraValue: null },
        { Type: 'WorkingStatus', Code: 'LEAVE', CodeValueVI: 'Tạm nghỉ', ExtraValue: null },

        // ProductType
        { Type: 'ProductType', Code: 'FOOD', CodeValueVI: 'Thức ăn', ExtraValue: null },
        { Type: 'ProductType', Code: 'LITTER', CodeValueVI: 'Cát vệ sinh', ExtraValue: null },
        { Type: 'ProductType', Code: 'COLLAR', CodeValueVI: 'Vòng cổ', ExtraValue: null },
        { Type: 'ProductType', Code: 'LEASH', CodeValueVI: 'Dây dắt', ExtraValue: null },
        { Type: 'ProductType', Code: 'TOY', CodeValueVI: 'Đồ chơi', ExtraValue: null },
        { Type: 'ProductType', Code: 'GROOM', CodeValueVI: 'Dụng cụ chải lông', ExtraValue: null },

        // DetailStatus
        { Type: 'DetailStatus', Code: 'AVAIL', CodeValueVI: 'Còn hàng', ExtraValue: null },
        { Type: 'DetailStatus', Code: 'OUT', CodeValueVI: 'Hết hàng', ExtraValue: null },
        { Type: 'DetailStatus', Code: 'DISC', CodeValueVI: 'Ngừng kinh doanh', ExtraValue: null },

        // PaymentType
        { Type: 'PaymentType', Code: 'CASH', CodeValueVI: 'Tiền mặt', ExtraValue: null },
        { Type: 'PaymentType', Code: 'CARD', CodeValueVI: 'Thanh toán bằng thẻ', ExtraValue: null },

        // PaymentStatus
        { Type: 'PaymentStatus', Code: 'PEND', CodeValueVI: 'Chờ thanh toán', ExtraValue: null },
        { Type: 'PaymentStatus', Code: 'PAID', CodeValueVI: 'Đã thanh toán', ExtraValue: null },
        { Type: 'PaymentStatus', Code: 'FAIL', CodeValueVI: 'Thanh toán thất bại', ExtraValue: null },

        // ShippingStatus
        { Type: 'ShippingStatus', Code: 'PEND', CodeValueVI: 'Chờ giao hàng', ExtraValue: null },
        { Type: 'ShippingStatus', Code: 'DELI', CodeValueVI: 'Đã giao hàng', ExtraValue: null },
        { Type: 'ShippingStatus', Code: 'PEND_CANCEL', CodeValueVI: 'Chờ hủy', ExtraValue: null },
        { Type: 'ShippingStatus', Code: 'CANCELED', CodeValueVI: 'Đã hủy', ExtraValue: null },

        // ShippingMethod
        { Type: 'ShippingMethod', Code: 'FAST', CodeValueVI: 'Giao hàng chuyển phát nhanh', ExtraValue: 30000.00 },
        { Type: 'ShippingMethod', Code: 'ECO', CodeValueVI: 'Giao hàng tiết kiệm', ExtraValue: 15000.00 },
        { Type: 'ShippingMethod', Code: 'EXPRESS', CodeValueVI: 'Giao hàng hỏa tốc', ExtraValue: 40000.00 },

        // CouponStatus
        { Type: 'CouponStatus', Code: 'ACTIVE', CodeValueVI: 'Hoạt động', ExtraValue: null },
        { Type: 'CouponStatus', Code: 'EXPIRED', CodeValueVI: 'Hết hạn', ExtraValue: null },

        // DiscountType
        { Type: 'DiscountType', Code: 'PERC', CodeValueVI: 'Phần trăm', ExtraValue: null },
        { Type: 'DiscountType', Code: 'FIXED', CodeValueVI: 'Cố định', ExtraValue: null },

        // AppointmentStatus
        { Type: 'AppointmentStatus', Code: 'PEND', CodeValueVI: 'Chờ xác nhận', ExtraValue: null },
        { Type: 'AppointmentStatus', Code: 'CONF', CodeValueVI: 'Đã xác nhận', ExtraValue: null },
        { Type: 'AppointmentStatus', Code: 'COMP', CodeValueVI: 'Đã hoàn thành', ExtraValue: null },
        { Type: 'AppointmentStatus', Code: 'CANCELED', CodeValueVI: 'Đã hủy', ExtraValue: null },

        // AppointmentType
        { Type: 'AppointmentType', Code: 'FIRST', CodeValueVI: 'Lần đầu', ExtraValue: null },
        { Type: 'AppointmentType', Code: 'FOLLOW_UP', CodeValueVI: 'Tái khám', ExtraValue: null },

        // BannerStatus
        { Type: 'BannerStatus', Code: 'SHOW', CodeValueVI: 'Hiển thị', ExtraValue: null },
        { Type: 'BannerStatus', Code: 'HIDE', CodeValueVI: 'Ẩn', ExtraValue: null },

        // CancelReason
        { Type: 'CancelReason', Code: 'OTHER', CodeValueVI: 'Khác', ExtraValue: null },
        { Type: 'CancelReason', Code: 'CHANGE_MIND', CodeValueVI: 'Đổi ý không muốn mua nữa', ExtraValue: null },
        { Type: 'CancelReason', Code: 'BETTER_PRICE', CodeValueVI: 'Tìm thấy giá tốt hơn ở nơi khác', ExtraValue: null },
        { Type: 'CancelReason', Code: 'NOT_NEEDED', CodeValueVI: 'Sản phẩm không còn cần thiết', ExtraValue: null },
        { Type: 'CancelReason', Code: 'ORDER_ERROR', CodeValueVI: 'Lỗi trong quá trình đặt hàng', ExtraValue: null },

        // ScheduleStatus
        { Type: 'ScheduleStatus', Code: 'PEND', CodeValueVI: 'Chờ khám', ExtraValue: null },
        { Type: 'ScheduleStatus', Code: 'COMP', CodeValueVI: 'Đã khám', ExtraValue: null },
        { Type: 'ScheduleStatus', Code: 'CANCELED', CodeValueVI: 'Đã bị hủy', ExtraValue: null },

        // PetStatus
        { Type: 'PetStatus', Code: 'VALID', CodeValueVI: 'Hiện diện', ExtraValue: null },
        { Type: 'PetStatus', Code: 'DELET', CodeValueVI: 'Đã xóa', ExtraValue: null },

        // ServiceStatus
        { Type: 'ServiceStatus', Code: 'VALID', CodeValueVI: 'Hoạt động', ExtraValue: null },
        { Type: 'ServiceStatus', Code: 'INVALID', CodeValueVI: 'Tạm dừng', ExtraValue: null },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('AllCodes', null, {});
  },
};