// ==================== KARAKTER TANIMLARI ====================
const CHARACTERS = [
    { id: 'ahmet', name: 'Ahmet', tag: 'Sinirli Komşu', skinTone: '#e8c8a0', hairColor: '#3b2614', eyeColor: '#3b2614', hasBeard: true, gender: 'male' },
    { id: 'mehmet', name: 'Mehmet', tag: 'Ukala Amca', skinTone: '#d4a574', hairColor: '#1a1a1a', eyeColor: '#2b1a0a', hasBeard: false, gender: 'male' },
    { id: 'ayse', name: 'Ayşe', tag: 'Dedikocucu Teyze', skinTone: '#fce4d2', hairColor: '#8b4513', eyeColor: '#4a3520', hasBeard: false, gender: 'female' },
    { id: 'fatma', name: 'Fatma', tag: 'Kıskanç Yenge', skinTone: '#f0c8a8', hairColor: '#2b1a0a', eyeColor: '#3b2614', hasBeard: false, gender: 'female' },
    { id: 'hasan', name: 'Hasan', tag: 'Keko Dayı', skinTone: '#c49563', hairColor: '#1a1a1a', eyeColor: '#1a1a1a', hasBeard: true, gender: 'male' },
    { id: 'ali', name: 'Ali', tag: 'Mahallenin Kabadayısı', skinTone: '#d4a574', hairColor: '#3b2614', eyeColor: '#2b1a0a', hasBeard: true, gender: 'male' },
    { id: 'zeynep', name: 'Zeynep', tag: 'Drama Queen', skinTone: '#fde8d8', hairColor: '#c0392b', eyeColor: '#27ae60', hasBeard: false, gender: 'female' },
    { id: 'emre', name: 'Emre', tag: 'Küstah Çocuk', skinTone: '#f5d0b0', hairColor: '#8b7355', eyeColor: '#3b2614', hasBeard: false, gender: 'male' },
    { id: 'derya', name: 'Derya', tag: 'Patron Hanım', skinTone: '#f0c8a8', hairColor: '#1a1a1a', eyeColor: '#2c3e50', hasBeard: false, gender: 'female' },
    { id: 'burak', name: 'Burak', tag: 'Gym Abisi', skinTone: '#c49563', hairColor: '#3b2614', eyeColor: '#2b1a0a', hasBeard: true, gender: 'male' },
    { id: 'selin', name: 'Selin', tag: 'Laf Sokan Arkadaş', skinTone: '#fce4d2', hairColor: '#d4a017', eyeColor: '#3b2614', hasBeard: false, gender: 'female' },
    { id: 'kemal', name: 'Kemal', tag: 'Sinir Bozucu Müdür', skinTone: '#e8c8a0', hairColor: '#808080', eyeColor: '#2b1a0a', hasBeard: false, gender: 'male' },
];

const HAND_TYPES = [
    { id: 'female-light', name: 'Kadın (Açık)', desc: 'İnce & zarif', skinClass: 'skin-female-light', hairy: false },
    { id: 'female-medium', name: 'Kadın (Esmer)', desc: 'İnce & güçlü', skinClass: 'skin-female-medium', hairy: false },
    { id: 'male-light', name: 'Erkek (Açık)', desc: 'Güçlü & kılsız', skinClass: 'skin-male-light', hairy: false },
    { id: 'male-medium', name: 'Erkek (Esmer)', desc: 'Güçlü & sert', skinClass: 'skin-male-medium', hairy: false },
    { id: 'male-hairy', name: 'Erkek (Kıllı)', desc: 'Ekstra güçlü', skinClass: 'skin-male-hairy', hairy: true },
    { id: 'male-dark', name: 'Erkek (Koyu)', desc: 'Ağır yumruk', skinClass: 'skin-male-dark', hairy: false },
];

// ==================== GAME STATE ====================
const gameState = {
    slapCount: 0, maxPower: 0, currentPower: 0,
    isAnimating: false, exhaustion: 0, combo: 0,
    comboTimer: null, lastSlapTime: 0,
    selectedCharacter: null, selectedHand: null,
    touchStart: { x: 0, y: 0, time: 0 },
    touchEnd: { x: 0, y: 0, time: 0 },
    totalDamage: 0, slapMarks: []
};

