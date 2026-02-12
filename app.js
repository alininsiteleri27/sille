// ==================== Game State ====================
const gameState = {
    slapCount: 0,
    maxPower: 0,
    currentPower: 0,
    isAnimating: false,
    touchStart: { x: 0, y: 0, time: 0 },
    touchEnd: { x: 0, y: 0, time: 0 },
    exhaustion: 0, // 0-100, increases with each slap
    selectedHand: 'female-light'
};

// ==================== DOM Elements ====================
const faceContainer = document.getElementById('faceContainer');
const faceImage = document.getElementById('faceImage');
const redness = document.getElementById('redness');
const particleContainer = document.getElementById('particleContainer');
const leftEye = document.getElementById('leftEye');
const rightEye = document.getElementById('rightEye');
const powerFill = document.getElementById('powerFill');
const hitIndicator = document.getElementById('hitIndicator');
const slapCountEl = document.getElementById('slapCount');
const maxPowerEl = document.getElementById('maxPower');
const currentPowerEl = document.getElementById('currentPower');
const uploadSection = document.getElementById('uploadSection');
const uploadBtn = document.getElementById('uploadBtn');
const useDefaultBtn = document.getElementById('useDefaultBtn');
const imageUpload = document.getElementById('imageUpload');
const handTypeSelect = document.getElementById('handType');
const handSlap = document.getElementById('handSlap');
const sweatContainer = document.getElementById('sweatContainer');
const tongue = document.getElementById('tongue');
const fpsArm = document.getElementById('fpsArm');
const eyeCalibrationBtn = document.getElementById('eyeCalibrationBtn');
const eyeCalibrationPanel = document.getElementById('eyeCalibrationPanel');
const saveEyePos = document.getElementById('saveEyePos');
const cancelEyePos = document.getElementById('cancelEyePos');
const leftEyePosEl = document.getElementById('leftEyePos');
const rightEyePosEl = document.getElementById('rightEyePos');
const container = document.querySelector('.container');

