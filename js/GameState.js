import { guns } from './Config.js';

export const state = {
    score: 0,
    ammo: 12,
    totalShots: 0,
    totalHits: 0,
    isDoublePoints: false,

    // Player
    playerName: 'Player',

    // Gun system state
    currentGun: 'rifle',
    canShoot: true,
    isReloading: false,
    isZoomed: false,

    // Input/Camera state
    pointerLocked: false,
    yaw: 0,
    pitch: 0,
    recoilPitch: 0,
    recoilYaw: 0,

    // Gun visuals
    gunRecoilOffset: 0,
    gunBobOffset: 0,

    // Timers (references)
    comboTimer: null,
    gameTimer: null,
    powerUpTimer: null,

    // Resources
    monsterTexture: null
};

export function resetGameState() {
    state.score = 0;
    state.ammo = guns[state.currentGun].maxAmmo;
    state.totalShots = 0;
    state.totalHits = 0;
    state.combo = 1;
    state.bestCombo = 1;
    state.isPaused = false;
    state.isGameOver = false;
    state.totalMisses = 0;

    state.isSlowMo = false;
    state.isInfiniteAmmo = false;
    state.isDoublePoints = false;

    state.recoilPitch = 0;
    state.recoilYaw = 0;
    state.gunRecoilOffset = 0;
}