// ==================== DOM ELEMENTS ====================
const $ = id => document.getElementById(id);
const mainMenu = $('mainMenu');
const gameScreen = $('gameScreen');
const characterGrid = $('characterGrid');
const handOptions = $('handOptions');
const startGameBtn = $('startGameBtn');
const startHint = $('startHint');
const backToMenuBtn = $('backToMenuBtn');
const faceContainer = $('faceContainer');
const faceCanvas = $('faceCanvas');
const redness = $('redness');
const particleContainer = $('particleContainer');
const leftEye = $('leftEye');
const rightEye = $('rightEye');
const powerFill = $('powerFill');
const powerLabel = $('powerLabel');
const hitIndicator = $('hitIndicator');
const slapCountEl = $('slapCount');
const maxPowerEl = $('maxPower');
const currentPowerEl = $('currentPower');
const sweatContainer = $('sweatContainer');
const tongue = $('tongue');
const fpsArm = $('fpsArm');
const comboDisplay = $('comboDisplay');
const comboCountEl = $('comboCount');
const damageNumbers = $('damageNumbers');
const hairLayer = $('hairLayer');

// ==================== CANVAS - KARAKTER ÇİZİMİ ====================
function drawCharacter(canvas, char, size = 500) {
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;
    const s = size / 500; // scale factor

    // Arka plan
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.6);
    bg.addColorStop(0, '#2a2a4a'); bg.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size);

    // Boyun
    ctx.fillStyle = char.skinTone;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 130 * s, 45 * s, 60 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Omuzlar
    ctx.fillStyle = '#333355';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 200 * s, 160 * s, 60 * s, 0, 0, Math.PI);
    ctx.fill();

    // Yüz
    const faceGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160 * s);
    faceGrad.addColorStop(0, lightenColor(char.skinTone, 20));
    faceGrad.addColorStop(1, char.skinTone);
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 140 * s, 175 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yüz gölge
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.ellipse(cx + 20 * s, cy + 30 * s, 120 * s, 150 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Saç
    ctx.fillStyle = char.hairColor;
    if (char.gender === 'female') {
        // Uzun saç
        ctx.beginPath();
        ctx.ellipse(cx, cy - 80 * s, 150 * s, 120 * s, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 150 * s, cy - 80 * s, 60 * s, 200 * s);
        ctx.fillRect(cx + 90 * s, cy - 80 * s, 60 * s, 200 * s);
        // Saç parlak
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.ellipse(cx - 30 * s, cy - 120 * s, 50 * s, 30 * s, -0.3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.ellipse(cx, cy - 90 * s, 145 * s, 100 * s, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 140 * s, cy - 90 * s, 30 * s, 50 * s);
        ctx.fillRect(cx + 110 * s, cy - 90 * s, 30 * s, 50 * s);
    }

    // Kulaklar
    ctx.fillStyle = char.skinTone;
    ctx.beginPath();
    ctx.ellipse(cx - 140 * s, cy, 20 * s, 30 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 140 * s, cy, 20 * s, 30 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gözler
    const eyeY = cy - 20 * s;
    // Beyaz
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(cx - 50 * s, eyeY, 28 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 50 * s, eyeY, 28 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill();
    // İris
    ctx.fillStyle = char.eyeColor;
    ctx.beginPath(); ctx.arc(cx - 50 * s, eyeY, 11 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 50 * s, eyeY, 11 * s, 0, Math.PI * 2); ctx.fill();
    // Pupil
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(cx - 50 * s, eyeY, 5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 50 * s, eyeY, 5 * s, 0, Math.PI * 2); ctx.fill();
    // Parlak
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 45 * s, eyeY - 5 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 55 * s, eyeY - 5 * s, 4 * s, 0, Math.PI * 2); ctx.fill();

    // Kaşlar
    ctx.strokeStyle = char.hairColor; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 80 * s, eyeY - 35 * s);
    ctx.quadraticCurveTo(cx - 50 * s, eyeY - 45 * s, cx - 20 * s, eyeY - 35 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 20 * s, eyeY - 35 * s);
    ctx.quadraticCurveTo(cx + 50 * s, eyeY - 45 * s, cx + 80 * s, eyeY - 35 * s); ctx.stroke();

    // Burun
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 15 * s, cy + 50 * s);
    ctx.lineTo(cx, cy + 55 * s); ctx.lineTo(cx + 15 * s, cy + 50 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.ellipse(cx - 3 * s, cy + 20 * s, 5 * s, 12 * s, -0.2, 0, Math.PI * 2); ctx.fill();

    // Ağız
    ctx.strokeStyle = darkenColor(char.skinTone, 40); ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.moveTo(cx - 40 * s, cy + 90 * s);
    ctx.quadraticCurveTo(cx, cy + 105 * s, cx + 40 * s, cy + 90 * s); ctx.stroke();

    // Yanaklar
    ctx.fillStyle = 'rgba(255,120,120,0.15)';
    ctx.beginPath(); ctx.ellipse(cx - 90 * s, cy + 30 * s, 35 * s, 25 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 90 * s, cy + 30 * s, 35 * s, 25 * s, 0, 0, Math.PI * 2); ctx.fill();

    // Sakal
    if (char.hasBeard) {
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        for (let i = 0; i < 300; i++) {
            const bx = cx + (Math.random() - 0.5) * 180 * s;
            const by = cy + 60 * s + Math.random() * 100 * s;
            const dist = Math.sqrt((bx - cx) ** 2 + (by - (cy + 100 * s)) ** 2);
            if (dist < 100 * s) {
                ctx.fillRect(bx, by, 1.5 * s, 4 * s);
            }
        }
    }
}

function lightenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
    const b = Math.min(255, (num & 0xFF) + amount);
    return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
    const b = Math.max(0, (num & 0xFF) - amount);
    return `rgb(${r},${g},${b})`;
}

