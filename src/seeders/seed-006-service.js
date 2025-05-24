'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert(
            'Service',
            [
                // Khám tổng quát
                {
                    ServiceName: 'Khám tổng quát',
                    Price: 150000.00,
                    Duration: 30,
                    Description: 'Đánh giá sức khỏe tổng quát, kiểm tra tim mạch, hô hấp, da lông và ký sinh trùng.',
                    ServiceStatus: 'VALID',
                },
                // Tiêm phòng
                {
                    ServiceName: 'Tiêm phòng',
                    Price: 220000.00,
                    Duration: 45,
                    Description: 'Tiêm vaccine phòng bệnh dại, parvovirus, care cho chó hoặc FVRCP, calici cho mèo.',
                    ServiceStatus: 'VALID',
                },
                // Phẫu thuật triệt sản
                {
                    ServiceName: 'Phẫu thuật triệt sản',
                    Price: 600000.00,
                    Duration: 90,
                    Description: 'Thực hiện triệt sản an toàn, giảm nguy cơ bệnh sinh sản và hành vi không mong muốn.',
                    ServiceStatus: 'VALID',
                },
                // Xét nghiệm máu
                {
                    ServiceName: 'Xét nghiệm máu',
                    Price: 120000.00,
                    Duration: 20,
                    Description: 'Phân tích máu để phát hiện sớm bệnh ký sinh trùng, thiếu máu hoặc nhiễm trùng.',
                    ServiceStatus: 'VALID',
                },
                // Siêu âm chẩn đoán
                {
                    ServiceName: 'Siêu âm chẩn đoán',
                    Price: 250000.00,
                    Duration: 30,
                    Description: 'Chẩn đoán hình ảnh để kiểm tra cơ quan nội tạng, thai kỳ hoặc khối u.',
                    ServiceStatus: 'VALID',
                },
                // Điều trị ký sinh trùng
                {
                    ServiceName: 'Điều trị ký sinh trùng',
                    Price: 180000.00,
                    Duration: 30,
                    Description: 'Tẩy giun, kiểm soát ve rận và điều trị các bệnh ký sinh trùng khác.',
                    ServiceStatus: 'VALID',
                },
                // Chăm sóc răng miệng
                {
                    ServiceName: 'Chăm sóc răng miệng',
                    Price: 300000.00,
                    Duration: 60,
                    Description: 'Cạo vôi răng, nhổ răng hỏng, vệ sinh răng miệng để ngăn ngừa bệnh nha chu.',
                    ServiceStatus: 'VALID',
                },
                // Chụp X-quang
                {
                    ServiceName: 'Chụp X-quang',
                    Price: 350000.00,
                    Duration: 45,
                    Description: 'Chẩn đoán hình ảnh xương, khớp hoặc cơ quan nội tạng để phát hiện tổn thương.',
                    ServiceStatus: 'VALID',
                },
            ],
            {}
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Service', null, {});
    },
};