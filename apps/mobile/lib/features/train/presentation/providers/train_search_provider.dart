import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/train_result.dart';
import '../../data/repositories/train_repository.dart';
import 'dart:async';

part 'train_search_provider.g.dart';

@riverpod
class TrainSearch extends _$TrainSearch {
  Timer? _debounceTimer;

  @override
  FutureOr<List<TrainResult>> build() {
    return [];
  }

  void search(String query) {
    _debounceTimer?.cancel();
    
    if (query.trim().length < 2) {
      state = const AsyncValue.data([]);
      return;
    }
    
    // Optimistic loading state immediately after debounce expires
    _debounceTimer = Timer(const Duration(milliseconds: 500), () async {
      state = const AsyncValue.loading();
      try {
        final repo = ref.read(trainRepositoryProvider);
        final results = await repo.searchTrains(query);
        state = AsyncValue.data(results);
      } catch (e, stack) {
        state = AsyncValue.error(e, stack);
      }
    });
  }
}
