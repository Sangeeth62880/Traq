// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'route_option.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

RouteOption _$RouteOptionFromJson(Map<String, dynamic> json) {
  return _RouteOption.fromJson(json);
}

/// @nodoc
mixin _$RouteOption {
  @JsonKey(name: 'train_number')
  String get trainNumber => throw _privateConstructorUsedError;
  @JsonKey(name: 'train_name')
  String get trainName => throw _privateConstructorUsedError;
  @JsonKey(name: 'departure_time')
  String get departureTime => throw _privateConstructorUsedError;
  @JsonKey(name: 'arrival_time')
  String get arrivalTime => throw _privateConstructorUsedError;
  @JsonKey(name: 'duration_minutes')
  int get durationMinutes => throw _privateConstructorUsedError;
  @JsonKey(name: 'avg_occupancy_pct')
  int? get avgOccupancyPct => throw _privateConstructorUsedError;
  @JsonKey(name: 'delay_minutes')
  int get delayMinutes => throw _privateConstructorUsedError;
  @JsonKey(name: 'score')
  double get score => throw _privateConstructorUsedError;
  @JsonKey(name: 'recommended')
  bool get recommended => throw _privateConstructorUsedError;
  @JsonKey(name: 'occupancy_unknown')
  bool get occupancyUnknown => throw _privateConstructorUsedError;

  /// Serializes this RouteOption to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RouteOption
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RouteOptionCopyWith<RouteOption> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RouteOptionCopyWith<$Res> {
  factory $RouteOptionCopyWith(
          RouteOption value, $Res Function(RouteOption) then) =
      _$RouteOptionCopyWithImpl<$Res, RouteOption>;
  @useResult
  $Res call(
      {@JsonKey(name: 'train_number') String trainNumber,
      @JsonKey(name: 'train_name') String trainName,
      @JsonKey(name: 'departure_time') String departureTime,
      @JsonKey(name: 'arrival_time') String arrivalTime,
      @JsonKey(name: 'duration_minutes') int durationMinutes,
      @JsonKey(name: 'avg_occupancy_pct') int? avgOccupancyPct,
      @JsonKey(name: 'delay_minutes') int delayMinutes,
      @JsonKey(name: 'score') double score,
      @JsonKey(name: 'recommended') bool recommended,
      @JsonKey(name: 'occupancy_unknown') bool occupancyUnknown});
}

/// @nodoc
class _$RouteOptionCopyWithImpl<$Res, $Val extends RouteOption>
    implements $RouteOptionCopyWith<$Res> {
  _$RouteOptionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RouteOption
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? trainNumber = null,
    Object? trainName = null,
    Object? departureTime = null,
    Object? arrivalTime = null,
    Object? durationMinutes = null,
    Object? avgOccupancyPct = freezed,
    Object? delayMinutes = null,
    Object? score = null,
    Object? recommended = null,
    Object? occupancyUnknown = null,
  }) {
    return _then(_value.copyWith(
      trainNumber: null == trainNumber
          ? _value.trainNumber
          : trainNumber // ignore: cast_nullable_to_non_nullable
              as String,
      trainName: null == trainName
          ? _value.trainName
          : trainName // ignore: cast_nullable_to_non_nullable
              as String,
      departureTime: null == departureTime
          ? _value.departureTime
          : departureTime // ignore: cast_nullable_to_non_nullable
              as String,
      arrivalTime: null == arrivalTime
          ? _value.arrivalTime
          : arrivalTime // ignore: cast_nullable_to_non_nullable
              as String,
      durationMinutes: null == durationMinutes
          ? _value.durationMinutes
          : durationMinutes // ignore: cast_nullable_to_non_nullable
              as int,
      avgOccupancyPct: freezed == avgOccupancyPct
          ? _value.avgOccupancyPct
          : avgOccupancyPct // ignore: cast_nullable_to_non_nullable
              as int?,
      delayMinutes: null == delayMinutes
          ? _value.delayMinutes
          : delayMinutes // ignore: cast_nullable_to_non_nullable
              as int,
      score: null == score
          ? _value.score
          : score // ignore: cast_nullable_to_non_nullable
              as double,
      recommended: null == recommended
          ? _value.recommended
          : recommended // ignore: cast_nullable_to_non_nullable
              as bool,
      occupancyUnknown: null == occupancyUnknown
          ? _value.occupancyUnknown
          : occupancyUnknown // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RouteOptionImplCopyWith<$Res>
    implements $RouteOptionCopyWith<$Res> {
  factory _$$RouteOptionImplCopyWith(
          _$RouteOptionImpl value, $Res Function(_$RouteOptionImpl) then) =
      __$$RouteOptionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'train_number') String trainNumber,
      @JsonKey(name: 'train_name') String trainName,
      @JsonKey(name: 'departure_time') String departureTime,
      @JsonKey(name: 'arrival_time') String arrivalTime,
      @JsonKey(name: 'duration_minutes') int durationMinutes,
      @JsonKey(name: 'avg_occupancy_pct') int? avgOccupancyPct,
      @JsonKey(name: 'delay_minutes') int delayMinutes,
      @JsonKey(name: 'score') double score,
      @JsonKey(name: 'recommended') bool recommended,
      @JsonKey(name: 'occupancy_unknown') bool occupancyUnknown});
}

