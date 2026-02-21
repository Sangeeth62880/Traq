import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:traq/features/auth/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Safety timeout: if auth takes too long, force re-evaluation
    Future.delayed(3.seconds, () {
      if (mounted) {
        ref.invalidate(authNotifierProvider);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A56DB),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 120,
              height: 120,
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Text(
                    '🚂',
                    style: TextStyle(fontSize: 64),
                  ),
                ),
              ),
            ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.3, end: 0),
            
            const SizedBox(height: 24),
            
            const Text(
              'TRAQ',
              style: TextStyle(
                fontSize: 40,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 8,
              ),
            ).animate().fadeIn(delay: 200.ms, duration: 600.ms),
            
            const SizedBox(height: 12),
            
            const Text(
              'Know your coach. Beat the crowd.',
              style: TextStyle(
                fontSize: 14,
                color: Colors.white70,
              ),
            ).animate().fadeIn(delay: 400.ms, duration: 600.ms),
            
            const SizedBox(height: 48),
            
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ).animate().fadeIn(delay: 800.ms),
          ],
        ),
      ),
    );
  }
}
