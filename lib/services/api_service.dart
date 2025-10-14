// Lý do file này: Tập trung tất cả API calls (login, register, etc.), handle error, add base URL. Dễ mở rộng sau (ví dụ add product API).

// lib/services/api_service.dart

import 'dart:convert'; // Để encode/decode JSON
import 'package:dio/dio.dart'; // Package dio cho HTTP
import '../models/user_model.dart'; // Import model

class ApiService {
  final Dio _dio = Dio(); // Instance dio
  final String baseUrl =
      'http://10.0.2.2:9999'; // Base URL BE, thay đổi nếu deploy

  ApiService() {
    // Setup dio: Add interceptor để log hoặc add token sau
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Sau này add token: options.headers['Authorization'] = 'Bearer $token';
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          // Handle error global
          print('API Error: ${e.message}');
          return handler.next(e);
        },
      ),
    );
  }

  // Hàm register: POST /api/register
  Future<Map<String, dynamic>> register({
    required String accountName,
    required String email,
    required String password,
    required String userName,
    required String phone,
    required String address,
    required String gender,
    String accountType = 'C', // Mặc định 'C' cho customer
  }) async {
    try {
      final response = await _dio.post(
        '$baseUrl/api/register',
        data: {
          // Body dựa trên validateAccountInput trong accountService
          'accountname': accountName,
          'email': email,
          'password': password,
          'username': userName,
          'phone': phone,
          'address': address,
          'gender': gender, // 'M', 'F', 'O' dựa trên AllCodes
          'accounttype': accountType,
        },
      );
      return response.data; // Trả {errCode, errMessage, data: {AccountID}}
    } on DioException catch (e) {
      return {'errCode': 3, 'errMessage': e.message ?? 'Lỗi kết nối'};
    }
  }

  // Hàm login: POST /api/login
  Future<Map<String, dynamic>> login({
    required String accountName,
    required String password,
    bool rememberLogin = false, // rememberMe cho JWT expiry long
  }) async {
    try {
      final response = await _dio.post(
        '$baseUrl/api/login',
        data: {
          // Body dựa trên userLogin trong accountService
          'accountname': accountName,
          'password': password,
          'rememberLogin': rememberLogin,
        },
        options: Options(
          followRedirects: false,
          validateStatus: (status) => status! < 500, // Để lấy header nếu cần
        ),
      );
      // Assume bạn adjust BE để có response.data['token'], nếu không, parse header set-cookie (phức tạp hơn)
      return response.data; // Trả {errCode, errMessage, data: user, token?}
    } on DioException catch (e) {
      return {'errCode': 3, 'errMessage': e.message ?? 'Lỗi kết nối'};
    }
  }

  // Lý do: Thêm các hàm gọi API từ accountService: sendForgotToken, verifyForgotToken, changePassword.
  // Hàm gửi OTP: POST /api/send-forgot-token
  Future<Map<String, dynamic>> sendForgotToken(String email) async {
    try {
      final response = await _dio.post(
        '$baseUrl/api/send-forgot-token',
        data: {
          'email': email,
        }, // Body chỉ email, dựa trên handleSendForgotTokenApi
      );
      return response.data; // {errCode, errMessage, data: accountID}
    } on DioException catch (e) {
      return {'errCode': 3, 'errMessage': e.message ?? 'Lỗi kết nối'};
    }
  }

  // Hàm xác thực OTP: POST /api/verify-forgot-token
  Future<Map<String, dynamic>> verifyForgotToken(
    String accountId,
    String token,
  ) async {
    try {
      final response = await _dio.post(
        '$baseUrl/api/verify-forgot-token',
        data: {
          'accountid': accountId,
          'token': token, // VerificationCode
        },
      );
      return response.data; // {errCode, errMessage}
    } on DioException catch (e) {
      return {'errCode': 3, 'errMessage': e.message ?? 'Lỗi kết nối'};
    }
  }

  // Hàm đổi password: POST /api/change-password
  Future<Map<String, dynamic>> changePassword(
    String accountId,
    String newPassword,
  ) async {
    try {
      final response = await _dio.put(
        // Hoặc post nếu BE dùng put
        '$baseUrl/api/change-password',
        data: {
          'accountid': accountId,
          'password': 'forgot_password', // Flag đặc biệt từ FE/BE
          'newpassword': newPassword,
        },
      );
      return response.data; // {errCode, errMessage}
    } on DioException catch (e) {
      return {'errCode': 3, 'errMessage': e.message ?? 'Lỗi kết nối'};
    }
  }

  // Hàm get AllCodes for filter
  Future<Map<String, dynamic>> getAllCodes(String type) async {
    try {
      final response = await _dio.get(
        '$baseUrl/api/get-allcodes',
        queryParameters: {'type': type}, // Param type
      );
      return response
          .data; // {errCode, data: list {Code, CodeValueVI, ExtraValue}}
    } on DioException catch (e) {
      return {'errCode': 3, 'errMessage': e.message ?? 'Lỗi kết nối'};
    }
  }

  // Hàm get sale banners
  Future<Map<String, dynamic>> getSaleBanners() async {
    try {
      final response = await _dio.get(
        '$baseUrl/api/get-sale-bannerinfo',
        queryParameters: {
          'productid': 'ALL',
        }, // Thêm param này để load all banners
      );
      return response.data; // {errCode, data: list banners}
    } on DioException catch (e) {
      return {'errCode': 3, 'errMessage': e.message ?? 'Lỗi kết nối'};
    }
  }

  // Hàm load sale products (cập nhật filter param to match 'PROMOTION', 'producttype-X', 'pettype-X')
  Future<Map<String, dynamic>> loadSaleProducts({
    int page = 1,
    int limit = 20,
    String search = '',
    String filter = 'ALL',
    String sort = '0',
  }) async {
    try {
      final response = await _dio.get(
        '$baseUrl/api/load-sale-productinfo',
        queryParameters: {
          'page': page,
          'limit': limit,
          'search': search,
          'filter':
              filter, // 'ALL', 'PROMOTION', 'producttype-Code', 'pettype-Code'
          'sort':
              sort, // '0' default, '1' sold, '2' price asc, '3' desc, '4' new
        },
      );
      return response.data; // {errCode, data: list products, totalItems}
    } on DioException catch (e) {
      return {'errCode': 3, 'errMessage': e.message ?? 'Lỗi kết nối'};
    }
  }

  // Hàm load product detail: GET /api/get-productdetailinfo
  Future<Map<String, dynamic>> getProductDetail(
    String productId,
    int? detailId,
  ) async {
    try {
      final response = await _dio.get(
        '$baseUrl/api/get-productdetailinfo',
        queryParameters: {
          'productid': productId, // Required string
          'productdetailid': detailId, // int nullable, BE handle if null
        },
      );
      return response
          .data; // {errCode, data: {ProductID, ProductName, DetailName, Stock, Promotion, etc.}}
    } on DioException catch (e) {
      return {'errCode': 3, 'errMessage': e.message ?? 'Lỗi kết nối'};
    }
  }
}
