export const guns = {
    pistol: {
        name: 'Pistol',
        maxAmmo: 12,
        damage: 10,
        recoil: 0.02,
        recoilRecovery: 0.8,
        fireRate: 300,
        reloadTime: 1200,
        sound: { freq: 200, duration: 0.1 },
        model: {
            bodyColor: 0xCCCCCC, // Silver
            barrelLength: 0.4,
            bodyWidth: 0.15,
            bodyHeight: 0.15
        }
    },
    rifle: {
        name: 'Rifle',
        maxAmmo: 30,
        damage: 8,
        recoil: 0.015,
        recoilRecovery: 0.85,
        fireRate: 150,
        reloadTime: 2000,
        sound: { freq: 250, duration: 0.08 },
        model: {
            bodyColor: 0x78866b, // Camo Green (Lighter)
            barrelLength: 0.7,
            bodyWidth: 0.12,
            bodyHeight: 0.12
        }
    },
    shotgun: {
        name: 'Shotgun',
        maxAmmo: 8,
        damage: 25, // Damage per pellet
        recoil: 0.06,
        recoilRecovery: 0.7,
        fireRate: 800,
        reloadTime: 2500,
        pellets: 5,
        spread: 0.05,
        sound: { freq: 150, duration: 0.15 },
        model: {
            bodyColor: 0xcd853f, // Peru (Lighter Wood)
            barrelLength: 0.6,
            bodyWidth: 0.18,
            bodyHeight: 0.18
        }
    },
    sniper: {
        name: 'Sniper',
        maxAmmo: 5,
        damage: 50, // High damage
        recoil: 0.1,
        recoilRecovery: 0.6,
        fireRate: 1200,
        reloadTime: 3000,
        sound: { freq: 180, duration: 0.2 },
        model: {
            bodyColor: 0x708090, // Slate Grey
            barrelLength: 0.9,
            bodyWidth: 0.14,
            bodyHeight: 0.14
        }
    }
};

export const difficultySettings = {
    easy: { targetSize: 1.5, spawnDelay: 900, moveSpeed: 0.001, forwardSpeed: 0.01, gameTime: 90, pointValue: 5, maxMisses: 10, winningScore: 1000 },
    normal: { targetSize: 1.2, spawnDelay: 700, moveSpeed: 0.0015, forwardSpeed: 0.015, gameTime: 60, pointValue: 10, maxMisses: 7, winningScore: 2000 },
    hard: { targetSize: 0.9, spawnDelay: 500, moveSpeed: 0.002, forwardSpeed: 0.025, gameTime: 45, pointValue: 15, maxMisses: 3, winningScore: 10000 }
};