/// @nodoc
class __$$RouteOptionImplCopyWithImpl<$Res>
    extends _$RouteOptionCopyWithImpl<$Res, _$RouteOptionImpl>
    implements _$$RouteOptionImplCopyWith<$Res> {
  __$$RouteOptionImplCopyWithImpl(
      _$RouteOptionImpl _value, $Res Function(_$RouteOptionImpl) _then)
      : super(_value, _then);

  /// Create a copy of RouteOption
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? trainNumber = null,
    Object? trainName = null,
    Object? departureTime = null,
    Object? arrivalTime = null,
    Object? durationMinutes = null,
    Object? avgOccupancyPct = freezed,
    Object? delayMinutes = null,
    Object? score = null,
    Object? recommended = null,
    Object? occupancyUnknown = null,
  }) {
    return _then(_$RouteOptionImpl(
      trainNumber: null == trainNumber
          ? _value.trainNumber
          : trainNumber // ignore: cast_nullable_to_non_nullable
              as String,
      trainName: null == trainName
          ? _value.trainName
          : trainName // ignore: cast_nullable_to_non_nullable
              as String,
      departureTime: null == departureTime
          ? _value.departureTime
          : departureTime // ignore: cast_nullable_to_non_nullable
              as String,
      arrivalTime: null == arrivalTime
          ? _value.arrivalTime
          : arrivalTime // ignore: cast_nullable_to_non_nullable
              as String,
      durationMinutes: null == durationMinutes
          ? _value.durationMinutes
          : durationMinutes // ignore: cast_nullable_to_non_nullable
              as int,
      avgOccupancyPct: freezed == avgOccupancyPct
          ? _value.avgOccupancyPct
          : avgOccupancyPct // ignore: cast_nullable_to_non_nullable
              as int?,
      delayMinutes: null == delayMinutes
          ? _value.delayMinutes
          : delayMinutes // ignore: cast_nullable_to_non_nullable
              as int,
      score: null == score
          ? _value.score
          : score // ignore: cast_nullable_to_non_nullable
              as double,
      recommended: null == recommended
          ? _value.recommended
          : recommended // ignore: cast_nullable_to_non_nullable
              as bool,
      occupancyUnknown: null == occupancyUnknown
          ? _value.occupancyUnknown
          : occupancyUnknown // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RouteOptionImpl implements _RouteOption {
  const _$RouteOptionImpl(
      {@JsonKey(name: 'train_number') required this.trainNumber,
      @JsonKey(name: 'train_name') required this.trainName,
      @JsonKey(name: 'departure_time') required this.departureTime,
      @JsonKey(name: 'arrival_time') required this.arrivalTime,
      @JsonKey(name: 'duration_minutes') required this.durationMinutes,
      @JsonKey(name: 'avg_occupancy_pct') this.avgOccupancyPct,
      @JsonKey(name: 'delay_minutes') required this.delayMinutes,
      @JsonKey(name: 'score') required this.score,
      @JsonKey(name: 'recommended') this.recommended = false,
      @JsonKey(name: 'occupancy_unknown') this.occupancyUnknown = false});

  factory _$RouteOptionImpl.fromJson(Map<String, dynamic> json) =>
      _$$RouteOptionImplFromJson(json);

  @override
  @JsonKey(name: 'train_number')
  final String trainNumber;
  @override
  @JsonKey(name: 'train_name')
  final String trainName;
  @override
  @JsonKey(name: 'departure_time')
  final String departureTime;
  @override
  @JsonKey(name: 'arrival_time')
  final String arrivalTime;
  @override
  @JsonKey(name: 'duration_minutes')
  final int durationMinutes;
  @override
  @JsonKey(name: 'avg_occupancy_pct')
  final int? avgOccupancyPct;
  @override
  @JsonKey(name: 'delay_minutes')
  final int delayMinutes;
  @override
  @JsonKey(name: 'score')
  final double score;
  @override
  @JsonKey(name: 'recommended')
  final bool recommended;
  @override
  @JsonKey(name: 'occupancy_unknown')
  final bool occupancyUnknown;

  @override
  String toString() {
    return 'RouteOption(trainNumber: $trainNumber, trainName: $trainName, departureTime: $departureTime, arrivalTime: $arrivalTime, durationMinutes: $durationMinutes, avgOccupancyPct: $avgOccupancyPct, delayMinutes: $delayMinutes, score: $score, recommended: $recommended, occupancyUnknown: $occupancyUnknown)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RouteOptionImpl &&
            (identical(other.trainNumber, trainNumber) ||
                other.trainNumber == trainNumber) &&
            (identical(other.trainName, trainName) ||
                other.trainName == trainName) &&
            (identical(other.departureTime, departureTime) ||
                other.departureTime == departureTime) &&
            (identical(other.arrivalTime, arrivalTime) ||
                other.arrivalTime == arrivalTime) &&
            (identical(other.durationMinutes, durationMinutes) ||
                other.durationMinutes == durationMinutes) &&
            (identical(other.avgOccupancyPct, avgOccupancyPct) ||
                other.avgOccupancyPct == avgOccupancyPct) &&
            (identical(other.delayMinutes, delayMinutes) ||
                other.delayMinutes == delayMinutes) &&
            (identical(other.score, score) || other.score == score) &&
            (identical(other.recommended, recommended) ||
                other.recommended == recommended) &&
            (identical(other.occupancyUnknown, occupancyUnknown) ||
                other.occupancyUnknown == occupancyUnknown));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      trainNumber,
      trainName,
      departureTime,
      arrivalTime,
      durationMinutes,
      avgOccupancyPct,
      delayMinutes,
      score,
      recommended,
      occupancyUnknown);

  /// Create a copy of RouteOption
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RouteOptionImplCopyWith<_$RouteOptionImpl> get copyWith =>
      __$$RouteOptionImplCopyWithImpl<_$RouteOptionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RouteOptionImplToJson(
      this,
    );
  }
}

