import { state } from './GameState.js';
import { guns } from './Config.js';

let audioContext;

export function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

export function playShootSound() {
    if (!audioContext) initAudio();
    const gun = guns[state.currentGun];
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = gun.sound.freq;
    osc.type = state.currentGun === 'shotgun' ? 'sawtooth' : 'square';
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + gun.sound.duration);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + gun.sound.duration);
}

export function playHitSound() {
    if (!audioContext) initAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 600;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.15);
}

export function playMissSound() {
    if (!audioContext) initAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 100;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.2);
}

export function playReloadSound() {
    if (!audioContext) initAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(300, audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(150, audioContext.currentTime + 0.3);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.3);
}
let menuMusic = new Audio('backgroundmusic.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.5;

let gameMusic = new Audio('ingame_backgroundmusic.mp3');
gameMusic.loop = true;
gameMusic.volume = 0.4;

export function playMenuMusic() {
    gameMusic.pause();
    gameMusic.currentTime = 0;
    menuMusic.play().catch(e => console.log("Autoplay blocked:", e));
}

export function stopMenuMusic() {
    menuMusic.pause();
    menuMusic.currentTime = 0;
}

export function playGameMusic() {
    menuMusic.pause();
    menuMusic.currentTime = 0;
    gameMusic.play().catch(e => console.log("Autoplay blocked:", e));
}

export function stopGameMusic() {
    gameMusic.pause();
    gameMusic.currentTime = 0;
}