// ==================== Image Upload System ====================
function createDefaultFace() {
    // Create a canvas with a simple face
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Background gradient (skin tone)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f4c2a0');
    gradient.addColorStop(1, '#d9a88a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some texture
    for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 50}, ${Math.random() * 30}, ${Math.random() * 20}, 0.1)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    // Face outline (oval)
    ctx.fillStyle = '#e0b090';
    ctx.beginPath();
    ctx.ellipse(250, 250, 180, 220, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shadows for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(250, 280, 150, 180, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    // Left eye white
    ctx.beginPath();
    ctx.ellipse(180, 200, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right eye white
    ctx.beginPath();
    ctx.ellipse(320, 200, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#3b2614';
    // Left pupil
    ctx.beginPath();
    ctx.arc(180, 200, 12, 0, Math.PI * 2);
    ctx.fill();
    // Right pupil
    ctx.beginPath();
    ctx.arc(320, 200, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(185, 195, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(325, 195, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#3b2614';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    // Left eyebrow
    ctx.beginPath();
    ctx.moveTo(140, 160);
    ctx.quadraticCurveTo(180, 150, 220, 160);
    ctx.stroke();
    // Right eyebrow
    ctx.beginPath();
    ctx.moveTo(280, 160);
    ctx.quadraticCurveTo(320, 150, 360, 160);
    ctx.stroke();

    // Nose
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.moveTo(250, 220);
    ctx.lineTo(230, 280);
    ctx.lineTo(250, 290);
    ctx.lineTo(270, 280);
    ctx.closePath();
    ctx.fill();

    // Nose highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(245, 250, 8, 15, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#a0522d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(200, 340);
    ctx.quadraticCurveTo(250, 360, 300, 340);
    ctx.stroke();

    // Cheeks (blush)
    ctx.fillStyle = 'rgba(255, 150, 150, 0.3)';
    ctx.beginPath();
    ctx.ellipse(140, 260, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(360, 260, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL('image/png');
}

function loadImage(src) {
    faceImage.src = src;
    faceImage.style.display = 'block';
    uploadSection.classList.add('hidden');
    faceContainer.style.cursor = 'pointer';
}

// Upload button click
uploadBtn.addEventListener('click', () => {
    imageUpload.click();
});

// File upload handler
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            loadImage(event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Use default face
useDefaultBtn.addEventListener('click', () => {
    const defaultFace = createDefaultFace();
    loadImage(defaultFace);
});

// ==================== Hand Selection System ====================
const handEmojis = {
    'female-light': '✋🏻',
    'female-medium': '✋🏽',
    'male-light': '✋🏻',
    'male-medium': '✋🏽',
    'male-hairy': '✋🏿'
};

handTypeSelect.addEventListener('change', (e) => {
    gameState.selectedHand = e.target.value;
    handSlap.querySelector('.hand-emoji').textContent = handEmojis[gameState.selectedHand];
});

// ==================== Sweat System ====================
function createSweatDrops(power) {
    const dropCount = Math.floor(power / 20) + 2;

    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'sweat-drop';

        // Random position on forehead area
        drop.style.left = (30 + Math.random() * 40) + '%';
        drop.style.top = (15 + Math.random() * 15) + '%';
        drop.style.animationDelay = (Math.random() * 0.3) + 's';

        sweatContainer.appendChild(drop);

        setTimeout(() => drop.remove(), 1500);
    }
}

// ==================== Tongue System ====================
function showTongue() {
    tongue.classList.remove('hide');
    tongue.classList.add('show');

    setTimeout(() => {
        tongue.classList.remove('show');
        tongue.classList.add('hide');
    }, 2000);
}

// ==================== Exhaustion System ====================
function updateExhaustion(power) {
    // Increase exhaustion based on power
    gameState.exhaustion = Math.min(gameState.exhaustion + (power / 10), 100);

    // Visual feedback
    if (gameState.exhaustion > 70) {
        faceContainer.classList.add('exhausted');
        createSweatDrops(gameState.exhaustion);

        if (gameState.exhaustion > 90) {
            showTongue();
            createDizzyStars();
        }
    }

    // Gradual recovery
    setTimeout(() => {
        gameState.exhaustion = Math.max(gameState.exhaustion - 5, 0);
        if (gameState.exhaustion < 70) {
            faceContainer.classList.remove('exhausted');
        }
    }, 2000);
}

function createDizzyStars() {
    const dizzy = document.createElement('div');
    dizzy.className = 'dizzy-stars show';
    dizzy.textContent = '⭐✨💫';
    faceContainer.appendChild(dizzy);

    setTimeout(() => dizzy.remove(), 3000);
}

// ==================== Hand Slap Animation ====================
function animateHand(startX, startY, endX, endY, power) {
    // Set hand emoji
    const handEmoji = handSlap.querySelector('.hand-emoji');
    handEmoji.textContent = handEmojis[gameState.selectedHand];

    // Calculate angle and distance
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Set CSS variables for animation
    handSlap.style.setProperty('--startX', (startX - 40) + 'px');
    handSlap.style.setProperty('--startY', (startY - 40) + 'px');
    handSlap.style.setProperty('--endX', (endX - 40) + 'px');
    handSlap.style.setProperty('--endY', (endY - 40) + 'px');
    handSlap.style.setProperty('--rotation', (angle + 90) + 'deg');

    // Trigger animation
    handSlap.classList.remove('active');
    void handSlap.offsetWidth; // Force reflow
    handSlap.classList.add('active');

    // Remove animation class
    setTimeout(() => {
        handSlap.classList.remove('active');
    }, 500);
}

// ==================== FPS ARM SYSTEM ====================
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let armIdleInterval;

// Mouse tracking
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateFPSArm();
});

// Touch tracking for mobile
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        updateFPSArm();
    }
}, { passive: true });

function updateFPSArm() {
    if (!fpsArm.classList.contains('punching')) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const offsetX = (mouseX - centerX) / 15;
        const offsetY = (mouseY - centerY) / 15;
        const rotation = (mouseX - centerX) / 80;

        fpsArm.style.transform = `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotation}deg)`;
    }
}

// Idle animation
function startArmIdle() {
    fpsArm.classList.add('idle');
}

function stopArmIdle() {
    fpsArm.classList.remove('idle');
}

// Punch animation
function triggerArmPunch() {
    stopArmIdle();
    fpsArm.classList.remove('punching');
    void fpsArm.offsetWidth; // Force reflow
    fpsArm.classList.add('punching');

    setTimeout(() => {
        fpsArm.classList.remove('punching');
        startArmIdle();
    }, 400);
}

// Start idle on load
setTimeout(() => {
    startArmIdle();
}, 1000);

// ==================== EYE CALIBRATION SYSTEM ====================
let calibrationMode = false;
let eyePositions = { left: null, right: null };
let clickCount = 0;

eyeCalibrationBtn.addEventListener('click', () => {
    eyeCalibrationPanel.classList.remove('hidden');
    calibrationMode = true;
    clickCount = 0;
    eyePositions = { left: null, right: null };
    leftEyePosEl.textContent = '-';
    rightEyePosEl.textContent = '-';
});

cancelEyePos.addEventListener('click', () => {
    eyeCalibrationPanel.classList.add('hidden');
    calibrationMode = false;
    clickCount = 0;
    // Remove markers
    document.querySelectorAll('.eye-click-marker').forEach(m => m.remove());
});

saveEyePos.addEventListener('click', () => {
    if (eyePositions.left && eyePositions.right) {
        // Update eye positions
        leftEye.style.left = eyePositions.left.x + '%';
        leftEye.style.top = eyePositions.left.y + '%';
        rightEye.style.left = eyePositions.right.x + '%';
        rightEye.style.top = eyePositions.right.y + '%';

        eyeCalibrationPanel.classList.add('hidden');
        calibrationMode = false;
        clickCount = 0;
        document.querySelectorAll('.eye-click-marker').forEach(m => m.remove());
    }
});

// Click handler for eye calibration
faceContainer.addEventListener('click', (e) => {
    if (!calibrationMode) return;

    const rect = faceContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Create visual marker
    const marker = document.createElement('div');
    marker.className = 'eye-click-marker';
    marker.style.left = e.clientX - rect.left + 'px';
    marker.style.top = e.clientY - rect.top + 'px';
    faceContainer.appendChild(marker);

    if (clickCount === 0) {
        // First click - left eye
        eyePositions.left = { x: x.toFixed(1), y: y.toFixed(1) };
        leftEyePosEl.textContent = `${x.toFixed(0)}%, ${y.toFixed(0)}%`;
        clickCount++;
    } else if (clickCount === 1) {
        // Second click - right eye
        eyePositions.right = { x: x.toFixed(1), y: y.toFixed(1) };
        rightEyePosEl.textContent = `${x.toFixed(0)}%, ${y.toFixed(0)}%`;
        clickCount++;
    }
});

// ==================== SCREEN SHAKE ====================
function triggerScreenShake() {
    container.classList.remove('shake');
    void container.offsetWidth;
    container.classList.add('shake');

    setTimeout(() => {
        container.classList.remove('shake');
    }, 500);
}

// ==================== IMPACT WAVE ====================
function createImpactWave(x, y) {
    const wave = document.createElement('div');
    wave.className = 'impact-wave';
    wave.style.left = (x - 10) + 'px';
    wave.style.top = (y - 10) + 'px';
    document.body.appendChild(wave);

    setTimeout(() => wave.remove(), 600);
}

// ==================== Sound System ====================
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    // Create slap sound using Web Audio API
    playSlap(power) {
        this.init();
        if (!this.audioContext) return;

        const duration = 0.15;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Frequency based on power (louder slap = lower pitch)
        oscillator.frequency.value = 150 - (power * 0.5);
        oscillator.type = 'triangle';

        // Volume envelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(power / 200, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    // Create impact sound
    playImpact(power) {
        this.init();
        if (!this.audioContext) return;

        const duration = 0.1;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 80;
        oscillator.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.value = 200 + (power * 2);

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(power / 150, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }
}

const soundSystem = new SoundSystem();

// ==================== Particle System ====================
function createParticles(x, y, power) {
    const particleCount = Math.floor(power / 8) + 8;
    const particles = ['⭐', '💥', '💫', '✨', '💦', '💢', '🌟', '✴️', '💨'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];

        // More realistic physics-based trajectory
        const angle = (Math.random() * Math.PI * 1.5) + (Math.PI * 0.25); // Upward arc
        const velocity = (50 + Math.random() * power * 2.5);
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - (Math.random() * 30); // Add upward bias
        const rotation = (Math.random() * 1080) - 540; // Multiple rotations

        // Random size based on power
        const size = 18 + Math.random() * (power / 4);

        particle.style.left = x + (Math.random() * 40 - 20) + 'px';
        particle.style.top = y + (Math.random() * 40 - 20) + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.setProperty('--rot', rotation + 'deg');
        particle.style.fontSize = size + 'px';

        // Add subtle delay for more realistic burst effect
        particle.style.animationDelay = (Math.random() * 0.1) + 's';
        particle.style.animationDuration = (0.8 + Math.random() * 0.4) + 's';

        particleContainer.appendChild(particle);

        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, 1200);
    }
}

// ==================== Visual Effects ====================
function showRedness(power, hitX, hitY) {
    const container = faceContainer.getBoundingClientRect();
    const relativeX = ((hitX / container.width) * 100);
    const relativeY = ((hitY / container.height) * 100);

    // Create dynamic redness based on hit location
    const intensity = Math.min(power / 80, 1);
    redness.style.background = `radial-gradient(circle at ${relativeX}% ${relativeY}%, rgba(255, 0, 0, ${0.7 * intensity}) 0%, rgba(255, 80, 80, ${0.5 * intensity}) 20%, rgba(255, 0, 0, 0) 50%)`;
    redness.style.opacity = intensity;

    // Fadeout timing based on power
    const fadeTime = 600 + (power * 8);
    setTimeout(() => {
        redness.style.opacity = '0';
    }, fadeTime);
}

function blinkEyes() {
    leftEye.classList.add('blink');
    rightEye.classList.add('blink');

    setTimeout(() => {
        leftEye.classList.remove('blink');
        rightEye.classList.remove('blink');
    }, 300);
}

function showHitIndicator(power) {
    let text = '';
    if (power < 30) {
        text = 'PAT! 👋';
    } else if (power < 60) {
        text = 'TOKAT! 💥';
    } else if (power < 90) {
        text = 'ŞAMAR! 💢';
    } else {
        text = 'SÜPER TOKAT! ⭐';
    }

    hitIndicator.textContent = text;
    hitIndicator.classList.add('show');

    setTimeout(() => {
        hitIndicator.classList.remove('show');
    }, 600);
}

function animateFace(power) {
    // Remove previous animations
    faceContainer.classList.remove('shake', 'slapped', 'strong-slap');

    // Trigger reflow
    void faceContainer.offsetWidth;

    // Apply appropriate animation based on power
    if (power > 70) {
        faceContainer.classList.add('strong-slap');
    } else if (power > 30) {
        faceContainer.classList.add('slapped');
    } else {
        faceContainer.classList.add('shake');
    }
}

// ==================== Power Calculation ====================
function calculatePower(startX, startY, endX, endY, startTime, endTime) {
    // Calculate distance
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate velocity (pixels per millisecond)
    const timeDelta = Math.max(endTime - startTime, 1);
    const velocity = distance / timeDelta;

    // Convert to power (0-100 scale)
    // Velocity threshold: 0.5 = weak, 2+ = strong
    let power = Math.min(velocity * 30, 100);

    // Boost power if distance is significant
    if (distance > 100) {
        power = Math.min(power * 1.2, 100);
    }

    return Math.floor(power);
}

// ==================== Slap Handler ====================
function handleSlap(x, y, power) {
    if (gameState.isAnimating) return;
    gameState.isAnimating = true;

    // Update stats
    gameState.slapCount++;
    gameState.currentPower = power;
    if (power > gameState.maxPower) {
        gameState.maxPower = power;
    }

    // Update UI
    slapCountEl.textContent = gameState.slapCount;
    maxPowerEl.textContent = gameState.maxPower;
    currentPowerEl.textContent = power + '%';
    powerFill.style.width = power + '%';

    // Visual effects with position-aware redness
    animateFace(power);
    showRedness(power, x, y);
    blinkEyes();
    showHitIndicator(power);
    createParticles(x, y, power);

    // NEW: FPS Effects
    triggerArmPunch(); // FPS kol animasyonu

    if (power > 40) {
        triggerScreenShake(); // Ekran sarsıntısı
    }

    // Impact wave
    const rect = faceContainer.getBoundingClientRect();
    createImpactWave(rect.left + x, rect.top + y);

    // NEW: Exhaustion and reactions
    updateExhaustion(power);

    // Show sweat if power is high
    if (power > 50) {
        createSweatDrops(power);
    }

    // Sound effects
    soundSystem.playSlap(power);
    setTimeout(() => soundSystem.playImpact(power), 50);

    // Random additional blink for realism
    if (Math.random() > 0.4) {
        setTimeout(blinkEyes, 200 + Math.random() * 400);
    }

    // Reset animation lock
    setTimeout(() => {
        gameState.isAnimating = false;
        powerFill.style.width = '0%';
    }, 800);
}

// ==================== Mouse Events ====================
let mousePressed = false;
let mouseStartX = 0;
let mouseStartY = 0;
let mouseStartTime = 0;

faceContainer.addEventListener('mousedown', (e) => {
    mousePressed = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    mouseStartTime = Date.now();

    // Visual feedback
    faceContainer.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!mousePressed) return;

    // Show power preview during drag
    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeDelta = Math.max(Date.now() - mouseStartTime, 1);
    const velocity = distance / timeDelta;
    const previewPower = Math.min(velocity * 30, 100);

    powerFill.style.width = previewPower + '%';
});

