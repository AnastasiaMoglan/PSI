function todayStr(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(dateStrA, dateStrB) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(dateStrB) - new Date(dateStrA)) / msPerDay);
}

// Pure function: given a habit and "today", returns the updated habit after marking it done.
function markHabitDone(habit, today = todayStr()) {
  if (habit.lastDoneDate === today) {
    return habit; // already marked done today, no change
  }

  const diff = habit.lastDoneDate ? daysBetween(habit.lastDoneDate, today) : null;
  const newStreak = diff === 1 ? habit.streak + 1 : 1;

  return { ...habit, streak: newStreak, lastDoneDate: today };
}

module.exports = { todayStr, daysBetween, markHabitDone };
