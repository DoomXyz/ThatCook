import db from '../models/index';
import { Op, literal } from 'sequelize';
import { checkScheduleStatus } from './utilitiesService';

let cancelExpiredSchedules = () => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            const currentDateTime = new Date();
            const oneMonthAgo = new Date(currentDateTime);
            oneMonthAgo.setMonth(currentDateTime.getMonth() - 1);
            const pendingSchedules = await db.Schedule.findAll({
                where: {
                    ScheduleStatus: 'PEND'
                },
                attributes: ['ScheduleID', 'Date', 'StartTime'],
                raw: true,
                transaction,
            });
            const expiredSchedules = pendingSchedules.filter(schedule => {
                const dateStr = schedule.Date.toISOString().split('T')[0];
                const scheduleStart = new Date(`${dateStr}T${schedule.StartTime}+07:00`);
                return scheduleStart < currentDateTime;
            });
            if (expiredSchedules.length > 0) {
                const scheduleIDs = expiredSchedules.map(schedule => schedule.ScheduleID);
                await db.Schedule.update(
                    { ScheduleStatus: 'CANCELED' },
                    {
                        where: { ScheduleID: { [Op.in]: scheduleIDs } },
                        transaction
                    }
                );
            }
            await db.Schedule.destroy({
                where: {
                    Date: {
                        [Op.lt]: oneMonthAgo
                    }
                },
                transaction
            });
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Xử lý lịch trình thành công!',
                data: null
            });
        } catch (e) {
            await transaction.rollback();
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi hủy lịch trình quá hạn: ${e.message}`,
                data: null
            });
        }
    });
};

let loadSchedule = (veterinarianid, startDate) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!veterinarianid || !startDate) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null,
                });
                return;
            }
            await cancelExpiredSchedules();
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                resolve({
                    errCode: 1,
                    errMessage: 'Ngày bắt đầu không hợp lệ!',
                    data: null,
                });
                return;
            }
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            const where = {
                VeterinarianID: veterinarianid,
                Date: { [Op.between]: [start, end] },
            };
            const rows = await db.Schedule.findAll({
                where,
                attributes: ['ScheduleID', 'Date', 'StartTime', 'EndTime', 'AppointmentID', 'ScheduleStatus'],
                include: [
                    {
                        model: db.Appointment,
                        as: 'Appointment',
                        attributes: ['CustomerName', 'ServiceID', 'PetID', 'AppointmentStatus', 'AppointmentType'],
                        required: true,
                        include: [
                            {
                                model: db.Service,
                                as: 'Service',
                                attributes: ['ServiceName'],
                                required: true,
                            },
                            {
                                model: db.Pet,
                                as: 'Pet',
                                attributes: ['PetName'],
                                required: true,
                            },
                        ],
                    },
                ],
                order: [['Date', 'ASC'], ['StartTime', 'ASC']],
                raw: false,
                nest: true,
            });
            if (!rows || rows.length === 0) {
                resolve({
                    errCode: 0,
                    errMessage: 'Không có lịch làm việc trong tuần này!',
                    data: [],
                });
                return;
            }
            const data = rows.map(row => ({
                ScheduleID: row.ScheduleID,
                Date: row.Date,
                StartTime: row.StartTime.slice(0, 5),
                EndTime: row.EndTime.slice(0, 5),
                CustomerName: row.Appointment.CustomerName,
                ServiceName: row.Appointment.Service.ServiceName,
                PetName: row.Appointment.Pet.PetName,
                AppointmentID: row.AppointmentID,
                AppointmentType: row.Appointment.AppointmentType,
                AppointmentStatus: row.Appointment.AppointmentStatus,
                ScheduleStatus: row.ScheduleStatus,
            }));
            resolve({
                errCode: 0,
                errMessage: 'Lấy lịch làm việc thành công!',
                data,
            });
        } catch (e) {
            console.log('Error in loadSchedule: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy lịch làm việc: ${e.message}`,
                data: null,
            });
        }
    });
};

let changeScheduleStatus = (scheduleid, schedulestatus) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            if (!scheduleid || !schedulestatus) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null,
                });
                return;
            }
            const validScheduleStatus = await checkScheduleStatus(schedulestatus);
            if (!validScheduleStatus) {
                await transaction.rollback();
                resolve({
                    errCode: 1,
                    errMessage: 'Trạng thái lịch làm việc không hợp lệ!',
                    data: null,
                });
                return;
            }
            const schedule = await db.Schedule.findOne({
                where: { ScheduleID: scheduleid },
                transaction,
            });
            if (!schedule) {
                await transaction.rollback();
                resolve({
                    errCode: 1,
                    errMessage: 'Không tìm thấy lịch làm việc này!',
                    data: null,
                });
                return;
            }
            await db.Schedule.update(
                { ScheduleStatus: schedulestatus },
                { where: { ScheduleID: scheduleid }, transaction }
            );
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Cập nhật trạng thái lịch làm việc thành công!',
                data: schedule,
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in changeScheduleStatus: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi cập nhật trạng thái lịch làm việc: ${e.message}`,
                data: null,
            });
        }
    });
};

module.exports = {
    loadSchedule,
    changeScheduleStatus
};
