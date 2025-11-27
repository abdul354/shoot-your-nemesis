import * as THREE from 'three';

// Configuration
const LANE_WIDTH = 5;
const LANE_COUNT = 3;
const SPEED = 10; // Speed for the background movement effect

let starMesh;
let gridMesh;
let gridOffset = 0;

export function initEnvironment(scene) {
    // 1. Background & Fog
    scene.background = new THREE.Color('#050011');
    scene.fog = new THREE.Fog('#050011', 40, 160);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight('#400080', 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#00ffff', 1.5);
    dirLight.position.set(0, 20, -10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight('#ff00aa', 2, 200, 2);
    pointLight.position.set(0, 25, -150);
    scene.add(pointLight);

    // 3. StarField
    createStarField(scene);

    // 4. Moving Grid
    createMovingGrid(scene);

    // 5. Lane Guides (Floor)
    createLaneGuides(scene);
}

export function updateEnvironment(delta) {
    // Animate Stars
    if (starMesh) {
        const positions = starMesh.geometry.attributes.position.array;
        const count = positions.length / 3;
        const activeSpeed = SPEED > 0 ? SPEED : 2;

        for (let i = 0; i < count; i++) {
            let z = positions[i * 3 + 2];
            z += activeSpeed * delta * 2.0; // Parallax effect

            // Reset when it passes the camera
            if (z > 100) {
                z = -550 - Math.random() * 50;

                // Re-randomize X/Y on respawn
                let x = (Math.random() - 0.5) * 400;
                let y = (Math.random() - 0.5) * 200 + 50;

                // Exclude central area
                if (Math.abs(x) < 15 && y > -5 && y < 20) {
                    if (x < 0) x -= 15;
                    else x += 15;
                }

                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
            }
            positions[i * 3 + 2] = z;
        }
        starMesh.geometry.attributes.position.needsUpdate = true;
    }

    // Animate Grid
    if (gridMesh) {
        const activeSpeed = SPEED > 0 ? SPEED : 5;
        gridOffset += activeSpeed * delta;

        const cellSize = 10;
        const zPos = -100 + (gridOffset % cellSize);
        gridMesh.position.z = zPos;
    }
}

function createStarField(scene) {
    const count = 3000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        let x = (Math.random() - 0.5) * 400;
        let y = (Math.random() - 0.5) * 200 + 50;
        let z = -550 + Math.random() * 650;

        if (Math.abs(x) < 15 && y > -5 && y < 20) {
            if (x < 0) x -= 15;
            else x += 15;
        }

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.5,
        color: '#ffffff',
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    starMesh = new THREE.Points(geometry, material);
    scene.add(starMesh);
}

function createMovingGrid(scene) {
    const geometry = new THREE.PlaneGeometry(300, 400, 30, 40);
    const material = new THREE.MeshBasicMaterial({
        color: '#8800ff',
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    gridMesh = new THREE.Mesh(geometry, material);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.set(0, -0.2, -100);
    scene.add(gridMesh);
}

function createLaneGuides(scene) {
    const group = new THREE.Group();
    group.position.set(0, 0.02, 0);

    // Solid Floor
    const floorGeo = new THREE.PlaneGeometry(LANE_COUNT * LANE_WIDTH * 4, 200); // Made wider for shooting range
    const floorMat = new THREE.MeshBasicMaterial({
        color: '#1a0b2e',
        transparent: true,
        opacity: 0.9
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.02, -20);
    group.add(floor);

    // Lane Separators
    // Calculate positions: centered around 0
    // For 3 lanes: -1.5*W, -0.5*W, 0.5*W, 1.5*W (approx)
    // The snippet used a loop from 0 to laneCount, starting at -(totalWidth)/2

    const totalWidth = LANE_COUNT * LANE_WIDTH;
    const startX = -totalWidth / 2;

    for (let i = 0; i <= LANE_COUNT; i++) {
        const x = startX + (i * LANE_WIDTH);

        const lineGeo = new THREE.PlaneGeometry(0.05, 200);
        const lineMat = new THREE.MeshBasicMaterial({
            color: '#00ffff',
            transparent: true,
            opacity: 0.4
        });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(x, 0, -20);
        group.add(line);
    }

    scene.add(group);
}
