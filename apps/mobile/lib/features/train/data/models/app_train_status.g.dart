// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_train_status.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AppTrainStatusImpl _$$AppTrainStatusImplFromJson(Map<String, dynamic> json) =>
    _$AppTrainStatusImpl(
      trainNumber: json['train_number'] as String,
      trainName: json['train_name'] as String,
      currentStation: json['current_station'] as String,
      delayMinutes: (json['delay_minutes'] as num).toInt(),
      status: json['status'] as String,
      route: json['route'] as List<dynamic>,
      lastUpdated: json['last_updated'] as String,
      avgOccupancyPct: (json['avg_occupancy_pct'] as num).toInt(),
      stale: json['stale'] as bool?,
    );

Map<String, dynamic> _$$AppTrainStatusImplToJson(
        _$AppTrainStatusImpl instance) =>
    <String, dynamic>{
      'train_number': instance.trainNumber,
      'train_name': instance.trainName,
      'current_station': instance.currentStation,
      'delay_minutes': instance.delayMinutes,
      'status': instance.status,
      'route': instance.route,
      'last_updated': instance.lastUpdated,
      'avg_occupancy_pct': instance.avgOccupancyPct,
      'stale': instance.stale,
    };
