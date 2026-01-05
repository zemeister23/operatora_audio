// API Base URL
const API_BASE = '/api';

// DOM Elements
const usersList = document.getElementById('usersList');
const refreshBtn = document.getElementById('refreshBtn');
const totalUsersEl = document.getElementById('totalUsers');
const totalFilesEl = document.getElementById('totalFiles');
const todayFilesEl = document.getElementById('todayFiles');
const headerText = document.getElementById('headerText');
const userAudioModal = document.getElementById('userAudioModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const userAudioList = document.getElementById('userAudioList');
const modalUserName = document.getElementById('modalUserName');
const filterInput = document.getElementById('filterInput');
const formatFilter = document.getElementById('formatFilter');

// Current user data for modal
let currentUser = null;
let currentUserAudios = [];

// Typing animation for header
const headerMessages = [
    'cat /var/log/audio_uploads.log',
    'systemctl status audio-server',
    'tail -f /var/log/audio_uploads.log',
    'ps aux | grep audio',
    'netstat -tulpn | grep :3000'
];

let currentMessageIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;

function typeHeaderText() {
    const currentMessage = headerMessages[currentMessageIndex];
    
    if (!isDeleting && currentCharIndex <= currentMessage.length) {
        headerText.textContent = currentMessage.substring(0, currentCharIndex);
        currentCharIndex++;
        setTimeout(typeHeaderText, 100);
    } else if (isDeleting && currentCharIndex >= 0) {
        headerText.textContent = currentMessage.substring(0, currentCharIndex);
        currentCharIndex--;
        setTimeout(typeHeaderText, 50);
    } else if (!isDeleting && currentCharIndex > currentMessage.length) {
        isDeleting = true;
        setTimeout(typeHeaderText, 2000);
    } else if (isDeleting && currentCharIndex < 0) {
        isDeleting = false;
        currentMessageIndex = (currentMessageIndex + 1) % headerMessages.length;
        setTimeout(typeHeaderText, 500);
    }
}

// Format user name
function formatUserName(name, surname) {
    const parts = [];
    if (name) parts.push(name.trim());
    if (surname) parts.push(surname.trim());
    return parts.join('_') || 'UNKNOWN';
}

// Set number directly without animation
function setNumber(element, value) {
    if (element) {
        element.textContent = value;
    }
}

// Update progress bars
function updateProgressBar(barId, value, maxValue) {
    const bar = document.getElementById(barId);
    if (bar) {
        const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
        bar.style.width = percentage + '%';
    }
}

// Load user statistics
async function loadUserStatistics() {
    try {
        usersList.innerHTML = `
            <div class="loading">
                <span class="loading-dots">Loading users</span>
                <span class="loading-animation">...</span>
            </div>
        `;
        
        const response = await fetch(`${API_BASE}/users/stats`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const userStats = await response.json();
        console.log('Loaded user statistics:', userStats);
        displayUsers(userStats);
        updateStats(userStats);
    } catch (error) {
        console.error('Error loading user statistics:', error);
        usersList.innerHTML = `
            <div class="loading" style="color: #ff0000;">
                <span>&gt; ERROR:</span> ${error.message}
                <br>
                <span>&gt; Retrying...</span>
            </div>
        `;
    }
}

// Display users with typing effect
function displayUsers(userStats) {
    if (userStats.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <p>&gt; No users found.</p>
                <p>&gt; Users will appear here after they upload audio files.</p>
            </div>
        `;
        return;
    }

    let html = '';
    userStats.forEach((user, index) => {
        const userName = formatUserName(user.name, user.surname);
        
        html += `
        <div class="user-item" style="animation-delay: ${index * 0.1}s;">
            <div class="user-info">
                <div class="user-name">${userName}</div>
                <div class="user-details">
                    <div class="user-stat">
                        <span class="stat-label">&gt; TOTAL_AUDIOS</span>
                        <span class="stat-value total">${user.totalAudios}</span>
                    </div>
                    <div class="user-stat">
                        <span class="stat-label">&gt; TODAY_AUDIOS</span>
                        <span class="stat-value today">${user.todayAudios}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    });
    
    usersList.innerHTML = html;
    
    // Set numbers directly without animation
    userStats.forEach((user, index) => {
        const totalEl = usersList.children[index]?.querySelector('.stat-value.total');
        const todayEl = usersList.children[index]?.querySelector('.stat-value.today');
        
        if (totalEl) {
            setNumber(totalEl, user.totalAudios);
        }
        if (todayEl) {
            setNumber(todayEl, user.todayAudios);
        }
    });
    
    // Add click event listeners to user items
    userStats.forEach((user, index) => {
        const userItem = usersList.children[index];
        if (userItem) {
            userItem.addEventListener('click', () => {
                openUserAudioModal(user);
            });
        }
    });
}

// Update statistics
function updateStats(userStats) {
    const totalUsers = userStats.length;
    const totalFiles = userStats.reduce((sum, user) => sum + user.totalAudios, 0);
    const todayFiles = userStats.reduce((sum, user) => sum + user.todayAudios, 0);
    
    const maxValue = Math.max(totalUsers, totalFiles, todayFiles, 1);
    
    // Set numbers directly without animation
    setNumber(totalUsersEl, totalUsers);
    setNumber(totalFilesEl, totalFiles);
    setNumber(todayFilesEl, todayFiles);
    
    // Update progress bars
    updateProgressBar('totalUsersBar', totalUsers, maxValue);
    updateProgressBar('totalFilesBar', totalFiles, maxValue);
    updateProgressBar('todayFilesBar', todayFiles, maxValue);
}

// Event Listeners

// Refresh button
refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<span>&gt;</span> REFRESHING...';
    loadUserStatistics().finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span>&gt;</span> REFRESH';
    });
});

