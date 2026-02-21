import 'dart:async';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:traq/features/auth/providers/auth_provider.dart';

class OTPScreen extends ConsumerStatefulWidget {
  final String phoneNumber;
  final ConfirmationResult? confirmationResult;

  const OTPScreen({
    super.key,
    required this.phoneNumber,
    this.confirmationResult,
  });

  @override
  ConsumerState<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends ConsumerState<OTPScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  bool _isLoading = false;
  String? _errorMsg;
  Timer? _autoVerifyTimer;
  ConfirmationResult? _currentConfirmation;

  @override
  void initState() {
    super.initState();
    _currentConfirmation = widget.confirmationResult;
    for (int i = 0; i < 6; i++) {
      _controllers[i].addListener(() => _onBoxChanged(i));
    }
  }

  @override
  void dispose() {
    _autoVerifyTimer?.cancel();
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onBoxChanged(int index) {
    if (_errorMsg != null) setState(() => _errorMsg = null);

    final text = _controllers[index].text;

    // Move to next box
    if (text.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
    
    // Auto-verify if all filled
    final otp = _controllers.map((c) => c.text).join();
    if (otp.length == 6) {
      _autoVerifyTimer?.cancel();
      _autoVerifyTimer = Timer(const Duration(milliseconds: 500), () => _verifyOTP(otp));
    } else {
      _autoVerifyTimer?.cancel();
    }
  }

  Future<void> _verifyOTP(String otp) async {
    if (_currentConfirmation == null) {
      setState(() => _errorMsg = 'Session expired. Please request a new OTP.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = null;
    });

    try {
      await ref.read(authNotifierProvider.notifier).verifyOTP(_currentConfirmation!, otp);
      // Success router redirect logic picks up auth change
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _errorMsg = humanizeAuthError(e));
    } catch (e) {
      if (mounted) setState(() => _errorMsg = 'An unexpected error occurred.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resendOTP() async {
    setState(() {
      _isLoading = true;
      _errorMsg = null;
    });

    try {
      final newConf = await ref.read(authNotifierProvider.notifier).signInWithPhone(widget.phoneNumber);
      if (mounted) {
        setState(() {
          _currentConfirmation = newConf;
          for (var c in _controllers) { c.clear(); }
        });
        // reset timer handled by the key on CountdownTimer widget below
      }
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _errorMsg = humanizeAuthError(e));
    } catch (e) {
      if (mounted) setState(() => _errorMsg = 'Failed to resend OTP.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).colorScheme.primary;
    final dangerColor = Theme.of(context).colorScheme.error;
    
    final currentOtp = _controllers.map((c) => c.text).join();
    final isComplete = currentOtp.length == 6;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Verify Phone'),
        backgroundColor: Colors.transparent,
        foregroundColor: Theme.of(context).colorScheme.onSurface,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Enter OTP',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'We have sent a 6-digit verification code to\n${widget.phoneNumber}',
                style: const TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 32),

              // OTP Boxes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (index) {
                  return SizedBox(
                    width: 44,
                    height: 56,
                    child: TextFormField(
                      controller: _controllers[index],
                      focusNode: _focusNodes[index],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 1,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      decoration: InputDecoration(
                        counterText: '',
                        filled: true,
                        fillColor: _controllers[index].text.isNotEmpty ? Colors.grey[100] : Colors.white,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(
                            color: _errorMsg != null ? dangerColor : Colors.grey[300]!,
                            width: 1.5,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(
                            color: _errorMsg != null ? dangerColor : primaryColor,
                            width: 2,
                          ),
                        ),
                      ),
                      onChanged: (val) {
                        // Handle backspace manually via FocusNode keyEvents if needed, 
                        // but a simple text wipe check handles empty triggers smoothly.
                        if (val.isEmpty && index > 0) {
                          _focusNodes[index - 1].requestFocus();
                        }
                      },
                    ),
                  );
                }),
              ),

              const SizedBox(height: 16),

              // Error Message
              AnimatedOpacity(
                opacity: _errorMsg != null ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 300),
                child: Text(
                  _errorMsg ?? '',
                  style: TextStyle(color: dangerColor, fontWeight: FontWeight.w500),
                  textAlign: TextAlign.center,
                ),
              ),

              const SizedBox(height: 24),

              // Verify Button
              ElevatedButton(
                onPressed: _isLoading || !isComplete ? null : () => _verifyOTP(currentOtp),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Verify', style: TextStyle(fontSize: 16)),
              ),

              const Spacer(),

              // Resend Timer
              Center(
                child: CountdownTimer(
                  key: ValueKey(_currentConfirmation?.verificationId),
                  seconds: 60,
                  onResend: _resendOTP,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Countdown Timer Widget
// -----------------------------------------------------------------------------
class CountdownTimer extends StatefulWidget {
  final int seconds;
  final VoidCallback onResend;

  const CountdownTimer({super.key, required this.seconds, required this.onResend});

  @override
  State<CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<CountdownTimer> {
  late int _remaining;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _remaining = widget.seconds;
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remaining > 0) {
        setState(() => _remaining--);
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_remaining > 0) {
      return Text(
        'Resend in ${_remaining}s',
        style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w500),
      );
    }
    return InkWell(
      onTap: widget.onResend,
      child: Text(
        'Resend OTP',
        style: TextStyle(
          color: Theme.of(context).colorScheme.primary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
