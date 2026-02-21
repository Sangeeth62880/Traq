import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/otp_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/train/presentation/screens/live_status_screen.dart';
import '../../features/train/presentation/screens/train_search_screen.dart';

part 'app_router.g.dart';

// -----------------------------------------------------------------------------
// Dummy Screen Placeholders
// -----------------------------------------------------------------------------

class TicketsScreen extends StatelessWidget {
  const TicketsScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Tickets Screen')));
}
class LiveMapScreen extends StatelessWidget {
  const LiveMapScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Live Map Screen')));
}
class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Alerts Screen')));
}
class ConsentScreen extends StatelessWidget {
  const ConsentScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Consent Screen')));
}

class RouteOptimizerScreen extends StatelessWidget {
  const RouteOptimizerScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Route Optimizer')));
}
class TicketDetailScreen extends StatelessWidget {
  const TicketDetailScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Ticket Detail')));
}
class AddTicketScreen extends StatelessWidget {
  const AddTicketScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Add Ticket')));
}

// -----------------------------------------------------------------------------
// Unread Alerts Provider (Mock for Badge)
// -----------------------------------------------------------------------------
@riverpod
int unreadAlerts(UnreadAlertsRef ref) => 2; // Placeholder

// -----------------------------------------------------------------------------
// Router Configuration
// -----------------------------------------------------------------------------

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorHomeKey = GlobalKey<NavigatorState>(debugLabel: 'shellHome');
final _shellNavigatorTicketsKey = GlobalKey<NavigatorState>(debugLabel: 'shellTickets');
final _shellNavigatorMapKey = GlobalKey<NavigatorState>(debugLabel: 'shellMap');
final _shellNavigatorAlertsKey = GlobalKey<NavigatorState>(debugLabel: 'shellAlerts');
final _shellNavigatorProfileKey = GlobalKey<NavigatorState>(debugLabel: 'shellProfile');

@riverpod
GoRouter router(RouterRef ref) {
  final authState = ref.watch(authNotifierProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    // Redirect logic
    redirect: (context, state) async {
      // 1. If currently fetching profile / checking auth state
      if (authState.isLoading) {
        return '/splash';
      }

      final isAuthenticated = authState.valueOrNull != null;
      final isGoingToLogin = state.matchedLocation == '/login' || state.matchedLocation == '/otp';

      // 2. If NOT authenticated: Force to /login unless currently navigating there
      if (!isAuthenticated) {
        if (!isGoingToLogin) return '/login';
        return null;
      }

      // 3. If AUTHENTICATED: Prevent them from seeing /splash, /login, or /otp
      if (state.matchedLocation == '/splash' || isGoingToLogin) {
        final prefs = await SharedPreferences.getInstance();
        final consentGiven = prefs.getBool('consent_given') ?? false;

        // Ensure user goes through onboarding consent flow if required
        if (!consentGiven && authState.value?.consentGiven != true) {
          return '/onboarding/consent';
        }

        return '/home/search'; // Normal authenticated home route
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/otp',
        builder: (context, state) {
          final extras = state.extra as Map<String, dynamic>? ?? {};
          return OTPScreen(
            phoneNumber: extras['phoneNumber'] as String? ?? '',
            confirmationResult: extras['confirmationResult'],
          );
        },
      ),
      GoRoute(
        path: '/onboarding/consent',
        builder: (context, state) => const ConsentScreen(),
      ),

      // -----------------------------------------------------------------------
      // Authenticated Shell with Bottom Navigation Bar
      // -----------------------------------------------------------------------
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ScaffoldWithNavBar(navigationShell: navigationShell);
        },
        branches: [
          // Branch 0: Home
          StatefulShellBranch(
            navigatorKey: _shellNavigatorHomeKey,
            routes: [
              GoRoute(
                path: '/home/search',
                builder: (context, state) => const TrainSearchScreen(),
              ),
              GoRoute(
                path: '/home/train/:trainNumber',
                builder: (context, state) => TrainStatusScreen(
                  trainNumber: state.pathParameters['trainNumber'] ?? '',
                ),
              ),
              GoRoute(
                path: '/home/route-optimizer',
                builder: (context, state) => const RouteOptimizerScreen(),
              ),
            ],
          ),
          // Branch 1: Tickets
          StatefulShellBranch(
            navigatorKey: _shellNavigatorTicketsKey,
            routes: [
              GoRoute(
                path: '/tickets',
                builder: (context, state) => const TicketsScreen(),
                routes: [
                  GoRoute(
                    path: 'add',
                    builder: (context, state) => const AddTicketScreen(),
                  ),
                  GoRoute(
                    path: ':ticketId',
                    builder: (context, state) => const TicketDetailScreen(),
                  ),
                ],
              ),
            ],
          ),
          // Branch 2: Map
          StatefulShellBranch(
            navigatorKey: _shellNavigatorMapKey,
            routes: [
              GoRoute(
                path: '/map',
                builder: (context, state) => const LiveMapScreen(),
              ),
            ],
          ),
          // Branch 3: Alerts
          StatefulShellBranch(
            navigatorKey: _shellNavigatorAlertsKey,
            routes: [
              GoRoute(
                path: '/alerts',
                builder: (context, state) => const AlertsScreen(),
              ),
            ],
          ),
          // Branch 4: Profile
          StatefulShellBranch(
            navigatorKey: _shellNavigatorProfileKey,
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

// -----------------------------------------------------------------------------
// ScaffoldWithNavBar
// -----------------------------------------------------------------------------

class ScaffoldWithNavBar extends ConsumerWidget {
  const ScaffoldWithNavBar({
    required this.navigationShell,
    super.key,
  });

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertCount = ref.watch(unreadAlertsProvider);

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (int index) => _onTap(context, index),
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          const NavigationDestination(
            icon: Icon(Icons.confirmation_number_outlined),
            selectedIcon: Icon(Icons.confirmation_number_rounded),
            label: 'Tickets',
          ),
          const NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map_rounded),
            label: 'Map',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: alertCount > 0,
              label: Text(alertCount.toString()),
              child: const Icon(Icons.notifications_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: alertCount > 0,
              label: Text(alertCount.toString()),
              child: const Icon(Icons.notifications_rounded),
            ),
            label: 'Alerts',
          ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  void _onTap(BuildContext context, int index) {
    navigationShell.goBranch(
      index,
      // A common pattern when tapping an already active tab is to push
      // back to the root of that tab.
      initialLocation: index == navigationShell.currentIndex,
    );
  }
}
