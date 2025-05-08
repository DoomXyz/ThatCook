import { handleVerifyTokenApi } from '../services/userServices';

const checkLoginStatus = async () => {
    try {
        const response = await handleVerifyTokenApi();
        if (response && response.errCode === 0) {
            const accountInfo = response.data;
            return {
                status: true,
                accountInfo: {
                    AccountID: accountInfo.AccountID,
                    AccountName: accountInfo.AccountName,
                    AccountType: accountInfo.AccountType,
                    UserImage: accountInfo.UserImage,
                    UserName: accountInfo.UserName
                }
            };
        }
        return {
            status: false,
            accountInfo: null
        };
    } catch (error) {
        console.log("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
        return {
            status: false,
            accountInfo: null
        };
    }
};


export {
    checkLoginStatus,
};