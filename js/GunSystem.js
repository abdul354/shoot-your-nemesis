import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { state } from './GameState.js';
import { guns } from './Config.js';
import { updateHUD } from './HUD.js';
import { playShootSound, playHitSound, playMissSound, playReloadSound } from './AudioSystem.js';
import { targets, destroyTarget, createParticles } from './TargetSystem.js';
import { activatePowerUp } from './PowerupSystem.js';

let gunModel = null;

export function getGunModel() {
    return gunModel;
}

export function switchGun(gunType, gunScene, camera, crosshair) {
    // If zoomed, unzoom
    if (state.isZoomed) unZoom(camera, crosshair);

    // Cancel any reloads
    state.isReloading = false;

    document.querySelectorAll('.gun-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-gun="${gunType}"]`).classList.add('active');
    state.currentGun = gunType;
    state.ammo = guns[state.currentGun].maxAmmo;

    createGunModel(gunScene); // Recreate gun model with new type
    updateHUD();
}

export function createGunModel(gunScene) {
    // Remove old gun model
    if (gunModel) {
        gunScene.remove(gunModel);
    }

    const gun = guns[state.currentGun];
    const model = gun.model;
    gunModel = new THREE.Group();

    // Gun body (handle + receiver)
    const bodyGeom = new THREE.BoxGeometry(model.bodyWidth, model.bodyHeight, 0.25);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: model.bodyColor,
        metalness: 0.7,
        roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.z = 0.1;
    gunModel.add(body);

    // Barrel
    const barrelGeom = new THREE.CylinderGeometry(0.02, 0.02, model.barrelLength, 8);
    const barrelMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.2
    });
    const barrel = new THREE.Mesh(barrelGeom, barrelMat);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(model.barrelLength / 2, model.bodyHeight * 0.3, 0.1);
    gunModel.add(barrel);

    // Grip (handle)
    const gripGeom = new THREE.BoxGeometry(model.bodyWidth * 0.6, model.bodyHeight * 1.2, 0.15);
    const gripMat = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        metalness: 0.3,
        roughness: 0.8
    });
    const grip = new THREE.Mesh(gripGeom, gripMat);
    grip.position.set(-0.05, -model.bodyHeight * 0.8, 0.08);
    grip.rotation.z = -0.3;
    gunModel.add(grip);

    // Scope for sniper
    if (state.currentGun === 'sniper') {
        const scopeGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
        const scopeMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.8,
            roughness: 0.2
        });
        const scope = new THREE.Mesh(scopeGeom, scopeMat);
        scope.rotation.z = Math.PI / 2;
        scope.position.set(0.2, model.bodyHeight * 1.5, 0.1);
        gunModel.add(scope);
    }

    // Magazine for rifle/pistol
    if (state.currentGun === 'rifle' || state.currentGun === 'pistol') {
        const magGeom = new THREE.BoxGeometry(0.08, 0.15, 0.12);
        const magMat = new THREE.MeshStandardMaterial({
            color: 0x2c2c2c,
            metalness: 0.5,
            roughness: 0.5
        });
        const mag = new THREE.Mesh(magGeom, magMat);
        mag.position.set(-0.02, -0.12, 0.08);
        gunModel.add(mag);
    }

    // Position gun in view
    gunModel.position.set(0.3, -0.25, -0.5);
    gunModel.rotation.y = -0.1;

    // Add lighting for gun
    // Note: In original code, lights were added to gunScene every time. 
    // We should probably check if lights exist or just add them once in Main.
    // For now, let's assume lights are handled in Main or we add them here if needed.
    // The original code added them inside createGunModel, which might duplicate them if called multiple times?
    // Actually original code: 
    // const gunLight = new THREE.PointLight... gunScene.add(gunLight);
    // This would indeed duplicate lights on switchGun. Let's fix that by not adding lights here.

    gunScene.add(gunModel);
}

export function reload(camera, crosshair) {
    if (state.ammo === guns[state.currentGun].maxAmmo || state.isPaused || state.isGameOver || state.isReloading) return;

    state.isReloading = true;
    if (state.isZoomed) unZoom(camera, crosshair); // Cancel zoom on reload
    playReloadSound();
    updateHUD(); // Show "Reloading..."

    setTimeout(() => {
        // Check if we are still reloading (e.g., didn't switch guns)
        if (state.isReloading) {
            state.ammo = guns[state.currentGun].maxAmmo;
            state.isReloading = false;
            updateHUD();
        }
    }, guns[state.currentGun].reloadTime);
}

export function unZoom(camera, crosshair) {
    state.isZoomed = false;
    camera.fov = 70;
    camera.updateProjectionMatrix();
    crosshair.style.display = 'block';
}

