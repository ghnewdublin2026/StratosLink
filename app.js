let observations = [];
let currentImageData = null;

// Handle Image Preview
document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentImageData = event.target.result;
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${currentImageData}" />`;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Save Observation with GPS Stamp
document.getElementById('saveNoteBtn').addEventListener('click', () => {
    const noteText = document.getElementById('noteInput').value;
    if (!noteText && !currentImageData) return;

    // Get the latest GPS entry
    const lastGps = logs[0] || { lat: "0", lon: "0", acc: "N/A", fix: "None" };

    const observation = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: noteText,
        lat: lastGps.lat,
        lon: lastGps.lon,
        acc: lastGps.acc,
        fix: lastGps.fix,
        image: currentImageData
    };

    observations.unshift(observation);
    resetNoteInput();
    renderNotes();
});

function renderNotes() {
    const container = document.getElementById('notesList');
    container.innerHTML = observations.map(obs => `
        <div class="note-card">
            <div class="note-header">
                <strong>${obs.time}</strong> 
                <span class="badge ${obs.acc < 0.05 ? 'p-fixed' : 'p-high'}">${obs.acc}m</span>
            </div>
            <p>${obs.text}</p>
            ${obs.image ? `<img src="${obs.image}" class="note-img" />` : ''}
            <div class="note-footer">📍 ${obs.lat}, ${obs.lon} (${obs.fix})</div>
        </div>
    `).join('');
}

function resetNoteInput() {
    document.getElementById('noteInput').value = '';
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imagePreview').classList.add('hidden');
    currentImageData = null;
}
