import { handleVerifyTokenApi } from '../services/accountServices';
import { uploadImageToCloudinaryApi } from '../services/utilitiesServices';

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
          UserName: accountInfo.UserName,
        },
      };
    }
    return {
      status: false,
      accountInfo: null,
    };
  } catch (error) {
    console.log('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
    return {
      status: false,
      accountInfo: null,
    };
  }
};

const uploadImages = async (images) => {
  try {
    const uploadedImages = [];
    for (let img of images) {
      if (img.file) {
        const response = await uploadImageToCloudinaryApi(img.file);
        if (response.errCode === 0) {
          uploadedImages.push({
            ImageID: img.ImageID,
            Image: response.data.secure_url,
          });
        } else {
          throw new Error(`Không thể tải ảnh ${img.file.name}`);
        }
      } else {
        uploadedImages.push({
          ImageID: img.ImageID,
          Image: img.Image,
        });
      }
    }
    return {
      status: true,
      images: uploadedImages,
    };
  } catch (error) {
    console.log('Lỗi khi tải ảnh:', error);
    return {
      status: false,
      images: [],
      error: error.message,
    };
  }
};

export {
  checkLoginStatus,
  uploadImages
};
