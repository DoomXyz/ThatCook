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
                AccountID: 'C00000010',
                AccountName: 'customer10',
                Email: 'customer10@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 10',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000010',
                Address: '132 Đường J, TP.HCM',
                Gender: 'F',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000011',
                AccountName: 'customer11',
                Email: 'customer11@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 11',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000011',
                Address: '133 Đường K, TP.HCM',
                Gender: 'M',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000012',
                AccountName: 'customer12',
                Email: 'customer12@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 12',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000012',
                Address: '134 Đường L, TP.HCM',
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
                PetID: 'P00000010',
                PetName: 'Kitty',
                AccountID: 'C00000010',
                PetType: 'CAT',
                PetGender: 'F',
                PetWeight: 4.0,
                Age: 2,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000011',
                PetName: 'Rocky',
                AccountID: 'C00000011',
                PetType: 'DOG',
                PetGender: 'M',
                PetWeight: 8.0,
                Age: 3,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000012',
                PetName: 'Sunny',
                AccountID: 'C00000012',
                PetType: 'DOG',
                PetGender: 'F',
                PetWeight: 0.11,
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

        // Tạo 3 lịch hẹn PEND → CONF → COMP
        const appointments = [
            {
                AppointmentID: 'L00000010',
                CustomerName: 'Khách hàng 10',
                CustomerEmail: 'customer10@clinic.com',
                CustomerPhone: '0901000010',
                AppointmentDate: new Date('2025-06-07'),
                StartTime: '08:00',
                EndTime: '08:30',
                Notes: 'Khám tổng quát cho mèo',
                AccountID: 'C00000010',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000010',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000011',
                CustomerName: 'Khách hàng 11',
                CustomerEmail: 'customer11@clinic.com',
                CustomerPhone: '0901000011',
                AppointmentDate: new Date('2025-06-08'),
                StartTime: '09:00',
                EndTime: '09:30',
                Notes: 'Khám sức khỏe cho chó',
                AccountID: 'C00000011',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000011',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000012',
                CustomerName: 'Khách hàng 12',
                CustomerEmail: 'customer12@clinic.com',
                CustomerPhone: '0901000012',
                AppointmentDate: new Date('2025-06-09'),
                StartTime: '10:00',
                EndTime: '10:30',
                Notes: 'Khám định kỳ cho chim',
                AccountID: 'C00000012',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000012',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
        ];

        await queryInterface.bulkInsert('Appointment', appointments, {});

        // Tạo Schedule
        const schedules = [
            {
                ScheduleID: 'S00000004',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000010',
                Date: new Date('2025-06-07'),
                StartTime: '08:00',
                EndTime: '08:30',
                ScheduleStatus: 'COMP',
            },
            {
                ScheduleID: 'S00000005',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000011',
                Date: new Date('2025-06-08'),
                StartTime: '09:00',
                EndTime: '09:30',
                ScheduleStatus: 'COMP',
            },
            {
                ScheduleID: 'S00000006',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000012',
                Date: new Date('2025-06-09'),
                StartTime: '10:00',
                EndTime: '10:30',
                ScheduleStatus: 'COMP',
            },
        ];

        await queryInterface.bulkInsert('Schedule', schedules, {});

        // Tạo AppointmentBill
        const appointmentBills = [
            {
                AppointmentBillID: 'LH0000001',
                AppointmentID: 'L00000010',
                ServicePrice: 200000,
                MedicalPrice: 50000,
                TotalPayment: 250000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Khám tổng quát, kê đơn thuốc',
                CreatedAt: createdAt,
            },
            {
                AppointmentBillID: 'LH0000002',
                AppointmentID: 'L00000011',
                ServicePrice: 250000,
                MedicalPrice: 75000,
                TotalPayment: 325000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Khám sức khỏe, tiêm ngừa',
                CreatedAt: createdAt,
            },
            {
                AppointmentBillID: 'LH0000003',
                AppointmentID: 'L00000012',
                ServicePrice: 150000,
                MedicalPrice: 30000,
                TotalPayment: 180000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Khám định kỳ, bổ sung vitamin',
                CreatedAt: createdAt,
            },
        ];

        await queryInterface.bulkInsert('AppointmentBill', appointmentBills, {});
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('AppointmentBill', { AppointmentBillID: ['LH0000001', 'LH0000002', 'LH0000003'] }, {});
        await queryInterface.bulkDelete('Schedule', { ScheduleID: ['S00000004', 'S00000005', 'S00000006'] }, {});
        await queryInterface.bulkDelete('Appointment', { AppointmentID: ['L00000010', 'L00000011', 'L00000012'] }, {});
        await queryInterface.bulkDelete('Pet', { PetID: ['P00000010', 'P00000011', 'P00000012'] }, {});
        await queryInterface.bulkDelete('Account', { AccountID: ['C00000010', 'C00000011', 'C00000012'] }, {});
    },
};