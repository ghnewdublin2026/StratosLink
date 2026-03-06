let map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(map);

let marker = L.marker([0, 0]).addTo(map);
let circle = L.circle([0, 0], { radius: 0 }).addTo(map);

// 1. Fallback: Internal GPS
navigator.geolocation.watchPosition((pos) => {
    if (document.getElementById('status').innerText.includes("Internal")) {
        updateMap(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
    }
}, null, { enableHighAccuracy: true });

function updateMap(lat, lon, acc) {
    const latlng = [lat, lon];
    marker.setLatLng(latlng);
    circle.setLatLng(latlng);
    circle.setRadius(acc);
    map.setView(latlng, map.getZoom() > 15 ? map.getZoom() : 18);
    document.getElementById('stats').innerText = `Accuracy: ${acc.toFixed(2)}m`;
}

// 2. High Precision: Web Bluetooth
document.getElementById('connectBle').addEventListener('click', async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'Precision-GPS' }],
            optionalServices: ['181a'] // Environmental Sensing UUID
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('181a');
        const characteristic = await service.getCharacteristic('2a67'); // Location and Navigation

        document.getElementById('status').innerText = "Status: RTK Hardware Connected";
        
        characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (e) => {
            const view = e.target.value;
            // Assuming ESP32 sends: Float32 Lat, Float32 Lon, Float32 Acc
            const lat = view.getFloat32(0, true);
            const lon = view.getFloat32(4, true);
            const acc = view.getFloat32(8, true);
            updateMap(lat, lon, acc);
        });
    } catch (err) {
        console.error(err);
        alert("Bluetooth Connection Failed: " + err);
    }
});

