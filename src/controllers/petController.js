import petService from '../services/petService';

let handleGetAccountPetInfo = async (req, res) => {
    try {
        let response = await petService.getAccountPetInfo(req.query.accountid);
        return res.status(200).json(response);
    } catch (e) {
        console.log('Error in handleGetAccountPetInfo: ', e);
        return res.status(500).json({
            errCode: 3,
            errMessage: `Lỗi từ server: ${e.message}`,
            data: null,
        });
    }
};

let handleGetPetInfo = async (req, res) => {
    try {
        let response = await petService.getPetInfo(req.query.petid);
        return res.status(200).json(response);
    } catch (e) {
        console.log('Error in handleGetPetInfo: ', e);
        return res.status(500).json({
            errCode: 3,
            errMessage: `Lỗi từ server: ${e.message}`,
            data: null,
        });
    }
};

let handleSavePetInfo = async (req, res) => {
    try {
        const { accountid, petInfo } = req.body
        let response = await petService.savePetInfo(accountid, petInfo);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi từ server: ' + e.message,
            data: null,
        });
    }
};

let handleChangePetInfo = async (req, res) => {
    try {
        const { petid, petInfo } = req.body
        let response = await petService.changePetInfo(petid, petInfo);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi từ server: ' + e.message,
            data: null,
        });
    }
};

let handleRemovePet = async (req, res) => {
    try {
        let response = await petService.removePet(req.body.petid);
        return res.status(200).json(response);
    } catch (e) {
        console.log('Error in handleRemovePet: ', e);
        return res.status(500).json({
            errCode: 3,
            errMessage: `Lỗi từ server: ${e.message}`,
            data: null,
        });
    }
};

module.exports = {
    handleGetAccountPetInfo,
    handleGetPetInfo,
    handleSavePetInfo,
    handleChangePetInfo,
    handleRemovePet,
};