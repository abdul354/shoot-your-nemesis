import { state } from './GameState.js';
import { guns } from './Config.js';

// HUD elements references
let hudScore, hudAmmo, hudAccuracy, hudTimer, hudCurrentGun, hudPlayer, hudPowerup;

function getHUDElements() {
    hudScore = document.getElementById('score');
    hudAmmo = document.getElementById('ammo');
    hudAccuracy = document.getElementById('accuracy');
    hudTimer = document.getElementById('timer');
    hudCurrentGun = document.getElementById('currentGun');
    hudPlayer = document.getElementById('hudPlayer');
    hudPowerup = document.getElementById('powerup');
}

export function updateHUD() {
    if (!hudScore) getHUDElements();

    if (hudScore) hudScore.textContent = state.score;

    // Show "Reloading..." or ammo count
    if (hudAmmo) {
        if (state.isReloading) {
            hudAmmo.textContent = "Reloading...";
        } else if (state.isInfiniteAmmo) {
            hudAmmo.textContent = "∞ / ∞"; // Infinite symbol
        } else {
            hudAmmo.textContent = `${state.ammo}/${guns[state.currentGun].maxAmmo}`;
        }
    }

    if (hudAccuracy) hudAccuracy.textContent = state.totalShots > 0 ? Math.round((state.totalHits / state.totalShots) * 100) + '%' : '0%';
    if (hudTimer) hudTimer.textContent = state.gameTime + 's';
    if (hudCurrentGun) hudCurrentGun.textContent = guns[state.currentGun].name;
    if (hudPlayer) hudPlayer.textContent = state.playerName;

    // Update powerup HUD (if it exists)
    if (hudPowerup && !state.isSlowMo && !state.isInfiniteAmmo && !state.isDoublePoints) {
        hudPowerup.textContent = "None";
    }
}

export function setPowerupText(text) {
    if (!hudPowerup) hudPowerup = document.getElementById('powerup');
    if (hudPowerup) hudPowerup.textContent = text;
}
