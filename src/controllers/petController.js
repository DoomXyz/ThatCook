import petService from '../services/petService';

const handleError = (res, e) => {
    console.log(e);
    return res.status(500).json({
        errCode: 3,
        errMessage: `Lỗi từ server: ${e.message}`,
        data: null,
    });
};

let handleGetAccountPetInfo = async (req, res) => {
    try {
        const { AccountID } = req.query;
        let response = await petService.getAccountPetInfo(AccountID);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

let handleGetPetInfo = async (req, res) => {
    try {
        const { AccountID, PetID } = req.query;
        let response = await petService.getPetInfo(AccountID, PetID);
        return res.status(200).json(response);
    } catch (e) {
        return handleError(res, e);
    }
};

module.exports = {
    handleGetAccountPetInfo,
    handleGetPetInfo,
};