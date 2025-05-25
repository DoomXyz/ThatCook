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
                AccountID: 'C00000016',
                AccountName: 'customer16',
                Email: 'customer16@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 16',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000016',
                Address: '138 Đường P, TP.HCM',
                Gender: 'F',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000017',
                AccountName: 'customer17',
                Email: 'customer17@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 17',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000017',
                Address: '139 Đường Q, TP.HCM',
                Gender: 'M',
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: 'ACT',
                AccountType: 'C',
            },
            {
                AccountID: 'C00000018',
                AccountName: 'customer18',
                Email: 'customer18@clinic.com',
                Password: defaultPassword,
                UserName: 'Khách hàng 18',
                UserImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg',
                Phone: '0901000018',
                Address: '140 Đường R, TP.HCM',
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
                PetID: 'P00000016',
                PetName: 'Snow',
                AccountID: 'C00000016',
                PetType: 'CAT',
                PetGender: 'F',
                PetWeight: 3.5,
                Age: 2,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000017',
                PetName: 'Duke',
                AccountID: 'C00000017',
                PetType: 'DOG',
                PetGender: 'M',
                PetWeight: 14.0,
                Age: 4,
                PetStatus: 'VALID',
            },
            {
                PetID: 'P00000018',
                PetName: 'Sky',
                AccountID: 'C00000018',
                PetType: 'DOG',
                PetGender: 'F',
                PetWeight: 0.14,
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
                AppointmentID: 'L00000019',
                CustomerName: 'Khách hàng 16',
                CustomerEmail: 'customer16@clinic.com',
                CustomerPhone: '0901000016',
                AppointmentDate: new Date('2025-06-04'),
                StartTime: '08:00',
                EndTime: '08:30',
                Notes: 'Khám tổng quát lần 1',
                AccountID: 'C00000016',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000016',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000020',
                CustomerName: 'Khách hàng 17',
                CustomerEmail: 'customer17@clinic.com',
                CustomerPhone: '0901000017',
                AppointmentDate: new Date('2025-06-05'),
                StartTime: '09:00',
                EndTime: '09:30',
                Notes: 'Khám sức khỏe lần 1',
                AccountID: 'C00000017',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000017',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FIRST',
                PrevAppointmentID: null,
            },
            {
                AppointmentID: 'L00000021',
                CustomerName: 'Khách hàng 18',
                CustomerEmail: 'customer18@clinic.com',
                CustomerPhone: '0901000018',
                AppointmentDate: new Date('2025-06-06'),
                StartTime: '10:00',
                EndTime: '10:30',
                Notes: 'Khám định kỳ lần 1',
                AccountID: 'C00000018',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000018',
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
                ScheduleID: 'S00000013',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000019',
                Date: new Date('2025-06-04'),
                StartTime: '08:00',
                EndTime: '08:30',
                ScheduleStatus: 'COMP',
            },
            {
                ScheduleID: 'S00000014',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000020',
                Date: new Date('2025-06-05'),
                StartTime: '09:00',
                EndTime: '09:30',
                ScheduleStatus: 'COMP',
            },
            {
                ScheduleID: 'S00000015',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000021',
                Date: new Date('2025-06-06'),
                StartTime: '10:00',
                EndTime: '10:30',
                ScheduleStatus: 'COMP',
            },
        ];

        await queryInterface.bulkInsert('Schedule', prevSchedules, {});

        // Tạo AppointmentBill cho lịch hẹn trước
        const prevAppointmentBills = [
            {
                AppointmentBillID: 'LH0000007',
                AppointmentID: 'L00000019',
                ServicePrice: 200000,
                MedicalPrice: 50000,
                TotalPayment: 250000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Khám tổng quát lần 1',
                CreatedAt: createdAt,
            },
            {
                AppointmentBillID: 'LH0000008',
                AppointmentID: 'L00000020',
                ServicePrice: 250000,
                MedicalPrice: 75000,
                TotalPayment: 325000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Khám sức khỏe lần 1',
                CreatedAt: createdAt,
            },
            {
                AppointmentBillID: 'LH0000009',
                AppointmentID: 'L00000021',
                ServicePrice: 150000,
                MedicalPrice: 30000,
                TotalPayment: 180000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Khám định kỳ lần 1',
                CreatedAt: createdAt,
            },
        ];

        await queryInterface.bulkInsert('AppointmentBill', prevAppointmentBills, {});

        // Tạo 3 lịch tái khám CONF → COMP
        const appointments = [
            {
                AppointmentID: 'L00000022',
                CustomerName: 'Khách hàng 16',
                CustomerEmail: 'customer16@clinic.com',
                CustomerPhone: '0901000016',
                AppointmentDate: new Date('2025-06-13'),
                StartTime: '08:00',
                EndTime: '08:30',
                Notes: 'Tái khám cho mèo',
                AccountID: 'C00000016',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000016',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FOLLOW_UP',
                PrevAppointmentID: 'L00000019',
            },
            {
                AppointmentID: 'L00000023',
                CustomerName: 'Khách hàng 17',
                CustomerEmail: 'customer17@clinic.com',
                CustomerPhone: '0901000017',
                AppointmentDate: new Date('2025-06-14'),
                StartTime: '09:00',
                EndTime: '09:30',
                Notes: 'Tái khám cho chó',
                AccountID: 'C00000017',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000017',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FOLLOW_UP',
                PrevAppointmentID: 'L00000020',
            },
            {
                AppointmentID: 'L00000024',
                CustomerName: 'Khách hàng 18',
                CustomerEmail: 'customer18@clinic.com',
                CustomerPhone: '0901000018',
                AppointmentDate: new Date('2025-06-15'),
                StartTime: '10:00',
                EndTime: '10:30',
                Notes: 'Tái khám cho chim',
                AccountID: 'C00000018',
                VeterinarianID: vet[0].AccountID,
                ServiceID: service[0].ServiceID,
                PetID: 'P00000018',
                CreatedAt: createdAt,
                AppointmentStatus: 'COMP',
                AppointmentType: 'FOLLOW_UP',
                PrevAppointmentID: 'L00000021',
            },
        ];

        await queryInterface.bulkInsert('Appointment', appointments, {});

        // Tạo Schedule
        const schedules = [
            {
                ScheduleID: 'S00000016',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000022',
                Date: new Date('2025-06-13'),
                StartTime: '08:00',
                EndTime: '08:30',
                ScheduleStatus: 'COMP',
            },
            {
                ScheduleID: 'S00000017',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000023',
                Date: new Date('2025-06-14'),
                StartTime: '09:00',
                EndTime: '09:30',
                ScheduleStatus: 'COMP',
            },
            {
                ScheduleID: 'S00000018',
                VeterinarianID: vet[0].AccountID,
                AppointmentID: 'L00000024',
                Date: new Date('2025-06-15'),
                StartTime: '10:00',
                EndTime: '10:30',
                ScheduleStatus: 'COMP',
            },
        ];

        await queryInterface.bulkInsert('Schedule', schedules, {});

        // Tạo AppointmentBill
        const appointmentBills = [
            {
                AppointmentBillID: 'LH0000010',
                AppointmentID: 'L00000022',
                ServicePrice: 200000,
                MedicalPrice: 50000,
                TotalPayment: 250000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Tái khám, kiểm tra sức khỏe',
                CreatedAt: createdAt,
            },
            {
                AppointmentBillID: 'LH0000011',
                AppointmentID: 'L00000023',
                ServicePrice: 250000,
                MedicalPrice: 75000,
                TotalPayment: 325000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Tái khám, tiêm ngừa bổ sung',
                CreatedAt: createdAt,
            },
            {
                AppointmentBillID: 'LH0000012',
                AppointmentID: 'L00000024',
                ServicePrice: 150000,
                MedicalPrice: 30000,
                TotalPayment: 180000,
                MedicalImage: 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/sample.jpg',
                MedicalNotes: 'Tái khám, bổ sung vitamin',
                CreatedAt: createdAt,
            },
        ];

        await queryInterface.bulkInsert('AppointmentBill', appointmentBills, {});
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('AppointmentBill', { AppointmentBillID: ['LH0000007', 'LH0000008', 'LH0000009', 'LH0000010', 'LH0000011', 'LH0000012'] }, {});
        await queryInterface.bulkDelete('Schedule', { ScheduleID: ['S00000013', 'S00000014', 'S00000015', 'S00000016', 'S00000017', 'S00000018'] }, {});
        await queryInterface.bulkDelete('Appointment', { AppointmentID: ['L00000019', 'L00000020', 'L00000021', 'L00000022', 'L00000023', 'L00000024'] }, {});
        await queryInterface.bulkDelete('Pet', { PetID: ['P00000016', 'P00000017', 'P00000018'] }, {});
        await queryInterface.bulkDelete('Account', { AccountID: ['C00000016', 'C00000017', 'C00000018'] }, {});
    },
};