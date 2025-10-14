// lib/providers/auth_provider.dart

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../models/product_model.dart';
import '../models/banner_model.dart';
import '../models/code_model.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = false;

  // For home/products
  List<ProductModel> _products = [];
  List<BannerModel> _banners = [];
  List<CodeModel> _productTypes = [];
  List<CodeModel> _petTypes = [];
  int _totalPages = 1;

  // For product detail (mới thêm: lưu detail để display)
  Map<String, dynamic>? _productDetail; // Raw JSON detail for screen

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  List<ProductModel> get products => _products;
  List<BannerModel> get banners => _banners;
  List<CodeModel> get productTypes => _productTypes;
  List<CodeModel> get petTypes => _petTypes;
  int get totalPages => _totalPages;
  Map<String, dynamic>? get productDetail => _productDetail;

  final ApiService _apiService = ApiService();

  void _safeNotifyListeners() {
    SchedulerBinding.instance.addPostFrameCallback((_) {
      notifyListeners();
    });
  }

  Future<void> loadUserFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user');
    final token = prefs.getString('token');
    if (userJson != null && token != null) {
      _user = UserModel.fromJson(jsonDecode(userJson));
      _token = token;
      _safeNotifyListeners();
    }
  }

  Future<Map<String, dynamic>> register({
    required String accountName,
    required String email,
    required String password,
    required String userName,
    required String phone,
    required String address,
    required String gender,
  }) async {
    _isLoading = true;
    _safeNotifyListeners();
    final result = await _apiService.register(
      accountName: accountName,
      email: email,
      password: password,
      userName: userName,
      phone: phone,
      address: address,
      gender: gender,
    );
    _isLoading = false;
    _safeNotifyListeners();
    return result;
  }

  Future<Map<String, dynamic>> login({
    required String accountName,
    required String password,
    bool rememberLogin = false,
  }) async {
    _isLoading = true;
    _safeNotifyListeners();
    final result = await _apiService.login(
      accountName: accountName,
      password: password,
      rememberLogin: rememberLogin,
    );
    if (result['errCode'] == 0) {
      _user = UserModel.fromJson(result['data']);
      _token = result['token'];
      if (rememberLogin) {
        final prefs = await SharedPreferences.getInstance();
        prefs.setString('user', jsonEncode(_user!.toJson()));
        prefs.setString('token', _token!);
      }
    }
    _isLoading = false;
    _safeNotifyListeners();
    return result;
  }

  Future<void> logout() async {
    _isLoading = true;
    _safeNotifyListeners();
    _user = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    prefs.clear();
    _isLoading = false;
    _safeNotifyListeners();
  }

  Future<Map<String, dynamic>> sendForgotToken(String email) async {
    _isLoading = true;
    _safeNotifyListeners();
    final result = await _apiService.sendForgotToken(email);
    _isLoading = false;
    _safeNotifyListeners();
    return result;
  }

  Future<Map<String, dynamic>> verifyForgotToken(
    String accountId,
    String token,
  ) async {
    _isLoading = true;
    _safeNotifyListeners();
    final result = await _apiService.verifyForgotToken(accountId, token);
    _isLoading = false;
    _safeNotifyListeners();
    return result;
  }

  Future<Map<String, dynamic>> changeForgotPassword(
    String accountId,
    String newPassword,
  ) async {
    _isLoading = true;
    _safeNotifyListeners();
    final result = await _apiService.changePassword(accountId, newPassword);
    _isLoading = false;
    _safeNotifyListeners();
    return result;
  }

  Future<void> loadCodes() async {
    final productRes = await _apiService.getAllCodes('ProductType');
    if (productRes['errCode'] == 0) {
      _productTypes = (productRes['data'] as List)
          .map((json) => CodeModel.fromJson(json))
          .toList();
    }
    final petRes = await _apiService.getAllCodes('PetType');
    if (petRes['errCode'] == 0) {
      _petTypes = (petRes['data'] as List)
          .map((json) => CodeModel.fromJson(json))
          .toList();
    }
    _safeNotifyListeners();
  }

  Future<void> loadBanners() async {
    final res = await _apiService.getSaleBanners();
    print('Load banners result: ${jsonEncode(res)}'); // Added log here
    if (res['errCode'] != 0) {
      print(
        'Banner error: ${res['errMessage']}',
      ); // Optional error-specific log
    }
    if (res['errCode'] == 0) {
      _banners = (res['data'] as List)
          .map((json) => BannerModel.fromJson(json))
          .toList();
      _safeNotifyListeners();
    }
  }

  Future<Map<String, dynamic>> loadProducts({
    int page = 1,
    int limit = 20,
    String search = '',
    String filter = 'ALL',
    String sort = '0',
  }) async {
    _isLoading = true;
    _safeNotifyListeners();
    final res = await _apiService.loadSaleProducts(
      page: page,
      limit: limit,
      search: search,
      filter: filter,
      sort: sort,
    );
    if (res['errCode'] == 0) {
      _products = (res['data'] as List)
          .map((json) => ProductModel.fromJson(json))
          .toList();
      _totalPages =
          (res['totalItems'] as int) ~/ limit +
          ((res['totalItems'] as int) % limit > 0 ? 1 : 0);
      _safeNotifyListeners();
    }
    _isLoading = false;
    return res;
  }

  // Thêm hàm getProductDetail (fix lỗi undefined)
  Future<Map<String, dynamic>> getProductDetail(
    String productId,
    int? detailId,
  ) async {
    _isLoading = true;
    _safeNotifyListeners();
    final result = await _apiService.getProductDetail(productId, detailId);
    if (result['errCode'] == 0) {
      _productDetail = result['data']; // Lưu raw detail
      _safeNotifyListeners();
    }
    _isLoading = false;
    return result;
  }
}