// Start typing animation
typeHeaderText();

// Load user statistics on page load
loadUserStatistics();

// Auto-refresh every 5 seconds to show new uploads
setInterval(() => {
    loadUserStatistics();
}, 5000);

// Also refresh when page becomes visible (user switches tabs back)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadUserStatistics();
    }
});

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

// Open user audio modal
async function openUserAudioModal(user) {
    currentUser = user;
    const userName = formatUserName(user.name, user.surname);
    modalUserName.textContent = userName.toUpperCase();
    userAudioModal.classList.add('show');
    
    // Load user audio files
    await loadUserAudios(user.name, user.surname);
}

// Close modal
function closeUserAudioModal() {
    userAudioModal.classList.remove('show');
    currentUser = null;
    currentUserAudios = [];
}

// Load user audio files
async function loadUserAudios(name, surname) {
    try {
        userAudioList.innerHTML = `
            <div class="loading">
                <span class="loading-dots">Loading audio files</span>
                <span class="loading-animation">...</span>
            </div>
        `;
        
        const encodedName = encodeURIComponent(name);
        const encodedSurname = encodeURIComponent(surname);
        const response = await fetch(`${API_BASE}/users/${encodedName}/${encodedSurname}/audio`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const audioFiles = await response.json();
        currentUserAudios = audioFiles;
        displayUserAudios(audioFiles);
    } catch (error) {
        console.error('Error loading user audio files:', error);
        userAudioList.innerHTML = `
            <div class="loading" style="color: #ff0000;">
                <span>&gt; ERROR:</span> ${error.message}
            </div>
        `;
    }
}

// Display user audio files
function displayUserAudios(audioFiles) {
    if (audioFiles.length === 0) {
        userAudioList.innerHTML = `
            <div class="empty-state">
                <p>&gt; No audio files found for this user.</p>
            </div>
        `;
        return;
    }

    const html = audioFiles.map(audio => {
        return `
        <div class="audio-item-modal">
            <div class="audio-info-modal">
                <div class="audio-name-modal">${audio.originalName}</div>
                <div class="audio-details-modal">
                    <div class="audio-detail-modal">
                        <strong>&gt; Size:</strong> ${formatFileSize(audio.size)}
                    </div>
                    <div class="audio-detail-modal">
                        <strong>&gt; Format:</strong> ${audio.format.toUpperCase()}
                    </div>
                    <div class="audio-detail-modal">
                        <strong>&gt; Uploaded:</strong> ${formatDate(audio.uploadedAt)}
                    </div>
                </div>
                <div class="audio-actions-modal">
                    <audio controls class="audio-player-modal" src="${API_BASE}/audio/${audio.id}/stream"></audio>
                    <button class="btn-delete" onclick="deleteUserAudio('${audio.id}')">DELETE</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    userAudioList.innerHTML = html;
}

// Filter audio files
function filterUserAudios() {
    const filterText = filterInput.value.toLowerCase();
    const filterFormat = formatFilter.value.toLowerCase();
    
    let filtered = currentUserAudios;
    
    if (filterText) {
        filtered = filtered.filter(audio => 
            audio.originalName.toLowerCase().includes(filterText)
        );
    }
    
    if (filterFormat) {
        filtered = filtered.filter(audio => 
            audio.format.toLowerCase() === filterFormat.replace('.', '')
        );
    }
    
    displayUserAudios(filtered);
}

// Delete audio file
async function deleteUserAudio(id) {
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

        // Remove from current list
        currentUserAudios = currentUserAudios.filter(audio => audio.id !== id);
        
        // Reload user statistics and user audios
        if (currentUser) {
            await loadUserAudios(currentUser.name, currentUser.surname);
            await loadUserStatistics();
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert(`Delete failed: ${error.message}`);
    }
}

// Make deleteUserAudio available globally
window.deleteUserAudio = deleteUserAudio;

// Modal event listeners
closeModalBtn.addEventListener('click', closeUserAudioModal);

// Close modal when clicking outside
userAudioModal.addEventListener('click', (e) => {
    if (e.target === userAudioModal) {
        closeUserAudioModal();
    }
});

// Filter event listeners
filterInput.addEventListener('input', filterUserAudios);
formatFilter.addEventListener('change', filterUserAudios);

// Add glitch effect on hover for stat cards
document.addEventListener('DOMContentLoaded', () => {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.animation = 'glitch 0.3s';
        });
    });
});
