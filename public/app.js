// API Base URL
const API_BASE = '/api';

// DOM Elements
const audioList = document.getElementById('audioList');
const refreshBtn = document.getElementById('refreshBtn');
const totalFilesEl = document.getElementById('totalFiles');
const totalSizeEl = document.getElementById('totalSize');
const avgSizeEl = document.getElementById('avgSize');

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}


// Load audio files
async function loadAudioFiles() {
    try {
        const response = await fetch(`${API_BASE}/audio`);
        if (!response.ok) throw new Error('Failed to fetch audio files');
        
        const audioFiles = await response.json();
        displayAudioFiles(audioFiles);
        updateStats(audioFiles);
    } catch (error) {
        console.error('Error loading audio files:', error);
        audioList.innerHTML = '<div class="loading">Error loading audio files. Please try again.</div>';
    }
}

// Display audio files
function displayAudioFiles(audioFiles) {
    if (audioFiles.length === 0) {
        audioList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
                <p>No audio files uploaded yet.</p>
                <p>Use the API to upload audio files. See API_DOCUMENTATION.md for details.</p>
            </div>
        `;
        return;
    }

    audioList.innerHTML = audioFiles.map(audio => {
        const ownerName = audio.owner && (audio.owner.name || audio.owner.surname) 
            ? `${audio.owner.name || ''} ${audio.owner.surname || ''}`.trim() 
            : 'N/A';
        
        return `
        <div class="audio-item">
            <div class="audio-info">
                <div class="audio-name">${audio.originalName}</div>
                <div class="audio-details">
                    <div class="audio-detail">
                        <strong>Owner:</strong> ${ownerName}
                    </div>
                    <div class="audio-detail">
                        <strong>Size:</strong> ${formatFileSize(audio.size)}
                    </div>
                    <div class="audio-detail">
                        <strong>Format:</strong> ${audio.format.toUpperCase()}
                    </div>
                    <div class="audio-detail">
                        <strong>Uploaded:</strong> ${formatDate(audio.uploadedAt)}
                    </div>
                    <div class="audio-detail">
                        <strong>Type:</strong> ${audio.mimetype || 'N/A'}
                    </div>
                </div>
            </div>
            <div class="audio-actions">
                <audio controls class="audio-player" src="${API_BASE}/audio/${audio.id}/stream"></audio>
                <button class="btn btn-danger" onclick="deleteAudio('${audio.id}')">Delete</button>
            </div>
        </div>
    `;
    }).join('');
}

// Update statistics
function updateStats(audioFiles) {
    const totalFiles = audioFiles.length;
    const totalSize = audioFiles.reduce((sum, audio) => sum + audio.size, 0);
    const avgSize = totalFiles > 0 ? totalSize / totalFiles : 0;

    totalFilesEl.textContent = totalFiles;
    totalSizeEl.textContent = formatFileSize(totalSize);
    avgSizeEl.textContent = formatFileSize(avgSize);
}


// Delete audio file
async function deleteAudio(id) {
    if (!confirm('Are you sure you want to delete this audio file?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/audio/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete audio file');
        }

        alert('Audio file deleted successfully');
        loadAudioFiles();
    } catch (error) {
        console.error('Delete error:', error);
        alert(`Delete failed: ${error.message}`);
    }
}

// Event Listeners

// Refresh button
refreshBtn.addEventListener('click', () => {
    loadAudioFiles();
});

// Make deleteAudio available globally
window.deleteAudio = deleteAudio;

// Load audio files on page load
loadAudioFiles();
