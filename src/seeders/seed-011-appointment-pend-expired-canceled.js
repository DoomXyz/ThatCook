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
                AccountID: 'C00000004',
                AccountName: 'customer4',
                Email: 'customer4@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 4',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000004',
                Address: '126 Đường D, TP.HCM',
                Gender: 'F',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000005',
                AccountName: 'customer5',
                Email: 'customer5@clinic.com',
                Password: defaultPassword,
                UserName: 'Khák hàng 5',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000005',
                Address: '127 Đường E, TP.HCM',
                Gender: 'M',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000006',
                AccountName: 'customer6',
                Email: 'customer6@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 6',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000006',
                Address: '128 Đường F, TP.HCM',
                Gender: 'F',
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
                PetID: 'P00000004',
                PetName: 'Luna',
                AccountID: 'C00000004',
                PetType: 'CAT',
                PetGender: 'F',
                PetWeight: 3.8,
                Age: 1,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000005',
                PetName: 'Max',
                AccountID: 'C00000005',
                PetType: 'DOG',
                PetGender: 'M',
                PetWeight: 15.0,
                Age: 4,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000006',
                PetName: 'Coco',
                AccountID: 'C00000006',
                PetType: 'DOG',
                PetGender: 'M',
                PetWeight: 0.15,
                Age: 2,
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

        // Tạo 3 lịch hẹn PEND → Quá hạn → CANCELED
        const appointments = [
            {
                AppointmentID: 'L00000004',
                CustomerName: 'Khách hàng 4',
                CustomerEmail: 'customer4@clinic.com',
                CustomerPhone: '0901000004',
                AppointmentDate: new Date('2025-05-20'), // Ngày đã qua
                StartTime: '08:00',
                EndTime: '08:30',
                Notes: 'Khám tổng quát cho mèo',
                AccountID: 'C00000004',
                VeterinarianID: null,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000004',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000005',
                CustomerName: 'Khách hàng 5',
                CustomerEmail: 'customer5@clinic.com',
                CustomerPhone: '0901000005',
                AppointmentDate: new Date('2025-05-21'), // Ngày đã qua
                StartTime: '09:00',
                EndTime: '09:30',
                Notes: 'Khám sức khỏe cho chó',
                AccountID: 'C00000005',
                VeterinarianID: null,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000005',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000006',
                CustomerName: 'Khách hàng 6',
                CustomerEmail: 'customer6@clinic.com',
                CustomerPhone: '0901000006',
                AppointmentDate: new Date('2025-05-22'), // Ngày đã qua
                StartTime: '10:00',
                EndTime: '10:30',
                Notes: 'Khám định kỳ cho chim',
                AccountID: 'C00000006',
                VeterinarianID: null,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000006',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
        ];

        await queryInterface.bulkInsert('Appointment', appointments, {});
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('Appointment', { AppointmentID: ['L00000004', 'L00000005', 'L00000006'] }, {});
        await queryInterface.bulkDelete('Pet', { PetID: ['P00000004', 'P00000005', 'P00000006'] }, {});
        await queryInterface.bulkDelete('Account', { AccountID: ['C00000004', 'C00000005', 'C00000006'] }, {});
    },
};