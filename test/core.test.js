import test from 'node:test';
import assert from 'node:assert/strict';

import { checkMonotonic, isMonotonic } from '../src/index.js';

test('empty sequence is monotonic', () => {
  assert.deepEqual(checkMonotonic([]), { ok: true, violation: null });
  assert.equal(isMonotonic([]), true);
});

test('single element is monotonic', () => {
  assert.deepEqual(checkMonotonic([42]), { ok: true, violation: null });
  assert.equal(isMonotonic([42]), true);
});

test('strictly increasing sequence is monotonic', () => {
  assert.deepEqual(checkMonotonic([1, 2, 3, 4]), { ok: true, violation: null });
  assert.equal(isMonotonic([1, 2, 3, 4]), true);
});

test('equal adjacent values are allowed', () => {
  assert.deepEqual(checkMonotonic([5, 5, 5]), { ok: true, violation: null });
  assert.equal(isMonotonic([5, 5, 5]), true);
});

test('reports the first violation with its predecessor', () => {
  const result = checkMonotonic([1, 3, 2, 0]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.violation, {
    index: 2,
    previousIndex: 1,
    value: 2,
    previous: 3,
  });
  assert.equal(isMonotonic([1, 3, 2, 0]), false);
});

test('reports a decrease at the very start', () => {
  const result = checkMonotonic([10, 9]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.violation, {
    index: 1,
    previousIndex: 0,
    value: 9,
    previous: 10,
  });
});

test('reports a decrease at the very end', () => {
  const result = checkMonotonic([1, 2, 3, 2]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.violation, {
    index: 3,
    previousIndex: 2,
    value: 2,
    previous: 3,
  });
});

test('NaN is treated as a violation', () => {
  const result = checkMonotonic([1, NaN, 3]);
  assert.equal(result.ok, false);
  assert.equal(result.violation.index, 1);
  assert.equal(result.violation.previousIndex, 0);
  assert.ok(Number.isNaN(result.violation.value));
  assert.equal(result.violation.previous, 1);
});

test('string timestamps compare lexicographically', () => {
  assert.deepEqual(checkMonotonic(['a', 'b', 'c']), { ok: true, violation: null });
  const result = checkMonotonic(['a', 'c', 'b']);
  assert.equal(result.ok, false);
  assert.deepEqual(result.violation, {
    index: 2,
    previousIndex: 1,
    value: 'b',
    previous: 'c',
  });
});

test('non-array input throws TypeError', () => {
  assert.throws(() => checkMonotonic('not an array'), TypeError);
  assert.throws(() => checkMonotonic(null), TypeError);
  assert.throws(() => checkMonotonic(undefined), TypeError);
});

test('does not mutate the input array', () => {
  const input = [1, 3, 2];
  const copy = input.slice();
  checkMonotonic(input);
  assert.deepEqual(input, copy);
});
