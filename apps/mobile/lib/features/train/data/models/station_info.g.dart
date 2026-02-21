// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'station_info.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$StationInfoImpl _$$StationInfoImplFromJson(Map<String, dynamic> json) =>
    _$StationInfoImpl(
      code: json['code'] as String,
      name: json['name'] as String,
      delayMinutes: (json['delay_minutes'] as num?)?.toInt(),
      stopNumber: (json['stop_number'] as num?)?.toInt(),
      distanceKm: (json['distance_km'] as num?)?.toInt(),
    );

Map<String, dynamic> _$$StationInfoImplToJson(_$StationInfoImpl instance) =>
    <String, dynamic>{
      'code': instance.code,
      'name': instance.name,
      'delay_minutes': instance.delayMinutes,
      'stop_number': instance.stopNumber,
      'distance_km': instance.distanceKm,
    };
