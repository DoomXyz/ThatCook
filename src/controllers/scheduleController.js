import scheduleService from '../services/scheduleService';

const handleError = (res, e) => {
    console.log(e);
    return res.status(500).json({
        errCode: 3,
        errMessage: `Lỗi từ server: ${e.message}`,
        data: null,
    });
};

let handleLoadSchedule = async (req, res) => {
    try {
        const VeterinarianID = req.query.VeterinarianID || ''
        const StartDate = req.query.StartDate || '';
        let response = await scheduleService.loadSchedule(VeterinarianID, StartDate);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

let handleChangeScheduleStatus = async (req, res) => {
    try {
        const { ScheduleID, ScheduleStatus } = req.body
        let response = await scheduleService.changeScheduleStatus(ScheduleID, ScheduleStatus);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

module.exports = {
    handleLoadSchedule,
    handleChangeScheduleStatus,
};