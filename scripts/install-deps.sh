#!/bin/bash
# =============================================================================
# TRAQ — Native Dependency Setup Script
# =============================================================================
# Installs InfluxDB 2.x, Redis, and Mosquitto natively via Homebrew or APT.
# Replaces Docker Compose orchestration.
# Usage: ./scripts/install-deps.sh
# =============================================================================

set -e

OS="$(uname -s)"
echo "🖥️  Detected OS: $OS"

if [ "$OS" = "Darwin" ]; then
    # macOS - Use Homebrew
    echo "📦 Using Homebrew to install dependencies..."
    
    # Check if brew is installed
    if ! command -v brew >/dev/null 2>&1; then
        echo "❌ Homebrew is not installed. Please install it first: https://brew.sh/"
        exit 1
    fi

    echo "▶️  Installing Redis..."
    brew list redis &>/dev/null || brew install redis

    echo "▶️  Installing Mosquitto (MQTT)..."
    brew list mosquitto &>/dev/null || brew install mosquitto

    echo "▶️  Installing InfluxDB 2.x..."
    brew list influxdb &>/dev/null || brew install influxdb

    echo "✅ Dependencies installed!"
    echo "Note: You may want to start these services using brew services start <name>"
    echo "eg: brew services start influxdb"

elif [ "$OS" = "Linux" ]; then
    # Linux - Use APT
    echo "📦 Using APT to install dependencies..."
    
    # Check if apt is available
    if ! command -v apt-get >/dev/null 2>&1; then
        echo "❌ apt-get not found. This script only supports Debian-based Linux."
        exit 1
    fi

    sudo apt-get update

    echo "▶️  Installing Redis..."
    sudo apt-get install -y redis-server

    echo "▶️  Installing Mosquitto (MQTT)..."
    sudo apt-get install -y mosquitto mosquitto-clients

    echo "▶️  Installing InfluxDB 2.x..."
    # Add InfluxData repository
    curl -sL https://repos.influxdata.com/influxdata-archive_compat.key | gpg --dearmor | sudo tee /usr/share/keyrings/influxdb-archive-keyring.gpg >/dev/null
    echo "deb [signed-by=/usr/share/keyrings/influxdb-archive-keyring.gpg] https://repos.influxdata.com/debian stable main" | sudo tee /etc/apt/sources.list.d/influxdb.list
    sudo apt-get update
    sudo apt-get install -y influxdb2

    echo "✅ Dependencies installed!"
    echo "Note: Services are typically managed via systemctl on Linux."

else
    echo "❌ Unsupported OS: $OS. Please install InfluxDB, Redis, and Mosquitto manually."
    exit 1
fi

echo "🚀 Run 'make dev' to start all services."
