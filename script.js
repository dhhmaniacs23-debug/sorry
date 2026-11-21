/* ── References ─────────────────────────────── */
const meterTrack   = document.getElementById('meterTrack');
const meterFill    = document.getElementById('meterFill');
const meterHandle  = document.getElementById('meterHandle');
const meterNum     = document.getElementById('meterNum');
const meterMsg     = document.getElementById('meterMsg');
const meterSection = document.getElementById('meterSection');
const meterCenter  = document.getElementById('meterCenter');
const splitLayout  = document.getElementById('splitLayout');
const flashOverlay = document.getElementById('flashOverlay');
const confettiContainer = document.getElementById('confettiContainer');
const emojiLayer   = document.getElementById('emojiLayer');
const wordSection  = document.getElementById('wordSection');
const dogSection   = document.getElementById('dogSection');

const lO    = document.getElementById('lO');
const lR1   = document.getElementById('lR1');
const lFour = document.getElementById('lFour');

/* ── State ──────────────────────────────────── */
let isDragging = false;
let breached   = false;

/* ── Floating sad emojis (gentle rate tied to meter) */
const SAD_EMOJIS   = ['😢', '😔', '🥺', '😭', '😿'];
const HAPPY_EMOJIS = ['😊', '😄', '🥰', '😍', '😁', '❤️', '💕', '💗'];
let currentEmojis = SAD_EMOJIS;
const MAX_EMOJIS = 10;
let activeEmojis  = 0;
let emojiTimer    = null;
let emojiCurrentMs = 0;

function spawnEmoji() {
  if (activeEmojis >= MAX_EMOJIS) return;
  activeEmojis++;
  const el = document.createElement('div');
  el.className      = 'float-emoji';
  el.textContent    = currentEmojis[Math.floor(Math.random() * currentEmojis.length)];
  el.style.left     = (4 + Math.random() * 92) + '%';
  el.style.fontSize = (14 + Math.random() * 14) + 'px';
  const dur = 4 + Math.random() * 4;
  el.style.animationDuration = dur + 's';
  emojiLayer.appendChild(el);
  setTimeout(() => { el.remove(); activeEmojis--; }, dur * 1000 + 300);
}

function setEmojiRate(p) {
  // Gentle increase: 1300ms → 950 → 700 → 500. No bursts, no chaos.
  const ms = p < 30 ? 1300 :
             p < 60 ? 950  :
             p < 85 ? 700  : 500;
  if (ms === emojiCurrentMs) return;
  emojiCurrentMs = ms;
  if (emojiTimer) clearInterval(emojiTimer);
  emojiTimer = setInterval(spawnEmoji, ms);
}

setEmojiRate(0);
spawnEmoji();

/* ── Messages ───────────────────────────────── */
const MSGS = [
  'pull it up ↑',
  'more... ↑',
  'keep going... ↑',
  'still more... ↑',
  'way more... ↑',
  'almost there... ↑',
];
function msgForPct(p) {
  if (p <= 0)  return MSGS[0];
  if (p < 20)  return MSGS[1];
  if (p < 40)  return MSGS[2];
  if (p < 60)  return MSGS[3];
  if (p < 80)  return MSGS[4];
  return MSGS[5];
}

/* ── Apply meter value ──────────────────────── */
function applyPct(p) {
  p = Math.max(0, Math.min(100, p));
  meterFill.style.height   = p + '%';
  meterHandle.style.bottom = p + '%';
  meterNum.textContent     = Math.round(p);

  if (p < 40)      meterNum.style.color = '#43e97b';
  else if (p < 75) meterNum.style.color = '#fa8231';
  else             meterNum.style.color = '#e84393';

  setEmojiRate(p);

  const msg = msgForPct(p);
  if (meterMsg.textContent !== msg) {
    meterMsg.style.opacity = '0';
    setTimeout(() => { meterMsg.textContent = msg; meterMsg.style.opacity = '1'; }, 140);
  }
}

/* ── Pointer → percentage ───────────────────── */
function pctFrom(e) {
  const rect    = meterTrack.getBoundingClientRect();
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return (1 - (clientY - rect.top) / rect.height) * 100;
}

/* ── Drag handlers ──────────────────────────── */
meterTrack.addEventListener('pointerdown', (e) => {
  if (breached) return;
  isDragging = true;
  meterTrack.classList.add('dragging');
  meterTrack.setPointerCapture(e.pointerId);
  applyPct(pctFrom(e));
});
meterTrack.addEventListener('pointermove', (e) => {
  if (!isDragging || breached) return;
  const p = pctFrom(e);
  applyPct(p);
  if (p >= 100) triggerBreakthrough();
});
meterTrack.addEventListener('pointerup', () => {
  isDragging = false;
  meterTrack.classList.remove('dragging');
});

/* ── Breakthrough ───────────────────────────── */
function triggerBreakthrough() {
  if (breached) return;
  breached = true;
  isDragging = false;
  meterTrack.classList.remove('dragging');
  applyPct(100);
  meterNum.textContent = '???';
  meterNum.style.color = '#e84393';

  // Shake, then vanish
  meterSection.classList.add('shaking');
  setTimeout(() => {
    meterSection.classList.remove('shaking');
    meterCenter.classList.add('vanish');
  }, 560);

  // Flash screen
  flashOverlay.classList.add('on');
  setTimeout(() => flashOverlay.classList.remove('on'), 180);

  // Fade out the message cleanly
  meterMsg.style.opacity = '0';

  // Wait for meter to fully vanish (shake 560ms + vanish 500ms) then show split
  setTimeout(showSplit, 1150);
}

