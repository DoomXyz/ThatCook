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
                AccountID: 'C00000013',
                AccountName: 'customer13',
                Email: 'customer13@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 13',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000013',
                Address: '135 Đường M, TP.HCM',
                Gender: 'M',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000014',
                AccountName: 'customer14',
                Email: 'customer14@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 14',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000014',
                Address: '136 Đường N, TP.HCM',
                Gender: 'F',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000015',
                AccountName: 'customer15',
                Email: 'customer15@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 15',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000015',
                Address: '137 Đường O, TP.HCM',
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
                PetID: 'P00000013',
                PetName: 'Milo',
                AccountID: 'C00000013',
                PetType: 'CAT',
                PetGender: 'M',
                PetWeight: 4.2,
                Age: 2,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000014',
                PetName: 'Bella',
                AccountID: 'C00000014',
                PetType: 'DOG',
                PetGender: 'F',
                PetWeight: 10.5,
                Age: 3,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000015',
                PetName: 'Rio',
                AccountID: 'C00000015',
                PetType: 'DOG',
                PetGender: 'M',
                PetWeight: 0.13,
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

        // Tạo 3 lịch hẹn trước (FIRST, COMP) làm điều kiện cho tái khám
        const prevAppointments = [
            {
                AppointmentID: 'L00000013',
                CustomerName: 'Khách hàng 13',
                CustomerEmail: 'customer13@clinic.com',
                CustomerPhone: '0901000013',
                AppointmentDate: new Date('2025-06-01'),
                StartTime: '08:00',
                EndTime: '08:30',
                Notes: 'Khám tổng quát lần 1',
                AccountID: 'C00000013',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000013',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000014',
                CustomerName: 'Khách hàng 14',
                CustomerEmail: 'customer14@clinic.com',
                CustomerPhone: '0901000014',
                AppointmentDate: new Date('2025-06-02'),
                StartTime: '09:00',
                EndTime: '09:30',
                Notes: 'Khám sức khỏe lần 1',
                AccountID: 'C00000014',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000014',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000015',
                CustomerName: 'Khách hàng 15',
                CustomerEmail: 'customer15@clinic.com',
                CustomerPhone: '0901000015',
                AppointmentDate: new Date('2025-06-03'),
                StartTime: '10:00',
                EndTime: '10:30',
                Notes: 'Khám định kỳ lần 1',
                AccountID: 'C00000015',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000015',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
        ];

        await queryInterface.bulkInsert('Appointment', prevAppointments, {});

        // Tạo Schedule cho lịch hẹn trước
        const prevSchedules = [
            {
                ScheduleID: 'S00000007',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000013',
                Date: new Date('2025-06-01'),
                StartTime: '08:00',
                EndTime: '08:30',
                ScheduleStatus: 'COMP',
            },
            {
                ScheduleID: 'S00000008',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000014',
                Date: new Date('2025-06-02'),
                StartTime: '09:00',
                EndTime: '09:30',
                ScheduleStatus: 'COMP',
            },
            {
                ScheduleID: 'S00000009',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000015',
                Date: new Date('2025-06-03'),
                StartTime: '10:00',
                EndTime: '10:30',
                ScheduleStatus: 'COMP',
            },
        ];

        await queryInterface.bulkInsert('Schedule', prevSchedules, {});

        // Tạo AppointmentBill cho lịch hẹn trước
        const prevAppointmentBills = [
            {
                AppointmentBillID: 'LH0000004',
                AppointmentID: 'L00000013',
                ServicePrice: 200000,
                MedicalPrice: 50000,
                TotalPayment: 250000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Khám tổng quát lần 1',
                CreatedAt: createdAt,
            },
            {
                AppointmentBillID: 'LH0000005',
                AppointmentID: 'L00000014',
                ServicePrice: 250000,
                MedicalPrice: 75000,
                TotalPayment: 325000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Khám sức khỏe lần 1',
                CreatedAt: createdAt,
            },
            {
                AppointmentBillID: 'LH0000006',
                AppointmentID: 'L00000015',
                ServicePrice: 150000,
                MedicalPrice: 30000,
                TotalPayment: 180000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Khám định kỳ lần 1',
                CreatedAt: createdAt,
            },
        ];

        await queryInterface.bulkInsert('AppointmentBill', prevAppointmentBills, {});

        // Tạo 3 lịch tái khám CONF → CANCELED
        const appointments = [
            {
                AppointmentID: 'L00000016',
                CustomerName: 'Khách hàng 13',
                CustomerEmail: 'customer13@clinic.com',
                CustomerPhone: '0901000013',
                AppointmentDate: new Date('2025-06-10'),
                StartTime: '08:00',
                EndTime: '08:30',
                Notes: 'Tái khám cho mèo',
                AccountID: 'C00000013',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000013',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FOLLOW_UP',
                PrevAppointmentID: 'L00000013',
            },
            {
                AppointmentID: 'L00000017',
                CustomerName: 'Khách hàng 14',
                CustomerEmail: 'customer14@clinic.com',
                CustomerPhone: '0901000014',
                AppointmentDate: new Date('2025-06-11'),
                StartTime: '09:00',
                EndTime: '09:30',
                Notes: 'Tái khám cho chó',
                AccountID: 'C00000014',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000014',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FOLLOW_UP',
                PrevAppointmentID: 'L00000014',
            },
            {
                AppointmentID: 'L00000018',
                CustomerName: 'Khách hàng 15',
                CustomerEmail: 'customer15@clinic.com',
                CustomerPhone: '0901000015',
                AppointmentDate: new Date('2025-06-12'),
                StartTime: '10:00',
                EndTime: '10:30',
                Notes: 'Tái khám cho chim',
                AccountID: 'C00000015',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000015',
                CreatedAt: createdAt,
                AppointmentStatus: 'CANCELED',
                AppointmentType: 'FOLLOW_UP',
                PrevAppointmentID: 'L00000015',
            },
        ];

        await queryInterface.bulkInsert('Appointment', appointments, {});

        // Tạo Schedule (sẽ bị xóa khi hủy)
        const schedules = [
            {
                ScheduleID: 'S00000010',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000016',
                Date: new Date('2025-06-10'),
                StartTime: '08:00',
                EndTime: '08:30',
                ScheduleStatus: 'PEND',
            },
            {
                ScheduleID: 'S00000011',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000017',
                Date: new Date('2025-06-11'),
                StartTime: '09:00',
                EndTime: '09:30',
                ScheduleStatus: 'PEND',
            },
            {
                ScheduleID: 'S00000012',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000018',
                Date: new Date('2025-06-12'),
                StartTime: '10:00',
                EndTime: '10:30',
                ScheduleStatus: 'PEND',
            },
        ];

        await queryInterface.bulkInsert('Schedule', schedules, {});
        // Giả lập hủy bằng cách xóa Schedule
        await queryInterface.bulkDelete('Schedule', { AppointmentID: ['L00000016', 'L00000017', 'L00000018'] }, {});
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('AppointmentBill', { AppointmentBillID: ['LH0000004', 'LH0000005', 'LH0000006'] }, {});
        await queryInterface.bulkDelete('Schedule', { ScheduleID: ['S00000007', 'S00000008', 'S00000009'] }, {});
        await queryInterface.bulkDelete('Appointment', { AppointmentID: ['L00000013', 'L00000014', 'L00000015', 'L00000016', 'L00000017', 'L00000018'] }, {});
        await queryInterface.bulkDelete('Pet', { PetID: ['P00000013', 'P00000014', 'P00000015'] }, {});
        await queryInterface.bulkDelete('Account', { AccountID: ['C00000013', 'C00000014', 'C00000015'] }, {});
    },
};