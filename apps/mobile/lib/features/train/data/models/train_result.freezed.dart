// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'train_result.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

TrainResult _$TrainResultFromJson(Map<String, dynamic> json) {
  return _TrainResult.fromJson(json);
}

/// @nodoc
mixin _$TrainResult {
  @JsonKey(name: 'train_number')
  String get trainNumber => throw _privateConstructorUsedError;
  @JsonKey(name: 'train_name')
  String get trainName => throw _privateConstructorUsedError;
  @JsonKey(name: 'from_station')
  String get fromStation => throw _privateConstructorUsedError;
  @JsonKey(name: 'to_station')
  String get toStation => throw _privateConstructorUsedError;
  @JsonKey(name: 'departure_time')
  String get departureTime => throw _privateConstructorUsedError;
  @JsonKey(name: 'arrival_time')
  String get arrivalTime => throw _privateConstructorUsedError;
  @JsonKey(name: 'duration_minutes')
  int get durationMinutes => throw _privateConstructorUsedError;
  @JsonKey(name: 'coach_classes')
  List<String> get coachClasses => throw _privateConstructorUsedError;
  @JsonKey(name: 'days_of_operation')
  List<String> get daysOfOperation => throw _privateConstructorUsedError;
  @JsonKey(name: 'cached')
  bool? get cached => throw _privateConstructorUsedError;
  @JsonKey(name: 'apiDown')
  bool? get apiDown => throw _privateConstructorUsedError;

  /// Serializes this TrainResult to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TrainResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TrainResultCopyWith<TrainResult> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TrainResultCopyWith<$Res> {
  factory $TrainResultCopyWith(
          TrainResult value, $Res Function(TrainResult) then) =
      _$TrainResultCopyWithImpl<$Res, TrainResult>;
  @useResult
  $Res call(
      {@JsonKey(name: 'train_number') String trainNumber,
      @JsonKey(name: 'train_name') String trainName,
      @JsonKey(name: 'from_station') String fromStation,
      @JsonKey(name: 'to_station') String toStation,
      @JsonKey(name: 'departure_time') String departureTime,
      @JsonKey(name: 'arrival_time') String arrivalTime,
      @JsonKey(name: 'duration_minutes') int durationMinutes,
      @JsonKey(name: 'coach_classes') List<String> coachClasses,
      @JsonKey(name: 'days_of_operation') List<String> daysOfOperation,
      @JsonKey(name: 'cached') bool? cached,
      @JsonKey(name: 'apiDown') bool? apiDown});
}

/// @nodoc
class _$TrainResultCopyWithImpl<$Res, $Val extends TrainResult>
    implements $TrainResultCopyWith<$Res> {
  _$TrainResultCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TrainResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? trainNumber = null,
    Object? trainName = null,
    Object? fromStation = null,
    Object? toStation = null,
    Object? departureTime = null,
    Object? arrivalTime = null,
    Object? durationMinutes = null,
    Object? coachClasses = null,
    Object? daysOfOperation = null,
    Object? cached = freezed,
    Object? apiDown = freezed,
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
      fromStation: null == fromStation
          ? _value.fromStation
          : fromStation // ignore: cast_nullable_to_non_nullable
              as String,
      toStation: null == toStation
          ? _value.toStation
          : toStation // ignore: cast_nullable_to_non_nullable
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
      coachClasses: null == coachClasses
          ? _value.coachClasses
          : coachClasses // ignore: cast_nullable_to_non_nullable
              as List<String>,
      daysOfOperation: null == daysOfOperation
          ? _value.daysOfOperation
          : daysOfOperation // ignore: cast_nullable_to_non_nullable
              as List<String>,
      cached: freezed == cached
          ? _value.cached
          : cached // ignore: cast_nullable_to_non_nullable
              as bool?,
      apiDown: freezed == apiDown
          ? _value.apiDown
          : apiDown // ignore: cast_nullable_to_non_nullable
              as bool?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$TrainResultImplCopyWith<$Res>
    implements $TrainResultCopyWith<$Res> {
  factory _$$TrainResultImplCopyWith(
          _$TrainResultImpl value, $Res Function(_$TrainResultImpl) then) =
      __$$TrainResultImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'train_number') String trainNumber,
      @JsonKey(name: 'train_name') String trainName,
      @JsonKey(name: 'from_station') String fromStation,
      @JsonKey(name: 'to_station') String toStation,
      @JsonKey(name: 'departure_time') String departureTime,
      @JsonKey(name: 'arrival_time') String arrivalTime,
      @JsonKey(name: 'duration_minutes') int durationMinutes,
      @JsonKey(name: 'coach_classes') List<String> coachClasses,
      @JsonKey(name: 'days_of_operation') List<String> daysOfOperation,
      @JsonKey(name: 'cached') bool? cached,
      @JsonKey(name: 'apiDown') bool? apiDown});
}