document.addEventListener('mouseup', (e) => {
    if (!mousePressed) return;
    mousePressed = false;

    const endX = e.clientX;
    const endY = e.clientY;
    const endTime = Date.now();

    // Calculate power
    const power = calculatePower(mouseStartX, mouseStartY, endX, endY, mouseStartTime, endTime);

    // Only register as slap if there was movement and minimum power
    if (power > 5) {
        // Animate hand
        animateHand(mouseStartX, mouseStartY, endX, endY, power);

        const rect = faceContainer.getBoundingClientRect();
        const localX = endX - rect.left;
        const localY = endY - rect.top;
        handleSlap(localX, localY, power);
    } else {
        powerFill.style.width = '0%';
    }

    faceContainer.style.cursor = 'pointer';
});

// ==================== Touch Events ====================
faceContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    gameState.touchStart.x = touch.clientX;
    gameState.touchStart.y = touch.clientY;
    gameState.touchStart.time = Date.now();
}, { passive: false });

faceContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    gameState.touchEnd.x = touch.clientX;
    gameState.touchEnd.y = touch.clientY;
    gameState.touchEnd.time = Date.now();

    // Show power preview
    const power = calculatePower(
        gameState.touchStart.x,
        gameState.touchStart.y,
        gameState.touchEnd.x,
        gameState.touchEnd.y,
        gameState.touchStart.time,
        gameState.touchEnd.time
    );

    powerFill.style.width = power + '%';
}, { passive: false });

