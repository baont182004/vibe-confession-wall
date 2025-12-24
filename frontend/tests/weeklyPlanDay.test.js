import test from 'node:test';
import assert from 'node:assert/strict';
import { getDayIndex } from '../src/utils/weeklyPlanDay.js';

test('maps dayOfWeek to Monday-based index', () => {
  assert.equal(getDayIndex(1), 0);
  assert.equal(getDayIndex(2), 1);
  assert.equal(getDayIndex(7), 6);
});

test('accepts zero-based day index', () => {
  assert.equal(getDayIndex(0), 0);
  assert.equal(getDayIndex(6), 6);
});