abstract class _RouteOption implements RouteOption {
  const factory _RouteOption(
          {@JsonKey(name: 'train_number') required final String trainNumber,
          @JsonKey(name: 'train_name') required final String trainName,
          @JsonKey(name: 'departure_time') required final String departureTime,
          @JsonKey(name: 'arrival_time') required final String arrivalTime,
          @JsonKey(name: 'duration_minutes') required final int durationMinutes,
          @JsonKey(name: 'avg_occupancy_pct') final int? avgOccupancyPct,
          @JsonKey(name: 'delay_minutes') required final int delayMinutes,
          @JsonKey(name: 'score') required final double score,
          @JsonKey(name: 'recommended') final bool recommended,
          @JsonKey(name: 'occupancy_unknown') final bool occupancyUnknown}) =
      _$RouteOptionImpl;

  factory _RouteOption.fromJson(Map<String, dynamic> json) =
      _$RouteOptionImpl.fromJson;

  @override
  @JsonKey(name: 'train_number')
  String get trainNumber;
  @override
  @JsonKey(name: 'train_name')
  String get trainName;
  @override
  @JsonKey(name: 'departure_time')
  String get departureTime;
  @override
  @JsonKey(name: 'arrival_time')
  String get arrivalTime;
  @override
  @JsonKey(name: 'duration_minutes')
  int get durationMinutes;
  @override
  @JsonKey(name: 'avg_occupancy_pct')
  int? get avgOccupancyPct;
  @override
  @JsonKey(name: 'delay_minutes')
  int get delayMinutes;
  @override
  @JsonKey(name: 'score')
  double get score;
  @override
  @JsonKey(name: 'recommended')
  bool get recommended;
  @override
  @JsonKey(name: 'occupancy_unknown')
  bool get occupancyUnknown;

  /// Create a copy of RouteOption
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RouteOptionImplCopyWith<_$RouteOptionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
