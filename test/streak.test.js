const { markHabitDone, daysBetween } = require('../src/streak');

describe('markHabitDone', () => {
  const baseHabit = { id: '1', name: 'Read', streak: 0, lastDoneDate: null };

  test('first time done sets streak to 1', () => {
    const result = markHabitDone(baseHabit, '2026-01-01');
    expect(result.streak).toBe(1);
    expect(result.lastDoneDate).toBe('2026-01-01');
  });

  test('consecutive day increases streak', () => {
    const habit = { ...baseHabit, streak: 3, lastDoneDate: '2026-01-01' };
    const result = markHabitDone(habit, '2026-01-02');
    expect(result.streak).toBe(4);
    expect(result.lastDoneDate).toBe('2026-01-02');
  });

  test('marking done twice on the same day does not change the streak', () => {
    const habit = { ...baseHabit, streak: 2, lastDoneDate: '2026-01-01' };
    const result = markHabitDone(habit, '2026-01-01');
    expect(result.streak).toBe(2);
    expect(result).toEqual(habit);
  });

  test('missing a day resets the streak to 1, not 0', () => {
    const habit = { ...baseHabit, streak: 5, lastDoneDate: '2026-01-01' };
    const result = markHabitDone(habit, '2026-01-05');
    expect(result.streak).toBe(1);
    expect(result.lastDoneDate).toBe('2026-01-05');
  });

  test('the habit itself is never deleted after a missed day', () => {
    const habit = { ...baseHabit, streak: 5, lastDoneDate: '2026-01-01' };
    const result = markHabitDone(habit, '2026-02-01');
    expect(result.id).toBe(habit.id);
    expect(result.name).toBe(habit.name);
  });
});

describe('daysBetween', () => {
  test('computes whole-day difference between two ISO dates', () => {
    expect(daysBetween('2026-01-01', '2026-01-02')).toBe(1);
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0);
    expect(daysBetween('2026-01-01', '2026-01-10')).toBe(9);
  });
});
