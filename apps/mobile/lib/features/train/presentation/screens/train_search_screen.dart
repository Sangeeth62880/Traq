import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/train_search_provider.dart';
import '../widgets/search_skeleton.dart';

class TrainSearchScreen extends ConsumerWidget {
  const TrainSearchScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchState = ref.watch(trainSearchProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Trains'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              onChanged: (val) => ref.read(trainSearchProvider.notifier).search(val),
              decoration: InputDecoration(
                hintText: 'Train name or number...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
              ),
            ),
          ),
        ),
      ),
      body: searchState.when(
        data: (trains) {
          if (trains.isEmpty) {
            return const Center(child: Text('Enter a train number or name to search'));
          }
          return ListView.builder(
            itemCount: trains.length,
            itemBuilder: (context, index) {
              final train = trains[index];
              return ListTile(
                leading: const CircleAvatar(
                  child: Icon(Icons.train),
                ),
                title: Text('${train.trainNumber} - ${train.trainName}'),
                subtitle: Text('${train.fromStation} to ${train.toStation}'),
                trailing: train.apiDown == true 
                  ? const Icon(Icons.cloud_off, color: Colors.grey)
                  : (train.cached == true 
                      ? const Icon(Icons.offline_bolt, color: Colors.blue) 
                      : const Icon(Icons.check_circle, color: Colors.green)),
                onTap: () {
                  context.push('/train/${train.trainNumber}');
                },
              );
            },
          );
        },
        error: (err, stack) => Center(child: Text('Error: $err')),
        loading: () => const SearchSkeleton(),
      ),
    );
  }
}
