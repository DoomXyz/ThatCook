// Lý do: Parse data banner từ getBannerSaleInfo (BannerID, BannerImage, ProductID, ProductName, ProductImage).
// lib/models/banner_model.dart

class BannerModel {
  final int bannerId; // BannerID
  final String bannerImage; // BannerImage
  final String? productId; // ProductID (nullable)
  final String? productName; // ProductName (nullable)
  final String? productImage; // ProductImage (nullable)

  BannerModel({
    required this.bannerId,
    required this.bannerImage,
    this.productId,
    this.productName,
    this.productImage,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      bannerId: json['BannerID'] as int,
      bannerImage: json['BannerImage'] as String,
      productId: json['ProductID'] as String?,
      productName: json['ProductName'] as String?,
      productImage: json['ProductImage'] as String?,
    );
  }
}
