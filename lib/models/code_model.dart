//  CodeModel cho AllCodes (Code, CodeValueVI, ExtraValue) dùng cho filter dropdown.
// lib/models/code_model.dart

class CodeModel {
  final String code; // Code
  final String codeValueVI; // CodeValueVI
  final double? extraValue; // ExtraValue (nullable)

  CodeModel({required this.code, required this.codeValueVI, this.extraValue});

  factory CodeModel.fromJson(Map<String, dynamic> json) {
    return CodeModel(
      code: json['Code'] as String,
      codeValueVI: json['CodeValueVI'] as String,
      extraValue: json['ExtraValue'] != null
          ? (json['ExtraValue'] as num).toDouble()
          : null,
    );
  }
}