/* ── Show split layout ──────────────────────── */
function showSplit() {
  splitLayout.style.display = 'flex';
  // Small timeout is more reliable than getBoundingClientRect for triggering transition
  setTimeout(() => {
    splitLayout.classList.add('visible');
    // Start flash after columns have slid in (~0.9s + 0.18s delay = ~1.1s)
    setTimeout(startFlash, 1200);
  }, 20);
}

/* ── SORRY ↔ SIRI flash ─────────────────────── */
function setSorry() {
  lO.classList.remove('gone');
  lR1.classList.remove('is-siri');
  lFour.classList.remove('is-siri');
  wordSection.classList.remove('is-siri-mode');
}
function setSiri() {
  lO.classList.add('gone');
  lR1.classList.add('is-siri');
  lFour.classList.add('is-siri');
  wordSection.classList.add('is-siri-mode');
}

function startFlash() {
  // Start on SORRY, flip every 1 second indefinitely (readable)
  setSorry();
  let isSiri = false;

  setInterval(() => {
    isSiri = !isSiri;
    if (isSiri) setSiri();
    else        setSorry();
  }, 1000);

  // Dog appears after 3 flips so she's seen both states
  setTimeout(showDog, 3200);
}

/* ── Dog section ────────────────────────────── */
function showDog() {
  dogSection.classList.add('visible');
  setupDrag();
}

/* ── Drag & drop heart ──────────────────────── */
function setupDrag() {
  const heart    = document.getElementById('heart');
  const dogDrop  = document.getElementById('dogDrop');
  const dogImg   = document.getElementById('dogImg');
  const happyMsg = document.getElementById('happyMsg');
  let   dropped  = false;

  function handleDrop() {
    if (dropped) return;
    dropped = true;
    heart.style.display = 'none';
    dogDrop.classList.remove('drag-over');
    dogImg.src = 'https://media1.tenor.com/m/Fycny4Yvaw4AAAAd/fakesmile.gif';
    dogImg.style.transform = 'scale(1.08)';
    setTimeout(() => { dogImg.style.transform = ''; }, 350);
    happyMsg.classList.add('show');
    currentEmojis = HAPPY_EMOJIS;
    if (emojiTimer) clearInterval(emojiTimer);
    emojiTimer = setInterval(spawnEmoji, 400);
    for (let i = 0; i < 5; i++) setTimeout(spawnEmoji, i * 80);
    spawnConfetti();
  }

  heart.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'heart');
    setTimeout(() => heart.classList.add('dragging'), 0);
  });
  heart.addEventListener('dragend',   () => heart.classList.remove('dragging'));
  dogDrop.addEventListener('dragover',  (e) => { e.preventDefault(); dogDrop.classList.add('drag-over'); });
  dogDrop.addEventListener('dragleave', ()  => dogDrop.classList.remove('drag-over'));
  dogDrop.addEventListener('drop',      (e) => { e.preventDefault(); handleDrop(); });

  let clone = null;
  heart.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    clone = heart.cloneNode(true);
    clone.style.cssText = `position:fixed;left:${t.clientX-30}px;top:${t.clientY-30}px;
      pointer-events:none;z-index:1000;animation:none;opacity:0.85;font-size:inherit;`;
    document.body.appendChild(clone);
    heart.classList.add('dragging');
  }, { passive: true });
  heart.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if (clone) { clone.style.left=(t.clientX-30)+'px'; clone.style.top=(t.clientY-30)+'px'; }
    const r = dogDrop.getBoundingClientRect();
    dogDrop.classList.toggle('drag-over',
      t.clientX>r.left && t.clientX<r.right && t.clientY>r.top && t.clientY<r.bottom);
  }, { passive: false });
  heart.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    clone?.remove(); clone = null;
    heart.classList.remove('dragging');
    dogDrop.classList.remove('drag-over');
    const r = dogDrop.getBoundingClientRect();
    if (t.clientX>r.left && t.clientX<r.right && t.clientY>r.top && t.clientY<r.bottom)
      handleDrop();
  });
}

/* ── Confetti ───────────────────────────────── */
function spawnConfetti() {
  const C = ['#e84393','#fa8231','#43e97b','#c0392b','#9b59b6','#3498db','#f1c40f'];
  for (let i = 0; i < 55; i++) {
    const p = document.createElement('div');
    const s = 7 + Math.random() * 11;
    p.className = 'confetti-piece';
    p.style.cssText = `left:${Math.random()*100}%;width:${s}px;height:${s}px;
      background:${C[Math.floor(Math.random()*C.length)]};
      border-radius:${Math.random()>0.45?'50%':'3px'};
      animation-delay:${(Math.random()*0.4).toFixed(2)}s;
      animation-duration:${(0.9+Math.random()*0.9).toFixed(2)}s;`;
    confettiContainer.appendChild(p);
    setTimeout(() => p.remove(), 2600);
  }
}
