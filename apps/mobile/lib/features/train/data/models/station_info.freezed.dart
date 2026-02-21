// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'station_info.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

StationInfo _$StationInfoFromJson(Map<String, dynamic> json) {
  return _StationInfo.fromJson(json);
}

/// @nodoc
mixin _$StationInfo {
  @JsonKey(name: 'code')
  String get code => throw _privateConstructorUsedError;
  @JsonKey(name: 'name')
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'delay_minutes')
  int? get delayMinutes => throw _privateConstructorUsedError;
  @JsonKey(name: 'stop_number')
  int? get stopNumber => throw _privateConstructorUsedError;
  @JsonKey(name: 'distance_km')
  int? get distanceKm => throw _privateConstructorUsedError;

  /// Serializes this StationInfo to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of StationInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $StationInfoCopyWith<StationInfo> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $StationInfoCopyWith<$Res> {
  factory $StationInfoCopyWith(
          StationInfo value, $Res Function(StationInfo) then) =
      _$StationInfoCopyWithImpl<$Res, StationInfo>;
  @useResult
  $Res call(
      {@JsonKey(name: 'code') String code,
      @JsonKey(name: 'name') String name,
      @JsonKey(name: 'delay_minutes') int? delayMinutes,
      @JsonKey(name: 'stop_number') int? stopNumber,
      @JsonKey(name: 'distance_km') int? distanceKm});
}

/// @nodoc
class _$StationInfoCopyWithImpl<$Res, $Val extends StationInfo>
    implements $StationInfoCopyWith<$Res> {
  _$StationInfoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of StationInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? code = null,
    Object? name = null,
    Object? delayMinutes = freezed,
    Object? stopNumber = freezed,
    Object? distanceKm = freezed,
  }) {
    return _then(_value.copyWith(
      code: null == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      delayMinutes: freezed == delayMinutes
          ? _value.delayMinutes
          : delayMinutes // ignore: cast_nullable_to_non_nullable
              as int?,
      stopNumber: freezed == stopNumber
          ? _value.stopNumber
          : stopNumber // ignore: cast_nullable_to_non_nullable
              as int?,
      distanceKm: freezed == distanceKm
          ? _value.distanceKm
          : distanceKm // ignore: cast_nullable_to_non_nullable
              as int?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$StationInfoImplCopyWith<$Res>
    implements $StationInfoCopyWith<$Res> {
  factory _$$StationInfoImplCopyWith(
          _$StationInfoImpl value, $Res Function(_$StationInfoImpl) then) =
      __$$StationInfoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'code') String code,
      @JsonKey(name: 'name') String name,
      @JsonKey(name: 'delay_minutes') int? delayMinutes,
      @JsonKey(name: 'stop_number') int? stopNumber,
      @JsonKey(name: 'distance_km') int? distanceKm});
}

/// @nodoc
class __$$StationInfoImplCopyWithImpl<$Res>
    extends _$StationInfoCopyWithImpl<$Res, _$StationInfoImpl>
    implements _$$StationInfoImplCopyWith<$Res> {
  __$$StationInfoImplCopyWithImpl(
      _$StationInfoImpl _value, $Res Function(_$StationInfoImpl) _then)
      : super(_value, _then);

  /// Create a copy of StationInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? code = null,
    Object? name = null,
    Object? delayMinutes = freezed,
    Object? stopNumber = freezed,
    Object? distanceKm = freezed,
  }) {
    return _then(_$StationInfoImpl(
      code: null == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      delayMinutes: freezed == delayMinutes
          ? _value.delayMinutes
          : delayMinutes // ignore: cast_nullable_to_non_nullable
              as int?,
      stopNumber: freezed == stopNumber
          ? _value.stopNumber
          : stopNumber // ignore: cast_nullable_to_non_nullable
              as int?,
      distanceKm: freezed == distanceKm
          ? _value.distanceKm
          : distanceKm // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$StationInfoImpl implements _StationInfo {
  const _$StationInfoImpl(
      {@JsonKey(name: 'code') required this.code,
      @JsonKey(name: 'name') required this.name,
      @JsonKey(name: 'delay_minutes') this.delayMinutes,
      @JsonKey(name: 'stop_number') this.stopNumber,
      @JsonKey(name: 'distance_km') this.distanceKm});

  factory _$StationInfoImpl.fromJson(Map<String, dynamic> json) =>
      _$$StationInfoImplFromJson(json);

  @override
  @JsonKey(name: 'code')
  final String code;
  @override
  @JsonKey(name: 'name')
  final String name;
  @override
  @JsonKey(name: 'delay_minutes')
  final int? delayMinutes;
  @override
  @JsonKey(name: 'stop_number')
  final int? stopNumber;
  @override
  @JsonKey(name: 'distance_km')
  final int? distanceKm;

  @override
  String toString() {
    return 'StationInfo(code: $code, name: $name, delayMinutes: $delayMinutes, stopNumber: $stopNumber, distanceKm: $distanceKm)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$StationInfoImpl &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.delayMinutes, delayMinutes) ||
                other.delayMinutes == delayMinutes) &&
            (identical(other.stopNumber, stopNumber) ||
                other.stopNumber == stopNumber) &&
            (identical(other.distanceKm, distanceKm) ||
                other.distanceKm == distanceKm));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, code, name, delayMinutes, stopNumber, distanceKm);

  /// Create a copy of StationInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$StationInfoImplCopyWith<_$StationInfoImpl> get copyWith =>
      __$$StationInfoImplCopyWithImpl<_$StationInfoImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$StationInfoImplToJson(
      this,
    );
  }
}

abstract class _StationInfo implements StationInfo {
  const factory _StationInfo(
      {@JsonKey(name: 'code') required final String code,
      @JsonKey(name: 'name') required final String name,
      @JsonKey(name: 'delay_minutes') final int? delayMinutes,
      @JsonKey(name: 'stop_number') final int? stopNumber,
      @JsonKey(name: 'distance_km') final int? distanceKm}) = _$StationInfoImpl;

  factory _StationInfo.fromJson(Map<String, dynamic> json) =
      _$StationInfoImpl.fromJson;

  @override
  @JsonKey(name: 'code')
  String get code;
  @override
  @JsonKey(name: 'name')
  String get name;
  @override
  @JsonKey(name: 'delay_minutes')
  int? get delayMinutes;
  @override
  @JsonKey(name: 'stop_number')
  int? get stopNumber;
  @override
  @JsonKey(name: 'distance_km')
  int? get distanceKm;

  /// Create a copy of StationInfo
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$StationInfoImplCopyWith<_$StationInfoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
