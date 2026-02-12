// ============ DATA ============
const CHARS = [
    { id: 'ahmet', name: 'Ahmet', tag: 'Sinirli Komşu', skin: '#e8c8a0', hair: '#3b2614', eye: '#3b2614', beard: true, g: 'm' },
    { id: 'mehmet', name: 'Mehmet', tag: 'Ukala Amca', skin: '#d4a574', hair: '#1a1a1a', eye: '#2b1a0a', beard: false, g: 'm' },
    { id: 'ayse', name: 'Ayşe', tag: 'Dedikocucu Teyze', skin: '#fce4d2', hair: '#8b4513', eye: '#4a3520', beard: false, g: 'f' },
    { id: 'fatma', name: 'Fatma', tag: 'Kıskanç Yenge', skin: '#f0c8a8', hair: '#2b1a0a', eye: '#3b2614', beard: false, g: 'f' },
    { id: 'hasan', name: 'Hasan', tag: 'Keko Dayı', skin: '#c49563', hair: '#1a1a1a', eye: '#1a1a1a', beard: true, g: 'm' },
    { id: 'ali', name: 'Ali', tag: 'Kabadayı', skin: '#d4a574', hair: '#3b2614', eye: '#2b1a0a', beard: true, g: 'm' },
    { id: 'zeynep', name: 'Zeynep', tag: 'Drama Queen', skin: '#fde8d8', hair: '#c0392b', eye: '#27ae60', beard: false, g: 'f' },
    { id: 'emre', name: 'Emre', tag: 'Küstah Çocuk', skin: '#f5d0b0', hair: '#8b7355', eye: '#3b2614', beard: false, g: 'm' },
    { id: 'selin', name: 'Selin', tag: 'Laf Sokan', skin: '#fce4d2', hair: '#d4a017', eye: '#3b2614', beard: false, g: 'f' },
    { id: 'burak', name: 'Burak', tag: 'Gym Abisi', skin: '#c49563', hair: '#3b2614', eye: '#2b1a0a', beard: true, g: 'm' },
];
const HANDS = [
    { id: 'fl', name: 'Kadın Açık', desc: 'Zarif', skin: '#fce4d2', skinD: '#e8c0a0', hairy: false, thick: 0.85 },
    { id: 'fm', name: 'Kadın Esmer', desc: 'Güçlü', skin: '#d4a574', skinD: '#b88a58', hairy: false, thick: 0.85 },
    { id: 'ml', name: 'Erkek Açık', desc: 'Kılsız', skin: '#e8c8a0', skinD: '#c49563', hairy: false, thick: 1 },
    { id: 'mm', name: 'Erkek Esmer', desc: 'Sert', skin: '#c49563', skinD: '#a07850', hairy: false, thick: 1 },
    { id: 'mh', name: 'Erkek Kıllı', desc: 'Kıllı', skin: '#d4a574', skinD: '#b08050', hairy: true, thick: 1.05 },
    { id: 'md', name: 'Erkek Koyu', desc: 'Ağır', skin: '#8b6340', skinD: '#6b4a30', hairy: false, thick: 1 },
];

// ============ STATE ============
const S = {
    char: null, hand: null, slaps: 0, maxP: 0, combo: 0, comboT: null, lastSlap: 0,
    exhaustion: 0, isSlapping: false,
    mx: 0, my: 0, handX: 0, handY: 0, handAngle: 0,
    slapAnim: 0, slapPhase: 0,
    faceShake: { x: 0, y: 0, rot: 0, vx: 0, vy: 0, vr: 0 },
    redness: [], sweat: [], particles: [], dmgNums: [],
    eyeSquint: 0, mouthOpen: 0, browAngle: 0,
    blinkTimer: 0, blinkState: 0,
    touchSX: 0, touchSY: 0, touchST: 0, touchEX: 0, touchEY: 0,
    mouseDown: false, msX: 0, msY: 0, msT: 0,
};

// ============ SOFT BODY MESH ============
const MESH_W = 12, MESH_H = 15;
let meshPts = [], meshRest = [];
function initMesh(cx, cy, w, h) {
    meshPts = []; meshRest = [];
    for (let j = 0; j < MESH_H; j++)for (let i = 0; i < MESH_W; i++) {
        const x = cx - w / 2 + w * i / (MESH_W - 1);
        const y = cy - h / 2 + h * j / (MESH_H - 1);
        meshPts.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, pinned: j === 0 });
        meshRest.push({ x, y });
    }
}
function pokeMesh(px, py, force, radius) {
    meshPts.forEach(p => {
        if (p.pinned) return;
        const dx = p.x - px, dy = p.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
            const f = force * (1 - dist / radius);
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * f * 0.8;
            p.vy += Math.sin(angle) * f * 0.5;
        }
    });
}
function updateMesh() {
    const stiffness = 0.12, damping = 0.88;
    meshPts.forEach((p, i) => {
        if (p.pinned) { p.x = meshRest[i].x + S.faceShake.x; p.y = meshRest[i].y + S.faceShake.y; return; }
        const rx = meshRest[i].x + S.faceShake.x;
        const ry = meshRest[i].y + S.faceShake.y;
        p.vx += (rx - p.x) * stiffness;
        p.vy += (ry - p.y) * stiffness;
        p.vx *= damping; p.vy *= damping;
        p.x += p.vx; p.y += p.vy;
    });
}
function getMeshPt(i, j) { return meshPts[j * MESH_W + i]; }