// ==================== MENÜ SİSTEMİ ====================
function buildMenu() {
    // Karakter kartları
    characterGrid.innerHTML = '';
    CHARACTERS.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.id = char.id;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'character-avatar';
        const miniCanvas = document.createElement('canvas');
        drawCharacter(miniCanvas, char, 140);
        avatarDiv.appendChild(miniCanvas);

        const nameEl = document.createElement('div');
        nameEl.className = 'character-name';
        nameEl.textContent = char.name;

        const tagEl = document.createElement('div');
        tagEl.className = 'character-tag';
        tagEl.textContent = char.tag;

        card.append(avatarDiv, nameEl, tagEl);
        card.addEventListener('click', () => selectCharacter(char, card));
        characterGrid.appendChild(card);
    });

    // El seçenekleri
    handOptions.innerHTML = '';
    HAND_TYPES.forEach(hand => {
        const opt = document.createElement('div');
        opt.className = 'hand-option';
        opt.dataset.id = hand.id;

        const preview = document.createElement('div');
        preview.className = 'hand-preview';
        // Renk önizleme
        const colors = { 'skin-female-light': '#fce4d2', 'skin-female-medium': '#d4a574', 'skin-male-light': '#e8c8a0', 'skin-male-medium': '#c49563', 'skin-male-hairy': '#d4a574', 'skin-male-dark': '#8b6340' };
        preview.style.background = `linear-gradient(135deg, ${lightenColor(colors[hand.skinClass] || '#d4a574', 15)}, ${colors[hand.skinClass] || '#d4a574'})`;
        preview.style.borderRadius = '30px 30px 15px 15px';
        preview.style.border = '2px solid rgba(255,255,255,0.15)';
        if (hand.hairy) {
            preview.style.backgroundImage = `linear-gradient(135deg, ${lightenColor(colors[hand.skinClass], 15)}, ${colors[hand.skinClass]}), repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)`;
        }

        const nameEl = document.createElement('div');
        nameEl.className = 'hand-option-name';
        nameEl.textContent = hand.name;

        const descEl = document.createElement('div');
        descEl.className = 'hand-option-desc';
        descEl.textContent = hand.desc;

        opt.append(preview, nameEl, descEl);
        opt.addEventListener('click', () => selectHand(hand, opt));
        handOptions.appendChild(opt);
    });
}

function selectCharacter(char, card) {
    document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    gameState.selectedCharacter = char;
    checkStartReady();
}

