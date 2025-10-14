// lib/screens/product_detail_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;
  final int? detailId;

  const ProductDetailScreen({
    super.key,
    required this.productId,
    this.detailId,
  });

  @override
  _ProductDetailScreenState createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  @override
  void initState() {
    super.initState();
    // Load detail
    Provider.of<AuthProvider>(
      context,
      listen: false,
    ).getProductDetail(widget.productId, widget.detailId);
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final detail = auth.productDetail; // Raw data from provider

    if (auth.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (detail == null) {
      return const Scaffold(
        body: Center(child: Text('Lỗi load chi tiết sản phẩm')),
      );
    }

    // Parse fields từ detail
    final productName = detail['ProductName'] as String? ?? 'N/A';
    final price = detail['ProductPrice'] as double? ?? 0.0;
    final description =
        detail['ProductDescription'] as String? ?? 'No description';
    final detailName = detail['DetailName'] as String? ?? 'Default';
    final stock = detail['Stock'] as int? ?? 0;
    final promotion = detail['Promotion'] as double? ?? 0.0;
    final images =
        detail['Image'] as List<dynamic>? ?? []; // List images từ BE response

    return Scaffold(
      appBar: AppBar(title: Text(productName)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Main image
            if (detail['ProductImage'] != null)
              Image.network(
                detail['ProductImage'] as String,
                height: 200,
                fit: BoxFit.cover,
              ),
            const SizedBox(height: 16),
            Text(
              'Giá: $price VND',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            if (promotion > 0)
              Text(
                'Khuyến mãi: $promotion%',
                style: const TextStyle(color: Colors.red),
              ),
            const SizedBox(height: 8),
            Text('Chi tiết: $detailName'),
            Text('Tồn kho: $stock'),
            const SizedBox(height: 16),
            Text('Mô tả: $description'),
            const SizedBox(height: 16),
            // List images phụ
            if (images.isNotEmpty)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Ảnh phụ:'),
                  SizedBox(
                    height: 100,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: images.length,
                      itemBuilder: (context, index) {
                        final image = images[index] as Map<String, dynamic>;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: Image.network(
                            image['Image'] as String,
                            width: 100,
                            fit: BoxFit.cover,
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // Placeholder add to cart with this detail
              },
              child: const Text('Thêm Vào Giỏ'),
            ),
          ],
        ),
      ),
    );
  }
}
