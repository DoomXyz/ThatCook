import serviceService from '../services/serviceService';

const handleError = (res, e) => {
    console.log(e);
    return res.status(500).json({
        errCode: 3,
        errMessage: `Lỗi từ server: ${e.message}`,
        data: null,
    });
};

let handleGetVeterinarianService = async (req, res) => {
    try {
        let response = await serviceService.getVeterinarianService(req.query.accountid);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

let handleGetServiceInfo = async (req, res) => {
    try {
        const { serviceid } = req.query;
        let response = await serviceService.getServiceInfo(serviceid);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

let handleLoadServiceInfo = async (req, res) => {
    try {
        const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
        const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
        const search = req.query.search || '';
        const filter = req.query.filter || 'ALL';
        const sort = req.query.sort || '0';
        let response = await serviceService.loadServiceInfo(page, limit, search, filter, sort);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

let handleCreateService = async (req, res) => {
    try {
        let response = await serviceService.createService(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

let handleChangeServiceInfo = async (req, res) => {
    try {
        let response = await serviceService.changeServiceInfo(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

let handleChangeServiceStatus = async (req, res) => {
    try {
        const { serviceID, newStatus } = req.body;
        let response = await serviceService.changeServiceStatus(serviceID, newStatus);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

module.exports = {
    handleGetVeterinarianService,
    handleGetServiceInfo,
    handleLoadServiceInfo,
    handleCreateService,
    handleChangeServiceInfo,
    handleChangeServiceStatus,
}