import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static const _keyUid = 'traq_uid';
  static const _keyIdToken = 'traq_id_token';
  static const _keyTokenExpiry = 'traq_token_expiry';

  Future<void> saveUid(String uid) => _storage.write(key: _keyUid, value: uid);

  Future<String?> getUid() => _storage.read(key: _keyUid);

  Future<void> saveIdToken(String token, DateTime expiry) async {
    await _storage.write(key: _keyIdToken, value: token);
    await _storage.write(key: _keyTokenExpiry, value: expiry.toIso8601String());
  }

  Future<String?> getValidIdToken() async {
    final expiry = await _storage.read(key: _keyTokenExpiry);
    if (expiry == null) return null;
    if (DateTime.parse(expiry).isBefore(DateTime.now())) return null;
    return _storage.read(key: _keyIdToken);
  }

  Future<void> clearAll() => _storage.deleteAll();
}
