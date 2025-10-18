// lib/screens/admin_screen.dart

import 'package:flutter/material.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Quản Trị')),
      body: const Center(child: Text('Giao diện quản trị - Add code sau')),
    );
  }
}
