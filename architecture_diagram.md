# Traq System Architecture

```mermaid
graph TD
    subgraph "User Layer"
        User((Passenger))
        WebUI[React Web Application]
    end

    subgraph "Hardware Layer"
        ESP32[ESP32 Railway Card]
        BLE_Link{Web Bluetooth BLE}
    end

    subgraph "Cloud & Backend (Firebase)"
        FB_Auth[Firebase Auth]
        FB_FS[Cloud Firestore<br/>- User Profiles<br/>- Booking History]
        FB_RTDB[Realtime Database<br/>- Active Tickets<br/>- Verification Status]
    end

    subgraph "External Services & APIs"
        RR_API[RailRadar API<br/>- Train Status<br/>- Schedules]
        InfDB[InfluxDB<br/>- Crowd Density Sensors]
    end

    subgraph "Enforcement Layer"
        TTE[Ticket Collector App]
    end

    %% Interactions
    User -->|Interacts| WebUI
    WebUI -->|Google/OTP Login| FB_Auth
    WebUI -->|Fetch Trains| RR_API
    WebUI -->|View Density| InfDB
    
    WebUI -->|1. Book Ticket| FB_FS
    WebUI -->|2. Handshake & Sync| BLE_Link
    BLE_Link -->|Push Ticket ID| ESP32
    WebUI -->|3. Register Active Ticket| FB_RTDB

    ESP32 ---|Physical Presence| TTE
    TTE -->|Verify Card ID| FB_RTDB
    
    %% Styling
    style ESP32 fill:#f96,stroke:#333,stroke-width:2px
    style WebUI fill:#2f80ed,stroke:#fff,color:#fff
    style BLE_Link fill:#22c55e,stroke:#333
    style FB_RTDB fill:#ffca28,stroke:#333
```

## Component Breakdown

### 1. React Web Application (Frontend)
- **State Management:** Handles journey selection, train searching, and booking flows.
- **BLE Service:** Manages the browser-to-hardware communication lifecycle (Scanning -> Connecting -> Handshake -> Data Push).

### 2. ESP32 Railway Card (Edge Hardware)
- **Role:** Portable bearer of the digital ticket.
- **Communication:** Passive BLE Peripheral that accepts writes to specific characteristics after a 2-step verification handshake.

### 3. Firebase Architecture
- **Firestore:** Optimized for document-based retrieval of long-term booking history and user metadata.
- **Realtime Database (RTDB):** Used as a high-speed lock/verification table. When a ticket is synced to a card, its ID and route are mirrored here with `verified: false`.

### 4. Logic & Data Flow
1. **Discovery:** User searches for a train (RailRadar) and checks which coach is empty (InfluxDB).
2. **Transaction:** User books a general ticket (Firestore).
3. **Physical Sync:** The Web App establishes a BLE link, performs a handshake with the ESP32, and pushes the Ticket ID.
4. **Validation:** Simultaneously, the Web App updates the RTDB to signal that a specific Ticket ID is now "Live" on a physical card for the Ticket Collector (TTE) to verify.