faceContainer.addEventListener('touchend', (e) => {
    e.preventDefault();

    const endTime = Date.now();
    const power = calculatePower(
        gameState.touchStart.x,
        gameState.touchStart.y,
        gameState.touchEnd.x,
        gameState.touchEnd.y,
        gameState.touchStart.time,
        endTime
    );

    // Only register as slap if there was movement and minimum power
    if (power > 5) {
        // Animate hand
        animateHand(
            gameState.touchStart.x,
            gameState.touchStart.y,
            gameState.touchEnd.x,
            gameState.touchEnd.y,
            power
        );

        const rect = faceContainer.getBoundingClientRect();
        const localX = gameState.touchEnd.x - rect.left;
        const localY = gameState.touchEnd.y - rect.top;
        handleSlap(localX, localY, power);
    } else {
        powerFill.style.width = '0%';
    }

    // Reset touch tracking
    gameState.touchStart = { x: 0, y: 0, time: 0 };
    gameState.touchEnd = { x: 0, y: 0, time: 0 };
}, { passive: false });

// ==================== Random Eye Blinks ====================
function randomBlink() {
    if (!gameState.isAnimating) {
        blinkEyes();
    }

    // Next blink in 2-5 seconds
    const nextBlink = 2000 + Math.random() * 3000;
    setTimeout(randomBlink, nextBlink);
}

// Start random blinking after 3 seconds
setTimeout(randomBlink, 3000);

// ==================== Initialize ====================
console.log('🎮 Tokat Atma Oyunu başlatıldı!');
console.log('👋 Fare veya parmağınızı hızlıca kaydırın!');

// Preload audio context on first user interaction
document.addEventListener('click', () => {
    soundSystem.init();
}, { once: true });

document.addEventListener('touchstart', () => {
    soundSystem.init();
}, { once: true });
