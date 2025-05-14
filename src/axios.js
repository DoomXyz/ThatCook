import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 10000,
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => {
    const { data } = response;
    return data;
  },
  (error) => {
    const status = error && error.response && error.response.status;
    switch (status) {
      case 400:
        console.error('Bad Request (400): Yêu cầu không hợp lệ', error);
        break;
      case 401:
        console.error('Unauthorized (401): Không được phép truy cập, vui lòng đăng nhập lại', error);
        break;
      case 403:
        console.error('Forbidden (403): Bạn không có quyền truy cập tài nguyên này', error);
        break;
      case 404:
        console.error('Not Found (404): Không tìm thấy tài nguyên', error);
        break;
      case 500:
        console.error('Internal Server Error (500): Lỗi máy chủ, vui lòng thử lại sau', error);
        break;
      case 502:
        console.error('Bad Gateway (502): Máy chủ trung gian gặp sự cố', error);
        break;
      case 503:
        console.error('Service Unavailable (503): Dịch vụ tạm thời không khả dụng', error);
        break;
      default:
        console.error(`Lỗi không xác định (${status}): `, error);
        break;
    }
  }
);

export default instance;
