import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class RouteTimelineItem extends StatelessWidget {
  final Map<String, dynamic> stationPoint;
  final bool isPast;
  final bool isCurrent;

  const RouteTimelineItem({
    super.key,
    required this.stationPoint,
    required this.isPast,
    required this.isCurrent,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isCurrent
                      ? AppTheme.secondaryColor
                      : (isPast ? AppTheme.primaryColor : Colors.grey.shade300),
                  border: isCurrent ? Border.all(color: AppTheme.secondaryColor.withOpacity(0.5), width: 4) : null,
                ),
              ),
              if (!isCurrent) // Just a visual mock of the line connecting nodes
                Container(
                  width: 2,
                  height: 40,
                  color: isPast ? AppTheme.primaryColor : Colors.grey.shade300,
                ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  stationPoint['name'] ?? 'Unknown Station',
                  style: TextStyle(
                    fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                    fontSize: 16,
                  ),
                ),
                Text(
                  'Arr: ${stationPoint['arrival_time'] ?? '--:--'} | Dep: ${stationPoint['departure_time'] ?? '--:--'}',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
                if (stationPoint['delay_minutes'] != null && stationPoint['delay_minutes'] > 0)
                  Text(
                    '${stationPoint['delay_minutes']} min delay',
                    style: const TextStyle(color: AppTheme.dangerColor, fontSize: 12),
                  ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
