const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
const list = document.getElementById('habit-list');
const form = document.getElementById('habit-form');
const nameInput = document.getElementById('habit-name');

async function loadHabits() {
  const res = await fetch('/habits');
  const habits = await res.json();
  renderList(habits);
  drawSky(habits);
}

function renderList(habits) {
  list.innerHTML = '';
  habits.forEach((habit) => {
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.textContent = habit.name;

    const streak = document.createElement('span');
    streak.className = 'streak-badge';
    streak.textContent = `🔥 ${habit.streak}`;

    const button = document.createElement('button');
    button.className = 'mark-done';
    button.textContent = 'Mark done today';
    button.onclick = () => markDone(habit.id);

    const right = document.createElement('span');
    right.appendChild(streak);
    right.appendChild(button);

    li.appendChild(label);
    li.appendChild(right);
    list.appendChild(li);
  });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Small seeded PRNG so the decorative background starfield stays put across redraws.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Places habit stars along a gentle flowing curve (by creation order) instead of
// scattering them randomly, so the connecting lines read as one constellation.
function habitPosition(index, total, id, width, height) {
  const marginX = 70;
  const usableWidth = width - marginX * 2;
  const x = total <= 1 ? width / 2 : marginX + (usableWidth * index) / (total - 1);

  const jitter = (hashString(id) % 100) / 100 - 0.5; // -0.5..0.5, per-habit but stable
  const wave = Math.sin(index * 1.1) * height * 0.16;
  const y = height / 2 + wave + jitter * height * 0.12;

  return { x, y };
}

function drawBackgroundStars(width, height) {
  const rand = mulberry32(42);
  const count = Math.floor((width * height) / 4500);

  for (let i = 0; i < count; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const radius = rand() * 1.2 + 0.3;
    const opacity = rand() * 0.5 + 0.15;

    ctx.beginPath();
    ctx.fillStyle = `rgba(232, 232, 255, ${opacity})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGlowingStar(x, y, radius, glowColor) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
  glow.addColorStop(0, glowColor);
  glow.addColorStop(1, 'rgba(255, 224, 102, 0)');

  ctx.beginPath();
  ctx.fillStyle = glow;
  ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = '#fff8e0';
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSky(habits) {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  drawBackgroundStars(width, height);

  const positions = habits.map((habit, index) => ({
    habit,
    ...habitPosition(index, habits.length, habit.id, width, height),
  }));

  // Flowing constellation line through every star with an active streak.
  ctx.strokeStyle = 'rgba(255, 224, 102, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  let started = false;
  positions.forEach(({ habit, x, y }) => {
    if (habit.streak <= 0) return;
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  });
  if (started) ctx.stroke();

  positions.forEach(({ habit, x, y }) => {
    const brightness = Math.min(1, 0.55 + habit.streak * 0.08);
    const radius = Math.min(6, 2 + habit.streak * 0.6);

    drawGlowingStar(x, y, radius, `rgba(255, 224, 102, ${brightness})`);

    ctx.fillStyle = '#e8e8ff';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(habit.name, x, y + radius * 4 + 16);
  });
}

async function markDone(id) {
  await fetch(`/habits/${id}/done`, { method: 'POST' });
  loadHabits();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  await fetch('/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  nameInput.value = '';
  loadHabits();
});

loadHabits();
