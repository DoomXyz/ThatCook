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
        const veterinarianid = req.query.veterinarianid || ''
        const startDate = req.query.startDate || '';
        let response = await scheduleService.loadSchedule(veterinarianid, startDate);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

let handleChangeScheduleStatus = async (req, res) => {
    try {
        const { scheduleid, schedulestatus } = req.body
        let response = await scheduleService.changeScheduleStatus(scheduleid, schedulestatus);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

module.exports = {
    handleLoadSchedule,
    handleChangeScheduleStatus,
};