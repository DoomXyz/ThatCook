import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import RobotoRegularFont from '../assets/fonts/Roboto-Regular-normal.js';

import { handleVerifyTokenApi } from '../services/accountServices';
import { handleGetAllCodesApi, uploadImageToCloudinaryApi } from '../services/utilitiesServices';

const checkLoginStatus = async () => {
  try {
    const response = await handleVerifyTokenApi();
    if (response && response.errCode === 0) {
      const { AccountID, AccountName, AccountType, UserImage, UserName } = response.data
      return {
        status: true,
        accountInfo: {
          AccountID,
          AccountName,
          AccountType,
          UserImage,
          UserName,
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

const getAllCodes = async (Type) => {
  try {
    const response = await handleGetAllCodesApi(Type);
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
    console.log(`Lỗi khi lấy dữ liệu ${Type}:`, error);
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

const validateAccountInput = async (userInfo, type) => {
  const { AccountName, Email, Password, UserName, Phone, Address, Gender, AccountType } = userInfo;
  console.log(userInfo)
  const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
  const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
  const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
  const phoneRegex = /^[0-9]{10,11}$/;

  if (!AccountName) return { valid: false, errMessage: 'Tên tài khoản trống!' };
  if (!accountNameRegex.test(AccountName)) return { valid: false, errMessage: 'Tên tài khoản sai định dạng!' };

  if (!Email) return { valid: false, errMessage: 'Email trống!' };
  if (!emailRegex.test(Email)) return { valid: false, errMessage: 'Email sai định dạng!' };

  if (type === 'REG') {
    if (!Password) return { valid: false, errMessage: 'Mật khẩu trống!' };
    if (!passwordRegex.test(Password)) return { valid: false, errMessage: 'Mật khẩu không hợp lệ! (Cần ít nhất 8 ký tự)' };
  }

  if (!UserName) return { valid: false, errMessage: 'Tên người dùng trống!' };
  if (!userNameRegex.test(UserName)) return { valid: false, errMessage: 'Tên người dùng không hợp lệ!' };

  if (!Phone) return { valid: false, errMessage: 'Số điện thoại trống!' };
  if (!phoneRegex.test(Phone)) return { valid: false, errMessage: 'Số điện thoại không hợp lệ!' };

  if (!Address) return { valid: false, errMessage: 'Địa chỉ trống!' };

  const genderResponse = await getAllCodes('Gender');
  const validGender = genderResponse.data?.map((item) => item.Code) || [];
  if (!Gender) return { valid: false, errMessage: 'Giới tính không tồn tại!' };
  if (!validGender.includes(Gender)) return { valid: false, errMessage: 'Giới tính không hợp lệ!' };

  const accounttypeResponse = await getAllCodes('AccountType');
  const validAccountType = accounttypeResponse.data?.map((item) => item.Code) || [];
  if (!AccountType) return { valid: false, errMessage: 'Loại tài khoản không tồn tại!' };
  if (!validAccountType.includes(AccountType)) return { valid: false, errMessage: 'Loại tài khoản không hợp lệ!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validateProductInput = async (productInfo) => {
  if (!productInfo || !Object.keys(productInfo).length) return { valid: false, errMessage: 'Thiếu thông tin sản phẩm!' };

  const { ProductName, ProductType, ProductPrice, ProductDescription, PetType, Image } = productInfo;
  const productNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,100}$/;

  if (!ProductName) return { valid: false, errMessage: 'Tên sản phẩm không được để trống!' };
  if (!productNameRegex.test(ProductName.trim())) return { valid: false, errMessage: 'Tên sản phẩm không hợp lệ!' };

  if (!ProductType) return { valid: false, errMessage: 'Loại sản phẩm không được để trống!' };
  const productTypeResponse = await getAllCodes('ProductType');
  const validProductType = productTypeResponse.data?.map((item) => item.Code) || [];
  if (!validProductType.includes(ProductType)) return { valid: false, errMessage: 'Loại sản phẩm không hợp lệ!' };

  if (!ProductPrice) return { valid: false, errMessage: 'Giá sản phẩm không được để trống!' };
  const Price = parseFloat(ProductPrice);
  if (isNaN(Price) || Price <= 0) return { valid: false, errMessage: 'Giá sản phẩm phải lớn hơn 0!' };

  if (ProductDescription?.trim().length > 65535) return { valid: false, errMessage: 'Mô tả sản phẩm vượt quá giới hạn ký tự!' };

  if (!PetType || !Array.isArray(PetType) || !PetType.length) return { valid: false, errMessage: 'Vui lòng chọn ít nhất một loại thú cưng!' };
  for (const petType of PetType) {
    const petTypeResponse = await getAllCodes('PetType');
    const validPetType = petTypeResponse.data?.map((item) => item.Code) || [];
    if (!validPetType.includes(petType)) return { valid: false, errMessage: `Loại thú cưng ${petType} không hợp lệ!` };
  }

  if (!Image || !Array.isArray(Image) || Image.length === 0) return { valid: false, errMessage: 'Vui lòng thêm ít nhất 1 hình ảnh!' };
  if (Image.length > 5) return { valid: false, errMessage: 'Tối đa 5 hình ảnh!' };
  if (Image.some(img => !img.Image || !img.Image.trim() || img.Image.trim().length > 2048)) {
    return { valid: false, errMessage: 'Danh sách ảnh không hợp lệ hoặc vượt quá 2048 ký tự!' };
  }

  return { valid: true, errMessage: 'Kiểm tra thông tin sản phẩm hoàn tất!' };
};

const validateProductDetailInput = async (productDetail) => {
  const detailNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
  if (!productDetail || !Array.isArray(productDetail) || !productDetail.length) return { valid: false, errMessage: 'Vui lòng thêm ít nhất một chi tiết sản phẩm!' };
  for (let i = 0; i < productDetail.length; i++) {
    const { DetailName, Stock, ExtraPrice, Promotion, DetailStatus } = productDetail[i]
    if (!DetailName) return { valid: false, errMessage: `Tên chi tiết tại dòng ${i + 1} không được để trống!` };
    if (!detailNameRegex.test(DetailName.trim())) return { valid: false, errMessage: `Tên chi tiết tại dòng ${i + 1} không hợp lệ!` };

    if (Stock === undefined || Stock === '') return { valid: false, errMessage: `Số lượng tồn tại dòng ${i + 1} không được để trống!` };
    if (isNaN(Stock) || parseInt(Stock) < 0) return { valid: false, errMessage: `Số lượng tồn tại dòng ${i + 1} phải lớn hơn hoặc bằng 0!` };

    if (ExtraPrice === undefined || ExtraPrice === '') return { valid: false, errMessage: `Giá thêm tại dòng ${i + 1} không được để trống!` };
    if (isNaN(ExtraPrice) || parseFloat(ExtraPrice) < 0) return { valid: false, errMessage: `Giá thêm tại dòng ${i + 1} phải lớn hơn hoặc bằng 0!` };

    if (Promotion === undefined || Promotion === '') return { valid: false, errMessage: `Khuyến mãi tại dòng ${i + 1} không được để trống!` };
    if (isNaN(Promotion) || parseFloat(Promotion) < 0 || parseFloat(Promotion) > 100) return { valid: false, errMessage: `Khuyến mãi tại dòng ${i + 1} phải từ 0 đến 100%!` };

    if (!DetailStatus) return { valid: false, errMessage: `Trạng thái chi tiết tại dòng ${i + 1} không được để trống!` };
    const validDetailStatusResponse = await getAllCodes('DetailStatus');
    const validDetailStatus = validDetailStatusResponse.data?.map((item) => item.Code) || [];
    if (!validDetailStatus.includes(DetailStatus)) return { valid: false, errMessage: `Trạng thái chi tiết tại dòng ${i + 1} không hợp lệ!` };

    if (parseInt(Stock) === 0 && DetailStatus === 'AVAIL') return { valid: false, errMessage: `Số lượng tồn tại dòng ${i + 1} bằng 0, không thể chọn trạng thái Còn hàng!` };
  }
  return { valid: true, errMessage: 'Kiểm tra chi tiết sản phẩm hoàn tất!' };
};

const validateVeterinarianInput = async (veterinarianInfo) => {
  if (!veterinarianInfo || !Object.keys(veterinarianInfo).length) return { valid: false, errMessage: 'Thiếu thông tin bác sĩ thú y!' };

  const { Bio, Specialization, WorkingStatus, selectedServicesList } = veterinarianInfo;
  const specializationRegex = /^[A-Za-zÀ-ỹ0-9\s]{1,50}$/;

  if (Bio?.trim().length > 65535) return { valid: false, errMessage: 'Bio vượt quá độ dài tối đa (65535 ký tự)!' };

  if (Specialization && !specializationRegex.test(Specialization.trim())) return { valid: false, errMessage: 'Chuyên khoa không hợp lệ hoặc vượt quá 50 ký tự!' };

  const validWorkingStatusResponse = await getAllCodes('WorkingStatus');
  const validWorkingStatus = validWorkingStatusResponse.data?.map((item) => item.Code) || [];
  if (!WorkingStatus) return { valid: false, errMessage: 'Trạng thái làm việc không tồn tại!' };
  if (!validWorkingStatus.includes(WorkingStatus)) return { valid: false, errMessage: 'Trạng thái làm việc không hợp lệ!' };

  if (selectedServicesList.length === 0) return { valid: false, errMessage: 'Vui lòng chọn ít nhất một dịch vụ cho bác sĩ!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validateServiceInput = (serviceInfo) => {
  if (!serviceInfo || !Object.keys(serviceInfo).length) return { valid: false, errMessage: 'Thiếu thông tin dịch vụ!' };

  const { ServiceName, Price, Duration, Description } = serviceInfo;
  const nameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;

  if (!ServiceName?.trim()) return { valid: false, errMessage: 'Tên dịch vụ không được để trống!' };
  if (!nameRegex.test(ServiceName.trim())) return { valid: false, errMessage: 'Tên dịch vụ không hợp lệ (2-50 ký tự, chỉ chữ, số và khoảng trắng)!' };

  if (!Price || isNaN(Price) || parseFloat(Price) < 0) return { valid: false, errMessage: 'Giá dịch vụ không hợp lệ (phải là số không âm)!' };

  if (!Duration || isNaN(Duration) || parseInt(Duration) <= 0) return { valid: false, errMessage: 'Thời gian thực hiện không hợp lệ (phải là số nguyên dương)!' };

  if (Description?.trim().length > 65535) return { valid: false, errMessage: 'Mô tả vượt quá giới hạn ký tự (65535)!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validatePetInput = async (petInfo) => {
  if (!petInfo || !Object.keys(petInfo).length) return { valid: false, errMessage: 'Thiếu thông tin thú cưng!' };

  const { PetName, PetType, PetGender, PetWeight, Age } = petInfo;
  const petNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;

  if (!PetName?.trim() || PetName.trim().length > 50) return { valid: false, errMessage: 'Tên thú cưng trống hoặc vượt quá 50 ký tự!' };
  if (!petNameRegex.test(PetName.trim())) return { valid: false, errMessage: 'Tên thú cưng không hợp lệ!' };

  if (!PetType) return { valid: false, errMessage: 'Loại thú cưng không được để trống!' };
  const validPetTypeResponse = await getAllCodes('PetType');
  const validPetType = validPetTypeResponse.data?.map((item) => item.Code) || [];
  if (!validPetType.includes(PetType)) return { valid: false, errMessage: 'Loại thú cưng không hợp lệ!' };

  if (!PetGender) return { valid: false, errMessage: 'Giới tính thú cưng không được để trống!' };
  const validPetGenderResponse = await getAllCodes('PetGender');
  const validPetGender = validPetGenderResponse.data?.map((item) => item.Code) || [];
  if (!validPetGender.includes(PetGender)) return { valid: false, errMessage: 'Giới tính thú cưng không hợp lệ!' };

  if (!PetWeight || isNaN(PetWeight) || PetWeight <= 0 || PetWeight > 999.99) return { valid: false, errMessage: 'Cân nặng thú cưng không hợp lệ (phải từ 0.01 đến 999.99)!' };

  if (Age === undefined || isNaN(Age) || Age < 0 || Age > 999) return { valid: false, errMessage: 'Tuổi thú cưng không hợp lệ (phải từ 0 đến 999)!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validateAppointmentInput = async (appointmentInfo) => {
  if (!appointmentInfo || !Object.keys(appointmentInfo).length) return { valid: false, errMessage: 'Thiếu thông tin đặt lịch!' };

  const { CustomerName, CustomerEmail, CustomerPhone, AppointmentDate, StartTime, Notes, ServiceID, PetID } = appointmentInfo;
  const customerNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
  const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,11}$/;
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

  if (!CustomerName) return { valid: false, errMessage: 'Tên khách hàng không được để trống!' };
  if (!customerNameRegex.test(CustomerName.trim())) return { valid: false, errMessage: 'Tên khách hàng sai định dạng!' };

  if (!CustomerEmail) return { valid: false, errMessage: 'Email không được để trống!' };
  if (!emailRegex.test(CustomerEmail.trim())) return { valid: false, errMessage: 'Email sai định dạng!' };

  if (!CustomerPhone) return { valid: false, errMessage: 'Số điện thoại không được để trống!' };
  if (!phoneRegex.test(CustomerPhone.trim())) return { valid: false, errMessage: 'Số điện thoại không hợp lệ!' };

  if (!AppointmentDate || !StartTime) return { valid: false, errMessage: 'Ngày hoặc giờ hẹn không được để trống!' };
  if (!timeRegex.test(StartTime)) return { valid: false, errMessage: 'Giờ hẹn không hợp lệ (HH:mm)!' };
  const dateCheck = new Date(AppointmentDate);
  if (isNaN(dateCheck.getTime())) return { valid: false, errMessage: 'Ngày hẹn không hợp lệ!' };
  const [hours, minutes] = StartTime.split(':').map(Number);
  dateCheck.setHours(hours, minutes, 0, 0);
  if (dateCheck <= new Date()) return { valid: false, errMessage: 'Thời gian hẹn phải trong tương lai!' };

  if (Notes?.trim().length > 65535) return { valid: false, errMessage: 'Mô tả tình trạng không hợp lệ hoặc vượt quá giới hạn ký tự!' };

  if (!ServiceID || !PetID) return { valid: false, errMessage: 'Thông tin thú cưng và dịch vụ không được bỏ trống!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validateBannerInput = async (bannerInfo) => {
  if (!bannerInfo || !Object.keys(bannerInfo).length) return { valid: false, errMessage: 'Thiếu thông tin banner!' };

  const { BannerImage, HiddenAt, BannerStatus } = bannerInfo;

  if (!BannerImage) return { valid: false, errMessage: 'Thiếu hình ảnh banner!' };

  if (HiddenAt !== undefined && HiddenAt !== null) {
    const hiddenAtDate = new Date(HiddenAt);
    if (isNaN(hiddenAtDate.getTime()) || hiddenAtDate <= new Date()) return { valid: false, errMessage: 'Ngày ẩn không hợp lệ hoặc phải lớn hơn thời gian hiện tại!' };
  }

  if (!BannerStatus) return { valid: false, errMessage: 'Trạng thái banner không được để trống!' };
  const bannerStatusResponse = await getAllCodes('BannerStatus');
  const validBannerStatus = bannerStatusResponse.data?.map((item) => item.Code) || [];
  if (!validBannerStatus.includes(BannerStatus)) return { valid: false, errMessage: `Trạng thái banner ${BannerStatus} không hợp lệ!` };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const validateCouponInput = async (couponInfo) => {
  if (!couponInfo || !Object.keys(couponInfo).length) return { valid: false, errMessage: 'Thiếu thông tin mã giảm giá!' };

  const { CouponCode, CouponDescription, MinOrderValue, DiscountValue, MaxDiscount, DiscountType, StartDate, EndDate, CouponStatus } = couponInfo;
  const couponCodeRegex = /^[a-zA-Z0-9]{5,20}$/;

  if (!CouponCode) return { valid: false, errMessage: 'Vui lòng nhập mã giảm giá!' };
  if (!couponCodeRegex.test(CouponCode.trim())) return { valid: false, errMessage: 'Mã giảm giá không hợp lệ hoặc vượt quá giới hạn ký tự!' };

  if (CouponDescription?.trim().length > 0 && CouponDescription.trim().length > 65535) return { valid: false, errMessage: 'Mô tả giảm giá không hợp lệ hoặc vượt quá giới hạn ký tự!' };

  if (MinOrderValue !== undefined && MinOrderValue < 0) return { valid: false, errMessage: 'Giá trị mua ít nhất không được nhỏ hơn 0!' };

  if (!DiscountValue) return { valid: false, errMessage: 'Giá trị giảm không được để trống!' };
  if (DiscountType === 'PERC' && (DiscountValue > 100 || DiscountValue < 0)) return { valid: false, errMessage: 'Giá trị giảm không hợp lệ!' };
  if (DiscountType === 'FIXED' && DiscountValue < 0) return { valid: false, errMessage: 'Giá trị giảm không hợp lệ!' };

  if (MaxDiscount !== undefined) {
    if (MaxDiscount < 0) return { valid: false, errMessage: 'Giảm giá tối đa phải lớn hơn 0!' };
    if (DiscountType === 'FIXED' && parseFloat(MaxDiscount) > parseFloat(DiscountValue)) return { valid: false, errMessage: 'Giảm giá tối đa không được lớn hơn giá trị giảm ban đầu!' };
  }

  if (!DiscountType) return { valid: false, errMessage: 'Loại giảm giá không được để trống!' };
  const typeResponse = await getAllCodes('DiscountType');
  const validDiscountType = typeResponse.data?.map((item) => item.Code) || [];
  if (!validDiscountType.includes(DiscountType)) return { valid: false, errMessage: 'Loại giảm giá không hợp lệ!' };


  if (!StartDate) return { valid: false, errMessage: 'Ngày bắt đầu không được để trống!' };

  if (EndDate) {
    const startdateObj = new Date(StartDate);
    const enddateObj = new Date(EndDate);
    if (isNaN(enddateObj.getTime())) return { valid: false, errMessage: 'Ngày hết hạn không hợp lệ!' };
    const now = new Date();
    if (enddateObj <= now) return { valid: false, errMessage: 'Ngày hết hạn phải trong tương lai!' };
    if (enddateObj < startdateObj) return { valid: false, errMessage: 'Ngày hết hạn phải sau ngày bắt đầu!' };
  }

  if (!CouponStatus) return { valid: false, errMessage: 'Trạng thái giảm giá không được để trống!' };
  const statusResponse = await getAllCodes('CouponStatus');
  const validCouponStatus = statusResponse.data?.map((item) => item.Code) || [];
  if (!validCouponStatus.includes(CouponStatus)) return { valid: false, errMessage: 'Trạng thái giảm giá không hợp lệ!' };

  return { valid: true, errMessage: 'Kiểm tra thông tin hoàn tất!' };
};

const generateInvoicePDF = async (invoiceData) => {
  const doc = new jsPDF();
  let fontLoaded = false;

  try {
    doc.addFileToVFS('Roboto-Regular-normal.ttf', RobotoRegularFont);
    doc.addFont('Roboto-Regular-normal.ttf', 'Roboto-Regular', 'normal');
    doc.setFont('Roboto-Regular');
    fontLoaded = true;
  } catch (e) {
    console.error('Error loading custom font:', e);
    doc.setFont('Helvetica');
  }

  const [paymentTypeResponse, shippingMethodResponse, shippingStatusResponse] = await Promise.all([
    getAllCodes('PaymentType'),
    getAllCodes('ShippingMethod'),
    getAllCodes('ShippingStatus'),
  ]);

  const codePaymentType = paymentTypeResponse.status ? paymentTypeResponse.data : [];
  const codeShippingMethod = shippingMethodResponse.status ? shippingMethodResponse.data : [];
  const codeShippingStatus = shippingStatusResponse.status ? shippingStatusResponse.data : [];
  const { InvoiceID, ReceiverName, ReceiverPhone, ReceiverAddress, TotalQuantity, TotalPrice, DiscountAmount, TotalPayment, CreatedAt, PaymentType, ShippingMethod, ShippingStatus } = invoiceData
  doc.setFontSize(18);
  doc.text('MINCOW', 14, 20);
  doc.setFontSize(10);
  doc.text('Pet Accessories & Food', 14, 26);
  doc.text('136 Huỳnh Văn Bánh, p. 11, quận Phú Nhuận, HCM', 14, 34);

  const dateText = `Thời gian: ${CreatedAt
    ? new Date(CreatedAt).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    : 'N/A'}`;
  doc.text(dateText, 14, 42);
  doc.text(`Mã hóa đơn: ${InvoiceID || 'N/A'}`, 150, 42, { align: 'right' });

  const customerText = `Khách hàng: ${ReceiverName || 'N/A'}\nSĐT: ${ReceiverPhone || 'N/A'}\nĐịa chỉ: ${ReceiverAddress || 'N/A'}`;
  doc.text(customerText, 14, 50);

  const statusText = `Phương thức thanh toán: ${codePaymentType.find((item) => item.Code === PaymentType)?.CodeValueVI || PaymentType || 'N/A'}\nPhương thức giao hàng: ${codeShippingMethod.find((item) => item.Code === ShippingMethod)?.CodeValueVI || ShippingMethod || 'N/A'}\nTrạng thái giao hàng: ${codeShippingStatus.find((item) => item.Code === ShippingStatus)?.CodeValueVI || ShippingStatus || 'N/A'}`;
  doc.text(statusText, 14, 70);

  doc.setLineWidth(0.5);
  doc.line(14, 85, 196, 85);

  const tableData = (invoiceData.productList || []).map((item) => [
    item.ProductName || 'N/A',
    item.DetailName || 'N/A',
    `${parseFloat(item.ItemPrice || 0).toLocaleString('vi-VN')}đ`,
    item.ItemQuantity || 0,
    `${(parseFloat(item.ItemPrice || 0) * (item.ItemQuantity || 0)).toLocaleString('vi-VN')}đ`,
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Tên sản phẩm', 'Loại', 'Giá', 'Số lượng', 'Thành tiền']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: fontLoaded ? 'Roboto-Regular' : 'Helvetica',
      fontSize: 9,
      cellPadding: 2,
      overflow: 'linebreak',
      textColor: [0, 0, 0],
      halign: 'left',
    },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontSize: 9,
      fontStyle: 'normal',
      halign: 'center',
    },
    columnWidths: [60, 40, 25, 20, 25],
    columnStyles: {
      0: { halign: 'center', overflow: 'linebreak' },
      1: { halign: 'center', overflow: 'linebreak' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  let finalY = doc.lastAutoTable.finalY;

  doc.setLineWidth(0.5);
  doc.line(14, finalY + 2, 196, finalY + 2);

  const shippingFee = codeShippingMethod.find((item) => item.Code === ShippingMethod)?.ExtraValue
    ? parseFloat(codeShippingMethod.find((item) => item.Code === ShippingMethod).ExtraValue)
    : 0;

  doc.setFontSize(10);
  doc.text(`Tổng sản phẩm: ${TotalQuantity || 0}`, 14, finalY + 10);
  doc.text(`Tổng tiền hàng: ${parseFloat(TotalPrice || 0).toLocaleString('vi-VN')}đ`, 14, finalY + 16);
  doc.text(`Phí vận chuyển (${codeShippingMethod.find((item) => item.Code === ShippingMethod)?.CodeValueVI || ShippingMethod || 'N/A'}): ${shippingFee.toLocaleString('vi-VN')}đ`, 14, finalY + 22);
  doc.text(`Giảm giá: -${parseFloat(DiscountAmount || 0).toLocaleString('vi-VN')}đ`, 14, finalY + 28);
  doc.setFont(fontLoaded ? 'Roboto-Regular' : 'Helvetica', 'normal');
  doc.text(`Tổng thanh toán: ${parseFloat(TotalPayment || 0).toLocaleString('vi-VN')}đ`, 14, finalY + 34);

  doc.setLineWidth(0.5);
  doc.line(14, finalY + 38, 196, finalY + 38);

  const note1 = '*Lưu ý: giá thành tiền của sản phẩm đã bao gồm khuyến mãi (nếu có).';
  const note2 = 'Mọi thắc mắc xin liên hệ với bộ phận chăm sóc khách hàng (0901131141).';
  doc.setFontSize(9);
  const splitNote1 = doc.splitTextToSize(note1, 180);
  const splitNote2 = doc.splitTextToSize(note2, 180);
  doc.text(splitNote1, 14, finalY + 46);
  doc.text(splitNote2, 14, finalY + 54);

  const timestamp = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(/[,/: ]/g, '');
  doc.save(`HoaDon_${InvoiceID || 'unknown'}_${timestamp}.pdf`);
};

const generateAppointmentBillPDF = async (appointmentBillData) => {
  const doc = new jsPDF();
  let fontLoaded = false;
  try {
    doc.addFileToVFS('Roboto-Regular-normal.ttf', RobotoRegularFont);
    doc.addFont('Roboto-Regular-normal.ttf', 'Roboto-Regular', 'normal');
    doc.setFont('Roboto-Regular');
    fontLoaded = true;
  } catch (e) {
    console.error('Error loading custom font:', e);
    doc.setFont('Helvetica');
  }
  // Fetch code values for display
  const [validAppointmentStatusResponse, validPetTypeResponse, validPetGenderResponse] = await Promise.all([getAllCodes('AppointmentStatus'), getAllCodes('PetType'), getAllCodes('PetGender')]);

  const codeAppointmentStatus = validAppointmentStatusResponse.status ? validAppointmentStatusResponse.data : [];
  const codePetType = validPetTypeResponse.status ? validPetTypeResponse.data : [];
  const codePetGender = validPetGenderResponse.status ? validPetGenderResponse.data : [];
  // Header Section
  doc.setFontSize(18);
  doc.text('MINCOW', 14, 20);
  doc.setFontSize(10);
  doc.text('Website Thương mại & Dịch vụ Dành cho thú cưng', 14, 26);
  doc.text('Địa chỉ: 136 Huỳnh Văn Bánh, P. 11, Q. Phú Nhuận, Tp.HCM', 14, 32);

  // Time (left-aligned)
  const timeText = `Thời gian: ${appointmentBillData.AppointmentBill?.CreatedAt
    ? new Date(appointmentBillData.AppointmentBill.CreatedAt).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'N/A'
    }`;
  doc.text(timeText, 14, 40);

  // Bill ID (right-aligned)
  doc.text(`Mã hóa đơn: ${appointmentBillData.AppointmentBill?.AppointmentBillID || 'N/A'}`, 196, 40, { align: 'right' });

  // Status and Service Info (right-aligned, with custom line height)
  const statusLine = `Trạng thái: ${codeAppointmentStatus.find((item) => item.Code === appointmentBillData.AppointmentStatus)?.CodeValueVI || appointmentBillData.AppointmentStatus || 'N/A'}`;
  const serviceLine = `Dịch vụ: ${appointmentBillData.Service?.ServiceName || 'N/A'}`;
  const vetLine = `Bác sĩ: ${appointmentBillData.VeterinarianID ? 'Đã chỉ định' : 'Chưa chỉ định'}`;

  const statusLineHeight = 8; // Line height for status text (in mm)
  doc.text(statusLine, 196, 50, { align: 'right' });
  doc.text(serviceLine, 196, 50 + statusLineHeight, { align: 'right' });
  doc.text(vetLine, 196, 50 + statusLineHeight * 2, { align: 'right' });

  // Customer and Pet Info (left-aligned, with custom line height)
  const customerLine = `Khách hàng: ${appointmentBillData.CustomerName || 'N/A'}`;
  const petNameLine = `Tên thú cưng: ${appointmentBillData.Pet?.PetName || 'N/A'}`;
  const petTypeLine = `Loại thú cưng: ${codePetType.find((item) => item.Code === appointmentBillData.Pet?.PetType)?.CodeValueVI || appointmentBillData.Pet?.PetType || 'N/A'}`;
  const petGenderLine = `Giới tính: ${codePetGender.find((item) => item.Code === appointmentBillData.Pet?.PetGender)?.CodeValueVI || appointmentBillData.Pet?.PetGender || 'N/A'}`;

  const customerLineHeight = 8; // Line height for customer text (in mm)
  doc.text(customerLine, 14, 48);
  doc.text(petNameLine, 14, 48 + customerLineHeight);
  doc.text(petTypeLine, 14, 48 + customerLineHeight * 2);
  doc.text(petGenderLine, 14, 48 + customerLineHeight * 3);

  // Separator Line
  const separatorY = Math.max(50 + statusLineHeight * 3, 48 + customerLineHeight * 4);
  doc.setLineWidth(0.5);
  doc.line(14, separatorY, 196, separatorY);

  // Table for Appointment Details
  const tableData = [
    [
      appointmentBillData.AppointmentDate ? `${new Date(appointmentBillData.AppointmentDate).toLocaleDateString('vi-VN')} ${appointmentBillData.StartTime} - ${appointmentBillData.EndTime}` : 'N/A',
      appointmentBillData.AppointmentBill?.ServicePrice ? parseFloat(appointmentBillData.AppointmentBill.ServicePrice).toLocaleString('vi-VN') + ' vnđ' : 'N/A',
      appointmentBillData.AppointmentBill?.MedicalPrice ? parseFloat(appointmentBillData.AppointmentBill.MedicalPrice).toLocaleString('vi-VN') + ' vnđ' : 'N/A',
      appointmentBillData.AppointmentBill?.TotalPayment ? parseFloat(appointmentBillData.AppointmentBill.TotalPayment).toLocaleString('vi-VN') + ' vnđ' : 'N/A',
    ],
  ];

  autoTable(doc, {
    startY: 83,
    head: [['Ngày khám', 'Phí dịch vụ', 'Phí dược phẩm', 'Tổng thanh toán']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: fontLoaded ? 'Roboto-Regular' : 'Helvetica',
      fontSize: 9,
      cellPadding: 2,
      overflow: 'linebreak',
      textColor: [0, 0, 0],
      halign: 'left',
    },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontSize: 9,
      fontStyle: 'normal',
      halign: 'center',
    },
    columnWidths: [50, 35, 35, 35],
    columnStyles: {
      0: { halign: 'center', overflow: 'linebreak' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  let finalY = doc.lastAutoTable.finalY;

  // Separator Line
  doc.setLineWidth(0.5);
  doc.line(14, finalY + 2, 196, finalY + 2);

  // Footer: Notes and Medical Image
  doc.setFontSize(10);
  const notesText = `Ghi chú của bác sĩ: ${appointmentBillData.AppointmentBill?.MedicalNotes || 'Không có ghi chú'}`;
  const splitNotes = doc.splitTextToSize(notesText, 180);
  doc.text(splitNotes, 14, finalY + 10);

  // Medical Image (if available)
  if (appointmentBillData.AppointmentBill?.MedicalImage) {
    try {
      doc.addImage(appointmentBillData.AppointmentBill.MedicalImage, 'JPEG', 14, finalY + 20, 50, 50); // Adjust size and position as needed
      finalY += 60; // Adjust Y position after image
    } catch (e) {
      console.error('Error adding medical image to PDF:', e);
      doc.text('Đơn thuốc: Không thể tải hình ảnh', 14, finalY + 20);
      finalY += 10;
    }
  } else {
    doc.text('Đơn thuốc: Không có hình ảnh', 14, finalY + 20);
    finalY += 10;
  }

  // Separator Line
  doc.setLineWidth(0.5);
  doc.line(14, finalY + 5, 196, finalY + 5);

  // Footer Note
  const note = 'Mọi thắc mắc xin liên hệ với bộ phận chăm sóc khách hàng (0901131141).';
  doc.setFontSize(9);
  const splitNote = doc.splitTextToSize(note, 180);
  doc.text(splitNote, 14, finalY + 13);

  // Save the PDF
  const timestamp = new Date()
    .toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/[,/: ]/g, '');
  doc.save(`HoaDonLichKham_${appointmentBillData.AppointmentBill?.AppointmentBillID || 'unknown'}_${timestamp}.pdf`);
};

export {
  checkLoginStatus,
  getAllCodes,
  uploadImages,
  validateCodeInput,
  validateAccountInput,
  validateProductInput,
  validateProductDetailInput,
  validateVeterinarianInput,
  validateServiceInput,
  validatePetInput,
  validateAppointmentInput,
  validateBannerInput,
  validateCouponInput,
  generateInvoicePDF,
  generateAppointmentBillPDF,
};
