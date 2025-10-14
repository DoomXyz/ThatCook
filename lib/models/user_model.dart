// Lý do file này: Để parse response JSON từ API login/register thành object Dart. Dựa trên data từ accountService: data có AccountID, UserName, UserImage, etc. (exclude Password).

// lib/models/user_model.dart

class UserModel {
  final String accountId; // AccountID từ API
  final String accountName; // AccountName
  final String userName; // UserName
  final String? userImage; // UserImage (có thể null)
  final String accountStatus; // AccountStatus (ví dụ 'ACT')
  final String accountType; // AccountType (ví dụ 'C' cho customer)
  final String? navigate; // Navigate từ response login (không bắt buộc)

  UserModel({
    required this.accountId,
    required this.accountName,
    required this.userName,
    this.userImage,
    required this.accountStatus,
    required this.accountType,
    this.navigate,
  });

  // Factory để parse từ JSON (response.data từ API)
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      accountId: json['AccountID'] as String,
      accountName: json['AccountName'] as String,
      userName: json['UserName'] as String,
      userImage: json['UserImage'] as String?,
      accountStatus: json['AccountStatus'] as String,
      accountType: json['AccountType'] as String,
      navigate: json['navigate'] as String?,
    );
  }

  // Để lưu vào storage (shared_preferences), convert to Map
  Map<String, dynamic> toJson() {
    return {
      'AccountID': accountId,
      'AccountName': accountName,
      'UserName': userName,
      'UserImage': userImage,
      'AccountStatus': accountStatus,
      'AccountType': accountType,
      'navigate': navigate,
    };
  }
}
