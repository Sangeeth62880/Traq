import 'package:freezed_annotation/freezed_annotation.dart';

part 'train_result.freezed.dart';
part 'train_result.g.dart';

@freezed
class TrainResult with _$TrainResult {
  const factory TrainResult({
    @JsonKey(name: 'train_number') required String trainNumber,
    @JsonKey(name: 'train_name') required String trainName,
    @JsonKey(name: 'from_station') required String fromStation,
    @JsonKey(name: 'to_station') required String toStation,
    @JsonKey(name: 'departure_time') required String departureTime,
    @JsonKey(name: 'arrival_time') required String arrivalTime,
    @JsonKey(name: 'duration_minutes') required int durationMinutes,
    @JsonKey(name: 'coach_classes') required List<String> coachClasses,
    @JsonKey(name: 'days_of_operation') required List<String> daysOfOperation,
    @JsonKey(name: 'cached') bool? cached,
    @JsonKey(name: 'apiDown') bool? apiDown,
  }) = _TrainResult;

  factory TrainResult.fromJson(Map<String, dynamic> json) => _$TrainResultFromJson(json);
}
