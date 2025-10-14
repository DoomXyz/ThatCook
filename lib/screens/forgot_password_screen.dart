// lib/screens/forgot_password_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  _ForgotPasswordScreenState createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  int _currentStep = 1; // Bước hiện tại (1: email, 2: OTP, 3: new pass)
  final _emailController = TextEditingController();
  final _verificationCodeController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String _accountId = ''; // Lưu từ step 1
  bool _showNewPassword = false; // Show/hide new pass
  bool _showConfirmPassword = false; // Show/hide confirm

  // Toggle show/hide
  void _toggleShowPassword(bool isNew) {
    setState(() {
      if (isNew) {
        _showNewPassword = !_showNewPassword;
      } else {
        _showConfirmPassword = !_showConfirmPassword;
      }
    });
  }

  // Render form theo bước
  Widget _renderForm(AuthProvider authProvider) {
    switch (_currentStep) {
      case 1:
        return Form(
          child: Column(
            children: [
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null ||
                      value.isEmpty ||
                      !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(value)) {
                    return 'Email không hợp lệ';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: authProvider.isLoading
                    ? null
                    : () async {
                        if (_emailController.text.isNotEmpty) {
                          final result = await authProvider.sendForgotToken(
                            _emailController.text,
                          );
                          if (result['errCode'] == 0) {
                            setState(() {
                              _accountId = result['data']; // Lưu accountID
                              _currentStep = 2;
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Mã xác nhận đã gửi!'),
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(result['errMessage'] ?? 'Lỗi'),
                              ),
                            );
                          }
                        }
                      },
                child: const Text('Tiếp Tục'),
              ),
            ],
          ),
        );
      case 2:
        return Form(
          child: Column(
            children: [
              TextFormField(
                controller: _verificationCodeController,
                decoration: const InputDecoration(labelText: 'Mã Xác Minh'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: authProvider.isLoading
                    ? null
                    : () async {
                        if (_verificationCodeController.text.isNotEmpty) {
                          final result = await authProvider.verifyForgotToken(
                            _accountId,
                            _verificationCodeController.text,
                          );
                          if (result['errCode'] == 0) {
                            setState(() => _currentStep = 3);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Xác nhận thành công!'),
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(result['errMessage'] ?? 'Lỗi'),
                              ),
                            );
                          }
                        }
                      },
                child: const Text('Tiếp Tục'),
              ),
            ],
          ),
        );
      case 3:
        return Form(
          child: Column(
            children: [
              TextFormField(
                controller: _newPasswordController,
                decoration: InputDecoration(
                  labelText: 'Mật Khẩu Mới',
                  suffixIcon: IconButton(
                    icon: Icon(
                      _showNewPassword
                          ? Icons.visibility
                          : Icons.visibility_off,
                    ),
                    onPressed: () => _toggleShowPassword(true),
                  ),
                ),
                obscureText: !_showNewPassword,
                validator: (value) {
                  if (value == null || value.length < 8) {
                    return 'Mật khẩu ít nhất 8 ký tự';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _confirmPasswordController,
                decoration: InputDecoration(
                  labelText: 'Xác Nhận Mật Khẩu',
                  suffixIcon: IconButton(
                    icon: Icon(
                      _showConfirmPassword
                          ? Icons.visibility
                          : Icons.visibility_off,
                    ),
                    onPressed: () => _toggleShowPassword(false),
                  ),
                ),
                obscureText: !_showConfirmPassword,
                validator: (value) {
                  if (value != _newPasswordController.text) {
                    return 'Mật khẩu không khớp';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: authProvider.isLoading
                    ? null
                    : () async {
                        if (_newPasswordController.text ==
                                _confirmPasswordController.text &&
                            _newPasswordController.text.length >= 8) {
                          final result = await authProvider
                              .changeForgotPassword(
                                _accountId,
                                _newPasswordController.text,
                              );
                          if (result['errCode'] == 0) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Đổi mật khẩu thành công!'),
                              ),
                            );
                            Navigator.pushReplacementNamed(
                              context,
                              '/login',
                            ); // Về login
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(result['errMessage'] ?? 'Lỗi'),
                              ),
                            );
                          }
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Mật khẩu không hợp lệ hoặc không khớp',
                              ),
                            ),
                          );
                        }
                      },
                child: const Text('Hoàn Tất'),
              ),
            ],
          ),
        );
      default:
        return const SizedBox();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Quên Mật Khẩu')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Status bar như FE (các bước)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Column(
                  children: [const Icon(Icons.email), const Text('Nhập Email')],
                ),
                Column(
                  children: [const Icon(Icons.code), const Text('Xác Minh Mã')],
                ),
                Column(
                  children: [
                    const Icon(Icons.lock),
                    const Text('Đặt Lại Pass'),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (authProvider.isLoading)
              const Center(child: CircularProgressIndicator())
            else
              _renderForm(authProvider),
          ],
        ),
      ),
    );
  }
}
