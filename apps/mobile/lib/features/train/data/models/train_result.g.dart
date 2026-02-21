// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'train_result.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TrainResultImpl _$$TrainResultImplFromJson(Map<String, dynamic> json) =>
    _$TrainResultImpl(
      trainNumber: json['train_number'] as String,
      trainName: json['train_name'] as String,
      fromStation: json['from_station'] as String,
      toStation: json['to_station'] as String,
      departureTime: json['departure_time'] as String,
      arrivalTime: json['arrival_time'] as String,
      durationMinutes: (json['duration_minutes'] as num).toInt(),
      coachClasses: (json['coach_classes'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      daysOfOperation: (json['days_of_operation'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      cached: json['cached'] as bool?,
      apiDown: json['apiDown'] as bool?,
    );

Map<String, dynamic> _$$TrainResultImplToJson(_$TrainResultImpl instance) =>
    <String, dynamic>{
      'train_number': instance.trainNumber,
      'train_name': instance.trainName,
      'from_station': instance.fromStation,
      'to_station': instance.toStation,
      'departure_time': instance.departureTime,
      'arrival_time': instance.arrivalTime,
      'duration_minutes': instance.durationMinutes,
      'coach_classes': instance.coachClasses,
      'days_of_operation': instance.daysOfOperation,
      'cached': instance.cached,
      'apiDown': instance.apiDown,
    };
