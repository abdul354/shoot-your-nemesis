import { state } from './GameState.js';

let leaderboard = [];

export function loadPlayerName() {
    const playerNameInput = document.getElementById('playerName');
    const hudPlayer = document.getElementById('hudPlayer');
    const n = localStorage.getItem('msr_playerName');
    if (n) {
        state.playerName = n;
        if (playerNameInput) playerNameInput.value = n;
        if (hudPlayer) hudPlayer.textContent = n;
    }
}

export function savePlayerName() {
    const playerNameInput = document.getElementById('playerName');
    const hudPlayer = document.getElementById('hudPlayer');
    if (playerNameInput) {
        state.playerName = playerNameInput.value.trim() || 'Player';
        localStorage.setItem('msr_playerName', state.playerName);
    }
    if (hudPlayer) hudPlayer.textContent = state.playerName;
}

export function loadLeaderboard() {
    try {
        const raw = localStorage.getItem('msr_leaderboard');
        leaderboard = raw ? JSON.parse(raw) : [];
    } catch (e) {
        leaderboard = [];
    }
    return leaderboard;
}

export function saveLeaderboard() {
    localStorage.setItem('msr_leaderboard', JSON.stringify(leaderboard));
}

export function getLeaderboard() {
    return leaderboard;
}

export function setLeaderboard(newLeaderboard) {
    leaderboard = newLeaderboard;
}

export function renderLeaderboard(container, list) {
    if (!container) return;
    container.innerHTML = '';
    if (!list || list.length === 0) {
        container.innerHTML = '<div style="color:#ccc;padding:6px;">No scores yet.</div>';
        return;
    }
    list.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-item';
        const left = document.createElement('div');
        left.textContent = `${idx + 1}. ${item.name}`;
        const right = document.createElement('div');
        right.textContent = `${item.score} (${item.accuracy})`;
        row.appendChild(left);
        row.appendChild(right);
        container.appendChild(row);
    });
}

export function addScoreToLeaderboard(score, accuracyText, hits) {
    const entry = { name: state.playerName, score: score, accuracy: accuracyText, hits: hits, date: Date.now() };
    leaderboard.push(entry);
    // sort desc and keep top 10
    leaderboard.sort((a, b) => b.score - a.score || b.hits - a.hits);
    leaderboard = leaderboard.slice(0, 10);
    saveLeaderboard();
    return leaderboard;
}

export function initLeaderboard() {
    loadPlayerName();
    loadLeaderboard();
    const leaderboardSetup = document.getElementById('leaderboardSetup');
    if (leaderboardSetup) {
        renderLeaderboard(leaderboardSetup, leaderboard);
    }
}
