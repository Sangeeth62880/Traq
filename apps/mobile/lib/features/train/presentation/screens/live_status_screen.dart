import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/train_status_provider.dart';
import '../widgets/route_timeline_item.dart';

class TrainStatusScreen extends ConsumerWidget {
  final String trainNumber;

  const TrainStatusScreen({super.key, required this.trainNumber});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusState = ref.watch(trainStatusNotifierProvider(trainNumber));

    return Scaffold(
      appBar: AppBar(
        title: Text('Train $trainNumber Live Status'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(trainStatusNotifierProvider(trainNumber).notifier).refresh(),
          ),
        ],
      ),
      body: statusState.when(
        data: (status) {
          if (status == null) return const Center(child: Text('Not found'));
          
          return RefreshIndicator(
            onRefresh: () => ref.read(trainStatusNotifierProvider(trainNumber).notifier).refresh(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (status.stale == true)
                  Container(
                    padding: const EdgeInsets.all(8),
                    color: Colors.orange.shade100,
                    child: const Row(
                      children: [
                        Icon(Icons.warning, color: Colors.orange),
                        SizedBox(width: 8),
                        Expanded(child: Text('Live data unavailable. Showing cached schedule.', style: TextStyle(color: Colors.orange))),
                      ],
                    ),
                  ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(status.trainName, style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 8),
                        Text('Current Station: ${status.currentStation}', style: const TextStyle(fontSize: 16)),
                        const SizedBox(height: 4),
                        Text('Delay: ${status.delayMinutes} mins', 
                          style: TextStyle(
                            fontSize: 16,
                            color: status.delayMinutes > 15 ? AppTheme.dangerColor : AppTheme.successColor,
                            fontWeight: FontWeight.bold
                          )
                        ),
                        const SizedBox(height: 8),
                        Text('Last Updated: ${status.lastUpdated}', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ),
                ),
                if (status.route.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text('Route Progress', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Card(
                    child: ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: status.route.length,
                      itemBuilder: (context, index) {
                        final station = status.route[index];
                        final isPast = index < status.route.indexWhere((s) => s['name'] == status.currentStation);
                        final isCurrent = station['name'] == status.currentStation;
                        return RouteTimelineItem(
                          stationPoint: station is Map<String, dynamic> ? station : {'name': station.toString()},
                          isPast: isPast,
                          isCurrent: isCurrent,
                        );
                      },
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                // Map/IoT Placeholder
                Card(
                  color: Theme.of(context).colorScheme.surfaceVariant,
                  child: SizedBox(
                    height: 200,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.map, size: 48, color: Colors.grey.shade400),
                        const SizedBox(height: 8),
                        Text('IoT Map Integration Pending in Phase 3', style: TextStyle(color: Colors.grey.shade600))
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        error: (err, stack) => Center(child: Text('Error loading status: $err')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}
