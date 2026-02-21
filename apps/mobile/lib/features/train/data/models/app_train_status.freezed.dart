// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'app_train_status.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

AppTrainStatus _$AppTrainStatusFromJson(Map<String, dynamic> json) {
  return _AppTrainStatus.fromJson(json);
}

/// @nodoc
mixin _$AppTrainStatus {
  @JsonKey(name: 'train_number')
  String get trainNumber => throw _privateConstructorUsedError;
  @JsonKey(name: 'train_name')
  String get trainName => throw _privateConstructorUsedError;
  @JsonKey(name: 'current_station')
  String get currentStation => throw _privateConstructorUsedError;
  @JsonKey(name: 'delay_minutes')
  int get delayMinutes => throw _privateConstructorUsedError;
  @JsonKey(name: 'status')
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'route')
  List<dynamic> get route => throw _privateConstructorUsedError;
  @JsonKey(name: 'last_updated')
  String get lastUpdated => throw _privateConstructorUsedError;
  @JsonKey(name: 'avg_occupancy_pct')
  int get avgOccupancyPct => throw _privateConstructorUsedError;
  @JsonKey(name: 'stale')
  bool? get stale => throw _privateConstructorUsedError;

  /// Serializes this AppTrainStatus to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AppTrainStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AppTrainStatusCopyWith<AppTrainStatus> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AppTrainStatusCopyWith<$Res> {
  factory $AppTrainStatusCopyWith(
          AppTrainStatus value, $Res Function(AppTrainStatus) then) =
      _$AppTrainStatusCopyWithImpl<$Res, AppTrainStatus>;
  @useResult
  $Res call(
      {@JsonKey(name: 'train_number') String trainNumber,
      @JsonKey(name: 'train_name') String trainName,
      @JsonKey(name: 'current_station') String currentStation,
      @JsonKey(name: 'delay_minutes') int delayMinutes,
      @JsonKey(name: 'status') String status,
      @JsonKey(name: 'route') List<dynamic> route,
      @JsonKey(name: 'last_updated') String lastUpdated,
      @JsonKey(name: 'avg_occupancy_pct') int avgOccupancyPct,
      @JsonKey(name: 'stale') bool? stale});
}

/// @nodoc
class _$AppTrainStatusCopyWithImpl<$Res, $Val extends AppTrainStatus>
    implements $AppTrainStatusCopyWith<$Res> {
  _$AppTrainStatusCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AppTrainStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? trainNumber = null,
    Object? trainName = null,
    Object? currentStation = null,
    Object? delayMinutes = null,
    Object? status = null,
    Object? route = null,
    Object? lastUpdated = null,
    Object? avgOccupancyPct = null,
    Object? stale = freezed,
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
      currentStation: null == currentStation
          ? _value.currentStation
          : currentStation // ignore: cast_nullable_to_non_nullable
              as String,
      delayMinutes: null == delayMinutes
          ? _value.delayMinutes
          : delayMinutes // ignore: cast_nullable_to_non_nullable
              as int,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      route: null == route
          ? _value.route
          : route // ignore: cast_nullable_to_non_nullable
              as List<dynamic>,
      lastUpdated: null == lastUpdated
          ? _value.lastUpdated
          : lastUpdated // ignore: cast_nullable_to_non_nullable
              as String,
      avgOccupancyPct: null == avgOccupancyPct
          ? _value.avgOccupancyPct
          : avgOccupancyPct // ignore: cast_nullable_to_non_nullable
              as int,
      stale: freezed == stale
          ? _value.stale
          : stale // ignore: cast_nullable_to_non_nullable
              as bool?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AppTrainStatusImplCopyWith<$Res>
    implements $AppTrainStatusCopyWith<$Res> {
  factory _$$AppTrainStatusImplCopyWith(_$AppTrainStatusImpl value,
          $Res Function(_$AppTrainStatusImpl) then) =
      __$$AppTrainStatusImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'train_number') String trainNumber,
      @JsonKey(name: 'train_name') String trainName,
      @JsonKey(name: 'current_station') String currentStation,
      @JsonKey(name: 'delay_minutes') int delayMinutes,
      @JsonKey(name: 'status') String status,
      @JsonKey(name: 'route') List<dynamic> route,
      @JsonKey(name: 'last_updated') String lastUpdated,
      @JsonKey(name: 'avg_occupancy_pct') int avgOccupancyPct,
      @JsonKey(name: 'stale') bool? stale});
}