// ============ DOM ============
const el = id => document.getElementById(id);
const canvas = el('gameCanvas');
const ctx = canvas.getContext('2d');
const mainMenu = el('mainMenu');
const gameUI = el('gameUI');
const startBtn = el('startBtn');
const backBtn = el('backBtn');
const hint = el('hint');
const powerFill = el('powerFill');
const powerText = el('powerText');
const hitText = el('hitText');
const slapCountEl = el('slapCount');
const curPowerEl = el('curPower');
const comboCountEl = el('comboCount');

// ============ HELPERS ============
function lerpColor(a, b, t) {
    const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
    const ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255;
    const br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255;
    const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
}
function lighten(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) + a)},${Math.min(255, ((n >> 8) & 255) + a)},${Math.min(255, (n & 255) + a)})`; }
function darken(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.max(0, (n >> 16) - a)},${Math.max(0, ((n >> 8) & 255) - a)},${Math.max(0, (n & 255) - a)})`; }

// ============ MENU ============
function buildMenu() {
    const cg = el('charGrid'); cg.innerHTML = '';
    CHARS.forEach(c => {
        const d = document.createElement('div'); d.className = 'char-card';
        const cv = document.createElement('canvas'); cv.width = 120; cv.height = 120;
        drawFaceMini(cv.getContext('2d'), c, 60, 60, 50);
        d.innerHTML = `<div class="name">${c.name}</div><div class="tag">${c.tag}</div>`;
        d.prepend(cv);
        d.onclick = () => { document.querySelectorAll('.char-card').forEach(x => x.classList.remove('sel')); d.classList.add('sel'); S.char = c; checkReady(); };
        cg.appendChild(d);
    });
    const hg = el('handGrid'); hg.innerHTML = '';
    HANDS.forEach(h => {
        const d = document.createElement('div'); d.className = 'hand-card';
        const pv = document.createElement('div'); pv.className = 'preview';
        pv.style.background = `linear-gradient(135deg,${lighten(h.skin, 15)},${h.skinD})`;
        if (h.hairy) pv.style.backgroundImage = `linear-gradient(135deg,${lighten(h.skin, 15)},${h.skinD}),repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.12) 3px,rgba(0,0,0,.12) 4px)`;
        d.innerHTML = `<div class="hname">${h.name}</div><div class="hdesc">${h.desc}</div>`;
        d.prepend(pv);
        d.onclick = () => { document.querySelectorAll('.hand-card').forEach(x => x.classList.remove('sel')); d.classList.add('sel'); S.hand = h; checkReady(); };
        hg.appendChild(d);
    });
}
function checkReady() {
    startBtn.disabled = !(S.char && S.hand);
    hint.textContent = S.char && S.hand ? 'Hazır!' : 'Karakter ve el seç!';
}

// ============ FACE DRAWING ============
function drawFaceMini(ctx, c, cx, cy, r) {
    ctx.save();
    // bg
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
    bg.addColorStop(0, '#2a2a4a'); bg.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, cx * 2, cy * 2);
    // neck
    ctx.fillStyle = c.skin; ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.65, r * 0.22, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    // face
    const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    fg.addColorStop(0, lighten(c.skin, 15)); fg.addColorStop(1, c.skin);
    ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.7, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
    // hair
    ctx.fillStyle = c.hair;
    if (c.g === 'f') { ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.35, r * 0.75, r * 0.55, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillRect(cx - r * 0.75, cy - r * 0.35, r * 0.3, r * 0.8); ctx.fillRect(cx + r * 0.45, cy - r * 0.35, r * 0.3, r * 0.8); }
    else { ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.42, r * 0.72, r * 0.48, 0, Math.PI, Math.PI * 2); ctx.fill(); }
    // eyes
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(cx - r * 0.22, cy - r * 0.08, r * 0.13, r * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + r * 0.22, cy - r * 0.08, r * 0.13, r * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.eye; ctx.beginPath(); ctx.arc(cx - r * 0.22, cy - r * 0.08, r * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.22, cy - r * 0.08, r * 0.05, 0, Math.PI * 2); ctx.fill();
    // mouth
    ctx.strokeStyle = darken(c.skin, 40); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - r * 0.2, cy + r * 0.4); ctx.quadraticCurveTo(cx, cy + r * 0.5, cx + r * 0.2, cy + r * 0.4); ctx.stroke();
    // beard
    if (c.beard) { ctx.fillStyle = 'rgba(0,0,0,.1)'; for (let i = 0; i < 50; i++) { const bx = cx + (Math.random() - 0.5) * r; const by = cy + r * 0.25 + Math.random() * r * 0.4; if (Math.abs(bx - cx) < r * 0.45) ctx.fillRect(bx, by, 1, 2.5); } }
    ctx.restore();
}

