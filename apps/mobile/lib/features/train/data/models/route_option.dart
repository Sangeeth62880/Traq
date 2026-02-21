import 'package:freezed_annotation/freezed_annotation.dart';

part 'route_option.freezed.dart';
part 'route_option.g.dart';

@freezed
class RouteOption with _$RouteOption {
  const factory RouteOption({
    @JsonKey(name: 'train_number') required String trainNumber,
    @JsonKey(name: 'train_name') required String trainName,
    @JsonKey(name: 'departure_time') required String departureTime,
    @JsonKey(name: 'arrival_time') required String arrivalTime,
    @JsonKey(name: 'duration_minutes') required int durationMinutes,
    @JsonKey(name: 'avg_occupancy_pct') int? avgOccupancyPct,
    @JsonKey(name: 'delay_minutes') required int delayMinutes,
    @JsonKey(name: 'score') required double score,
    @JsonKey(name: 'recommended') @Default(false) bool recommended,
    @JsonKey(name: 'occupancy_unknown') @Default(false) bool occupancyUnknown,
  }) = _RouteOption;

  factory RouteOption.fromJson(Map<String, dynamic> json) => _$RouteOptionFromJson(json);
}
