// Lý do: UI form input dựa trên fields yêu cầu từ validateAccountInput (accountname, email, etc.). Sử dụng TextFormField cho validation.

// lib/screens/register_screen.dart

import 'package:flutter/material.dart'; // UI widgets
import 'package:provider/provider.dart'; // Để dùng provider
import '../providers/auth_provider.dart'; // Import provider

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>(); // Key cho form validation
  // Controllers cho input
  final _accountNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _userNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  String _gender = 'M'; // Mặc định, dropdown cho 'M', 'F', 'O'

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context); // Lấy provider

    return Scaffold(
      appBar: AppBar(title: const Text('Đăng Ký')), // Tiêu đề
      body: Padding(
        padding: const EdgeInsets.all(16.0), // Padding xung quanh
        child: Form(
          key: _formKey, // Gắn key cho validation
          child: ListView(
            // Scroll nếu form dài
            children: [
              TextFormField(
                // Input accountname
                controller: _accountNameController,
                decoration: const InputDecoration(labelText: 'Tên tài khoản'),
                validator: (value) {
                  // Validation dựa trên BE regex
                  if (value == null ||
                      value.isEmpty ||
                      !RegExp(r'^[a-zA-Z0-9_]{5,50}$').hasMatch(value)) {
                    return 'Tên tài khoản phải 5-50 ký tự, chỉ chữ cái, số, _';
                  }
                  return null;
                },
              ),
              TextFormField(
                // Input email
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: (value) {
                  if (value == null ||
                      value.isEmpty ||
                      !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(value)) {
                    return 'Email không hợp lệ';
                  }
                  return null;
                },
              ),
              TextFormField(
                // Input password
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Mật khẩu'),
                obscureText: true, // Ẩn password
                validator: (value) {
                  if (value == null || value.isEmpty || value.length < 8) {
                    return 'Mật khẩu ít nhất 8 ký tự';
                  }
                  return null;
                },
              ),
              TextFormField(
                // Input username
                controller: _userNameController,
                decoration: const InputDecoration(labelText: 'Tên người dùng'),
                validator: (value) {
                  if (value == null ||
                      value.isEmpty ||
                      !RegExp(r'^[A-Za-zÀ-ỹ0-9\s]{2,50}$').hasMatch(value)) {
                    return 'Tên người dùng 2-50 ký tự';
                  }
                  return null;
                },
              ),
              TextFormField(
                // Input phone
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Số điện thoại'),
                validator: (value) {
                  if (value == null ||
                      value.isEmpty ||
                      !RegExp(r'^[0-9]{10,11}$').hasMatch(value)) {
                    return 'Số điện thoại 10-11 số';
                  }
                  return null;
                },
              ),
              TextFormField(
                // Input address
                controller: _addressController,
                decoration: const InputDecoration(labelText: 'Địa chỉ'),
                validator: (value) {
                  if (value == null || value.isEmpty || value.length > 100) {
                    return 'Địa chỉ không quá 100 ký tự';
                  }
                  return null;
                },
              ),
              DropdownButtonFormField<String>(
                // Dropdown gender
                value: _gender,
                items: const [
                  DropdownMenuItem(value: 'M', child: Text('Nam')),
                  DropdownMenuItem(value: 'F', child: Text('Nữ')),
                  DropdownMenuItem(value: 'O', child: Text('Khác')),
                ],
                onChanged: (value) => setState(() => _gender = value!),
                decoration: const InputDecoration(labelText: 'Giới tính'),
              ),
              const SizedBox(height: 20), // Khoảng cách
              authProvider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(),
                    ) // Loading spinner
                  : ElevatedButton(
                      // Button submit
                      onPressed: () async {
                        if (_formKey.currentState!.validate()) {
                          // Check validation
                          final result = await authProvider.register(
                            accountName: _accountNameController.text,
                            email: _emailController.text,
                            password: _passwordController.text,
                            userName: _userNameController.text,
                            phone: _phoneController.text,
                            address: _addressController.text,
                            gender: _gender,
                          );
                          if (result['errCode'] == 0) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Đăng ký thành công!'),
                              ),
                            ); // Thông báo
                            Navigator.pushReplacementNamed(
                              context,
                              '/login',
                            ); // Navigate to login
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(result['errMessage'] ?? 'Lỗi'),
                              ),
                            );
                          }
                        }
                      },
                      child: const Text('Đăng Ký'),
                    ),
              TextButton(
                // Link to login
                onPressed: () => Navigator.pushNamed(context, '/login'),
                child: const Text('Đã có tài khoản? Đăng nhập'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