/// @nodoc
class __$$TrainResultImplCopyWithImpl<$Res>
    extends _$TrainResultCopyWithImpl<$Res, _$TrainResultImpl>
    implements _$$TrainResultImplCopyWith<$Res> {
  __$$TrainResultImplCopyWithImpl(
      _$TrainResultImpl _value, $Res Function(_$TrainResultImpl) _then)
      : super(_value, _then);

  /// Create a copy of TrainResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? trainNumber = null,
    Object? trainName = null,
    Object? fromStation = null,
    Object? toStation = null,
    Object? departureTime = null,
    Object? arrivalTime = null,
    Object? durationMinutes = null,
    Object? coachClasses = null,
    Object? daysOfOperation = null,
    Object? cached = freezed,
    Object? apiDown = freezed,
  }) {
    return _then(_$TrainResultImpl(
      trainNumber: null == trainNumber
          ? _value.trainNumber
          : trainNumber // ignore: cast_nullable_to_non_nullable
              as String,
      trainName: null == trainName
          ? _value.trainName
          : trainName // ignore: cast_nullable_to_non_nullable
              as String,
      fromStation: null == fromStation
          ? _value.fromStation
          : fromStation // ignore: cast_nullable_to_non_nullable
              as String,
      toStation: null == toStation
          ? _value.toStation
          : toStation // ignore: cast_nullable_to_non_nullable
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
      coachClasses: null == coachClasses
          ? _value._coachClasses
          : coachClasses // ignore: cast_nullable_to_non_nullable
              as List<String>,
      daysOfOperation: null == daysOfOperation
          ? _value._daysOfOperation
          : daysOfOperation // ignore: cast_nullable_to_non_nullable
              as List<String>,
      cached: freezed == cached
          ? _value.cached
          : cached // ignore: cast_nullable_to_non_nullable
              as bool?,
      apiDown: freezed == apiDown
          ? _value.apiDown
          : apiDown // ignore: cast_nullable_to_non_nullable
              as bool?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$TrainResultImpl implements _TrainResult {
  const _$TrainResultImpl(
      {@JsonKey(name: 'train_number') required this.trainNumber,
      @JsonKey(name: 'train_name') required this.trainName,
      @JsonKey(name: 'from_station') required this.fromStation,
      @JsonKey(name: 'to_station') required this.toStation,
      @JsonKey(name: 'departure_time') required this.departureTime,
      @JsonKey(name: 'arrival_time') required this.arrivalTime,
      @JsonKey(name: 'duration_minutes') required this.durationMinutes,
      @JsonKey(name: 'coach_classes') required final List<String> coachClasses,
      @JsonKey(name: 'days_of_operation')
      required final List<String> daysOfOperation,
      @JsonKey(name: 'cached') this.cached,
      @JsonKey(name: 'apiDown') this.apiDown})
      : _coachClasses = coachClasses,
        _daysOfOperation = daysOfOperation;

  factory _$TrainResultImpl.fromJson(Map<String, dynamic> json) =>
      _$$TrainResultImplFromJson(json);

  @override
  @JsonKey(name: 'train_number')
  final String trainNumber;
  @override
  @JsonKey(name: 'train_name')
  final String trainName;
  @override
  @JsonKey(name: 'from_station')
  final String fromStation;
  @override
  @JsonKey(name: 'to_station')
  final String toStation;
  @override
  @JsonKey(name: 'departure_time')
  final String departureTime;
  @override
  @JsonKey(name: 'arrival_time')
  final String arrivalTime;
  @override
  @JsonKey(name: 'duration_minutes')
  final int durationMinutes;
  final List<String> _coachClasses;
  @override
  @JsonKey(name: 'coach_classes')
  List<String> get coachClasses {
    if (_coachClasses is EqualUnmodifiableListView) return _coachClasses;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_coachClasses);
  }

  final List<String> _daysOfOperation;
  @override
  @JsonKey(name: 'days_of_operation')
  List<String> get daysOfOperation {
    if (_daysOfOperation is EqualUnmodifiableListView) return _daysOfOperation;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_daysOfOperation);
  }

  @override
  @JsonKey(name: 'cached')
  final bool? cached;
  @override
  @JsonKey(name: 'apiDown')
  final bool? apiDown;

  @override
  String toString() {
    return 'TrainResult(trainNumber: $trainNumber, trainName: $trainName, fromStation: $fromStation, toStation: $toStation, departureTime: $departureTime, arrivalTime: $arrivalTime, durationMinutes: $durationMinutes, coachClasses: $coachClasses, daysOfOperation: $daysOfOperation, cached: $cached, apiDown: $apiDown)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TrainResultImpl &&
            (identical(other.trainNumber, trainNumber) ||
                other.trainNumber == trainNumber) &&
            (identical(other.trainName, trainName) ||
                other.trainName == trainName) &&
            (identical(other.fromStation, fromStation) ||
                other.fromStation == fromStation) &&
            (identical(other.toStation, toStation) ||
                other.toStation == toStation) &&
            (identical(other.departureTime, departureTime) ||
                other.departureTime == departureTime) &&
            (identical(other.arrivalTime, arrivalTime) ||
                other.arrivalTime == arrivalTime) &&
            (identical(other.durationMinutes, durationMinutes) ||
                other.durationMinutes == durationMinutes) &&
            const DeepCollectionEquality()
                .equals(other._coachClasses, _coachClasses) &&
            const DeepCollectionEquality()
                .equals(other._daysOfOperation, _daysOfOperation) &&
            (identical(other.cached, cached) || other.cached == cached) &&
            (identical(other.apiDown, apiDown) || other.apiDown == apiDown));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      trainNumber,
      trainName,
      fromStation,
      toStation,
      departureTime,
      arrivalTime,
      durationMinutes,
      const DeepCollectionEquality().hash(_coachClasses),
      const DeepCollectionEquality().hash(_daysOfOperation),
      cached,
      apiDown);

  /// Create a copy of TrainResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TrainResultImplCopyWith<_$TrainResultImpl> get copyWith =>
      __$$TrainResultImplCopyWithImpl<_$TrainResultImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TrainResultImplToJson(
      this,
    );
  }
}

