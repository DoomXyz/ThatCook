// lib/screens/login_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _accountNameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberLogin = false; // Checkbox remember

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Đăng Nhập')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _accountNameController,
                decoration: const InputDecoration(labelText: 'Tên tài khoản'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập tên tài khoản';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Mật khẩu'),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập mật khẩu';
                  }
                  return null;
                },
              ),
              CheckboxListTile(
                title: const Text('Nhớ đăng nhập'),
                value: _rememberLogin,
                onChanged: (value) => setState(() => _rememberLogin = value!),
              ),
              TextButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/forgot_password'),
                child: const Text('Quên mật khẩu?'),
              ),

              authProvider.isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: () async {
                        if (_formKey.currentState!.validate()) {
                          final result = await authProvider.login(
                            accountName: _accountNameController.text,
                            password: _passwordController.text,
                            rememberLogin: _rememberLogin,
                          );
                          if (result['errCode'] == 0) {
                            print(
                              'Login success: ${result['data']}',
                            ); // Debug response
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Đăng nhập thành công!'),
                              ),
                            );
                            Navigator.pushReplacementNamed(
                              context,
                              '/home',
                            ); // Navigate to home (sẽ tạo sau)
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(result['errMessage'] ?? 'Lỗi'),
                              ),
                            );
                          }
                        }
                      },
                      child: const Text('Đăng Nhập'),
                    ),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/register'),
                child: const Text('Chưa có tài khoản? Đăng ký'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
