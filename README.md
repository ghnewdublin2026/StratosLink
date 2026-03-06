# 📍 StratosLink
**Centimeter-Accurate GNSS Tracking for the Mobile Web**

StratosLink bridges high-precision RTK hardware to a smartphone browser via Web-Bluetooth, providing real-time accuracy visualization and data logging.

### 🌟 Key Features
- **1cm Accuracy Support:** Direct integration with u-blox ZED-F9P for RTK Fixed status.
- **Dual-Mode Logging:** View data second-by-second for live movement or minute-by-minute for drift analysis.
- **CSV Export:** One-tap export of high-precision coordinate logs for GIS analysis.
- **Hybrid Source:** Automatically uses phone GPS when hardware is offline.

### 🔌 Hardware Protocol
| Offset | Type | Desc |
| :--- | :--- | :--- |
| 0-3 | Float | Lat |
| 4-7 | Float | Lon |
| 8-11 | Float | Accuracy (m) |
| 12 | UInt8 | Satellites (SIV) |
| 13 | UInt8 | Fix Type (3=3D, 5=Float, 6=Fixed) |

---
**Note:** Requires HTTPS and a Web-Bluetooth compatible browser (Chrome/Edge/Bluefy).