function drawFaceOnCanvas(c, cx, cy, faceW, faceH) {
    ctx.save();
    // Use mesh for deformed face
    const hw = faceW / 2, hh = faceH / 2;

    // Draw face shape using mesh deformation
    // Background neck & shoulders
    ctx.fillStyle = darken(c.skin, 10);
    const neckPt = getMeshPt(Math.floor(MESH_W / 2), MESH_H - 1);
    ctx.beginPath(); ctx.ellipse(neckPt.x, neckPt.y + faceH * 0.1, faceW * 0.18, faceH * 0.12, 0, 0, Math.PI * 2); ctx.fill();

    // Shoulders
    ctx.fillStyle = '#333355';
    ctx.beginPath(); ctx.ellipse(neckPt.x, neckPt.y + faceH * 0.2, faceW * 0.55, faceH * 0.08, 0, 0, Math.PI); ctx.fill();

    // Face skin - draw as deformed mesh quads
    for (let j = 0; j < MESH_H - 1; j++) {
        for (let i = 0; i < MESH_W - 1; i++) {
            const p0 = getMeshPt(i, j), p1 = getMeshPt(i + 1, j), p2 = getMeshPt(i + 1, j + 1), p3 = getMeshPt(i, j + 1);
            // Check if inside face ellipse
            const mcx = (p0.x + p1.x + p2.x + p3.x) / 4, mcy = (p0.y + p1.y + p2.y + p3.y) / 4;
            const dx = (mcx - cx) / hw, dy = (mcy - cy) / hh;
            if (dx * dx + dy * dy > 1.1) continue;

            const t = j / (MESH_H - 1);
            const skinColor = lerpColor(lighten(c.skin, 12).replace('rgb(', '#').replace(/,/g, '').replace(')', ''), c.skin, t);
            ctx.fillStyle = lighten(c.skin, Math.floor(12 - t * 20));
            ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath(); ctx.fill();
        }
    }

    // Face outline glow
    ctx.save();
    const centerPt = getMeshPt(Math.floor(MESH_W / 2), Math.floor(MESH_H / 2));
    const fcx = centerPt.x, fcy = centerPt.y;

    // Shadow on face
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.beginPath(); ctx.ellipse(fcx + faceW * 0.04, fcy + faceH * 0.06, hw * 0.8, hh * 0.85, 0, 0, Math.PI * 2); ctx.fill();

    // Ears
    const leftEarPt = getMeshPt(0, Math.floor(MESH_H * 0.4));
    const rightEarPt = getMeshPt(MESH_W - 1, Math.floor(MESH_H * 0.4));
    ctx.fillStyle = c.skin;
    ctx.beginPath(); ctx.ellipse(leftEarPt.x - faceW * 0.05, leftEarPt.y, faceW * 0.04, faceH * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(rightEarPt.x + faceW * 0.05, rightEarPt.y, faceW * 0.04, faceH * 0.06, 0, 0, Math.PI * 2); ctx.fill();

    // Hair
    ctx.fillStyle = c.hair;
    const topPt = getMeshPt(Math.floor(MESH_W / 2), 0);
    if (c.g === 'f') {
        ctx.beginPath(); ctx.ellipse(topPt.x, topPt.y - faceH * 0.02, hw * 0.85, hh * 0.5, 0, Math.PI, Math.PI * 2); ctx.fill();
        ctx.fillRect(topPt.x - hw * 0.85, topPt.y - faceH * 0.02, hw * 0.3, faceH * 0.45);
        ctx.fillRect(topPt.x + hw * 0.55, topPt.y - faceH * 0.02, hw * 0.3, faceH * 0.45);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.ellipse(topPt.x - hw * 0.15, topPt.y - hh * 0.35, hw * 0.25, hh * 0.12, -0.3, 0, Math.PI * 2); ctx.fill();
    } else {
        ctx.beginPath(); ctx.ellipse(topPt.x, topPt.y - faceH * 0.05, hw * 0.82, hh * 0.42, 0, Math.PI, Math.PI * 2); ctx.fill();
        ctx.fillRect(topPt.x - hw * 0.8, topPt.y - faceH * 0.05, hw * 0.15, hh * 0.2);
        ctx.fillRect(topPt.x + hw * 0.65, topPt.y - faceH * 0.05, hw * 0.15, hh * 0.2);
    }

    // Eyes area
    const eyeY = fcy - faceH * 0.08;
    const eyeL = fcx - faceW * 0.18, eyeR = fcx + faceW * 0.18;
    const squint = S.eyeSquint;
    const blinkH = S.blinkState > 0 ? 0.01 : 1;
    const eyeH = faceH * 0.042 * blinkH * (1 - squint * 0.5);

    // Eyebrows
    const browOff = S.browAngle;
    ctx.strokeStyle = c.hair; ctx.lineWidth = Math.max(2, faceW * 0.016); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(eyeL - faceW * 0.1, eyeY - faceH * 0.08 - browOff * 3); ctx.quadraticCurveTo(eyeL, eyeY - faceH * 0.1 - browOff * 5, eyeL + faceW * 0.1, eyeY - faceH * 0.08 + browOff); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(eyeR - faceW * 0.1, eyeY - faceH * 0.08 + browOff); ctx.quadraticCurveTo(eyeR, eyeY - faceH * 0.1 - browOff * 5, eyeR + faceW * 0.1, eyeY - faceH * 0.08 - browOff * 3); ctx.stroke();

    // Eye whites
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(eyeL, eyeY, faceW * 0.065, eyeH, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(eyeR, eyeY, faceW * 0.065, eyeH, 0, 0, Math.PI * 2); ctx.fill();

    if (blinkH > 0.1) {
        // Iris
        ctx.fillStyle = c.eye;
        ctx.beginPath(); ctx.arc(eyeL, eyeY, faceW * 0.028, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eyeR, eyeY, faceW * 0.028, 0, Math.PI * 2); ctx.fill();
        // Pupil
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(eyeL, eyeY, faceW * 0.013, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eyeR, eyeY, faceW * 0.013, 0, Math.PI * 2); ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(eyeL + faceW * 0.012, eyeY - faceH * 0.012, faceW * 0.008, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eyeR + faceW * 0.012, eyeY - faceH * 0.012, faceW * 0.008, 0, Math.PI * 2); ctx.fill();
    }

    // Nose
    const noseY = fcy + faceH * 0.06;
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath(); ctx.moveTo(fcx, fcy); ctx.lineTo(fcx - faceW * 0.04, noseY); ctx.lineTo(fcx, noseY + faceH * 0.015); ctx.lineTo(fcx + faceW * 0.04, noseY); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.ellipse(fcx - faceW * 0.008, fcy + faceH * 0.03, faceW * 0.012, faceH * 0.025, -0.2, 0, Math.PI * 2); ctx.fill();
    // Nostrils
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(fcx - faceW * 0.025, noseY + faceH * 0.005, faceW * 0.01, faceH * 0.006, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(fcx + faceW * 0.025, noseY + faceH * 0.005, faceW * 0.01, faceH * 0.006, 0, 0, Math.PI * 2); ctx.fill();

    // Mouth
    const mouthY = fcy + faceH * 0.2;
    const mouthOpen = S.mouthOpen;
    ctx.strokeStyle = darken(c.skin, 45); ctx.lineWidth = Math.max(1.5, faceW * 0.01);
    if (mouthOpen > 0.1) {
        // Open mouth
        ctx.fillStyle = 'rgba(80,20,20,0.9)';
        ctx.beginPath(); ctx.ellipse(fcx, mouthY, faceW * 0.1, faceH * 0.02 + mouthOpen * faceH * 0.04, 0, 0, Math.PI * 2); ctx.fill();
        // Teeth top
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(fcx - faceW * 0.06, mouthY - faceH * 0.015 - mouthOpen * faceH * 0.01, faceW * 0.12, faceH * 0.012);
        // Tongue
        if (mouthOpen > 0.5) {
            ctx.fillStyle = '#e06080';
            ctx.beginPath(); ctx.ellipse(fcx, mouthY + faceH * 0.01, faceW * 0.05, mouthOpen * faceH * 0.02, 0, 0, Math.PI); ctx.fill();
        }
    } else {
        ctx.beginPath(); ctx.moveTo(fcx - faceW * 0.1, mouthY); ctx.quadraticCurveTo(fcx, mouthY + faceH * 0.03, fcx + faceW * 0.1, mouthY); ctx.stroke();
        // Lips
        ctx.fillStyle = `rgba(200,100,100,0.15)`;
        ctx.beginPath(); ctx.ellipse(fcx, mouthY + faceH * 0.008, faceW * 0.08, faceH * 0.012, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Cheeks (blush)
    ctx.fillStyle = 'rgba(255,120,120,0.12)';
    ctx.beginPath(); ctx.ellipse(fcx - faceW * 0.25, fcy + faceH * 0.06, faceW * 0.08, faceH * 0.05, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(fcx + faceW * 0.25, fcy + faceH * 0.06, faceW * 0.08, faceH * 0.05, 0, 0, Math.PI * 2); ctx.fill();

    // Beard
    if (c.beard) {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < 150; i++) {
            const bx = fcx + (Math.random() - 0.5) * faceW * 0.5;
            const by = fcy + faceH * 0.12 + Math.random() * faceH * 0.22;
            if (Math.abs(bx - fcx) < faceW * 0.3) ctx.fillRect(bx, by, 1, 3);
        }
    }

    // Redness marks
    S.redness.forEach(r => {
        ctx.fillStyle = `rgba(255,30,30,${r.alpha})`;
        ctx.beginPath(); ctx.ellipse(r.x, r.y, r.size, r.size * 1.2, 0, 0, Math.PI * 2); ctx.fill();
    });

    // Sweat
    S.sweat.forEach(sw => {
        ctx.fillStyle = `rgba(100,200,255,${sw.alpha})`;
        ctx.beginPath(); ctx.ellipse(sw.x, sw.y, 3, 4.5, 0.7, 0, Math.PI * 2); ctx.fill();
    });

    ctx.restore();
}

// ============ HAND DRAWING ============
function drawHand(x, y, angle, scale) {
    if (!S.hand) return;
    const h = S.hand;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale * h.thick, scale);

    // Upper arm
    ctx.fillStyle = h.skinD;
    ctx.beginPath();
    ctx.moveTo(120, 60); ctx.lineTo(160, 60); ctx.lineTo(180, 0); ctx.lineTo(200, -180);
    ctx.lineTo(140, -180); ctx.lineTo(100, 0); ctx.closePath(); ctx.fill();

    // Forearm
    const fg = ctx.createLinearGradient(80, -20, 180, -20);
    fg.addColorStop(0, h.skin); fg.addColorStop(1, h.skinD);
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(80, 20); ctx.quadraticCurveTo(70, -20, 80, -60);
    ctx.lineTo(90, -120); ctx.lineTo(200, -140); ctx.lineTo(210, -60);
    ctx.quadraticCurveTo(210, 0, 200, 30); ctx.closePath(); ctx.fill();

    // Forearm highlight
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.ellipse(130, -50, 20, 50, 0.2, 0, Math.PI * 2); ctx.fill();

    // Arm hair
    if (h.hairy) {
        ctx.strokeStyle = 'rgba(60,40,20,0.3)'; ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
            const hx = 90 + Math.random() * 110;
            const hy = -120 + Math.random() * 130;
            const hl = 4 + Math.random() * 6;
            const ha = -0.5 + Math.random();
            ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(ha) * hl, hy + Math.sin(ha) * hl); ctx.stroke();
        }
    }

    // Wrist
    ctx.fillStyle = h.skin;
    ctx.beginPath(); ctx.ellipse(140, 30, 60, 20, 0, 0, Math.PI * 2); ctx.fill();

    // Palm
    const pg = ctx.createRadialGradient(130, 60, 10, 130, 70, 60);
    pg.addColorStop(0, lighten(h.skin, 10)); pg.addColorStop(1, h.skinD);
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.moveTo(80, 30); ctx.quadraticCurveTo(70, 50, 75, 80);
    ctx.quadraticCurveTo(80, 110, 100, 115);
    ctx.lineTo(180, 115); ctx.quadraticCurveTo(200, 110, 205, 80);
    ctx.quadraticCurveTo(210, 50, 200, 30); ctx.closePath(); ctx.fill();

    // Palm lines
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(90, 60); ctx.quadraticCurveTo(130, 55, 190, 65); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(95, 78); ctx.quadraticCurveTo(130, 73, 185, 80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(100, 95); ctx.quadraticCurveTo(130, 90, 170, 95); ctx.stroke();

    // Fingers
    const fingers = [
        { x: 95, y: 115, w: 16, h: 55, a: 0.15 },   // index
        { x: 120, y: 118, w: 16, h: 60, a: 0.05 },   // middle
        { x: 148, y: 117, w: 15, h: 55, a: -0.05 },  // ring
        { x: 174, y: 113, w: 14, h: 48, a: -0.15 },  // pinky
    ];
    fingers.forEach(f => {
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a);
        const ffg = ctx.createLinearGradient(0, 0, 0, f.h);
        ffg.addColorStop(0, h.skin); ffg.addColorStop(1, h.skinD);
        ctx.fillStyle = ffg;
        ctx.beginPath();
        ctx.roundRect(-f.w / 2, 0, f.w, f.h, f.w / 2); ctx.fill();
        // Joint lines
        ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-f.w / 3, f.h * 0.35); ctx.lineTo(f.w / 3, f.h * 0.35); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-f.w / 3, f.h * 0.6); ctx.lineTo(f.w / 3, f.h * 0.6); ctx.stroke();
        // Nail
        ctx.fillStyle = 'rgba(255,210,210,0.6)';
        ctx.beginPath(); ctx.roundRect(-f.w * 0.35, f.h - f.w * 0.8, f.w * 0.7, f.w * 0.7, [f.w * 0.2, f.w * 0.2, f.w * 0.1, f.w * 0.1]); ctx.fill();
        ctx.restore();
    });

    // Thumb
    ctx.save(); ctx.translate(70, 65); ctx.rotate(-0.6);
    const tfg = ctx.createLinearGradient(0, 0, 0, 50);
    tfg.addColorStop(0, h.skin); tfg.addColorStop(1, h.skinD);
    ctx.fillStyle = tfg;
    ctx.beginPath(); ctx.roundRect(-12, 0, 26, 50, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-6, 22); ctx.lineTo(8, 22); ctx.stroke();
    ctx.fillStyle = 'rgba(255,210,210,0.6)';
    ctx.beginPath(); ctx.roundRect(-7, 40, 16, 12, [5, 5, 3, 3]); ctx.fill();
    ctx.restore();

    // Knuckle shadows
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    fingers.forEach(f => { ctx.beginPath(); ctx.ellipse(f.x, f.y, f.w * 0.6, 4, f.a, 0, Math.PI * 2); ctx.fill(); });

    ctx.restore();
}

