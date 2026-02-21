#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚂 Setting up TRAQ Flutter Environment...${NC}"

# Navigate to the mobile app directory
cd apps/mobile

echo -e "${GREEN}1/3 Fetching dependencies...${NC}"
flutter pub get

echo -e "${GREEN}2/3 Generating build_runner files (Riverpod, Freezed, etc)...${NC}"
flutter pub run build_runner build --delete-conflicting-outputs

echo -e "${GREEN}3/3 FlutterFire Configuration...${NC}"
echo -e "${YELLOW}IMPORTANT: You must run the following command manually to connect your Firebase project:${NC}"
echo -e "  cd apps/mobile && flutterfire configure"
echo -e "${YELLOW}This will overwrite the placeholder firebase_options.dart with real credentials.${NC}"

echo -e "\n${BLUE}✅ Setup complete! You can now run the app with 'make dev:mobile'.${NC}"
