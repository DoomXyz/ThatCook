import db from '../models/index';
import { Op } from 'sequelize';
import { checkValidAllCode } from './utilitiesService';

let cancelExpiredSchedules = () => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            const currentDateTime = new Date();
            const oneDayAgo = new Date(currentDateTime);
            oneDayAgo.setDate(currentDateTime.getDate() - 1);
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
                return scheduleStart < oneDayAgo;;
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

const rejectSchedule = async (scheduleid, transaction) => {
    try {
        const schedule = await db.Schedule.findOne({
            where: { ScheduleID: scheduleid },
            attributes: ['ScheduleID', 'AppointmentID', 'VeterinarianID', 'Date', 'StartTime', 'EndTime'],
            transaction,
        });
        if (!schedule) {
            throw new Error('Không tìm thấy lịch làm việc!');
        }

        const appointment = await db.Appointment.findOne({
            where: { AppointmentID: schedule.AppointmentID },
            transaction,
        });
        if (!appointment) {
            throw new Error('Không tìm thấy lịch hẹn liên quan!');
        }

        if (appointment.AppointmentStatus === 'CONF') {
            await db.Appointment.update(
                { AppointmentStatus: 'PEND' },
                { where: { AppointmentID: schedule.AppointmentID }, transaction }
            );
        }
        const scheduleDate = new Date(schedule.Date);
        const dateStr = scheduleDate.toISOString().split('T')[0];
        const scheduleStart = new Date(`${dateStr}T${schedule.StartTime}`);
        const scheduleEnd = new Date(`${dateStr}T${schedule.EndTime}`);
        const conflictingAppointments = await db.Appointment.findAll({
            where: {
                VeterinarianID: schedule.VeterinarianID,
                AppointmentDate: scheduleDate,
                AppointmentID: { [Op.ne]: schedule.AppointmentID },
                AppointmentStatus: 'CANCELED',
            },
            transaction,
        });
        for (const conflictingApp of conflictingAppointments) {
            const conflictingStart = new Date(`${conflictingApp.AppointmentDate.toISOString().split('T')[0]}T${conflictingApp.StartTime}`);
            const conflictingEnd = new Date(`${conflictingApp.AppointmentDate.toISOString().split('T')[0]}T${conflictingApp.EndTime}`);
            if (scheduleStart < conflictingEnd && scheduleEnd > conflictingStart) {
                await db.Appointment.update(
                    { AppointmentStatus: 'PEND' },
                    { where: { AppointmentID: conflictingApp.AppointmentID }, transaction }
                );
            }
        }
        await db.Schedule.destroy({
            where: { ScheduleID: scheduleid },
            transaction,
        });
        return {
            errCode: 0,
            errMessage: 'Hủy lịch làm việc thành công!',
        };
    } catch (e) {
        throw new Error(`Lỗi khi hủy lịch làm việc: ${e.message}`);
    }
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

const changeScheduleStatus = (scheduleid, schedulestatus) => {
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
            const validScheduleStatus = await checkValidAllCode('ScheduleStatus', schedulestatus);
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
                    errMessage: 'Không tìm thấy lịch làm việc!',
                    data: null,
                });
                return;
            }
            if (schedulestatus === 'CANCELED') {
                const currentDateTime = new Date();
                const scheduleDate = new Date(schedule.Date);
                const scheduleStart = new Date(`${scheduleDate.toISOString().split('T')[0]}T${schedule.StartTime}+07:00`);
                const timeDifference = (scheduleStart - currentDateTime) / (1000 * 60 * 60);
                //tắt đoạn này để ko tính giờ
                if (timeDifference < 12) {
                    await transaction.rollback();
                    resolve({
                        errCode: 1,
                        errMessage: 'Không thể hủy lịch làm việc dưới 12 tiếng trước giờ hẹn!',
                        data: null,
                    });
                    return;
                }
                const result = await rejectSchedule(scheduleid, transaction);
                if (result.errCode !== 0) {
                    await transaction.rollback();
                    resolve(result);
                    return;
                }
            } else {
                await db.Schedule.update(
                    { ScheduleStatus: schedulestatus },
                    { where: { ScheduleID: scheduleid }, transaction }
                );
            }
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Cập nhật trạng thái lịch làm việc thành công!',
                data: schedule,
            });
            return;
        } catch (e) {
            await transaction.rollback();
            console.error('Error in changeScheduleStatus:', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi cập nhật trạng thái lịch làm việc: ${e.message}`,
                data: null,
            });
            return;
        }
    });
};

module.exports = {
    loadSchedule,
    changeScheduleStatus
};