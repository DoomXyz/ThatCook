// lib/main.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/forgot_password_screen.dart'; // Import mới
// import 'screens/home_screen.dart';  // Sẽ tạo sau

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // Init binding
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      // Wrap provider
      create: (context) =>
          AuthProvider()..loadUserFromStorage(), // Init và load storage
      child: MaterialApp(
        title: 'Pet Accessories App',
        theme: ThemeData(primarySwatch: Colors.blue), // Theme cơ bản
        initialRoute: '/login', // Bắt đầu từ login
        routes: {
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          // '/home': (context) => const HomeScreen(),  // Sẽ add sau
          '/home': (context) => const HomeScreen(), // Thêm dòng này
          '/forgot_password': (context) => const ForgotPasswordScreen(), // Thêm
        },
      ),
    );
  }
}
