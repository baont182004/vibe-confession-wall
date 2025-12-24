import test from 'node:test';
import assert from 'node:assert/strict';
import { getLocalDateKey, parseDateKeyLocal, shiftDateKey } from '../src/lib/dateKey.js';

test('getLocalDateKey respects timezone boundaries', () => {
  const date = new Date(Date.UTC(2024, 0, 1, 20, 30, 0)); // 2024-01-02 03:30 in UTC+7
  const key = getLocalDateKey(date, 'Asia/Ho_Chi_Minh');
  assert.equal(key, '2024-01-02');
});

test('parseDateKeyLocal returns a valid Date for date keys', () => {
  const parsed = parseDateKeyLocal('2024-12-31');
  assert.ok(parsed instanceof Date);
  assert.equal(parsed.getFullYear(), 2024);
  assert.equal(parsed.getMonth(), 11);
  assert.equal(parsed.getDate(), 31);
});

test('shiftDateKey shifts date keys by calendar days', () => {
  assert.equal(shiftDateKey('2024-01-01', 1), '2024-01-02');
  assert.equal(shiftDateKey('2024-01-01', -1), '2023-12-31');
});