// ============ PARTICLES ============
function addParticles(x, y, power) {
    const emojis = ['⭐', '💥', '💫', '✨', '💦', '💢', '😵', '💨'];
    const n = Math.floor(power / 8) + 6;
    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 2 + Math.random() * power * 0.08;
        S.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 1, emoji: emojis[Math.floor(Math.random() * emojis.length)], size: 14 + Math.random() * power * 0.15 });
    }
}
function addDmgNum(x, y, val) {
    S.dmgNums.push({ x, y, val, life: 1, vy: -3 });
}

// ============ SOUND ============
let audioCtx = null;
function initAudio() { if (!audioCtx) try { audioCtx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { } }
function playSlap(power) {
    initAudio(); if (!audioCtx) return;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 200 - power * 0.8; o.type = 'triangle';
    const n = audioCtx.currentTime;
    g.gain.setValueAtTime(Math.min(power / 120, 0.8), n);
    g.gain.exponentialRampToValueAtTime(0.01, n + 0.15);
    o.start(n); o.stop(n + 0.15);
    setTimeout(() => {
        const o2 = audioCtx.createOscillator(), g2 = audioCtx.createGain(), f = audioCtx.createBiquadFilter();
        o2.connect(f); f.connect(g2); g2.connect(audioCtx.destination);
        o2.frequency.value = 60 + power * 0.5; o2.type = 'sawtooth';
        f.type = 'lowpass'; f.frequency.value = 150 + power * 3;
        const n2 = audioCtx.currentTime;
        g2.gain.setValueAtTime(Math.min(power / 100, 0.9), n2);
        g2.gain.exponentialRampToValueAtTime(0.01, n2 + 0.12);
        o2.start(n2); o2.stop(n2 + 0.12);
    }, 30);
}

// ============ GAME LOGIC ============
let W, H, faceCX, faceCY, faceW, faceH, running = false;

function resize() {
    W = canvas.width = canvas.clientWidth * devicePixelRatio;
    H = canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    W /= devicePixelRatio; H /= devicePixelRatio;
    faceW = Math.min(W * 0.55, H * 0.5, 320);
    faceH = faceW * 1.25;
    faceCX = W * 0.42; faceCY = H * 0.45;
    if (S.char) initMesh(faceCX, faceCY, faceW, faceH);
}

function startGame() {
    mainMenu.classList.add('hidden'); gameUI.classList.remove('hidden');
    S.slaps = 0; S.maxP = 0; S.combo = 0; S.exhaustion = 0;
    S.redness = []; S.sweat = []; S.particles = []; S.dmgNums = [];
    S.eyeSquint = 0; S.mouthOpen = 0; S.browAngle = 0;
    S.faceShake = { x: 0, y: 0, rot: 0, vx: 0, vy: 0, vr: 0 };
    S.slapAnim = 0; S.slapPhase = 0; S.isSlapping = false;
    S.handX = W * 0.8; S.handY = H * 0.7; S.handAngle = -0.3;
    slapCountEl.textContent = '0'; curPowerEl.textContent = '0'; comboCountEl.textContent = '0';
    resize(); running = true;
    requestAnimationFrame(gameLoop);
}

function calcPower(sx, sy, ex, ey, st, et) {
    const d = Math.hypot(ex - sx, ey - sy);
    const v = d / Math.max(et - st, 1);
    let p = Math.min(v * 30, 100);
    if (d > 80) p = Math.min(p * 1.2, 100);
    if (S.combo > 2) p = Math.min(p * (1 + S.combo * 0.04), 100);
    return Math.floor(p);
}

function doSlap(power, hitX, hitY) {
    if (S.isSlapping) return;
    S.isSlapping = true; S.slapAnim = 1; S.slapPhase = 0;

    // Combo
    const now = Date.now();
    S.combo = now - S.lastSlap < 2000 ? S.combo + 1 : 1;
    S.lastSlap = now;
    clearTimeout(S.comboT);
    S.comboT = setTimeout(() => { S.combo = 0; comboCountEl.textContent = '0'; }, 2500);

    S.slaps++; if (power > S.maxP) S.maxP = power;
    slapCountEl.textContent = S.slaps; curPowerEl.textContent = power; comboCountEl.textContent = S.combo;
    powerFill.style.width = power + '%';

    // Face shake
    const dir = hitX < faceCX ? 1 : -1;
    S.faceShake.vx = dir * power * 0.15;
    S.faceShake.vy = -power * 0.05;
    S.faceShake.vr = dir * power * 0.002;

    // Poke mesh (soft body)
    pokeMesh(hitX, hitY, power * 0.3, faceW * 0.4);

    // Face reactions
    S.eyeSquint = Math.min(power / 80, 1);
    S.mouthOpen = Math.min(power / 60, 1);
    S.browAngle = Math.min(power / 50, 1) * 4;

    // Redness
    S.redness.push({ x: hitX, y: hitY, size: 20 + power * 0.3, alpha: Math.min(power / 70, 0.7) });

    // Sweat
    if (power > 40) {
        for (let i = 0; i < Math.floor(power / 25) + 1; i++) {
            S.sweat.push({ x: faceCX - faceW * 0.3 + Math.random() * faceW * 0.6, y: faceCY - faceH * 0.35 + Math.random() * faceH * 0.15, vy: 0.3 + Math.random() * 0.5, alpha: 0.8 });
        }
    }

    // Particles
    addParticles(hitX, hitY, power);
    addDmgNum(hitX, hitY - 30, power);

    // Sound
    playSlap(power);

    // Hit text
    let txt = power < 30 ? 'PAT! 👋' : power < 60 ? 'TOKAT! 💥' : power < 85 ? 'ŞAMAR! 💢' : 'SÜPER TOKAT! ⭐';
    if (S.combo >= 3) txt = S.combo + 'x KOMBO! 🔥';
    if (S.combo >= 5) txt = S.combo + 'x ÇILDIRDI! 💀';
    hitText.textContent = txt; hitText.classList.remove('show'); void hitText.offsetWidth; hitText.classList.add('show');
    setTimeout(() => hitText.classList.remove('show'), 700);

    // Power text
    powerText.textContent = power < 30 ? 'Hafif... Daha sert! 💪' : power < 60 ? 'İyi tokat! 👊' : power < 85 ? 'Acıttı! 😱' : '🔥 EFSANE! 🔥';

    // Recovery
    setTimeout(() => {
        S.isSlapping = false;
        powerFill.style.width = '0%';
        setTimeout(() => { powerText.textContent = 'Yüze kaydır! 👋'; }, 800);
    }, 600);
}

// ============ GAME LOOP ============
let lastTime = 0;
function gameLoop(time) {
    if (!running) return;
    const dt = Math.min((time - lastTime) / 16.67, 3); lastTime = time;

    ctx.clearRect(0, 0, W, H);

    // BG
    const bgG = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
    bgG.addColorStop(0, '#1e1b3a'); bgG.addColorStop(1, '#0f0c29');
    ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);

    // Face shake physics
    const sh = S.faceShake;
    sh.vx += -sh.x * 0.08; sh.vy += -sh.y * 0.08; sh.vr += -sh.rot * 0.08;
    sh.vx *= 0.9; sh.vy *= 0.9; sh.vr *= 0.9;
    sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.rot += sh.vr * dt;

    // Face reactions decay
    S.eyeSquint *= 0.96; S.mouthOpen *= 0.97; S.browAngle *= 0.95;

    // Blink
    S.blinkTimer -= dt;
    if (S.blinkTimer <= 0) { S.blinkState = 1; S.blinkTimer = 80 + Math.random() * 120; }
    if (S.blinkState > 0) { S.blinkState -= dt * 0.15; if (S.blinkState < 0) S.blinkState = 0; }

    // Redness fade
    S.redness.forEach(r => r.alpha *= 0.995);
    S.redness = S.redness.filter(r => r.alpha > 0.02);

    // Sweat
    S.sweat.forEach(sw => { sw.y += sw.vy * dt; sw.alpha -= 0.008 * dt; });
    S.sweat = S.sweat.filter(sw => sw.alpha > 0);

    // Update mesh
    updateMesh();

    // Draw face
    ctx.save();
    ctx.translate(faceCX, faceCY); ctx.rotate(sh.rot); ctx.translate(-faceCX, -faceCY);
    drawFaceOnCanvas(S.char, faceCX, faceCY, faceW, faceH);
    ctx.restore();

    // Particles
    ctx.textAlign = 'center';
    S.particles.forEach(p => {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.15 * dt; p.life -= 0.02 * dt;
        if (p.life > 0) { ctx.globalAlpha = p.life; ctx.font = p.size + 'px serif'; ctx.fillText(p.emoji, p.x, p.y); ctx.globalAlpha = 1; }
    });
    S.particles = S.particles.filter(p => p.life > 0);

    // Damage numbers
    S.dmgNums.forEach(d => {
        d.y += d.vy * dt; d.vy -= 0.05 * dt; d.life -= 0.02 * dt;
        if (d.life > 0) {
            ctx.globalAlpha = d.life;
            ctx.font = `900 ${d.val > 75 ? 36 : 24}px Outfit`;
            ctx.fillStyle = d.val > 75 ? '#ffd700' : '#ff4444';
            ctx.fillText('-' + d.val, d.x, d.y);
            ctx.globalAlpha = 1;
        }
    });
    S.dmgNums = S.dmgNums.filter(d => d.life > 0);

    // Hand - smooth follow mouse
    const targetHX = S.mx + 60, targetHY = S.my + 80;
    S.handX += (targetHX - S.handX) * 0.15 * dt;
    S.handY += (targetHY - S.handY) * 0.15 * dt;
    const targetAngle = Math.atan2(S.my - H * 0.5, S.mx - W * 0.5) * 0.15 - 0.3;
    S.handAngle += (targetAngle - S.handAngle) * 0.1 * dt;

    // Slap animation
    let handDrawX = S.handX, handDrawY = S.handY, handScale = 0.5, handRot = S.handAngle;
    if (S.slapAnim > 0) {
        S.slapPhase += 0.08 * dt;
        if (S.slapPhase < 0.3) {
            // Wind up - pull back
            handDrawX += 40 * S.slapPhase / 0.3;
            handDrawY += 20 * S.slapPhase / 0.3;
            handRot += 0.4 * S.slapPhase / 0.3;
        } else if (S.slapPhase < 0.6) {
            // Strike forward
            const t = (S.slapPhase - 0.3) / 0.3;
            handDrawX += 40 - 180 * t;
            handDrawY += 20 - 80 * t;
            handRot += 0.4 - 1.0 * t;
            handScale = 0.5 + 0.15 * t;
        } else if (S.slapPhase < 1) {
            // Return
            const t = (S.slapPhase - 0.6) / 0.4;
            handDrawX += -140 + 140 * t;
            handDrawY += -60 + 60 * t;
            handRot += -0.6 + 0.6 * t;
            handScale = 0.65 - 0.15 * t;
        } else {
            S.slapAnim = 0;
        }
    }

    drawHand(handDrawX, handDrawY, handRot, handScale);

    requestAnimationFrame(gameLoop);
}

