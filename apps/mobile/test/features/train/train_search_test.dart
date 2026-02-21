import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:traq/features/train/presentation/screens/train_search_screen.dart';

void main() {
  testWidgets('TrainSearchScreen renders search bar and empty state', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: TrainSearchScreen(),
        ),
      ),
    );

    expect(find.text('Search Trains'), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);
    expect(find.text('Enter a train number or name to search'), findsOneWidget);
  });
}
