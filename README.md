# 📍 StratosLink
**High-Precision GNSS Web Tracker**

StratosLink is a specialized web-based tool designed to break the "5-meter barrier" of standard smartphone GPS. By bridging high-end GNSS hardware (like the u-blox ZED-F9P) to a mobile browser via Web-Bluetooth, StratosLink visualizes your position with sub-meter accuracy in real-time.



## 🎯 Accuracy Tiers
* **Standard Mode:** Uses internal phone GPS (~5m - 10m accuracy).
* **Precision Mode:** Uses Dual-Band L1/L5 GNSS (~1m - 3m accuracy).
* **RTK Mode:** Uses external StratosLink Hardware (~0.01m / 1cm accuracy).

## 🚀 Features
- **Live Radius Visualization:** Dynamic Leaflet.js circles showing real-time error margins.
- **Hardware Bridge:** Connects to ESP32/u-blox rovers via Web-Bluetooth (No app install required).
- **NTRIP Ready:** Designed to work with RTK correction data for centimeter-level "Fixed" solutions.
- **Zero-Install:** Hosted entirely on GitHub Pages / Cloudflare Pages.

## 🛠 Hardware Requirements
To achieve the <1m accuracy shown in the tool, you will need:
1. **Microcontroller:** ESP32 (with BLE support).
2. **GNSS Module:** u-blox ZED-F9P or similar RTK-capable chip.
3. **Antenna:** Multi-band GNSS antenna.

## 💻 Installation & Deployment
1. **Web:** Push the `index.html`, `style.css`, and `app.js` to a GitHub repository.
2. **Enable Pages:** Settings > Pages > Deploy from Branch. 
   *Note: Web-Bluetooth requires an HTTPS connection.*
3. **Firmware:** Flash the provided `.ino` file to your ESP32.

## ⚠️ Limitations
- **Browser Support:** Requires Chrome, Edge, or Bluefy (on iOS) for Web-Bluetooth support.
- **Sky View:** High accuracy requires an unobstructed view of the sky.
