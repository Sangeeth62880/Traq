import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:traq/features/auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _signOut(BuildContext context, WidgetRef ref) async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(
              'Sign Out',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ref.read(authNotifierProvider.notifier).signOut();
    }
  }

  void _editName(BuildContext context, WidgetRef ref, String currentName) {
    final nameController = TextEditingController(text: currentName);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit Name'),
        content: TextFormField(
          controller: nameController,
          decoration: const InputDecoration(hintText: 'Full Name'),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final newName = nameController.text.trim();
              if (newName.isNotEmpty && newName != currentName) {
                ref.read(authNotifierProvider.notifier).updateProfile({'display_name': newName});
              }
              Navigator.pop(ctx);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final userProfile = authState.value;
    final primaryColor = Theme.of(context).colorScheme.primary;

    if (userProfile == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: ListView(
        children: [
          // Profile Header
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 48,
                  backgroundColor: primaryColor.withOpacity(0.1),
                  child: userProfile.photoUrl != null
                      ? ClipOval(
                          child: CachedNetworkImage(
                            imageUrl: userProfile.photoUrl!,
                            width: 96,
                            height: 96,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => const CircularProgressIndicator(),
                            errorWidget: (context, url, err) => Text(
                              userProfile.displayName[0].toUpperCase(),
                              style: TextStyle(fontSize: 32, color: primaryColor),
                            ),
                          ),
                        )
                      : Text(
                          userProfile.displayName.isNotEmpty ? userProfile.displayName[0].toUpperCase() : 'U',
                          style: TextStyle(fontSize: 32, color: primaryColor, fontWeight: FontWeight.bold),
                        ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      userProfile.displayName,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit, size: 20),
                      onPressed: () => _editName(context, ref, userProfile.displayName),
                      color: primaryColor,
                    ),
                  ],
                ),
                Text(
                  userProfile.phone ?? userProfile.email ?? 'No contact info',
                  style: const TextStyle(fontSize: 16, color: Colors.grey),
                ),
              ],
            ),
          ),
          
          const Divider(height: 1),

          // Preferences Section
          const Padding(
            padding: EdgeInsets.fromLTRB(24, 24, 24, 8),
            child: Text('PREFERENCES', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
          ),
          ListTile(
            leading: const Icon(Icons.language_rounded),
            title: const Text('Language'),
            trailing: DropdownButton<String>(
              value: userProfile.preferredLanguage,
              underline: const SizedBox(),
              items: const [
                DropdownMenuItem(value: 'en', child: Text('English')),
                DropdownMenuItem(value: 'hi', child: Text('हिन्दी')),
                DropdownMenuItem(value: 'mr', child: Text('मराठी')),
                DropdownMenuItem(value: 'ta', child: Text('தமிழ்')),
              ],
              onChanged: (val) {
                if (val != null) {
                  ref.read(authNotifierProvider.notifier).updateProfile({'preferred_language': val});
                }
              },
            ),
          ),
          ListTile(
            leading: const Icon(Icons.notifications_rounded),
            title: const Text('Notifications'),
            trailing: Switch(
              value: true, // Placeholder for actual notifications pref
              onChanged: (val) {
                // To be implemented in Phase 4
              },
            ),
          ),

          const Divider(height: 1),

          // Account Section
          const Padding(
            padding: EdgeInsets.fromLTRB(24, 24, 24, 8),
            child: Text('ACCOUNT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_rounded),
            title: const Text('Privacy Policy'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _launchURL('https://traq.example.com/privacy'),
          ),
          ListTile(
            leading: const Icon(Icons.description_rounded),
            title: const Text('Terms of Service'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _launchURL('https://traq.example.com/terms'),
          ),
          const ListTile(
            leading: Icon(Icons.info_rounded),
            title: Text('About Traq'),
            trailing: Text('Version 1.0.0', style: TextStyle(color: Colors.grey)),
          ),

          const Divider(height: 1),

          // Danger Zone
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListTile(
              leading: Icon(Icons.logout_rounded, color: Theme.of(context).colorScheme.error),
              title: Text(
                'Sign Out',
                style: TextStyle(color: Theme.of(context).colorScheme.error, fontWeight: FontWeight.bold),
              ),
              onTap: () => _signOut(context, ref),
            ),
          ),
          
          // Padding for bottom nav bar
          const SizedBox(height: 48),
        ],
      ),
    );
  }
}
