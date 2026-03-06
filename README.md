# 📍 StratosLink
**Professional GNSS Field Survey & RTK Workstation**

StratosLink is a high-precision field data collection tool that bridges RTK-capable GNSS hardware to a mobile web dashboard. It enables centimeter-level observations with instant photo and note logging.

### 🚀 Core Features
* **Centimeter Precision:** Seamlessly connects to u-blox ZED-F9P hardware via Web-Bluetooth.
* **Geotagged Observations:** Log field notes and attach photos—each entry is instantly timestamped and "GPS-stamped" with the current precision data.
* **RTK Status Monitoring:** Real-time tracking of Fix Type (3D, Float, Fixed) and Satellites in View (SIV).
* **Dual-View Dashboard:** Switch between a social-style "Observation Feed" and a raw "Live GPS" data table.
* **Survey Export:** Download your entire session as a comprehensive .CSV file for GIS or Excel.

### 🛠 Hardware Protocol
The tool expects a 14-byte BLE packet on Service `181a` / Char `2a67`. 
[Bytes 0-3: Lat] [4-7: Lon] [8-11: Acc] [12: SIV] [13: FixType]
