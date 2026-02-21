// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'route_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RouteOptionImpl _$$RouteOptionImplFromJson(Map<String, dynamic> json) =>
    _$RouteOptionImpl(
      trainNumber: json['train_number'] as String,
      trainName: json['train_name'] as String,
      departureTime: json['departure_time'] as String,
      arrivalTime: json['arrival_time'] as String,
      durationMinutes: (json['duration_minutes'] as num).toInt(),
      avgOccupancyPct: (json['avg_occupancy_pct'] as num?)?.toInt(),
      delayMinutes: (json['delay_minutes'] as num).toInt(),
      score: (json['score'] as num).toDouble(),
      recommended: json['recommended'] as bool? ?? false,
      occupancyUnknown: json['occupancy_unknown'] as bool? ?? false,
    );

Map<String, dynamic> _$$RouteOptionImplToJson(_$RouteOptionImpl instance) =>
    <String, dynamic>{
      'train_number': instance.trainNumber,
      'train_name': instance.trainName,
      'departure_time': instance.departureTime,
      'arrival_time': instance.arrivalTime,
      'duration_minutes': instance.durationMinutes,
      'avg_occupancy_pct': instance.avgOccupancyPct,
      'delay_minutes': instance.delayMinutes,
      'score': instance.score,
      'recommended': instance.recommended,
      'occupancy_unknown': instance.occupancyUnknown,
    };
