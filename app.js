let map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 22 }).addTo(map);
let marker = L.marker([0, 0]).addTo(map);
let circle = L.circle([0, 0], { radius: 0 }).addTo(map);

let gpsLogs = [];
let observations = [];
let currentImg = null;

// Initialize Settings from LocalStorage
window.onload = () => {
    ['bb-endpoint', 'bb-bucket', 'bb-keyId'].forEach(id => {
        document.getElementById(id).value = localStorage.getItem(id) || '';
    });
};

function updateGPS(lat, lon, acc, siv, fix) {
    const entry = { time: new Date().toLocaleTimeString(), lat, lon, acc, siv, fix };
    gpsLogs.unshift(entry);
    if(gpsLogs.length > 50) gpsLogs.pop();
    
    marker.setLatLng([lat, lon]);
    circle.setLatLng([lat, lon]).setRadius(acc);
    document.getElementById('stats').innerText = `Acc: ${acc.toFixed(3)}m | Sats: ${siv} | Fix: ${fix}`;
    
    const tbody = document.getElementById('logBody');
    tbody.innerHTML = gpsLogs.slice(0, 5).map(l => `<tr><td>${l.time}</td><td>${l.lat.toFixed(5)},${l.lon.toFixed(5)}</td><td>${l.acc}m</td><td>${l.fix}</td></tr>`).join('');
}

// Observation Handling
document.getElementById('saveNoteBtn').onclick = () => {
    const last = gpsLogs[0] || { lat:0, lon:0, acc:0, fix:'None' };
    observations.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: document.getElementById('noteInput').value,
        img: currentImg,
        lat: last.lat, lon: last.lon, acc: last.acc, fix: last.fix
    });
    renderNotes();
    document.getElementById('noteInput').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    currentImg = null;
};

// Cloud Sync to Backblaze B2
document.getElementById('syncToCloud').onclick = async () => {
    if (observations.length === 0) return alert("No observations to sync.");
    
    AWS.config.update({
        accessKeyId: localStorage.getItem('bb-keyId'),
        secretAccessKey: localStorage.getItem('bb-secret'),
        region: 'us-west-004' // Standard B2 Region
    });

    const s3 = new AWS.S3({
        endpoint: new AWS.Endpoint(localStorage.getItem('bb-endpoint')),
        s3ForcePathStyle: true
    });

    const surveyFolder = `StratosLink_Survey_${Date.now()}`;
    document.getElementById('status').innerText = "Syncing...";

    try {
        for (let obs of observations) {
            if (obs.img) {
                const blob = await (await fetch(obs.img)).blob();
                await s3.putObject({
                    Bucket: localStorage.getItem('bb-bucket'),
                    Key: `${surveyFolder}/images/IMG_${obs.id}.jpg`,
                    Body: blob,
                    ContentType: 'image/jpeg'
                }).promise();
            }
        }
        // Upload CSV
        const csv = "Time,Note,Lat,Lon,Acc,Fix\n" + observations.map(o => `"${o.time}","${o.text}",${o.lat},${o.lon},${o.acc},${o.fix}`).join("\n");
        await s3.putObject({
            Bucket: localStorage.getItem('bb-bucket'),
            Key: `${surveyFolder}/data_log.csv`,
            Body: csv,
            ContentType: 'text/csv'
        }).promise();

        alert("Upload Successful!");
        document.getElementById('status').innerText = "Cloud Sync Success";
    } catch (e) { alert("Upload Failed: " + e.message); }
};

// ... Include BLE, imageInput, and switchView logic from previous version ...
