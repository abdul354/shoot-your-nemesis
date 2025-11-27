import { state } from './GameState.js';
import { guns } from './Config.js';

export function initInput(renderer, overlay, camera, crosshair, callbacks) {
    const { shoot, reload, switchGun, togglePause, unZoom, onZoom } = callbacks;

    function onPointerLockChange() {
        state.pointerLocked = (document.pointerLockElement === renderer.domElement);
        if (state.pointerLocked && !state.isPaused && !state.isGameOver) {
            overlay.style.display = 'none';
            crosshair.style.display = 'block';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mousedown', onMouseDown);
        } else {
            state.isFiring = false; // Stop firing if lock lost
            if (!state.isPaused && !state.isGameOver) overlay.style.display = 'flex';
            crosshair.style.display = 'none';
            // Force unzoom if pointer lock is lost
            if (state.isZoomed) unZoom();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
        }
    }

    function onMouseMove(e) {
        if (state.isPaused || state.isGameOver) return;

        // Apply sensitivity modifier if zoomed
        const sensitivity = 0.0024;
        const currentSensitivity = state.isZoomed ? sensitivity * 0.4 : sensitivity;

        const mx = e.movementX || 0;
        const my = e.movementY || 0;
        state.yaw -= mx * currentSensitivity;
        state.pitch -= my * currentSensitivity;

        // Recoil recovery removed
        state.recoilPitch = 0;
        state.recoilYaw = 0;

        const max = Math.PI * 0.45;
        state.pitch = Math.max(-max, Math.min(max, state.pitch));
        camera.rotation.set(state.pitch, state.yaw, 0);
    }

    function onMouseDown(e) {
        if (state.isPaused || state.isGameOver) return;

        // Left Click: Shoot (Start firing)
        if (e.button === 0) {
            state.isFiring = true;
            shoot(); // Fire immediately once
        }
        // Right Click: Zoom
        if (e.button === 2 && state.currentGun === 'sniper' && !state.isReloading && !state.isZoomed) {
            onZoom();
        }
    }

    function onMouseUp(e) {
        // Left Click Up: Stop firing
        if (e.button === 0) {
            state.isFiring = false;
        }
        // Right Click Up: Un-zoom
        if (e.button === 2 && state.isZoomed) {
            unZoom();
        }
    }

    function onKeyDown(e) {
        if (e.key === 'Escape' && !state.isGameOver) {
            togglePause();
        }
        if ((e.key === 'r' || e.key === 'R') && !state.isReloading) {
            reload();
        }
        // Quick weapon switch with number keys
        if (e.key === '1') switchGun('pistol');
        if (e.key === '2') switchGun('rifle');
        if (e.key === '3') switchGun('shotgun');
        if (e.key === '4') switchGun('sniper');
    }

    overlay.addEventListener('click', () => {
        renderer.domElement.requestPointerLock();
        callbacks.startGameTimer();
    }, { once: true });

    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', () => {
        overlay.style.display = 'flex';
    });

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
}
