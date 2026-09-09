const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { readHabits, writeHabits } = require('./src/store');
const { markHabitDone, todayStr } = require('./src/streak');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/habits', (req, res) => {
  res.json(readHabits());
});

app.post('/habits', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const habits = readHabits();
  const habit = { id: crypto.randomUUID(), name: name.trim(), streak: 0, lastDoneDate: null };
  habits.push(habit);
  writeHabits(habits);

  res.status(201).json(habit);
});

app.post('/habits/:id/done', (req, res) => {
  const habits = readHabits();
  const index = habits.findIndex((h) => h.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'habit not found' });
  }

  habits[index] = markHabitDone(habits[index], todayStr());
  writeHabits(habits);

  res.json(habits[index]);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Starlog running at http://localhost:${PORT}`);
  });
}

module.exports = app;
