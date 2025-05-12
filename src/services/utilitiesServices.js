import axios from "axios";

const handleGetAllCodesApi = async (type) => {
    try {
        const response = await axios.get(`/api/get-allcodes?type=${type}`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        return [];
    }
};

const handleCheckCouponApi = async (couponcode, price) => {
    return axios.get(`/api/check-coupon?couponcode=${couponcode}&price=${price}`)
};

const handleGetCouponApi = async (couponcode) => {
    return axios.get(`/api/get-couponinfo?couponcode=${couponcode}`)
}

const uploadImageToCloudinaryApi = async (file) => {
    console.log("Bắt đầu upload ảnh lên Cloudinary:", file.name, file.size);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", process.env.REACT_APP_CLOUDINARY_API_KEY);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await axios.post(cloudinaryUrl, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 15000,
        });

        console.log("Phản hồi từ Cloudinary:", response.data);
        if (response.data && response.data.secure_url) {
            return {
                errCode: 0,
                errMessage: "Tải ảnh thành công!",
                data: response.data, // Trả về toàn bộ dữ liệu từ Cloudinary
            };
        } else {
            return {
                errCode: 1,
                errMessage: "Không lấy được link ảnh từ Cloudinary!",
            };
        }
    } catch (error) {
        console.error("Lỗi khi gọi Cloudinary API:", error.response ? error.response.data : error.message);
        return {
            errCode: 1,
            errMessage: error.response?.data?.error?.message || "Lỗi kết nối khi tải ảnh lên Cloudinary!",
        };
    }
};

export {
    handleGetAllCodesApi,
    handleCheckCouponApi,
    handleGetCouponApi,
    uploadImageToCloudinaryApi
};