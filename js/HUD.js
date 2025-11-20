import { state } from './GameState.js';
import { guns } from './Config.js';

// HUD elements
const hudScore = document.getElementById('score');
const hudAmmo = document.getElementById('ammo');
const hudAccuracy = document.getElementById('accuracy');
const hudCombo = document.getElementById('combo');
const hudTimer = document.getElementById('timer');
const hudCurrentGun = document.getElementById('currentGun');
const hudPlayer = document.getElementById('hudPlayer');
const hudMisses = document.getElementById('misses');
const hudPowerup = document.getElementById('powerup') || { textContent: '' };

export function updateHUD() {
    hudScore.textContent = state.score;

    // Show "Reloading..." or ammo count
    if (state.isReloading) {
        hudAmmo.textContent = "Reloading...";
    } else if (state.isInfiniteAmmo) {
        hudAmmo.textContent = "∞ / ∞"; // Infinite symbol
    } else {
        hudAmmo.textContent = `${state.ammo}/${guns[state.currentGun].maxAmmo}`;
    }

    hudAccuracy.textContent = state.totalShots > 0 ? Math.round((state.totalHits / state.totalShots) * 100) + '%' : '0%';
    hudCombo.textContent = `x${state.combo}`;
    hudTimer.textContent = state.gameTime + 's';
    hudCurrentGun.textContent = guns[state.currentGun].name;
    hudPlayer.textContent = state.playerName;
    hudMisses.textContent = `${state.totalMisses} / ${state.maxMisses}`;

    // Update powerup HUD (if it exists)
    if (!state.isSlowMo && !state.isInfiniteAmmo && !state.isDoublePoints) {
        hudPowerup.textContent = "None";
    }
}

export function setPowerupText(text) {
    hudPowerup.textContent = text;
}