export function shoot(scene, camera, raycaster, endGameCallback) {
    // Added check for reloading
    if (state.ammo <= 0 || !state.canShoot || state.isReloading) {
        playMissSound();
        return;
    }

    const gun = guns[state.currentGun];

    // Fire rate control
    state.canShoot = false;
    setTimeout(() => state.canShoot = true, gun.fireRate);

    // Consume ammo only if not infinite
    if (!state.isInfiniteAmmo) {
        state.ammo--;
    }
    state.totalShots++;

    // Apply recoil
    state.recoilPitch -= gun.recoil * (0.8 + Math.random() * 0.4);
    state.recoilYaw += (Math.random() - 0.5) * gun.recoil * 0.5;

    // Gun visual recoil
    state.gunRecoilOffset = 0.15 * gun.recoil * 10;

    // Muzzle flash
    const flashPower = gun.damage / 10;
    const flash = new THREE.PointLight(0xffb76b, 3.0 + flashPower, 10, 2);
    flash.position.copy(camera.position);
    scene.add(flash);
    setTimeout(() => scene.remove(flash), 80);

    playShootSound();

    const pellets = gun.pellets || 1;
    let hitAnyTarget = false;
    let scoreGained = 0;

    for (let p = 0; p < pellets; p++) {
        const spreadX = gun.spread ? (Math.random() - 0.5) * gun.spread : 0;
        const spreadY = gun.spread ? (Math.random() - 0.5) * gun.spread : 0;

        raycaster.setFromCamera(new THREE.Vector2(spreadX, spreadY), camera);
        const hits = raycaster.intersectObjects(targets, true);

        if (hits.length > 0) {
            hitAnyTarget = true; // Mark that we hit *something*
            const hitTarget = hits[0].object;

            // --- NEW TARGET LOGIC ---

            // 1. Check for Penalty Target
            if (hitTarget.userData.type === 'penalty') {
                state.score = Math.max(0, state.score - 50); // Lose points
                state.totalMisses++; // Add a miss
                if (state.totalMisses >= state.maxMisses) endGameCallback('misses');

                createParticles(hitTarget.position, scene);
                destroyTarget(hitTarget, scene, endGameCallback); // Remove it
                // We don't increment totalHits or reset combo for a penalty
                continue; // Stop processing this pellet
            }

            // 2. Check for Powerup Target
            if (hitTarget.userData.type === 'powerup') {
                state.totalHits++;
                activatePowerUp(hitTarget.userData.powerUpType, targets);
                createParticles(hitTarget.position, scene);
                scoreGained += 50 * state.combo; // Bonus points for powerup
                destroyTarget(hitTarget, scene, endGameCallback);
                continue; // Stop processing this pellet
            }

            // 3. Process Normal and Heavy Targets
            if (hitTarget.userData.type === 'normal' || hitTarget.userData.type === 'heavy') {
                if (!hitTarget.userData.health) hitTarget.userData.health = 10; // Failsafe

                hitTarget.userData.health -= gun.damage;
                state.totalHits++; // Count hit
                playHitSound();

                // Flash target white on hit
                const originalColor = hitTarget.userData.color;
                hitTarget.material.color.set(0xffffff);
                setTimeout(() => {
                    // Check if target still exists before resetting color
                    if (hitTarget.material) {
                        hitTarget.material.color.set(originalColor);
                    }
                }, 100);

                if (hitTarget.userData.health <= 0) {
                    // Target is destroyed
                    createParticles(hitTarget.position, scene);

                    // Add score (check for double points)
                    const basePoints = hitTarget.userData.type === 'heavy' ? 30 : 10;
                    scoreGained += basePoints * state.combo;

                    destroyTarget(hitTarget, scene, endGameCallback);

                    // Combo system
                    state.combo++;
                    if (state.combo > state.bestCombo) state.bestCombo = state.combo;
                    clearTimeout(state.comboTimer);
                    state.comboTimer = setTimeout(resetCombo, 2000);

                    // Show combo
                    if (state.combo > 2) {
                        const comboDisplay = document.createElement('div');
                        comboDisplay.className = 'combo-display';
                        comboDisplay.textContent = `${state.combo}x COMBO!`;
                        document.body.appendChild(comboDisplay);
                        setTimeout(() => comboDisplay.remove(), 500);
                    }

                } else {
                    // Target is damaged, but not destroyed
                    // Show a simple hit marker
                    const marker = document.createElement('div');
                    marker.className = 'hit-marker';
                    marker.textContent = `+${gun.damage}`;
                    document.body.appendChild(marker);
                    setTimeout(() => marker.remove(), 300);
                }
            }
        }
    } // End of pellet loop

    // --- AFTER PELLET LOOP ---

    // Apply score gains (with double points check)
    state.score += (state.isDoublePoints ? 2 : 1) * scoreGained;
    if (scoreGained > 0) {
        const marker = document.createElement('div');
        marker.className = 'hit-marker';
        marker.textContent = '+' + (state.isDoublePoints ? 2 : 1) * scoreGained;
        document.body.appendChild(marker);
        setTimeout(() => marker.remove(), 300);
    }

    if (!hitAnyTarget) {
        // This shot missed everything
        playMissSound();
        clearTimeout(state.comboTimer);
        state.comboTimer = setTimeout(resetCombo, 2000);

        // Increment misses and check for game over
        if (!state.isGameOver) {
            state.totalMisses++;
            if (state.totalMisses >= state.maxMisses) {
                endGameCallback('misses');
            }
        }
    }

    updateHUD();
}

function resetCombo() {
    state.combo = 1;
    updateHUD();
}
