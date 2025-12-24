import test from 'node:test';
import assert from 'node:assert/strict';
import { format, startOfWeek } from 'date-fns';
import { getExpectedDayOfWeekFromDateKey, isDateKeyInWeek } from '../src/lib/weeklyPlanDate.js';
import { getCompletionPolicy } from '../src/lib/weeklyPlanPolicy.js';
import { computeNextStreakState } from '../src/services/streakService.js';

const WEEK_FORMAT = "RRRR-'W'II";

test('dateKey remains within week boundaries', () => {
  const base = new Date(2024, 0, 1); // 2024-01-01
  const weekId = format(startOfWeek(base, { weekStartsOn: 1 }), WEEK_FORMAT);

  assert.equal(getExpectedDayOfWeekFromDateKey('2024-01-01', weekId), 1);
  assert.equal(isDateKeyInWeek('2024-01-07', weekId), true);
  assert.equal(isDateKeyInWeek('2024-01-08', weekId), false);
});

test('completion policy enforces open/closed rules', () => {
  const open = getCompletionPolicy({
    isClosed: false,
    hasCompletedKey: true,
    nonCompletedKeys: [],
  });
  assert.equal(open.allowCompletionToggle, false);
  assert.equal(open.allowMutation, false);

  const closed = getCompletionPolicy({
    isClosed: true,
    hasCompletedKey: true,
    nonCompletedKeys: [],
  });
  assert.equal(closed.allowCompletionToggle, true);
  assert.equal(closed.allowMutation, false);
});

test('streak increments only on consecutive day', () => {
  const user = {
    currentStreak: 2,
    bestStreak: 3,
    lastQualifiedDateKey: '2024-01-01',
  };

  const continued = computeNextStreakState(user, '2024-01-02');
  assert.equal(continued.currentStreak, 3);
  assert.equal(continued.bestStreak, 3);
  assert.equal(continued.lastQualifiedDateKey, '2024-01-02');

  const reset = computeNextStreakState(user, '2024-01-04');
  assert.equal(reset.currentStreak, 1);
  assert.equal(reset.lastQualifiedDateKey, '2024-01-04');
});
