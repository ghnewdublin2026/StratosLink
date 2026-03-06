let map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 22 }).addTo(map);
let marker = L.marker([0, 0]).addTo(map);
let circle = L.circle([0, 0], { radius: 0 }).addTo(map);

let gpsLogs = [];
let observations = [];
let currentImg = null;

// Handle GPS Updates
function updateGPS(lat, lon, acc, siv, fix) {
    const entry = { time: new Date().toLocaleTimeString(), lat, lon, acc, siv, fix };
    gpsLogs.unshift(entry);
    if(gpsLogs.length > 100) gpsLogs.pop();
    
    // Update Map
    const pos = [lat, lon];
    marker.setLatLng(pos);
    circle.setLatLng(pos).setRadius(acc);
    document.getElementById('stats').innerText = `Acc: ${acc.toFixed(3)}m | Sats: ${siv} | Fix: ${fix}`;
    
    // Update Table
    const tbody = document.getElementById('logBody');
    tbody.innerHTML = gpsLogs.slice(0, 5).map(l => `<tr><td>${l.time}</td><td>${l.lat.toFixed(5)},${l.lon.toFixed(5)}</td><td>${l.acc}m</td><td>${l.fix}</td></tr>`).join('');
}

// Fallback Internal GPS
navigator.geolocation.watchPosition(p => {
    if(!window.isUsingBLE) updateGPS(p.coords.latitude, p.coords.longitude, p.coords.accuracy, "--", "Internal");
}, null, { enableHighAccuracy: true });

// Note Saving Logic
document.getElementById('saveNoteBtn').onclick = () => {
    const note = document.getElementById('noteInput').value;
    const last = gpsLogs[0] || { lat:0, lon:0, acc:0, fix:'N/A' };
    
    observations.unshift({
        time: new Date().toLocaleTimeString(),
        text: note,
        img: currentImg,
        lat: last.lat, lon: last.lon, acc: last.acc, fix: last.fix
    });
    
    renderNotes();
    document.getElementById('noteInput').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    currentImg = null;
};

function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = observations.map(o => `
        <div class="note-card">
            <strong>${o.time}</strong> - ${o.text}
            ${o.img ? `<img src="${o.img}" class="note-img">` : ''}
            <div class="note-meta">📍 ${o.lat}, ${o.lon} (Acc: ${o.acc}m, ${o.fix})</div>
        </div>
    `).join('');
}

// Image Handling
document.getElementById('imageInput').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        currentImg = ev.target.result;
        document.getElementById('imagePreview').innerHTML = `<img src="${currentImg}">`;
    };
    reader.readAsDataURL(e.target.files[0]);
};

// Bluetooth
document.getElementById('connectBle').onclick = async () => {
    const device = await navigator.bluetooth.requestDevice({ filters:[{namePrefix:'Stratos'}], optionalServices:['181a'] });
    const server = await device.gatt.connect();
    const char = await (await server.getPrimaryService('181a')).getCharacteristic('2a67');
    window.isUsingBLE = true;
    document.getElementById('status').innerText = "📡 StratosLink: Hardware Connected";
    char.startNotifications();
    char.oncharacteristicvaluechanged = (e) => {
        const v = e.target.value;
        const fixMap = { 0:"No Fix", 3:"3D Fix", 5:"RTK Float", 6:"RTK FIXED" };
        updateGPS(v.getFloat32(0,true), v.getFloat32(4,true), v.getFloat32(8,true), v.getUint8(12), fixMap[v.getUint8(13)]);
    };
};

function switchView(v) {
    document.getElementById('notesList').classList.toggle('hidden', v !== 'notes');
    document.getElementById('gpsView').classList.toggle('hidden', v !== 'gps');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(v === 'notes' ? 'btn-notes' : 'btn-gps').classList.add('active');
}

// CSV Export
document.getElementById('downloadCsv').onclick = () => {
    let csv = "Time,Note,Lat,Lon,Accuracy,Fix\n" + observations.map(o => `"${o.time}","${o.text}",${o.lat},${o.lon},${o.acc},${o.fix}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Survey_${Date.now()}.csv`; a.click();
};