function selectHand(hand, opt) {
    document.querySelectorAll('.hand-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    gameState.selectedHand = hand;
    checkStartReady();
}

function checkStartReady() {
    const ready = gameState.selectedCharacter && gameState.selectedHand;
    startGameBtn.disabled = !ready;
    startHint.textContent = ready ? 'Hazırsın! Başla!' : 'Önce karakter ve el seç!';
    startHint.style.opacity = ready ? '0' : '0.7';
}

// ==================== OYUN BAŞLATMA ====================
startGameBtn.addEventListener('click', () => {
    if (!gameState.selectedCharacter || !gameState.selectedHand) return;
    mainMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    // Karakter çiz
    drawCharacter(faceCanvas, gameState.selectedCharacter, 500);

    // Kol skin uygula
    fpsArm.className = 'fps-arm ' + gameState.selectedHand.skinClass;

    // Kılları oluştur
    generateArmHairs();

    // İdle başla
    setTimeout(() => fpsArm.classList.add('idle'), 500);

    // Reset
    gameState.slapCount = 0; gameState.maxPower = 0; gameState.combo = 0;
    gameState.exhaustion = 0; gameState.totalDamage = 0; gameState.slapMarks = [];
    slapCountEl.textContent = '0'; maxPowerEl.textContent = '0';
    currentPowerEl.textContent = '0%'; comboCountEl.textContent = '0';
});

backToMenuBtn.addEventListener('click', () => {
    gameScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    fpsArm.classList.remove('idle', 'slapping', 'strong-slap');
});

// ==================== KIL SİSTEMİ ====================
function generateArmHairs() {
    hairLayer.innerHTML = '';
    if (!gameState.selectedHand || !gameState.selectedHand.hairy) return;

    for (let i = 0; i < 80; i++) {
        const hair = document.createElement('div');
        hair.className = 'arm-hair';
        hair.style.left = (10 + Math.random() * 80) + '%';
        hair.style.top = (5 + Math.random() * 85) + '%';
        hair.style.height = (6 + Math.random() * 10) + 'px';
        hair.style.transform = `rotate(${-20 + Math.random() * 40}deg)`;
        hair.style.opacity = (0.3 + Math.random() * 0.4).toString();
        hairLayer.appendChild(hair);
    }
    hairLayer.classList.add('visible');
}

// ==================== SES SİSTEMİ ====================
class SoundSystem {
    constructor() { this.ctx = null; this.ready = false; }
    init() {
        if (this.ready) return;
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.ready = true; } catch (e) { }
    }
    playSlap(power) {
        this.init(); if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.frequency.value = 200 - power * 0.8;
        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(Math.min(power / 120, 0.8), now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);

        // İmpact
        setTimeout(() => {
            const osc2 = this.ctx.createOscillator();
            const g2 = this.ctx.createGain();
            const f = this.ctx.createBiquadFilter();
            osc2.connect(f); f.connect(g2); g2.connect(this.ctx.destination);
            osc2.frequency.value = 60 + power * 0.5;
            osc2.type = 'sawtooth';
            f.type = 'lowpass'; f.frequency.value = 150 + power * 3;
            const n = this.ctx.currentTime;
            g2.gain.setValueAtTime(Math.min(power / 100, 0.9), n);
            g2.gain.exponentialRampToValueAtTime(0.01, n + 0.12);
            osc2.start(n); osc2.stop(n + 0.12);
        }, 30);
    }
}
const soundSystem = new SoundSystem();

// ==================== MOUSE İLE KOL TAKİBİ ====================
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    updateArmPosition();
});

document.addEventListener('touchmove', e => {
    if (e.touches.length) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; updateArmPosition(); }
}, { passive: true });

function updateArmPosition() {
    if (fpsArm.classList.contains('slapping') || fpsArm.classList.contains('strong-slap')) return;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const ox = (mouseX - cx) / 18, oy = (mouseY - cy) / 18;
    const rot = (mouseX - cx) / 90;
    fpsArm.style.transform = `translateX(${ox}px) translateY(${oy}px) rotate(${rot}deg)`;
}

// ==================== VURUŞ ANİMASYONLARI ====================
function triggerArmSlap(power) {
    fpsArm.classList.remove('idle', 'slapping', 'strong-slap');
    void fpsArm.offsetWidth;
    if (power > 70) {
        fpsArm.classList.add('strong-slap');
        setTimeout(() => { fpsArm.classList.remove('strong-slap'); fpsArm.classList.add('idle'); }, 600);
    } else {
        fpsArm.classList.add('slapping');
        setTimeout(() => { fpsArm.classList.remove('slapping'); fpsArm.classList.add('idle'); }, 500);
    }
}

