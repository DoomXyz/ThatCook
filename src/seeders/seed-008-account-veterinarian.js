const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const saltRounds = 10;
        const defaultPassword = await bcrypt.hash('Vet123456', saltRounds); // Mật khẩu mặc định cho tất cả bác sĩ
        const accountType = 'V'; // Veterinarian
        const accountStatus = 'ACT'; // Active
        const createdAt = new Date();

        // Tạo 10 tài khoản bác sĩ
        const accounts = Array.from({ length: 10 }, (_, index) => ({
            AccountID: `V${String(index + 1).padStart(8, '0')}`,
            AccountName: `vet${index + 1}`,
            Email: `vet${index + 1}@clinic.com`,
            Password: defaultPassword,
            UserName: `${String.fromCharCode(65 + index)} Bác sĩ ${index + 1}`,
            UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
            Phone: `090${String(1000000 + index).padStart(7, '0')}`,
            Address: `Địa chỉ ${index + 1}, TP.HCM`,
            Gender: index % 2 === 0 ? 'M' : 'F', // Ngẫu nhiên nam/nữ
            LoginAttempt: 0,
            LockUntil: null,
            CreatedAt: createdAt,
            AccountStatus: accountStatus,
            AccountType: accountType,
        }));

        await queryInterface.bulkInsert('Account', accounts, {});

        // Tạo thông tin bác sĩ thú y
        const vetInfos = accounts.map((account, index) => ({
            AccountID: account.AccountID,
            Bio: `Bác sĩ thú y với ${5 + index} năm kinh nghiệm`,
            Specialization: ['Thú nhỏ', 'Thú lớn', 'Chim', 'Bò sát'][index % 4], // Ngẫu nhiên chuyên môn
            WorkingStatus: index % 3 === 0 ? 'WORK' : 'LEAVE', // Ngẫu nhiên trạng thái
        }));

        await queryInterface.bulkInsert('VeterinarianInfo', vetInfos, {});

        // Lấy danh sách dịch vụ từ bảng Service
        const services = await queryInterface.sequelize.query(
            'SELECT ServiceID FROM Service WHERE ServiceStatus = :status',
            {
                replacements: { status: 'VALID' },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!services || services.length < 3) {
            throw new Error('Cần ít nhất 3 dịch vụ hợp lệ trong bảng Service!');
        }

        // Gán ngẫu nhiên 3-7 dịch vụ cho mỗi bác sĩ
        const vetServices = [];
        accounts.forEach((account) => {
            const numServices = Math.floor(Math.random() * 5) + 3; // 3-7 dịch vụ
            const shuffledServices = services.sort(() => 0.5 - Math.random()).slice(0, numServices);
            shuffledServices.forEach((service) => {
                vetServices.push({
                    VeterinarianID: account.AccountID,
                    ServiceID: service.ServiceID,
                });
            });
        });

        await queryInterface.bulkInsert('VeterinarianService', vetServices, {});
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('VeterinarianService', null, {});
        await queryInterface.bulkDelete('VeterinarianInfo', null, {});
        await queryInterface.bulkDelete('Account', { AccountType: 'V' }, {});
    },
};