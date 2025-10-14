// lib/screens/home_screen.dart

import 'dart:async';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/banner_model.dart';
import '../models/code_model.dart';
import '../models/product_model.dart';
import 'product_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchController = TextEditingController();
  Timer? _debounce;
  int _currentPage = 1;
  int _limit = 20;
  String _filter = 'ALL';
  String _sort = '0';

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    auth.loadCodes();
    auth.loadBanners();
    auth.loadProducts(page: _currentPage, limit: _limit);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      Provider.of<AuthProvider>(context, listen: false).loadProducts(
        page: 1,
        limit: _limit,
        search: value,
        filter: _filter,
        sort: _sort,
      );
      setState(() => _currentPage = 1);
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          decoration: const InputDecoration(hintText: 'Tìm kiếm...'),
          onChanged: _onSearchChanged,
        ),
      ),
      body: auth.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  // Banner slider
                  if (auth.banners.isNotEmpty)
                    CarouselSlider(
                      options: CarouselOptions(
                        height:
                            200.0, // Thêm: Fixed height 200 pixels (adjust số này để thay đổi kích thước cao)
                        // Hoặc dùng aspectRatio: 16 / 9,  // Comment height nếu dùng, cho tỷ lệ wide (e.g. 16:9)
                        autoPlay: true,
                        autoPlayInterval: const Duration(seconds: 5),
                        viewportFraction:
                            1.0, // Thêm: Banner full width màn hình
                        enlargeCenterPage:
                            false, // Tùy chọn: Không enlarge center để size đều
                      ),
                      items: auth.banners.map((banner) {
                        return GestureDetector(
                          onTap: () {
                            if (banner.productId != null) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ProductDetailScreen(
                                    productId: banner.productId!,
                                    detailId: null, // Default null for banner
                                  ),
                                ),
                              );
                            }
                          },
                          child: Image.network(
                            banner.bannerImage,
                            fit: BoxFit.cover, // Giữ để image fill banner
                            width: double.infinity, // Force full width
                          ),
                        );
                      }).toList(),
                    )
                  else
                    const Text('Không có banner'),
                  const SizedBox(height: 16),
                  // Filter và Sort
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      DropdownButton<String>(
                        value: _filter,
                        items: [
                          const DropdownMenuItem(
                            value: 'ALL',
                            child: Text('Tất cả'),
                          ),
                          const DropdownMenuItem(
                            value: 'PROMOTION',
                            child: Text('Khuyến mãi'),
                          ),
                          // Optgroup for ProductType
                          DropdownMenuItem(
                            enabled: false,
                            child: Text(
                              'Loại sản phẩm',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                          ...auth.productTypes.map(
                            (type) => DropdownMenuItem(
                              value: 'producttype-${type.code}',
                              child: Text(type.codeValueVI),
                            ),
                          ),
                          // Optgroup for PetType
                          DropdownMenuItem(
                            enabled: false,
                            child: Text(
                              'Loại thú cưng',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                          ...auth.petTypes.map(
                            (type) => DropdownMenuItem(
                              value: 'pettype-${type.code}',
                              child: Text('Cho ${type.codeValueVI}'),
                            ),
                          ),
                        ],
                        onChanged: (value) {
                          if (value != null &&
                              value != 'ALL' &&
                              value != 'PROMOTION') {
                            // Skip optgroup
                            setState(() => _filter = value);
                            auth.loadProducts(
                              page: 1,
                              limit: _limit,
                              filter: _filter,
                              sort: _sort,
                            );
                            setState(() => _currentPage = 1);
                          }
                        },
                      ),
                      DropdownButton<String>(
                        value: _sort,
                        items: const [
                          DropdownMenuItem(value: '0', child: Text('Mặc định')),
                          DropdownMenuItem(value: '1', child: Text('Bán chạy')),
                          DropdownMenuItem(value: '2', child: Text('Giá tăng')),
                          DropdownMenuItem(value: '3', child: Text('Giá giảm')),
                          DropdownMenuItem(value: '4', child: Text('Mới về')),
                        ],
                        onChanged: (value) {
                          if (value != null) {
                            setState(() => _sort = value);
                            auth.loadProducts(
                              page: 1,
                              limit: _limit,
                              filter: _filter,
                              sort: _sort,
                            );
                            setState(() => _currentPage = 1);
                          }
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Products Grid
                  auth.products.isEmpty
                      ? const Center(child: Text('Không tìm thấy sản phẩm'))
                      : GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.75,
                              ),
                          itemCount: auth.products.length,
                          itemBuilder: (context, index) {
                            final product = auth.products[index];
                            return Card(
                              child: GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => ProductDetailScreen(
                                        productId: product.productId,
                                        detailId: product
                                            .productDetailId, // int? pass to int?
                                      ),
                                    ),
                                  );
                                },
                                child: Column(
                                  children: [
                                    if (product.productImage != null)
                                      Image.network(
                                        product.productImage!,
                                        height: 100,
                                        fit: BoxFit.cover,
                                      ),
                                    Text(product.productName),
                                    Text('Giá: ${product.itemPrice} VND'),
                                    if (product.promotion > 0)
                                      Text('(${product.promotion}%)'),
                                    Text(
                                      '(Mặc định: ${product.detailName ?? ''})',
                                    ),
                                    ElevatedButton(
                                      onPressed: () {
                                        // Add to cart placeholder
                                      },
                                      child: const Text('Thêm Giỏ'),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                  const SizedBox(height: 16),
                  // Pagination
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back),
                        onPressed: _currentPage > 1
                            ? () {
                                setState(() => _currentPage--);
                                auth.loadProducts(
                                  page: _currentPage,
                                  limit: _limit,
                                  filter: _filter,
                                  sort: _sort,
                                );
                              }
                            : null,
                      ),
                      Text('$_currentPage / ${auth.totalPages}'),
                      IconButton(
                        icon: const Icon(Icons.arrow_forward),
                        onPressed: _currentPage < auth.totalPages
                            ? () {
                                setState(() => _currentPage++);
                                auth.loadProducts(
                                  page: _currentPage,
                                  limit: _limit,
                                  filter: _filter,
                                  sort: _sort,
                                );
                              }
                            : null,
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}
