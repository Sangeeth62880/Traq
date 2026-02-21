// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'train_status_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$trainStatusNotifierHash() =>
    r'131cfbf11cde2b19f9fc0de3402838ef50d3cba3';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

abstract class _$TrainStatusNotifier
    extends BuildlessAutoDisposeAsyncNotifier<AppTrainStatus?> {
  late final String trainNumber;

  FutureOr<AppTrainStatus?> build(
    String trainNumber,
  );
}

/// See also [TrainStatusNotifier].
@ProviderFor(TrainStatusNotifier)
const trainStatusNotifierProvider = TrainStatusNotifierFamily();

/// See also [TrainStatusNotifier].
class TrainStatusNotifierFamily extends Family<AsyncValue<AppTrainStatus?>> {
  /// See also [TrainStatusNotifier].
  const TrainStatusNotifierFamily();

  /// See also [TrainStatusNotifier].
  TrainStatusNotifierProvider call(
    String trainNumber,
  ) {
    return TrainStatusNotifierProvider(
      trainNumber,
    );
  }

  @override
  TrainStatusNotifierProvider getProviderOverride(
    covariant TrainStatusNotifierProvider provider,
  ) {
    return call(
      provider.trainNumber,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'trainStatusNotifierProvider';
}

/// See also [TrainStatusNotifier].
class TrainStatusNotifierProvider extends AutoDisposeAsyncNotifierProviderImpl<
    TrainStatusNotifier, AppTrainStatus?> {
  /// See also [TrainStatusNotifier].
  TrainStatusNotifierProvider(
    String trainNumber,
  ) : this._internal(
          () => TrainStatusNotifier()..trainNumber = trainNumber,
          from: trainStatusNotifierProvider,
          name: r'trainStatusNotifierProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$trainStatusNotifierHash,
          dependencies: TrainStatusNotifierFamily._dependencies,
          allTransitiveDependencies:
              TrainStatusNotifierFamily._allTransitiveDependencies,
          trainNumber: trainNumber,
        );

  TrainStatusNotifierProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.trainNumber,
  }) : super.internal();

  final String trainNumber;

  @override
  FutureOr<AppTrainStatus?> runNotifierBuild(
    covariant TrainStatusNotifier notifier,
  ) {
    return notifier.build(
      trainNumber,
    );
  }

  @override
  Override overrideWith(TrainStatusNotifier Function() create) {
    return ProviderOverride(
      origin: this,
      override: TrainStatusNotifierProvider._internal(
        () => create()..trainNumber = trainNumber,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        trainNumber: trainNumber,
      ),
    );
  }

  @override
  AutoDisposeAsyncNotifierProviderElement<TrainStatusNotifier, AppTrainStatus?>
      createElement() {
    return _TrainStatusNotifierProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is TrainStatusNotifierProvider &&
        other.trainNumber == trainNumber;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, trainNumber.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin TrainStatusNotifierRef
    on AutoDisposeAsyncNotifierProviderRef<AppTrainStatus?> {
  /// The parameter `trainNumber` of this provider.
  String get trainNumber;
}

class _TrainStatusNotifierProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<TrainStatusNotifier,
        AppTrainStatus?> with TrainStatusNotifierRef {
  _TrainStatusNotifierProviderElement(super.provider);

  @override
  String get trainNumber => (origin as TrainStatusNotifierProvider).trainNumber;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
