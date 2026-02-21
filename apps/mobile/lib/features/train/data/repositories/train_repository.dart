import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/network/api_client.dart';
import '../models/train_result.dart';
import '../models/app_train_status.dart';
import '../models/route_option.dart';
import '../models/station_info.dart';

part 'train_repository.g.dart';

class TrainRepository {
  final Dio _dio;

  TrainRepository(this._dio);

  Future<List<TrainResult>> searchTrains(String query) async {
    final response = await _dio.get('/trains/search', queryParameters: {'q': query});
    if (response.data is Map && response.data.containsKey('trains')) {
       return (response.data['trains'] as List).map((e) => TrainResult.fromJson(e)).toList();
    }
    return (response.data as List).map((e) => TrainResult.fromJson(e)).toList();
  }

  Future<AppTrainStatus> getTrainStatus(String trainNumber) async {
    final response = await _dio.get('/trains/$trainNumber/status');
    if (response.data is Map && response.data.containsKey('status')) {
      return AppTrainStatus.fromJson(response.data['status']);
    }
    return AppTrainStatus.fromJson(response.data);
  }

  Future<List<RouteOption>> getTrainsOnRoute(String from, String to, String date) async {
    final response = await _dio.get('/trains/route', queryParameters: {
      'from': from,
      'to': to,
      'date': date,
    });
    if (response.data is Map && response.data.containsKey('routes')) {
       return (response.data['routes'] as List).map((e) => RouteOption.fromJson(e)).toList();
    }
    return (response.data as List).map((e) => RouteOption.fromJson(e)).toList();
  }

  Future<List<StationInfo>> searchStations(String query) async {
    final response = await _dio.get('/trains/stations/search', queryParameters: {'q': query});
    if (response.data is Map && response.data.containsKey('stations')) {
       return (response.data['stations'] as List).map((e) => StationInfo.fromJson(e)).toList();
    }
    return (response.data as List).map((e) => StationInfo.fromJson(e)).toList();
  }
}

@riverpod
TrainRepository trainRepository(TrainRepositoryRef ref) {
  return TrainRepository(ref.watch(apiClientProvider));
}
