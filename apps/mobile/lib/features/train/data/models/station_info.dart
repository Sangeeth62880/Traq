import 'package:freezed_annotation/freezed_annotation.dart';

part 'station_info.freezed.dart';
part 'station_info.g.dart';

@freezed
class StationInfo with _$StationInfo {
  const factory StationInfo({
    @JsonKey(name: 'code') required String code,
    @JsonKey(name: 'name') required String name,
    @JsonKey(name: 'delay_minutes') int? delayMinutes,
    @JsonKey(name: 'stop_number') int? stopNumber,
    @JsonKey(name: 'distance_km') int? distanceKm,
  }) = _StationInfo;

  factory StationInfo.fromJson(Map<String, dynamic> json) => _$StationInfoFromJson(json);
}