/// @nodoc
class __$$AppTrainStatusImplCopyWithImpl<$Res>
    extends _$AppTrainStatusCopyWithImpl<$Res, _$AppTrainStatusImpl>
    implements _$$AppTrainStatusImplCopyWith<$Res> {
  __$$AppTrainStatusImplCopyWithImpl(
      _$AppTrainStatusImpl _value, $Res Function(_$AppTrainStatusImpl) _then)
      : super(_value, _then);

  /// Create a copy of AppTrainStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? trainNumber = null,
    Object? trainName = null,
    Object? currentStation = null,
    Object? delayMinutes = null,
    Object? status = null,
    Object? route = null,
    Object? lastUpdated = null,
    Object? avgOccupancyPct = null,
    Object? stale = freezed,
  }) {
    return _then(_$AppTrainStatusImpl(
      trainNumber: null == trainNumber
          ? _value.trainNumber
          : trainNumber // ignore: cast_nullable_to_non_nullable
              as String,
      trainName: null == trainName
          ? _value.trainName
          : trainName // ignore: cast_nullable_to_non_nullable
              as String,
      currentStation: null == currentStation
          ? _value.currentStation
          : currentStation // ignore: cast_nullable_to_non_nullable
              as String,
      delayMinutes: null == delayMinutes
          ? _value.delayMinutes
          : delayMinutes // ignore: cast_nullable_to_non_nullable
              as int,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      route: null == route
          ? _value._route
          : route // ignore: cast_nullable_to_non_nullable
              as List<dynamic>,
      lastUpdated: null == lastUpdated
          ? _value.lastUpdated
          : lastUpdated // ignore: cast_nullable_to_non_nullable
              as String,
      avgOccupancyPct: null == avgOccupancyPct
          ? _value.avgOccupancyPct
          : avgOccupancyPct // ignore: cast_nullable_to_non_nullable
              as int,
      stale: freezed == stale
          ? _value.stale
          : stale // ignore: cast_nullable_to_non_nullable
              as bool?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AppTrainStatusImpl implements _AppTrainStatus {
  const _$AppTrainStatusImpl(
      {@JsonKey(name: 'train_number') required this.trainNumber,
      @JsonKey(name: 'train_name') required this.trainName,
      @JsonKey(name: 'current_station') required this.currentStation,
      @JsonKey(name: 'delay_minutes') required this.delayMinutes,
      @JsonKey(name: 'status') required this.status,
      @JsonKey(name: 'route') required final List<dynamic> route,
      @JsonKey(name: 'last_updated') required this.lastUpdated,
      @JsonKey(name: 'avg_occupancy_pct') required this.avgOccupancyPct,
      @JsonKey(name: 'stale') this.stale})
      : _route = route;

  factory _$AppTrainStatusImpl.fromJson(Map<String, dynamic> json) =>
      _$$AppTrainStatusImplFromJson(json);

  @override
  @JsonKey(name: 'train_number')
  final String trainNumber;
  @override
  @JsonKey(name: 'train_name')
  final String trainName;
  @override
  @JsonKey(name: 'current_station')
  final String currentStation;
  @override
  @JsonKey(name: 'delay_minutes')
  final int delayMinutes;
  @override
  @JsonKey(name: 'status')
  final String status;
  final List<dynamic> _route;
  @override
  @JsonKey(name: 'route')
  List<dynamic> get route {
    if (_route is EqualUnmodifiableListView) return _route;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_route);
  }

  @override
  @JsonKey(name: 'last_updated')
  final String lastUpdated;
  @override
  @JsonKey(name: 'avg_occupancy_pct')
  final int avgOccupancyPct;
  @override
  @JsonKey(name: 'stale')
  final bool? stale;

  @override
  String toString() {
    return 'AppTrainStatus(trainNumber: $trainNumber, trainName: $trainName, currentStation: $currentStation, delayMinutes: $delayMinutes, status: $status, route: $route, lastUpdated: $lastUpdated, avgOccupancyPct: $avgOccupancyPct, stale: $stale)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AppTrainStatusImpl &&
            (identical(other.trainNumber, trainNumber) ||
                other.trainNumber == trainNumber) &&
            (identical(other.trainName, trainName) ||
                other.trainName == trainName) &&
            (identical(other.currentStation, currentStation) ||
                other.currentStation == currentStation) &&
            (identical(other.delayMinutes, delayMinutes) ||
                other.delayMinutes == delayMinutes) &&
            (identical(other.status, status) || other.status == status) &&
            const DeepCollectionEquality().equals(other._route, _route) &&
            (identical(other.lastUpdated, lastUpdated) ||
                other.lastUpdated == lastUpdated) &&
            (identical(other.avgOccupancyPct, avgOccupancyPct) ||
                other.avgOccupancyPct == avgOccupancyPct) &&
            (identical(other.stale, stale) || other.stale == stale));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      trainNumber,
      trainName,
      currentStation,
      delayMinutes,
      status,
      const DeepCollectionEquality().hash(_route),
      lastUpdated,
      avgOccupancyPct,
      stale);

  /// Create a copy of AppTrainStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AppTrainStatusImplCopyWith<_$AppTrainStatusImpl> get copyWith =>
      __$$AppTrainStatusImplCopyWithImpl<_$AppTrainStatusImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AppTrainStatusImplToJson(
      this,
    );
  }
}

abstract class _AppTrainStatus implements AppTrainStatus {
  const factory _AppTrainStatus(
      {@JsonKey(name: 'train_number') required final String trainNumber,
      @JsonKey(name: 'train_name') required final String trainName,
      @JsonKey(name: 'current_station') required final String currentStation,
      @JsonKey(name: 'delay_minutes') required final int delayMinutes,
      @JsonKey(name: 'status') required final String status,
      @JsonKey(name: 'route') required final List<dynamic> route,
      @JsonKey(name: 'last_updated') required final String lastUpdated,
      @JsonKey(name: 'avg_occupancy_pct') required final int avgOccupancyPct,
      @JsonKey(name: 'stale') final bool? stale}) = _$AppTrainStatusImpl;

  factory _AppTrainStatus.fromJson(Map<String, dynamic> json) =
      _$AppTrainStatusImpl.fromJson;

  @override
  @JsonKey(name: 'train_number')
  String get trainNumber;
  @override
  @JsonKey(name: 'train_name')
  String get trainName;
  @override
  @JsonKey(name: 'current_station')
  String get currentStation;
  @override
  @JsonKey(name: 'delay_minutes')
  int get delayMinutes;
  @override
  @JsonKey(name: 'status')
  String get status;
  @override
  @JsonKey(name: 'route')
  List<dynamic> get route;
  @override
  @JsonKey(name: 'last_updated')
  String get lastUpdated;
  @override
  @JsonKey(name: 'avg_occupancy_pct')
  int get avgOccupancyPct;
  @override
  @JsonKey(name: 'stale')
  bool? get stale;

  /// Create a copy of AppTrainStatus
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AppTrainStatusImplCopyWith<_$AppTrainStatusImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
