'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert(
            'Service',
            [
                // Service 1: Khám tổng quát
                {
                    ServiceID: 1,
                    ServiceName: 'Khám tổng quát',
                    Price: 150000.00,
                    Duration: 30,
                    Description: 'Dịch vụ khám tổng quát cơ bản',
                },
                // Service 2: Tiêm phòng
                {
                    ServiceID: 2,
                    ServiceName: 'Tiêm phòng',
                    Price: 200000.00,
                    Duration: 45,
                    Description: 'Dịch vụ tiêm phòng cho thú cưng',
                },
                // Service 3: Phẫu thuật cơ bản
                {
                    ServiceID: 3,
                    ServiceName: 'Phẫu thuật cơ bản',
                    Price: 500000.00,
                    Duration: 60,
                    Description: 'Phẫu thuật cơ bản cho thú cưng',
                },
                // Service 4: Xét nghiệm
                {
                    ServiceID: 4,
                    ServiceName: 'Xét nghiệm',
                    Price: 100000.00,
                    Duration: 20,
                    Description: 'Xét nghiệm máu và sức khỏe tổng quát',
                },
            ],
            {}
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Service', null, {});
    },
};