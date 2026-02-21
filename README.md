# 🚂 TRAQ — IoT + ML Real-Time Train Crowd Intelligence

> Real-time coach occupancy tracking, crowd prediction, and smart ticketing for Indian Railways.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TRAQ SYSTEM                               │
│                                                                     │
│  [Railway Card BLE] → [nRF52833] ──UART──→ [ESP32]                 │
│  [RF Signals]       → [AD8318 → ADS1115] ──I2C──→ [ESP32]         │
│                                                  ↓ MQTT             │
│  [Flutter App] ←──── [Fastify Backend] ←── [SQLite + InfluxDB + Redis]
│  [React Dashboard] ←────────┘    ↑                                  
│                          [FastAPI ML Service]                       
└─────────────────────────────────────────────────────────────────────┘
```

## Hardware Stack

| Component | Role |
|---|---|
| **ESP32-WROOM-32** | Main MCU — WiFi, MQTT, sensor fusion, data aggregation |
| **nRF52833** | BLE 5.1 SoC — AoA direction finding, device counting, card detection |
| **AD8318** | RF logarithmic power detector — ambient RF occupancy proxy |
| **ADS1115** | 16-bit ADC — reads AD8318 output via I2C with PGA |

## Project Structure

```
traq/
├── apps/
│   ├── backend/         Fastify API (TypeScript)     ← pnpm workspace
│   ├── dashboard/       React + Vite (TypeScript)    ← pnpm workspace
│   ├── simulator/       Hardware simulator (TS)      ← pnpm workspace
│   ├── mobile/          Flutter app (Dart)           ← standalone
│   └── ml-service/      FastAPI + XGBoost (Python)   ← Docker
├── packages/
│   ├── shared-types/    TypeScript interfaces        ← pnpm workspace
│   └── config/          tsconfig, eslint, prettier   ← pnpm workspace
├── infrastructure/
│   └── mosquitto/       MQTT broker config
├── scripts/
│   ├── db-setup.sh      Database migration runner
│   └── install-deps.sh  Native OS infra installer (Influx/Redis)
├── Makefile             Unified developer interface
└── turbo.json           Turborepo pipeline
```

## Quick Start

```bash
# 1. Install all dependencies (TS + Flutter + Native OS packages)
make setup

# 2. Run database migrations / initialization
make db:setup

# 3. Start infra + backend + dashboard + simulator
make dev

# 5. Run Flutter app (separate terminal)
make dev:mobile
```

## All Commands

| Command | Description |
|---|---|
| `make setup` | Install pnpm + Flutter dependencies |
| `make dev` | Start infra + backend + dashboard + simulator |
| `make dev:mobile` | Run Flutter app on device/emulator |
| `make build` | Production build (all apps) |
| `make test` | Run all tests (JS/TS + Flutter) |
| `make lint` | Lint all code |
| `make clean` | Clean build artifacts |
| `make simulate` | Run hardware simulator only |
| `make db:setup` | Run database migrations |

## Service Ports

| Service | Port |
|---|---|
| Backend API | http://localhost:3000 |
| Dashboard | http://localhost:5173 |
| ML Service | http://localhost:8000/docs |
| InfluxDB | http://localhost:8086 |
| SQLite | ./var/traq_local.db |
| Redis | localhost:6379 |
| MQTT | localhost:1883 (TCP), 9001 (WS) |
