// lib/models/product_model.dart

class ProductModel {
  final String productId; // ProductID (string)
  final String productName; // ProductName
  final double itemPrice; // ItemPrice (parse from string)
  final String? productImage; // ProductImage
  final int? productDetailId; // ProductDetailID (int nullable)
  final String? detailName; // DetailName
  final double promotion; // Promotion (parse from string or num)

  ProductModel({
    required this.productId,
    required this.productName,
    required this.itemPrice,
    this.productImage,
    this.productDetailId,
    this.detailName,
    required this.promotion,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      productId: json['ProductID'] as String,
      productName: json['ProductName'] as String,
      itemPrice: double.tryParse(json['ItemPrice'] as String) ?? 0.0,
      productImage: json['ProductImage'] as String?,
      productDetailId: json['ProductDetailID'] as int?, // int nullable
      detailName: json['DetailName'] as String?,
      promotion:
          double.tryParse(json['Promotion'].toString()) ??
          0.0, // Fix: parse from string or num
    );
  }
}
