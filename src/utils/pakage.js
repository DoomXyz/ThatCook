import { handleVerifyTokenApi } from '../services/accountServices';
import { handleGetAllCodesApi, uploadImageToCloudinaryApi } from '../services/utilitiesServices';

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

const getAllCodes = async (type) => {
  try {
    const response = await handleGetAllCodesApi(type);
    if (response && response.length > 0) {
      return {
        status: true,
        data: response,
      };
    }
    return {
      status: false,
      data: [],
    };
  } catch (error) {
    console.log(`Lỗi khi lấy dữ liệu ${type}:`, error);
    return {
      status: false,
      data: [],
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

const validateAccountInput = async (userInfo, type) => {
  const { accountname, email, password, username, phone, address, gender, accounttype } = userInfo;
  const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
  const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
  const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
  const phoneRegex = /^[0-9]{10,11}$/;

  if (!accountname) return { valid: false, errMessage: 'Tên tài khoản trống!' };
  if (!accountNameRegex.test(accountname)) return { valid: false, errMessage: 'Tên tài khoản sai định dạng!' };

  if (!email) return { valid: false, errMessage: 'Email trống!' };
  if (!emailRegex.test(email)) return { valid: false, errMessage: 'Email sai định dạng!' };

  if (type === "REG") {
    if (!password) return { valid: false, errMessage: 'Mật khẩu trống!' };
    if (!passwordRegex.test(password)) return { valid: false, errMessage: 'Mật khẩu không hợp lệ! (Cần ít nhất 8 ký tự)' };
  }

  if (!username) return { valid: false, errMessage: 'Tên người dùng trống!' };
  if (!userNameRegex.test(username)) return { valid: false, errMessage: 'Tên người dùng không hợp lệ!' };

  if (!phone) return { valid: false, errMessage: 'Số điện thoại trống!' };
  if (!phoneRegex.test(phone)) return { valid: false, errMessage: 'Số điện thoại không hợp lệ!' };

  if (!address) return { valid: false, errMessage: 'Địa chỉ trống!' };

  const genderResponse = await getAllCodes('Gender');
  const validGender = genderResponse.data?.map((item) => item.Code) || [];
  if (!gender) return { valid: false, errMessage: 'Giới tính không tồn tại!' };
  if (!validGender.includes(gender)) return { valid: false, errMessage: 'Giới tính không hợp lệ!' };

  const accounttypeResponse = await getAllCodes('AccountType');
  const validAccountType = accounttypeResponse.data?.map((item) => item.Code) || [];
  if (!accounttype) return { valid: false, errMessage: 'Loại tài khoản không tồn tại!' };
  if (!validAccountType.includes(accounttype)) return { valid: false, errMessage: 'Loại tài khoản không hợp lệ!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validateCodeInput = (codeInfo) => {
  if (!codeInfo || !Object.keys(codeInfo).length) return { valid: false, errMessage: 'Thiếu thông tin mã!' };

  const { Type, Code, CodeValueVI, ExtraValue } = codeInfo;
  const typeRegex = /^[A-Za-z0-9]{2,30}$/;
  const codeRegex = /^[A-Za-z0-9]{1,20}$/;
  const valueRegex = /^(?=.*[A-Za-zÀ-ỹ]).{2,50}$/;

  if (!Type?.trim()) return { valid: false, errMessage: 'Type không được để trống!' };
  if (!typeRegex.test(Type.trim())) return { valid: false, errMessage: 'Type không hợp lệ (2-30 ký tự, chỉ chữ và số)!' };

  if (!Code?.trim()) return { valid: false, errMessage: 'Code không được để trống!' };
  if (!codeRegex.test(Code.trim())) return { valid: false, errMessage: 'Code không hợp lệ (1-20 ký tự, chỉ chữ và số)!' };

  if (!CodeValueVI?.trim()) return { valid: false, errMessage: 'CodeValueVI không được để trống!' };
  if (!valueRegex.test(CodeValueVI.trim())) return { valid: false, errMessage: 'CodeValueVI không hợp lệ (2-50 ký tự, có ít nhất một chữ cái)!' };

  if (ExtraValue && (isNaN(ExtraValue) || parseFloat(ExtraValue) < 0)) return { valid: false, errMessage: 'ExtraValue phải là số không âm!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validateVeterinarianInput = async (veterinarianInfo) => {
  if (!veterinarianInfo || !Object.keys(veterinarianInfo).length) return { valid: false, errMessage: 'Thiếu thông tin bác sĩ thú y!' };

  const { bio, specialization, workingstatus, selectedServicesList } = veterinarianInfo;
  const specializationRegex = /^[A-Za-zÀ-ỹ0-9\s]{1,50}$/;

  if (bio?.trim().length > 65535) return { valid: false, errMessage: 'Bio vượt quá độ dài tối đa (65535 ký tự)!' };

  if (specialization && !specializationRegex.test(specialization.trim())) return { valid: false, errMessage: 'Chuyên khoa không hợp lệ hoặc vượt quá 50 ký tự!' };

  const workingstatusResponse = await getAllCodes('WorkingStatus');
  const validWorkingStatus = workingstatusResponse.data?.map((item) => item.Code) || [];
  if (!workingstatus) return { valid: false, errMessage: 'Trạng thái làm việc không tồn tại!' };
  if (!validWorkingStatus.includes(workingstatus)) return { valid: false, errMessage: 'Trạng thái làm việc không hợp lệ!' };

  if (selectedServicesList.length === 0) return { valid: false, errMessage: 'Vui lòng chọn ít nhất một dịch vụ cho bác sĩ!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validateServiceInput = (serviceInfo) => {
  if (!serviceInfo || !Object.keys(serviceInfo).length) return { valid: false, errMessage: 'Thiếu thông tin dịch vụ!' };

  const { ServiceName, Price, Duration, Description } = serviceInfo;
  const nameRegex = /^[A-Za-z0-9\s]{2,50}$/;

  if (!ServiceName?.trim()) return { valid: false, errMessage: 'Tên dịch vụ không được để trống!' };
  if (!nameRegex.test(ServiceName.trim())) return { valid: false, errMessage: 'Tên dịch vụ không hợp lệ (2-50 ký tự, chỉ chữ, số và khoảng trắng)!' };

  if (!Price || isNaN(Price) || parseFloat(Price) < 0) return { valid: false, errMessage: 'Giá dịch vụ không hợp lệ (phải là số không âm)!' };

  if (!Duration || isNaN(Duration) || parseInt(Duration) <= 0) return { valid: false, errMessage: 'Thời gian thực hiện không hợp lệ (phải là số nguyên dương)!' };

  if (Description?.trim().length > 65535) return { valid: false, errMessage: 'Mô tả vượt quá giới hạn ký tự (65535)!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validatePetInput = async (petInfo) => {
  if (!petInfo || !Object.keys(petInfo).length) return { valid: false, errMessage: 'Thiếu thông tin thú cưng!' };

  const { petname, pettype, petgender, petweight, age } = petInfo;
  const petNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;

  if (!petname?.trim() || petname.trim().length > 50) return { valid: false, errMessage: 'Tên thú cưng trống hoặc vượt quá 50 ký tự!' };
  if (!petNameRegex.test(petname.trim())) return { valid: false, errMessage: 'Tên thú cưng không hợp lệ!' };

  if (!pettype) return { valid: false, errMessage: 'Loại thú cưng không được để trống!' };
  const petTypeResponse = await getAllCodes('PetType');
  const validPetType = petTypeResponse.data?.map((item) => item.Code) || [];
  if (!validPetType.includes(pettype)) return { valid: false, errMessage: 'Loại thú cưng không hợp lệ!' };

  if (!petgender) return { valid: false, errMessage: 'Giới tính thú cưng không được để trống!' };
  const petGenderResponse = await getAllCodes('PetGender');
  const validPetGender = petGenderResponse.data?.map((item) => item.Code) || [];
  if (!validPetGender.includes(petgender)) return { valid: false, errMessage: 'Giới tính thú cưng không hợp lệ!' };

  if (!petweight || isNaN(petweight) || petweight <= 0 || petweight > 999.99) return { valid: false, errMessage: 'Cân nặng thú cưng không hợp lệ (phải từ 0.01 đến 999.99)!' };

  if (age === undefined || isNaN(age) || age < 0 || age > 999) return { valid: false, errMessage: 'Tuổi thú cưng không hợp lệ (phải từ 0 đến 999)!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validateAppointmentInput = async (appointmentInfo) => {
  if (!appointmentInfo || !Object.keys(appointmentInfo).length) return { valid: false, errMessage: 'Thiếu thông tin đặt lịch!' };

  const { customername, customeremail, customerphone, appointmentdate, starttime, notes, serviceid, petid } = appointmentInfo;
  const customerNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
  const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,11}$/;
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

  if (!customername) return { valid: false, errMessage: 'Tên khách hàng không được để trống!' };
  if (!customerNameRegex.test(customername.trim())) return { valid: false, errMessage: 'Tên khách hàng sai định dạng!' };

  if (!customeremail) return { valid: false, errMessage: 'Email không được để trống!' };
  if (!emailRegex.test(customeremail.trim())) return { valid: false, errMessage: 'Email sai định dạng!' };

  if (!customerphone) return { valid: false, errMessage: 'Số điện thoại không được để trống!' };
  if (!phoneRegex.test(customerphone.trim())) return { valid: false, errMessage: 'Số điện thoại không hợp lệ!' };

  if (!appointmentdate || !starttime) return { valid: false, errMessage: 'Ngày hoặc giờ hẹn không được để trống!' };
  if (!timeRegex.test(starttime)) return { valid: false, errMessage: 'Giờ hẹn không hợp lệ (HH:mm)!' };
  const dateCheck = new Date(appointmentdate);
  if (isNaN(dateCheck.getTime())) return { valid: false, errMessage: 'Ngày hẹn không hợp lệ!' };
  const [hours, minutes] = starttime.split(':').map(Number);
  dateCheck.setHours(hours, minutes, 0, 0);
  if (dateCheck <= new Date()) return { valid: false, errMessage: 'Thời gian hẹn phải trong tương lai!' };

  if (notes?.trim().length > 65535) return { valid: false, errMessage: 'Mô tả tình trạng không hợp lệ hoặc vượt quá giới hạn ký tự!' };

  if (!serviceid || petid) return { valid: false, errMessage: 'Thông tin thú cưng và dịch vụ không được bỏ trống!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

export {
  checkLoginStatus,
  getAllCodes,
  uploadImages,
  validateAccountInput,
  validateCodeInput,
  validateVeterinarianInput,
  validateServiceInput,
  validatePetInput,
  validateAppointmentInput
};