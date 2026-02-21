import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/app_train_status.dart';
import '../../data/repositories/train_repository.dart';

part 'train_status_provider.g.dart';

@riverpod
class TrainStatusNotifier extends _$TrainStatusNotifier {
  @override
  FutureOr<AppTrainStatus?> build(String trainNumber) async {
    return ref.read(trainRepositoryProvider).getTrainStatus(trainNumber);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    try {
      final status = await ref.read(trainRepositoryProvider).getTrainStatus(trainNumber);
      state = AsyncValue.data(status);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}
