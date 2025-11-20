import { state } from './GameState.js';
import { updateHUD, setPowerupText } from './HUD.js';

export function activatePowerUp(type, targets) {
    // Clear any existing powerup timer
    clearTimeout(state.powerUpTimer);

    // Deactivate all first (to reset)
    deactivatePowerUp('all', targets);

    if (type === 'slowmo') {
        state.isSlowMo = true;
        setPowerupText("SLOW-MO (7s)");
        // Apply to existing targets
        targets.forEach(target => {
            target.userData.moveSpeed = target.userData.originalSideSpeed * 0.5;
            target.userData.forwardSpeed = target.userData.originalForwardSpeed * 0.5;
        });
    } else if (type === 'infammo') {
        state.isInfiniteAmmo = true;
        setPowerupText("INFINITE AMMO (7s)");
    } else if (type === 'dblpoints') {
        state.isDoublePoints = true;
        setPowerupText("DOUBLE POINTS (7s)");
    }

    updateHUD();

    // Set timer to deactivate
    state.powerUpTimer = setTimeout(() => {
        deactivatePowerUp(type, targets);
    }, 7000); // 7 seconds
}

export function deactivatePowerUp(type, targets) {
    if (type === 'slowmo' || type === 'all') {
        state.isSlowMo = false;
        // Restore speed for existing targets
        if (targets) {
            targets.forEach(target => {
                target.userData.moveSpeed = target.userData.originalSideSpeed;
                target.userData.forwardSpeed = target.userData.originalForwardSpeed;
            });
        }
    }
    if (type === 'infammo' || type === 'all') {
        state.isInfiniteAmmo = false;
    }
    if (type === 'dblpoints' || type === 'all') {
        state.isDoublePoints = false;
    }

    if (type !== 'all') {
        setPowerupText("None");
        updateHUD();
    }
}
