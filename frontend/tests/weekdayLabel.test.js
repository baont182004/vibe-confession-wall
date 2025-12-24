import test from 'node:test';
import assert from 'node:assert/strict';
import { weekdayLabelFromDateKey, buildOverlapMessage } from '../src/utils/weekdayLabel.js';

test('weekdayLabelFromDateKey maps VN weekdays correctly', () => {
  assert.equal(weekdayLabelFromDateKey('2025-12-26'), 'Thứ 6');
  assert.equal(weekdayLabelFromDateKey('2025-12-22'), 'Thứ 2');
  assert.equal(weekdayLabelFromDateKey('2025-12-28'), 'Chủ nhật');
});

test('buildOverlapMessage uses dateKey-based weekday label', () => {
  const message = buildOverlapMessage({
    dateKey: '2025-12-26',
    startTime: '07:30',
    endTime: '09:00',
  });
  assert.ok(message.includes('Thứ 6, 2025-12-26'));
});
