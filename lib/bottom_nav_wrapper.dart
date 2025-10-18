// lib/bottom_nav_wrapper.dart

import 'package:flutter/material.dart';
import 'package:google_nav_bar/google_nav_bar.dart'; // Import mới cho google_nav_bar
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'screens/home_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/invoice_screen.dart';
import 'screens/admin_screen.dart';
import 'screens/profile_screen.dart';

class BottomNavWrapper extends StatefulWidget {
  const BottomNavWrapper({super.key});

  @override
  _BottomNavWrapperState createState() => _BottomNavWrapperState();
}

class _BottomNavWrapperState extends State<BottomNavWrapper> {
  int _selectedIndex = 0; // State cho tab selected

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    if (auth.user == null) {
      Future.microtask(() => Navigator.pushReplacementNamed(context, '/login'));
      return const SizedBox();
    }

    final isCustomer = auth.user?.accountType == 'C';

    // Danh sách screens
    final List<Widget> screens = [
      const HomeScreen(),
      const CartScreen(),
      isCustomer ? const InvoiceScreen() : const AdminScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: screens[_selectedIndex], // Switch screen dựa index
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(blurRadius: 20, color: Colors.black.withOpacity(.1))
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 8),
            child: GNav(
              rippleColor: Colors.grey[300]!,
              hoverColor: Colors.grey[100]!,
              gap: 8,
              activeColor: Colors.blue,
              iconSize: 24,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              duration: const Duration(milliseconds: 400),
              tabBackgroundColor: Colors.blue[100]!,
              color: Colors.grey,
              tabs: [
                const GButton(icon: Icons.home, text: 'Trang chủ'),
                const GButton(icon: Icons.shopping_cart, text: 'Giỏ hàng'),
                GButton(
                    icon:
                        isCustomer ? Icons.search : Icons.admin_panel_settings,
                    text: isCustomer ? 'Tra cứu' : 'Quản trị'),
                const GButton(icon: Icons.person, text: 'Thông tin'),
              ],
              selectedIndex: _selectedIndex,
              onTabChange: (index) {
                setState(() => _selectedIndex = index); // Update tab
              },
            ),
          ),
        ),
      ),
    );
  }
}