// ============ INPUT ============
function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] || e.changedTouches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
}

canvas.addEventListener('mousedown', e => {
    S.mouseDown = true; const p = getPos(e); S.msX = p.x; S.msY = p.y; S.msT = Date.now();
});
document.addEventListener('mousemove', e => {
    const p = getPos(e); S.mx = p.x; S.my = p.y;
    if (S.mouseDown) {
        const d = Math.hypot(p.x - S.msX, p.y - S.msY);
        const v = d / Math.max(Date.now() - S.msT, 1);
        powerFill.style.width = Math.min(v * 30, 100) + '%';
    }
});
document.addEventListener('mouseup', e => {
    if (!S.mouseDown) return; S.mouseDown = false;
    const p = getPos(e);
    const power = calcPower(S.msX, S.msY, p.x, p.y, S.msT, Date.now());
    if (power > 5) doSlap(power, p.x, p.y);
    else powerFill.style.width = '0%';
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault(); const p = getPos(e);
    S.touchSX = p.x; S.touchSY = p.y; S.touchST = Date.now();
    S.touchEX = p.x; S.touchEY = p.y; S.mx = p.x; S.my = p.y;
}, { passive: false });
canvas.addEventListener('touchmove', e => {
    e.preventDefault(); const p = getPos(e);
    S.touchEX = p.x; S.touchEY = p.y; S.mx = p.x; S.my = p.y;
    const pw = calcPower(S.touchSX, S.touchSY, p.x, p.y, S.touchST, Date.now());
    powerFill.style.width = pw + '%';
}, { passive: false });
canvas.addEventListener('touchend', e => {
    e.preventDefault();
    const pw = calcPower(S.touchSX, S.touchSY, S.touchEX, S.touchEY, S.touchST, Date.now());
    if (pw > 5) doSlap(pw, S.touchEX, S.touchEY);
    else powerFill.style.width = '0%';
}, { passive: false });

// ============ EVENTS ============
startBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', () => { running = false; gameUI.classList.add('hidden'); mainMenu.classList.remove('hidden'); });
window.addEventListener('resize', () => { if (running) resize(); });
document.addEventListener('click', () => initAudio(), { once: true });
document.addEventListener('touchstart', () => initAudio(), { once: true });

// ============ INIT ============
buildMenu();
console.log('🎮 Tokat Atma Oyunu hazır!');
