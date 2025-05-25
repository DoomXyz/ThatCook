const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const saltRounds = 10;
        const defaultPassword = await bcrypt.hash('User123456', saltRounds);
        const createdAt = new Date();

        // Tạo 3 tài khoản khách hàng
        const accounts = [
            {
                AccountID: 'C00000001',
                AccountName: 'customer1',
                Email: 'customer1@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 1',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000001',
                Address: '123 Đường A, TP.HCM',
                Gender: 'M',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000002',
                AccountName: 'customer2',
                Email: 'customer2@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 2',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000002',
                Address: '124 Đường B, TP.HCM',
                Gender: 'F',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000003',
                AccountName: 'customer3',
                Email: 'customer3@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 3',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000003',
                Address: '125 Đường C, TP.HCM',
                Gender: 'M',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
        ];

        await queryInterface.bulkInsert('Account', accounts, {});

        // Tạo 3 thú cưng
        const pets = [
            {
                PetID: 'P00000001',
                PetName: 'Miu',
                AccountID: 'C00000001',
                PetType: 'CAT',
                PetGender: 'F',
                PetWeight: 4.5,
                Age: 2,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000002',
                PetName: 'Rex',
                AccountID: 'C00000002',
                PetType: 'DOG',
                PetGender: 'M',
                PetWeight: 10.0,
                Age: 3,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000003',
                PetName: 'Tweety',
                AccountID: 'C00000003',
                PetType: 'DOG',
                PetGender: 'F',
                PetWeight: 0.1,
                Age: 1,
                PetStatus: 'VALID',
            },
        ];

        await queryInterface.bulkInsert('Pet', pets, {});

        // Lấy dịch vụ hợp lệ từ bảng Service
        const service = await queryInterface.sequelize.query(
            'SELECT ServiceID FROM Service WHERE ServiceStatus = :status LIMIT 1',
            {
                replacements: { status: 'VALID' },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!service || service.length === 0) {
            throw new Error('Cần ít nhất 1 dịch vụ hợp lệ trong bảng Service!');
        }

        // Tạo 3 lịch hẹn PEND → CANCELED
        const appointments = [
            {
                AppointmentID: 'L00000001',
                CustomerName: 'Khách hàng 1',
                CustomerEmail: 'customer1@clinic.com',
                CustomerPhone: '0901000001',
                AppointmentDate: new Date('2025-06-01'),
                StartTime: '08:00',
                EndTime: '08:30',
                Notes: 'Khám tổng quát cho mèo',
                AccountID: 'C00000001',
                VeterinarianID: null,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000001',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000002',
                CustomerName: 'Khách hàng 2',
                CustomerEmail: 'customer2@clinic.com',
                CustomerPhone: '0901000002',
                AppointmentDate: new Date('2025-06-02'),
                StartTime: '09:00',
                EndTime: '09:30',
                Notes: 'Khám sức khỏe cho chó',
                AccountID: 'C00000002',
                VeterinarianID: null,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000002',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000003',
                CustomerName: 'Khách hàng 3',
                CustomerEmail: 'customer3@clinic.com',
                CustomerPhone: '0901000003',
                AppointmentDate: new Date('2025-06-03'),
                StartTime: '10:00',
                EndTime: '10:30',
                Notes: 'Khám định kỳ cho chim',
                AccountID: 'C00000003',
                VeterinarianID: null,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000003',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
        ];

        await queryInterface.bulkInsert('Appointment', appointments, {});
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('Appointment', { AppointmentID: ['L00000001', 'L00000002', 'L00000003'] }, {});
        await queryInterface.bulkDelete('Pet', { PetID: ['P00000001', 'P00000002', 'P00000003'] }, {});
        await queryInterface.bulkDelete('Account', { AccountID: ['C00000001', 'C00000002', 'C00000003'] }, {});
    },
};