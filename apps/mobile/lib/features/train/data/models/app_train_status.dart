import 'package:freezed_annotation/freezed_annotation.dart';

part 'app_train_status.freezed.dart';
part 'app_train_status.g.dart';

@freezed
class AppTrainStatus with _$AppTrainStatus {
  const factory AppTrainStatus({
    @JsonKey(name: 'train_number') required String trainNumber,
    @JsonKey(name: 'train_name') required String trainName,
    @JsonKey(name: 'current_station') required String currentStation,
    @JsonKey(name: 'delay_minutes') required int delayMinutes,
    @JsonKey(name: 'status') required String status,
    @JsonKey(name: 'route') required List<dynamic> route,
    @JsonKey(name: 'last_updated') required String lastUpdated,
    @JsonKey(name: 'avg_occupancy_pct') required int avgOccupancyPct,
    @JsonKey(name: 'stale') bool? stale,
  }) = _AppTrainStatus;

  factory AppTrainStatus.fromJson(Map<String, dynamic> json) => _$AppTrainStatusFromJson(json);
}