function triggerScreenShake(power) {
    gameScreen.classList.remove('screen-shake');
    void gameScreen.offsetWidth;
    gameScreen.classList.add('screen-shake');
    setTimeout(() => gameScreen.classList.remove('screen-shake'), 500);

    if (power > 80) {
        const flash = document.createElement('div');
        flash.className = 'flash-overlay';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }
}

// ==================== PARÇACIK SİSTEMİ ====================
function createParticles(x, y, power) {
    const count = Math.floor(power / 6) + 8;
    const emojis = ['⭐', '💥', '💫', '✨', '💦', '💢', '🌟', '💨', '😵'];
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        const angle = Math.random() * Math.PI * 1.5 + Math.PI * 0.25;
        const vel = 50 + Math.random() * power * 2.5;
        p.style.left = x + (Math.random() * 40 - 20) + 'px';
        p.style.top = y + (Math.random() * 40 - 20) + 'px';
        p.style.setProperty('--tx', Math.cos(angle) * vel + 'px');
        p.style.setProperty('--ty', (Math.sin(angle) * vel - Math.random() * 30) + 'px');
        p.style.setProperty('--rot', (Math.random() * 1080 - 540) + 'deg');
        p.style.fontSize = (18 + Math.random() * power / 4) + 'px';
        p.style.animationDelay = Math.random() * 0.1 + 's';
        particleContainer.appendChild(p);
        setTimeout(() => p.remove(), 1200);
    }
}

// ==================== HASAR SAYILARI ====================
function showDamageNumber(x, y, power) {
    const num = document.createElement('div');
    num.className = 'damage-num' + (power > 75 ? ' critical' : '');
    num.textContent = '-' + power;
    num.style.left = x + 'px';
    num.style.top = y + 'px';
    num.style.fontSize = (1.5 + power / 50) + 'rem';
    damageNumbers.appendChild(num);
    setTimeout(() => num.remove(), 1000);
}

// ==================== VURUŞ İZLERİ ====================
function showSlapMark(x, y, power) {
    const mark = $('slapMark');
    const intensity = Math.min(power / 80, 1);
    mark.style.left = (x - 40) + 'px';
    mark.style.top = (y - 50) + 'px';
    mark.style.background = `radial-gradient(ellipse, rgba(255,50,50,${0.4 * intensity}) 0%, transparent 70%)`;
    mark.style.width = (60 + power * 0.4) + 'px';
    mark.style.height = (80 + power * 0.4) + 'px';
    mark.classList.remove('visible');
    void mark.offsetWidth;
    mark.classList.add('visible');
    setTimeout(() => { mark.style.opacity = '0'; }, 2000 + power * 15);
}

// ==================== KOMBO SİSTEMİ ====================
function updateCombo() {
    const now = Date.now();
    if (now - gameState.lastSlapTime < 2000) {
        gameState.combo++;
    } else {
        gameState.combo = 1;
    }
    gameState.lastSlapTime = now;
    comboCountEl.textContent = gameState.combo;

    if (gameState.combo > 1) {
        comboDisplay.classList.remove('active');
        void comboDisplay.offsetWidth;
        comboDisplay.classList.add('active');
    }

    clearTimeout(gameState.comboTimer);
    gameState.comboTimer = setTimeout(() => {
        gameState.combo = 0;
        comboCountEl.textContent = '0';
    }, 2500);
}

// ==================== VISUAL EFFECTS ====================
function showRedness(power, hitX, hitY) {
    const rect = faceContainer.getBoundingClientRect();
    const rx = (hitX / rect.width) * 100, ry = (hitY / rect.height) * 100;
    const intensity = Math.min(power / 75, 1);
    redness.style.background = `radial-gradient(circle at ${rx}% ${ry}%, rgba(255,0,0,${0.7 * intensity}) 0%, rgba(255,80,80,${0.5 * intensity}) 20%, rgba(255,0,0,0) 50%)`;
    redness.style.opacity = intensity;
    setTimeout(() => { redness.style.opacity = '0'; }, 600 + power * 8);
}

