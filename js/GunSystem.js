import * as THREE from 'three';
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

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createGunModel(gunScene) {
    // Remove old gun model
    if (gunModel) {
        gunScene.remove(gunModel);
    }

    gunModel = new THREE.Group();
    gunScene.add(gunModel);

    // DEBUG: Add a small yellow marker to prove this code is running
    // const debugMarker = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    // debugMarker.position.set(0, 0, 0);
    // gunModel.add(debugMarker);

    const loader = new GLTFLoader();
    console.log("Attempting to load ak-47.glb...");
    loader.load('ak-47.glb', (gltf) => {
        console.log("GLB Loaded, processing...");
        const model = gltf.scene;

        // Scale and position adjustments for the GLB model
        model.scale.set(0.4, 0.4, 0.4);
        // Position: x=right, y=down, z=forward
        model.position.set(0.19, -0.25, 1.2);
        model.rotation.y = Math.PI / 2; // Face forward (adjusted)

        // Enable shadows and fix materials
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material.metalness = 0.5;
                    child.material.roughness = 0.5;
                    child.material.needsUpdate = true;
                }
            }
        });

        gunModel.add(model);

        // --- ADD PROCEDURAL HANDS ---
        const armMat = new THREE.MeshStandardMaterial({ color: 0xdcb898 }); // Skin tone

        // Right Arm (Trigger hand)
        // Connecting from bottom-right to gun handle
        const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.2), armMat);
        rightArm.position.set(0.1, -0.6, -0.3);
        rightArm.rotation.x = -Math.PI / 3;
        rightArm.rotation.z = -Math.PI / 8;
        gunModel.add(rightArm);

        // Left Arm (Support hand)
        // Connecting from bottom-left to gun handguard
        const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.2), armMat);
        leftArm.position.set(0.7, -0.6, -0.1);
        leftArm.rotation.x = -Math.PI / 3;
        leftArm.rotation.z = Math.PI / 6;
        gunModel.add(leftArm);

        console.log("AK-47 Model Loaded Successfully");
    }, (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, (error) => {
        console.error('An error happened loading the gun model:', error);
        // Fallback
        const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.8), new THREE.MeshStandardMaterial({ color: 0xff00ff }));
        fallback.position.set(0.2, -0.2, -0.5);
        gunModel.add(fallback);
    });
}

export function reload(camera, crosshair) {
    if (state.ammo === guns[state.currentGun].maxAmmo || state.isPaused || state.isGameOver || state.isReloading) return;

    state.isReloading = true;
    if (state.isZoomed) unZoom(camera, crosshair);
    playReloadSound();
    updateHUD();

    setTimeout(() => {
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

export function shoot(scene, camera, raycaster, endGameCallback, reloadCallback) {
    if (state.ammo <= 0) {
        if (reloadCallback) reloadCallback();
        else playMissSound();
        return;
    }

    if (!state.canShoot || state.isReloading) return;

    const gun = guns[state.currentGun];

    // Fire rate control
    state.canShoot = false;
    setTimeout(() => state.canShoot = true, gun.fireRate);

    if (!state.isInfiniteAmmo) {
        state.ammo--;
    }
    state.totalShots++;

    // Auto-reload if empty
    if (state.ammo <= 0 && !state.isInfiniteAmmo && reloadCallback) {
        setTimeout(() => reloadCallback(), 200); // Short delay for feel
    }

    // Recoil removed
    // state.recoilPitch -= gun.recoil * (0.8 + Math.random() * 0.4);
    // state.recoilYaw += (Math.random() - 0.5) * gun.recoil * 0.5;

    // Gun visual recoil removed
    state.gunRecoilOffset = 0;

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
            hitAnyTarget = true;
            const hitTarget = hits[0].object;

            // 1. Check for Penalty Target - Just remove it, no score loss
            if (hitTarget.userData.type === 'penalty') {
                createParticles(hitTarget.position, scene);
                destroyTarget(hitTarget, scene, endGameCallback);
                continue;
            }

            // 2. Check for Powerup Target
            if (hitTarget.userData.type === 'powerup') {
                state.totalHits++;
                activatePowerUp(hitTarget.userData.powerUpType, targets);
                createParticles(hitTarget.position, scene);
                scoreGained += 50; // Simple 50 points
                destroyTarget(hitTarget, scene, endGameCallback);
                continue;
            }

            // 3. Process Normal and Heavy Targets
            if (hitTarget.userData.type === 'normal' || hitTarget.userData.type === 'heavy') {
                if (!hitTarget.userData.health) hitTarget.userData.health = 10;

                hitTarget.userData.health -= gun.damage;
                state.totalHits++;
                playHitSound();

                // Flash target white on hit
                const originalColor = hitTarget.userData.color;
                hitTarget.material.color.set(0xffffff);
                setTimeout(() => {
                    if (hitTarget.material) {
                        hitTarget.material.color.set(originalColor);
                    }
                }, 100);

                if (hitTarget.userData.health <= 0) {
                    createParticles(hitTarget.position, scene);

                    // Simple scoring: 100 points per kill
                    scoreGained += 100;

                    destroyTarget(hitTarget, scene, endGameCallback);

                } else {
                    // Hit marker
                    const marker = document.createElement('div');
                    marker.className = 'hit-marker';
                    marker.textContent = `+${gun.damage}`;
                    document.body.appendChild(marker);
                    setTimeout(() => marker.remove(), 300);
                }
            }
        }
    }

    // Apply score gains
    state.score += scoreGained;
    if (scoreGained > 0) {
        const marker = document.createElement('div');
        marker.className = 'hit-marker';
        marker.textContent = '+' + scoreGained;
        document.body.appendChild(marker);
        setTimeout(() => marker.remove(), 300);
    }

    if (!hitAnyTarget) {
        playMissSound();
        // No game over on misses anymore
    }

    updateHUD();
}

function resetCombo() {
    // Combo system removed/simplified
}
