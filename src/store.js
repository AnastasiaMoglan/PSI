const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'habits.json');

function readHabits() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
  return raw ? JSON.parse(raw) : [];
}

function writeHabits(habits) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(habits, null, 2));
}

module.exports = { readHabits, writeHabits, DATA_FILE };