function blinkEyes() {
    leftEye.classList.add('blink'); rightEye.classList.add('blink');
    setTimeout(() => { leftEye.classList.remove('blink'); rightEye.classList.remove('blink'); }, 300);
}

function showHitIndicator(power) {
    let text = power < 30 ? 'PAT! 👋' : power < 60 ? 'TOKAT! 💥' : power < 85 ? 'ŞAMAR! 💢' : 'SÜPER TOKAT! ⭐';
    if (gameState.combo >= 3) text = `${gameState.combo}x KOMBO! 🔥`;
    if (gameState.combo >= 5) text = `${gameState.combo}x ÇILDIRDI! 💀`;
    hitIndicator.textContent = text;
    hitIndicator.classList.remove('show');
    void hitIndicator.offsetWidth;
    hitIndicator.classList.add('show');
    setTimeout(() => hitIndicator.classList.remove('show'), 700);
}

function animateFace(power) {
    faceContainer.classList.remove('shake', 'slapped', 'strong-slapped');
    void faceContainer.offsetWidth;
    if (power > 70) faceContainer.classList.add('strong-slapped');
    else if (power > 30) faceContainer.classList.add('slapped');
    else faceContainer.classList.add('shake');
}

function createSweatDrops(power) {
    const count = Math.floor(power / 20) + 2;
    for (let i = 0; i < count; i++) {
        const drop = document.createElement('div');
        drop.className = 'sweat-drop';
        drop.style.left = (30 + Math.random() * 40) + '%';
        drop.style.top = (15 + Math.random() * 15) + '%';
        drop.style.animationDelay = (Math.random() * 0.3) + 's';
        sweatContainer.appendChild(drop);
        setTimeout(() => drop.remove(), 1500);
    }
}

function showTongue() {
    tongue.classList.remove('hide'); tongue.classList.add('show');
    setTimeout(() => { tongue.classList.remove('show'); tongue.classList.add('hide'); }, 2000);
}

function createDizzyStars() {
    const dizzy = document.createElement('div');
    dizzy.className = 'dizzy-stars show';
    dizzy.textContent = '⭐✨💫⭐';
    faceContainer.appendChild(dizzy);
    setTimeout(() => dizzy.remove(), 3000);
}

function updateExhaustion(power) {
    gameState.exhaustion = Math.min(gameState.exhaustion + power / 8, 100);
    if (gameState.exhaustion > 60) { faceContainer.classList.add('exhausted'); createSweatDrops(gameState.exhaustion); }
    if (gameState.exhaustion > 85) { showTongue(); createDizzyStars(); }
    setTimeout(() => { gameState.exhaustion = Math.max(gameState.exhaustion - 4, 0); if (gameState.exhaustion < 60) faceContainer.classList.remove('exhausted'); }, 2000);
}

function createImpactWave(x, y) {
    const wave = document.createElement('div');
    wave.className = 'impact-wave';
    wave.style.left = (x - 10) + 'px'; wave.style.top = (y - 10) + 'px';
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 600);
}

// ==================== GÜÇ HESAPLAMA ====================
function calculatePower(sx, sy, ex, ey, st, et) {
    const d = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);
    const v = d / Math.max(et - st, 1);
    let p = Math.min(v * 30, 100);
    if (d > 100) p = Math.min(p * 1.2, 100);
    // Kombo bonusu
    if (gameState.combo > 2) p = Math.min(p * (1 + gameState.combo * 0.05), 100);
    return Math.floor(p);
}

