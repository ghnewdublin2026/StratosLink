let map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 22 }).addTo(map);
let marker = L.marker([0, 0]).addTo(map);
let circle = L.circle([0, 0], { radius: 0 }).addTo(map);

let logs = [];
let currentView = 'second';

// Update Logic
function updateCore(lat, lon, acc, siv = "--", fix = "Internal") {
    const now = new Date();
    const entry = {
        time: now.toLocaleTimeString(),
        minKey: now.getHours() + ":" + now.getMinutes(),
        lat: lat.toFixed(7),
        lon: lon.toFixed(7),
        acc: acc.toFixed(3),
        siv: siv,
        fix: fix,
        className: acc < 0.05 ? 'p-fixed' : (acc < 1.5 ? 'p-high' : 'p-low')
    };

    logs.unshift(entry);
    if(logs.length > 1000) logs.pop();
    
    renderTable();
    
    const latlng = [lat, lon];
    marker.setLatLng(latlng);
    circle.setLatLng(latlng).setRadius(acc);
    if (!map.getBounds().contains(latlng)) map.setView(latlng, 19);
    
    document.getElementById('stats').innerText = `Acc: ${acc}m | Sats: ${siv} | Fix: ${fix}`;
    document.getElementById('fix-badge').innerText = fix;
    document.getElementById('fix-badge').className = `badge ${entry.className}`;
}

// Fallback Internal GPS
navigator.geolocation.watchPosition(p => {
    if (document.getElementById('status').innerText.includes("Internal")) {
        updateCore(p.coords.latitude, p.coords.longitude, p.coords.accuracy);
    }
}, null, { enableHighAccuracy: true });

// Bluetooth Implementation
document.getElementById('connectBle').addEventListener('click', async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'Stratos' }],
            optionalServices: ['181a']
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('181a');
        const char = await service.getCharacteristic('2a67');
        
        document.getElementById('status').innerText = "Status: StratosLink Hardware";
        char.startNotifications();
        char.addEventListener('characteristicvaluechanged', e => {
            const v = e.target.value;
            const fixMap = { 0:"No Fix", 3:"3D Fix", 5:"RTK Float", 6:"RTK FIXED" };
            updateCore(v.getFloat32(0,true), v.getFloat32(4,true), v.getFloat32(8,true), v.getUint8(12), fixMap[v.getUint8(13)]);
        });
    } catch (e) { alert("BLE Error: " + e); }
});

function renderTable() {
    const tbody = document.getElementById('logBody');
    tbody.innerHTML = '';
    let display = (currentView === 'second') ? logs.slice(0, 25) : 
        logs.filter((v,i,a) => a.findIndex(t => t.minKey === v.minKey) === i).slice(0, 25);

    display.forEach(l => {
        tbody.innerHTML += `<tr><td>${l.time}</td><td>${l.lat},${l.lon}</td>
        <td><span class="badge ${l.className}">${l.acc}m</span></td><td>${l.siv}</td><td>${l.fix}</td></tr>`;
    });
}

function switchView(v) { 
    currentView = v; 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(v === 'second' ? 'btn-sec' : 'btn-min').classList.add('active');
    renderTable(); 
}

document.getElementById('downloadCsv').onclick = () => {
    let csv = "Time,Lat,Lon,Acc,Sats,Fix\n" + logs.map(l => `${l.time},${l.lat},${l.lon},${l.acc},${l.siv},${l.fix}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `StratosLog_${Date.now()}.csv`; a.click();
};
