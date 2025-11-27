import * as THREE from 'three';
import { initEnvironment, updateEnvironment } from './Environment.js';
import { state, resetGameState } from './GameState.js';

import { initAudio, playMenuMusic, playGameMusic, stopGameMusic } from './AudioSystem.js';
import { updateHUD } from './HUD.js';
import { initLeaderboard, savePlayerName, addScoreToLeaderboard, renderLeaderboard, getLeaderboard, saveLeaderboard } from './Leaderboard.js';
import { targets, spawnTarget, updateTargets, resetTargets } from './TargetSystem.js';
import { switchGun, createGunModel, shoot, reload, unZoom, getGunModel } from './GunSystem.js';
import { initInput } from './Input.js';
import { deactivatePowerUp } from './PowerupSystem.js';

// CONFIGURATION: Replace this with your actual Ngrok URL
const NGROK_URL = "https://palaeanthropic-lina-repulsively.ngrok-free.dev";

// Automatically choose URL based on where the game is running
const SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '' // Use relative path for local
    : NGROK_URL; // Use Ngrok for GitHub Pages

// DOM Elements
const container = document.getElementById('container');
const overlay = document.getElementById('overlay');
const crosshair = document.getElementById('crosshair');
const pauseMenu = document.getElementById('pauseMenu');
const gameOverScreen = document.getElementById('gameOver');
const leaderboardGameOver = document.getElementById('leaderboard');

// Three.js globals
let scene, camera, renderer, clock, raycaster;
let gunScene, gunCamera;

// Initialize
initLeaderboard();

// Exported function to start the game from React
export function startGame(playerName, targetUrl) {
    state.playerName = playerName;
    savePlayerName(playerName);

    // Set game parameters
    state.gameTime = 60;
    state.winningScore = 999999; // Infinite play essentially

    // Handle custom target texture
    if (targetUrl) {
        const loader = new THREE.TextureLoader();
        loader.load(targetUrl, (texture) => {
            state.monsterTexture = texture;
            launchGame();
        }, undefined, (err) => {
            console.error("Error loading target texture:", err);
            // Fallback: Launch game anyway (texture will be null, targets might be white/colored squares)
            launchGame();
        });
    } else {
        // Default texture or handle missing texture if needed
        launchGame();
    }
}

function launchGame() {
    // Show game UI elements
    document.getElementById('hud').style.display = 'block';
    container.style.display = 'block'; // Fix: Unhide the game container
    overlay.style.display = 'flex';

    // Initialize game
    init();
    playGameMusic();
    animate();
}

// Restart button
const restartBtn = document.getElementById('restartBtn');
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        location.reload();
    });
}

// Pause menu
const resumeBtn = document.getElementById('resumeBtn');
if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
        togglePause();
    });
}

const quitBtn = document.getElementById('quitBtn');
if (quitBtn) {
    quitBtn.addEventListener('click', () => {
        location.reload();
    });
}

