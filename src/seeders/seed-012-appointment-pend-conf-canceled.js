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
                AccountID: 'C00000007',
                AccountName: 'customer7',
                Email: 'customer7@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 7',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000007',
                Address: '129 Đường G, TP.HCM',
                Gender: 'M',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000008',
                AccountName: 'customer8',
                Email: 'customer8@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 8',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000008',
                Address: '130 Đường H, TP.HCM',
                Gender: 'F',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000009',
                AccountName: 'customer9',
                Email: 'customer9@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 9',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000009',
                Address: '131 Đường I, TP.HCM',
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
                PetID: 'P00000007',
                PetName: 'Simba',
                AccountID: 'C00000007',
                PetType: 'CAT',
                PetGender: 'M',
                PetWeight: 5.0,
                Age: 3,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000008',
                PetName: 'Buddy',
                AccountID: 'C00000008',
                PetType: 'DOG',
                PetGender: 'M',
                PetWeight: 12.0,
                Age: 2,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000009',
                PetName: 'Polly',
                AccountID: 'C00000009',
                PetType: 'DOG',
                PetGender: 'F',
                PetWeight: 0.12,
                Age: 1,
                PetStatus: 'VALID',
            },
        ];

        await queryInterface.bulkInsert('Pet', pets, {});

        // Lấy bác sĩ và dịch vụ hợp lệ
        const vet = await queryInterface.sequelize.query(
            'SELECT AccountID FROM Account WHERE AccountType = :type LIMIT 1',
            {
                replacements: { type: 'V' },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!vet || vet.length === 0) {
            throw new Error('Cần ít nhất 1 bác sĩ hợp lệ trong bảng Account!');
        }

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

        // Tạo 3 lịch hẹn PEND → CONF → CANCELED
        const appointments = [
            {
                AppointmentID: 'L00000007',
                CustomerName: 'Khách hàng 7',
                CustomerEmail: 'customer7@clinic.com',
                CustomerPhone: '0901000007',
                AppointmentDate: new Date('2025-06-04'),
                StartTime: '08:00',
                EndTime: '08:30',
                Notes: 'Khám tổng quát cho mèo',
                AccountID: 'C00000007',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000007',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000008',
                CustomerName: 'Khách hàng 8',
                CustomerEmail: 'customer8@clinic.com',
                CustomerPhone: '0901000008',
                AppointmentDate: new Date('2025-06-05'),
                StartTime: '09:00',
                EndTime: '09:30',
                Notes: 'Khám sức khỏe cho chó',
                AccountID: 'C00000008',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000008',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000009',
                CustomerName: 'Khách hàng 9',
                CustomerEmail: 'customer9@clinic.com',
                CustomerPhone: '0901000009',
                AppointmentDate: new Date('2025-06-06'),
                StartTime: '10:00',
                EndTime: '10:30',
                Notes: 'Khám định kỳ cho chim',
                AccountID: 'C00000009',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000009',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
        ];

        await queryInterface.bulkInsert('Appointment', appointments, {});

        // Tạo Schedule (sẽ bị xóa khi hủy)
        const schedules = [
            {
                ScheduleID: 'S00000001',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000007',
                Date: new Date('2025-06-04'),
                StartTime: '08:00',
                EndTime: '08:30',
                ScheduleStatus: 'PEND',
            },
            {
                ScheduleID: 'S00000002',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000008',
                Date: new Date('2025-06-05'),
                StartTime: '09:00',
                EndTime: '09:30',
                ScheduleStatus: 'PEND',
            },
            {
                ScheduleID: 'S00000003',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000009',
                Date: new Date('2025-06-06'),
                StartTime: '10:00',
                EndTime: '10:30',
                ScheduleStatus: 'PEND',
            },
        ];

        await queryInterface.bulkInsert('Schedule', schedules, {});
        // Giả lập hủy bằng cách xóa Schedule
        await queryInterface.bulkDelete('Schedule', { AppointmentID: ['L00000007', 'L00000008', 'L00000009'] }, {});
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('Appointment', { AppointmentID: ['L00000007', 'L00000008', 'L00000009'] }, {});
        await queryInterface.bulkDelete('Pet', { PetID: ['P00000007', 'P00000008', 'P00000009'] }, {});
        await queryInterface.bulkDelete('Account', { AccountID: ['C00000007', 'C00000008', 'C00000009'] }, {});
    },
};