abstract class _TrainResult implements TrainResult {
  const factory _TrainResult(
      {@JsonKey(name: 'train_number') required final String trainNumber,
      @JsonKey(name: 'train_name') required final String trainName,
      @JsonKey(name: 'from_station') required final String fromStation,
      @JsonKey(name: 'to_station') required final String toStation,
      @JsonKey(name: 'departure_time') required final String departureTime,
      @JsonKey(name: 'arrival_time') required final String arrivalTime,
      @JsonKey(name: 'duration_minutes') required final int durationMinutes,
      @JsonKey(name: 'coach_classes') required final List<String> coachClasses,
      @JsonKey(name: 'days_of_operation')
      required final List<String> daysOfOperation,
      @JsonKey(name: 'cached') final bool? cached,
      @JsonKey(name: 'apiDown') final bool? apiDown}) = _$TrainResultImpl;

  factory _TrainResult.fromJson(Map<String, dynamic> json) =
      _$TrainResultImpl.fromJson;

  @override
  @JsonKey(name: 'train_number')
  String get trainNumber;
  @override
  @JsonKey(name: 'train_name')
  String get trainName;
  @override
  @JsonKey(name: 'from_station')
  String get fromStation;
  @override
  @JsonKey(name: 'to_station')
  String get toStation;
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
  @JsonKey(name: 'coach_classes')
  List<String> get coachClasses;
  @override
  @JsonKey(name: 'days_of_operation')
  List<String> get daysOfOperation;
  @override
  @JsonKey(name: 'cached')
  bool? get cached;
  @override
  @JsonKey(name: 'apiDown')
  bool? get apiDown;

  /// Create a copy of TrainResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TrainResultImplCopyWith<_$TrainResultImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
