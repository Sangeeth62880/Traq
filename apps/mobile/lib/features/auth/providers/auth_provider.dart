// =============================================================================
// Run this command to generate the .g.dart file:
// flutter pub run build_runner build --delete-conflicting-outputs
// =============================================================================

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/services/secure_storage_service.dart';

part 'auth_provider.g.dart';

// Represents the UserProfile interface from @traq/shared-types
class UserProfile {
  final String uid;
  final String displayName;
  final String? email;
  final String? phone;
  final String? photoUrl;
  final String preferredLanguage;
  final List<dynamic> savedRoutes;
  final bool consentGiven;
  final String? consentVersion;
  final String? consentTimestamp;
  final String createdAt;
  final String? updatedAt;

  UserProfile({
    required this.uid,
    required this.displayName,
    this.email,
    this.phone,
    this.photoUrl,
    required this.preferredLanguage,
    required this.savedRoutes,
    required this.consentGiven,
    this.consentVersion,
    this.consentTimestamp,
    required this.createdAt,
    this.updatedAt,
  });

  factory UserProfile.fromFirestore(Map<String, dynamic> data, String uid) {
    return UserProfile(
      uid: uid,
      displayName: data['display_name'] as String? ?? 'User',
      email: data['email'] as String?,
      phone: data['phone'] as String?,
      photoUrl: data['photo_url'] as String?,
      preferredLanguage: data['preferred_language'] as String? ?? 'en',
      savedRoutes: data['saved_routes'] as List<dynamic>? ?? [],
      consentGiven: data['consent_given'] as bool? ?? false,
      consentVersion: data['consent_version'] as String?,
      consentTimestamp: data['consent_timestamp'] as String?,
      createdAt: data['created_at'] as String? ?? DateTime.now().toIso8601String(),
      updatedAt: data['updated_at'] as String?,
    );
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

bool isValidIndianPhone(String phone) {
  final cleaned = phone.replaceAll(RegExp(r'\s+'), '');
  return RegExp(r'^\+91[6-9]\d{9}$').hasMatch(cleaned) || RegExp(r'^[6-9]\d{9}$').hasMatch(cleaned);
}

const Map<String, String> _firebaseErrorMessages = {
  'invalid-phone-number': 'Please enter a valid 10-digit mobile number',
  'too-many-requests': 'Too many attempts. Please wait a few minutes and try again',
  'invalid-verification-code': 'Incorrect OTP. Please check and try again',
  'code-expired': 'OTP has expired. Please request a new one',
  'network-request-failed': 'No internet connection. Please check your network',
  'user-disabled': 'This account has been disabled. Please contact support',
};

String humanizeAuthError(FirebaseAuthException e) {
  return _firebaseErrorMessages[e.code] ?? 'Something went wrong. Please try again';
}

// -----------------------------------------------------------------------------
// Providers
// -----------------------------------------------------------------------------

@riverpod
Stream<User?> firebaseAuthState(FirebaseAuthStateRef ref) {
  return FirebaseAuth.instance.authStateChanges();
}

@riverpod
class AuthNotifier extends _$AuthNotifier {
  final _secureStorage = SecureStorageService();

  @override
  Future<UserProfile?> build() async {
    // Watch Firebase auth state. When user signs in, this rebuilds.
    final user = await ref.watch(firebaseAuthStateProvider.future);
    
    if (user == null) {
      await _secureStorage.clearAll();
      return null;
    }

    try {
      // Force token refresh on sign-in payload processing occasionally
      final idTokenResult = await user.getIdTokenResult(true);
      await _secureStorage.saveUid(user.uid);
      if (idTokenResult.token != null && idTokenResult.expirationTime != null) {
        await _secureStorage.saveIdToken(idTokenResult.token!, idTokenResult.expirationTime!);
      }
    } catch (_) {} // Ignore token refresh errors silently

    return _fetchOrCreateUserProfile(user);
  }

  Future<void> signInWithGoogle() async {
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      
      if (googleUser == null) return; // User canceled the sign-in

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      await FirebaseAuth.instance.signInWithCredential(credential);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signInWithEmailAndPassword(String email, String password) async {
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signUpWithEmailAndPassword(String email, String password, String displayName) async {
    try {
      final credential = await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      if (credential.user != null) {
        await credential.user!.updateDisplayName(displayName);
        // Profile creation is handled by the build() listener auto-triggering
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<ConfirmationResult> signInWithPhone(String phoneNumber) async {
    return await FirebaseAuth.instance.signInWithPhoneNumber(phoneNumber);
  }

  Future<void> verifyOTP(ConfirmationResult confirmation, String otp) async {
    await confirmation.confirm(otp);
    // User state updates automatically via authStateChanges stream, 
    // so build() will re-run and fetch the profile.
  }

  Future<void> signOut() async {
    await FirebaseAuth.instance.signOut();
    await _secureStorage.clearAll();
  }

  Future<void> updateProfile(Map<String, dynamic> updates) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    
    updates['updated_at'] = DateTime.now().toIso8601String();
    await FirebaseFirestore.instance.collection('users').doc(user.uid).set(updates, SetOptions(merge: true));
    
    // Invalidate state to trigger rebuild and re-fetch profile
    ref.invalidateSelf();
  }

  Future<UserProfile> _fetchOrCreateUserProfile(User user) async {
    final docRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
    final snapshot = await docRef.get();

    if (snapshot.exists && snapshot.data() != null) {
      return UserProfile.fromFirestore(snapshot.data()!, user.uid);
    }

    // Auto-create defaults if it doesn't exist
    final newData = {
      'display_name': user.displayName ?? 'User',
      'email': user.email,
      'phone': user.phoneNumber,
      'photo_url': user.photoURL,
      'preferred_language': 'en',
      'saved_routes': [],
      'consent_given': false,
      'created_at': DateTime.now().toIso8601String(),
    };

    await docRef.set(newData);
    return UserProfile.fromFirestore(newData, user.uid);
  }
}