function init() {
    scene = new THREE.Scene();
    // Environment setup (Fog, Background, Grid, Stars)
    initEnvironment(scene);

    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 200);
    camera.position.set(0, 1.6, 6);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.setSize(innerWidth, innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.autoClear = false; // Important for rendering gun separately
    container.appendChild(renderer.domElement);

    // Create gun scene and camera
    gunScene = new THREE.Scene();
    gunCamera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.01, 10);
    gunCamera.position.set(0, 0, 0);

    createGunModel(gunScene);

    // Lighting
    scene.add(new THREE.AmbientLight(0x666666, 1.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(2, 5, 3);
    scene.add(dirLight);
    const spot = new THREE.SpotLight(0xfff5d6, 1.5, 50, Math.PI / 6, 0.2);
    spot.position.set(0, 8, 5);
    spot.target.position.set(0, 2, -6);
    scene.add(spot, spot.target);

    // Add lighting for gun (moved from createGunModel to here to avoid duplication)
    const gunLight = new THREE.PointLight(0xffffff, 1, 5);
    gunLight.position.set(0, 0.5, 1);
    gunScene.add(gunLight);

    const ambientGunLight = new THREE.AmbientLight(0x666666);
    gunScene.add(ambientGunLight);

    for (let i = 0; i < 4; i++) spawnTarget(scene, endGame);

    raycaster = new THREE.Raycaster();

    // Init Input
    initInput(renderer, overlay, camera, crosshair, {
        shoot: () => shoot(scene, camera, raycaster, endGame, () => reload(camera, crosshair)),
        reload: () => reload(camera, crosshair),
        switchGun: (type) => switchGun(type, gunScene, camera, crosshair),
        togglePause: togglePause,
        unZoom: () => unZoom(camera, crosshair),
        onZoom: () => {
            state.isZoomed = true;
            camera.fov = 25;
            camera.updateProjectionMatrix();
            crosshair.style.display = 'none';
        },
        startGameTimer: startGameTimer
    });

    window.addEventListener('resize', onWindowResize);

    updateHUD();
}

function togglePause() {
    state.isPaused = !state.isPaused;
    if (state.isPaused) {
        pauseMenu.style.display = 'flex';
        if (state.gameTimer) clearInterval(state.gameTimer);
        // Force unzoom on pause
        if (state.isZoomed) unZoom(camera, crosshair);
        document.exitPointerLock();
    } else {
        pauseMenu.style.display = 'none';
        startGameTimer();
        renderer.domElement.requestPointerLock();
    }
}

function startGameTimer() {
    if (state.gameTimer) clearInterval(state.gameTimer);
    state.gameTimer = setInterval(() => {
        if (!state.isPaused && !state.isGameOver) {
            state.gameTime--;
            updateHUD();
            if (state.gameTime <= 0) {
                endGame('time');
            }
        }
    }, 1000);
}

function endGame(reason = 'time') { // 'time' or 'misses'
    if (state.isGameOver) return; // Prevent multiple calls
    state.isGameOver = true;
    clearInterval(state.gameTimer);
    clearTimeout(state.powerUpTimer); // Stop any active powerups
    if (state.isZoomed) unZoom(camera, crosshair);
    document.exitPointerLock();
    stopGameMusic();

    // Set title based on reason
    const gameOverTitle = document.getElementById('gameOverTitle');
    if (reason === 'misses') {
        gameOverTitle.textContent = "ELIMINATED!";
    } else if (reason === 'win') {
        gameOverTitle.textContent = "VICTORY!";
        gameOverTitle.style.color = "#00ffff"; // Cyan for victory
    } else {
        gameOverTitle.textContent = "TIME'S UP!";
    }

    // Save to leaderboard
    const accuracyText = state.totalShots > 0 ? Math.round((state.totalHits / state.totalShots) * 100) + '%' : '0%';
    addScoreToLeaderboard(state.score, accuracyText, state.totalHits);

    // Send to local server
    const playerName = localStorage.getItem('msr_playerName') || 'Unknown';
    fetch(`${SERVER_URL}/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: playerName,
            score: state.score
        })
    }).catch(err => console.log("Server save failed:", err));

    // high score from leaderboard
    const lb = getLeaderboard();
    state.highScore = lb.length ? lb[0].score : 0;

    document.getElementById('finalScore').textContent = state.score;
    document.getElementById('finalAccuracy').textContent = accuracyText;
    document.getElementById('targetsHit').textContent = state.totalHits;
    // document.getElementById('bestCombo').textContent = `x${state.bestCombo}`; // Element might not exist in new HTML yet
    document.getElementById('highScore').textContent = state.highScore;

    renderLeaderboard(leaderboardGameOver, lb);
    gameOverScreen.style.display = 'flex';
}

function onWindowResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();

    // Also update gun camera
    gunCamera.aspect = innerWidth / innerHeight;
    gunCamera.updateProjectionMatrix();

    renderer.setSize(innerWidth, innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (state.isPaused || state.isGameOver) return;

    const t = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Update Environment (Stars/Grid)
    updateEnvironment(delta);

    // Update targets
    updateTargets(t, scene, endGame);

    // Check for win
    if (state.score >= state.winningScore) {
        endGame('win');
    }

    // Auto-fire handling
    if (state.isFiring && state.canShoot && !state.isReloading && !state.isPaused && !state.isGameOver) {
        shoot(scene, camera, raycaster, endGame);
    }

    // Animate gun
    const gunModel = getGunModel();
    if (gunModel && state.pointerLocked) {
        // Gun bob when moving (subtle idle sway)
        state.gunBobOffset += delta * 2;
        const bobX = Math.sin(state.gunBobOffset) * 0.002;
        const bobY = Math.cos(state.gunBobOffset * 2) * 0.002;

        // Apply recoil recovery
        state.gunRecoilOffset *= 0.85;

        // Don't bob while reloading
        if (!state.isReloading) {
            gunModel.position.x = 0.3 + bobX;
            gunModel.position.y = -0.25 + bobY;
        }
        gunModel.position.z = -0.5 - state.gunRecoilOffset;

        // Slight rotation for recoil
        gunModel.rotation.x = -state.gunRecoilOffset * 2;
    }

    if (renderer && scene && camera) {
        renderer.clear();
        renderer.render(scene, camera);

        // Render gun on top (but hide it if zoomed)
        if (gunModel && state.pointerLocked && !state.isZoomed) {
            renderer.clearDepth();
            renderer.render(gunScene, gunCamera);
        }
    }
}
