import test from 'node:test';
import assert from 'node:assert/strict';
import { groupItemsByDateKey, hasOverlapForDateKey } from '../src/utils/weeklyPlanItems.js';

test('groupItemsByDateKey groups items by matching dateKey', () => {
  const weekDateKeys = [
    '2025-12-22',
    '2025-12-23',
    '2025-12-24',
    '2025-12-25',
    '2025-12-26',
    '2025-12-27',
    '2025-12-28',
  ];
  const items = [
    { _id: 'a', dateKey: '2025-12-25', startTime: '09:00', endTime: '10:00' },
    { _id: 'b', dateKey: '2025-12-24', startTime: '14:00', endTime: '15:00' },
    { _id: 'c', dateKey: '2025-12-30', startTime: '09:00', endTime: '10:00' },
  ];

  const grouped = groupItemsByDateKey(items, weekDateKeys);
  assert.equal(grouped.length, 7);
  assert.equal(grouped[3].map((item) => item._id).join(','), 'a');
  assert.equal(grouped[2].map((item) => item._id).join(','), 'b');
  assert.equal(grouped[0].length, 0);
});

test('hasOverlapForDateKey checks overlap only within selected dateKey', () => {
  const items = [
    { _id: '1', dateKey: '2025-12-25', startTime: '09:00', endTime: '10:00' },
    { _id: '2', dateKey: '2025-12-25', startTime: '10:00', endTime: '11:00' },
    { _id: '3', dateKey: '2025-12-26', startTime: '09:30', endTime: '10:30' },
  ];

  assert.equal(hasOverlapForDateKey(items, '2025-12-25', 9 * 60 + 30, 10 * 60 + 30), true);
  assert.equal(hasOverlapForDateKey(items, '2025-12-26', 8 * 60, 9 * 60), false);
  assert.equal(hasOverlapForDateKey(items, '2025-12-25', 9 * 60 + 30, 10 * 60 + 30, '1'), true);
  assert.equal(hasOverlapForDateKey(items, '2025-12-25', 8 * 60, 9 * 60, '1'), false);
});
