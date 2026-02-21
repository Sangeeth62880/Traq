import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:traq/features/auth/providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _displayNameController = TextEditingController();
  
  bool _isLoading = false;
  bool _isRegistering = false;
  String? _errorMsg;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _displayNameController.dispose();
    super.dispose();
  }

  Future<void> _handlePhoneSignIn() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) return;

    if (!isValidIndianPhone(phone)) {
      setState(() => _errorMsg = 'Please enter a valid 10-digit mobile number');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = null;
    });

    try {
      final String formattedPhone = phone.startsWith('+91') ? phone : '+91$phone';
      final confirmation = await ref.read(authNotifierProvider.notifier).signInWithPhone(formattedPhone);

      if (mounted) {
        context.push('/otp', extra: {
          'phoneNumber': formattedPhone,
          'confirmationResult': confirmation,
        });
      }
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _errorMsg = humanizeAuthError(e));
    } catch (e) {
      if (mounted) setState(() => _errorMsg = 'An unexpected error occurred. Please try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleEmailAuth() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final displayName = _displayNameController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMsg = 'Please fill in all fields');
      return;
    }

    if (_isRegistering && displayName.isEmpty) {
      setState(() => _errorMsg = 'Please enter your name');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = null;
    });

    try {
      if (_isRegistering) {
        await ref.read(authNotifierProvider.notifier).signUpWithEmailAndPassword(email, password, displayName);
      } else {
        await ref.read(authNotifierProvider.notifier).signInWithEmailAndPassword(email, password);
      }
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _errorMsg = humanizeAuthError(e));
    } catch (e) {
      if (mounted) setState(() => _errorMsg = 'Authentication failed. Please check your credentials.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMsg = null;
    });

    try {
      await ref.read(authNotifierProvider.notifier).signInWithGoogle();
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _errorMsg = humanizeAuthError(e));
    } catch (e) {
      if (mounted) {
        setState(() => _errorMsg = 'Google Sign-In failed. Please ensure your device is configured correctly.');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final primaryColor = Theme.of(context).colorScheme.primary;

    return Scaffold(
      body: SingleChildScrollView(
        child: SizedBox(
          height: screenHeight,
          child: Column(
            children: [
              // --- Top Gradient Section ---
              Container(
                height: screenHeight * 0.3,
                width: double.infinity,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1A56DB), Color(0xFF1E40AF)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('🚂', style: TextStyle(fontSize: 48)),
                    SizedBox(height: 12),
                    Text(
                      'TRAQ',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 4,
                      ),
                    ),
                  ],
                ),
              ),

              // --- Bottom White Card Section ---
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(24),
                      topRight: Radius.circular(24),
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TabBar(
                          controller: _tabController,
                          labelColor: primaryColor,
                          unselectedLabelColor: Colors.grey,
                          indicatorColor: primaryColor,
                          tabs: const [
                            Tab(text: 'Phone'),
                            Tab(text: 'Email'),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Error Banner
                        if (_errorMsg != null)
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.error.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Theme.of(context).colorScheme.error.withOpacity(0.3)),
                            ),
                            child: Text(
                              _errorMsg!,
                              style: TextStyle(color: Theme.of(context).colorScheme.error),
                              textAlign: TextAlign.center,
                            ),
                          ),

                        Expanded(
                          child: TabBarView(
                            controller: _tabController,
                            children: [
                              // Phone Tab
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        height: 52,
                                        padding: const EdgeInsets.symmetric(horizontal: 16),
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          color: Colors.grey[100],
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: const Text('+91', style: TextStyle(fontWeight: FontWeight.bold)),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: TextFormField(
                                          controller: _phoneController,
                                          keyboardType: TextInputType.phone,
                                          maxLength: 10,
                                          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                                          decoration: const InputDecoration(counterText: '', hintText: 'Mobile Number'),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 24),
                                  ElevatedButton(
                                    onPressed: _isLoading || _phoneController.text.length < 10 ? null : _handlePhoneSignIn,
                                    child: _isLoading ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2) : const Text('Send OTP'),
                                  ),
                                ],
                              ),

                              // Email Tab
                              ListView(
                                padding: EdgeInsets.zero,
                                children: [
                                  if (_isRegistering) ...[
                                    TextFormField(
                                      controller: _displayNameController,
                                      decoration: const InputDecoration(hintText: 'Full Name', prefixIcon: Icon(Icons.person_outline)),
                                    ),
                                    const SizedBox(height: 16),
                                  ],
                                  TextFormField(
                                    controller: _emailController,
                                    keyboardType: TextInputType.emailAddress,
                                    decoration: const InputDecoration(hintText: 'Email Address', prefixIcon: Icon(Icons.email_outlined)),
                                  ),
                                  const SizedBox(height: 16),
                                  TextFormField(
                                    controller: _passwordController,
                                    obscureText: true,
                                    decoration: const InputDecoration(hintText: 'Password', prefixIcon: Icon(Icons.lock_outline)),
                                  ),
                                  const SizedBox(height: 24),
                                  ElevatedButton(
                                    onPressed: _isLoading ? null : _handleEmailAuth,
                                    child: _isLoading ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2) : Text(_isRegistering ? 'Create Account' : 'Sign In'),
                                  ),
                                  TextButton(
                                    onPressed: () => setState(() => _isRegistering = !_isRegistering),
                                    child: Text(_isRegistering ? 'Already have an account? Sign In' : 'New to Traq? Create Account'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),
                        Row(
                          children: [
                            const Expanded(child: Divider()),
                            Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text('OR', style: TextStyle(color: Colors.grey.shade400))),
                            const Expanded(child: Divider()),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Google Sign-In
                        OutlinedButton.icon(
                          onPressed: _isLoading ? null : _handleGoogleSignIn,
                          icon: Image.network('https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg', height: 18, errorBuilder: (_, __, ___) => const Text('G')),
                          label: const Text('Continue with Google'),
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size.fromHeight(52),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),

                        const SizedBox(height: 24),
                        // Terms
                        Wrap(
                          alignment: WrapAlignment.center,
                          children: [
                            const Text('By continuing, you agree to our ', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            InkWell(
                              onTap: () => _launchURL('https://traq.example.com/terms'),
                              child: Text('Terms', style: TextStyle(fontSize: 12, color: primaryColor, fontWeight: FontWeight.w600)),
                            ),
                            const Text(' & ', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            InkWell(
                              onTap: () => _launchURL('https://traq.example.com/privacy'),
                              child: Text('Privacy Policy', style: TextStyle(fontSize: 12, color: primaryColor, fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