// ==================== ANA TOKAT HANDLER ====================
function handleSlap(x, y, power) {
    if (gameState.isAnimating) return;
    gameState.isAnimating = true;

    // Kombo güncelle
    updateCombo();

    // Stats güncelle
    gameState.slapCount++;
    gameState.currentPower = power;
    gameState.totalDamage += power;
    if (power > gameState.maxPower) gameState.maxPower = power;

    // UI güncelle
    slapCountEl.textContent = gameState.slapCount;
    maxPowerEl.textContent = gameState.maxPower;
    currentPowerEl.textContent = power + '%';
    powerFill.style.width = power + '%';

    // Efektler
    animateFace(power);
    showRedness(power, x, y);
    blinkEyes();
    showHitIndicator(power);
    createParticles(x, y, power);
    showSlapMark(x, y, power);
    triggerArmSlap(power);
    soundSystem.playSlap(power);

    // Hasar sayısı
    const rect = faceContainer.getBoundingClientRect();
    showDamageNumber(rect.left + x, rect.top + y - 20, power);

    // Yüksek güç efektleri
    if (power > 40) triggerScreenShake(power);
    if (power > 50) createSweatDrops(power);
    createImpactWave(rect.left + x, rect.top + y);
    updateExhaustion(power);

    // Ekstra göz kırpma
    if (Math.random() > 0.4) setTimeout(blinkEyes, 200 + Math.random() * 400);

    // Power label güncelle
    if (power < 30) powerLabel.textContent = 'Hafif dokunuş... Daha sert! 💪';
    else if (power < 60) powerLabel.textContent = 'İyi tokat! Devam et! 👊';
    else if (power < 85) powerLabel.textContent = 'Acıttı! 😱';
    else powerLabel.textContent = '🔥 EFSANE TOKAT! 🔥';

    // Reset
    setTimeout(() => {
        gameState.isAnimating = false;
        powerFill.style.width = '0%';
        setTimeout(() => { powerLabel.textContent = 'Yüze kaydır ve tokat at! 👋'; }, 1000);
    }, 800);
}

// ==================== MOUSE EVENTS ====================
let mousePressed = false, msx = 0, msy = 0, mst = 0;

faceContainer.addEventListener('mousedown', e => {
    mousePressed = true; msx = e.clientX; msy = e.clientY; mst = Date.now();
    faceContainer.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', e => {
    if (!mousePressed) return;
    const d = Math.sqrt((e.clientX - msx) ** 2 + (e.clientY - msy) ** 2);
    const v = d / Math.max(Date.now() - mst, 1);
    powerFill.style.width = Math.min(v * 30, 100) + '%';
});

document.addEventListener('mouseup', e => {
    if (!mousePressed) return;
    mousePressed = false;
    const power = calculatePower(msx, msy, e.clientX, e.clientY, mst, Date.now());
    if (power > 5) {
        const rect = faceContainer.getBoundingClientRect();
        handleSlap(e.clientX - rect.left, e.clientY - rect.top, power);
    } else { powerFill.style.width = '0%'; }
    faceContainer.style.cursor = 'pointer';
});

// ==================== TOUCH EVENTS ====================
faceContainer.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    gameState.touchStart = { x: t.clientX, y: t.clientY, time: Date.now() };
    gameState.touchEnd = { ...gameState.touchStart };
}, { passive: false });

faceContainer.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    gameState.touchEnd = { x: t.clientX, y: t.clientY, time: Date.now() };
    const power = calculatePower(gameState.touchStart.x, gameState.touchStart.y, gameState.touchEnd.x, gameState.touchEnd.y, gameState.touchStart.time, gameState.touchEnd.time);
    powerFill.style.width = power + '%';
}, { passive: false });

faceContainer.addEventListener('touchend', e => {
    e.preventDefault();
    const power = calculatePower(gameState.touchStart.x, gameState.touchStart.y, gameState.touchEnd.x, gameState.touchEnd.y, gameState.touchStart.time, Date.now());
    if (power > 5) {
        const rect = faceContainer.getBoundingClientRect();
        handleSlap(gameState.touchEnd.x - rect.left, gameState.touchEnd.y - rect.top, power);
    } else { powerFill.style.width = '0%'; }
    gameState.touchStart = { x: 0, y: 0, time: 0 };
    gameState.touchEnd = { x: 0, y: 0, time: 0 };
}, { passive: false });

// ==================== RANDOM BLINKS ====================
function randomBlink() {
    if (!gameState.isAnimating && !gameScreen.classList.contains('hidden')) blinkEyes();
    setTimeout(randomBlink, 2000 + Math.random() * 3000);
}
setTimeout(randomBlink, 3000);

// ==================== INIT ====================
buildMenu();
document.addEventListener('click', () => soundSystem.init(), { once: true });
document.addEventListener('touchstart', () => soundSystem.init(), { once: true });
console.log('🎮 Tokat Atma Oyunu yüklendi!');
