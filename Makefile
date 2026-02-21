# ==============================================================================
# TRAQ Monorepo — Unified Developer Interface
# ==============================================================================
# This Makefile orchestrates the polyglot monorepo:
#   JS/TS apps  → Turborepo + pnpm
#   Flutter app → flutter CLI
#   Infra       → Native services via brew/apt
# ==============================================================================

.PHONY: setup dev dev\:mobile build test lint clean simulate db\:setup help

## Install all dependencies (pnpm + Flutter + Native Infra)
setup:
	@echo "📦 Installing JS/TS dependencies..."
	pnpm install
	@echo "📱 Installing Flutter dependencies..."
	cd apps/mobile && flutter pub get
	@echo "🛠️ Installing native infra (Influx, Redis, MQTT)..."
	./scripts/install-deps.sh
	@echo "✅ Setup complete."

## Start backend services + infra natively
dev:
	@echo "🐳 Starting local services (Redis, Mosquitto, InfluxDB)..."
	brew services start redis || true
	brew services start mosquitto || true
	brew services start influxdb || true
	@echo "🚀 Starting backend + dashboard + simulator..."
	pnpm dev:backend & pnpm dev:dashboard & pnpm dev:simulator

## Run Flutter app on connected device/emulator
dev\:mobile:
	cd apps/mobile && flutter run

## Build all (JS/TS via Turborepo + Flutter APK)
build:
	turbo run build --filter=!mobile
	cd apps/mobile && flutter build apk --release

## Run all tests (JS/TS + Flutter)
test:
	turbo run test
	cd apps/mobile && flutter test --coverage

## Lint all code (JS/TS + Flutter analyze)
lint:
	turbo run lint
	cd apps/mobile && flutter analyze

## Clean all build artifacts
clean:
	turbo run clean
	cd apps/mobile && flutter clean

## Run IoT hardware simulator
simulate:
	pnpm simulate

## Setup database (run migrations)
db\:setup:
	./scripts/db-setup.sh

## Show this help
help:
	@echo ""
	@echo "TRAQ Monorepo Commands:"
	@echo "  make setup        — Install all dependencies (pnpm + Flutter)"
	@echo "  make dev          — Start infra + backend + dashboard + simulator"
	@echo "  make dev:mobile   — Run Flutter app on device/emulator"
	@echo "  make build        — Build all apps (production)"
	@echo "  make test         — Run all tests"
	@echo "  make lint         — Lint all code"
	@echo "  make clean        — Clean all build artifacts"
	@echo "  make simulate     — Run hardware simulator"
	@echo "  make db:setup     — Run database migrations"
	@echo ""
