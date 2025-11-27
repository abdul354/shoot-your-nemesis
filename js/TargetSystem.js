import * as THREE from 'three';
import { state } from './GameState.js';

import { updateHUD } from './HUD.js';

export let targets = [];

export function resetTargets() {
    targets = [];
}

export function destroyTarget(target, scene, endGameCallback) {
    target.scale.setScalar(0.01); // Shrink

    // Remove from scene and array immediately
    scene.remove(target);
    const idx = targets.indexOf(target);
    if (idx >= 0) targets.splice(idx, 1);

    // Spawn a new one
    setTimeout(() => spawnTarget(scene, endGameCallback), 800); // Fixed spawn delay
}

export function createParticles(position, scene) {
    for (let i = 0; i < 10; i++) {
        const geom = new THREE.SphereGeometry(0.05, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const particle = new THREE.Mesh(geom, mat);
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            Math.random() * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        scene.add(particle);

        let opacity = 1;
        const fadeInterval = setInterval(() => {
            opacity -= 0.1;
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                scene.remove(particle);
            } else {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.005;
            }
        }, 50);
    }
}

export function spawnTarget(scene, endGameCallback) {
    if (state.isGameOver) return;

    const spriteMat = new THREE.SpriteMaterial({
        map: state.monsterTexture,
        transparent: true,
        color: 0xffffff // Start with white tint
    });
    const sprite = new THREE.Sprite(spriteMat);
    const size = 1.2; // Fixed target size

    // --- NEW TARGET TYPE LOGIC ---
    const rand = Math.random();
    if (rand < 0.05 && !state.isSlowMo && !state.isInfiniteAmmo && !state.isDoublePoints) { // 5% chance for Powerup (if one isn't active)
        sprite.userData.type = 'powerup';
        sprite.userData.health = 10;
        sprite.userData.color = 0xFFFF00; // Gold

        const powerupRand = Math.random();
        if (powerupRand < 0.33) sprite.userData.powerUpType = 'slowmo';
        else if (powerupRand < 0.66) sprite.userData.powerUpType = 'infammo';
        else sprite.userData.powerUpType = 'dblpoints';

    } else if (rand < 0.15) { // 10% chance for Penalty
        sprite.userData.type = 'penalty';
        sprite.userData.health = 10; // Still 1-shot
        sprite.userData.color = 0xFF0000; // Red
    } else if (rand < 0.40) { // 25% chance for Heavy
        sprite.userData.type = 'heavy';
        sprite.userData.health = 30; // 3 pistol shots
        sprite.userData.color = 0xADD8E6; // Light Blue
    } else { // 60% chance for Normal
        sprite.userData.type = 'normal';
        sprite.userData.health = 10; // 1 pistol shot
        sprite.userData.color = 0xffffff; // White
    }

    sprite.material.color.set(sprite.userData.color);
    sprite.scale.set(size, size, 1);

    // Spawn further back and move toward player
    const x = (Math.random() - 0.5) * 8;
    const y = 1 + Math.random() * 2.2;
    const z = -8 - Math.random() * 4; // Start closer to camera
    sprite.position.set(x, y, z);

    // Set speeds based on if slow-mo is active
    const baseSideSpeed = 0.008; // Fixed side speed
    const baseForwardSpeed = 0.012; // Fixed forward speed

    sprite.userData.originalSideSpeed = baseSideSpeed;
    sprite.userData.originalForwardSpeed = baseForwardSpeed;

    sprite.userData.moveSpeed = state.isSlowMo ? baseSideSpeed * 0.5 : baseSideSpeed;
    sprite.userData.forwardSpeed = state.isSlowMo ? baseForwardSpeed * 0.5 : baseForwardSpeed;

    sprite.userData.sideDirection = Math.random() > 0.5 ? 1 : -1;

    scene.add(sprite);
    targets.push(sprite);
}

export function updateTargets(t, scene, endGameCallback) {
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        target.position.y += Math.sin(t * 1.2 + i) * 0.0012;
        target.position.x += target.userData.sideDirection * target.userData.moveSpeed;

        // Move toward player (increase Z toward camera)
        target.position.z += target.userData.forwardSpeed;

        // --- ESCAPED TARGET PENALTY ---
        if (target.position.z > 4) {
            scene.remove(target);
            targets.splice(i, 1);
            i--;

            // Don't penalize for escaped penalty targets
            if (target.userData.type !== 'penalty') {
                state.score = Math.max(0, state.score - 5); // Penalty for letting target reach you
                state.totalMisses++; // Add a miss
                if (state.totalMisses >= state.maxMisses) {
                    endGameCallback('misses');
                }
            }

            updateHUD();
            spawnTarget(scene, endGameCallback); // Spawn a new one
            continue;
        }

        if (Math.abs(target.position.x) > 5) {
            target.userData.sideDirection *= -1;
        }
    }
}
