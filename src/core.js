// Core implementation of the timestamp monotonicity checker.
//
// A timestamp sequence is non-decreasing when every element is >= the one
// before it. The checker reports the FIRST violation it finds, along with the
// index of the offending element and the index of its predecessor. Reporting
// only the first violation keeps the API small and makes the result easy to
// act on: fix the earliest break and re-run.
//
// Timestamps are compared with JavaScript's `<` operator. We deliberately do
// NOT coerce strings, Dates, or BigInts: mixing types is a caller bug, and
// silently coercing would hide it. Callers who have epoch numbers should pass
// numbers; callers with ISO strings should parse them first. This is the one
// interpretation we picked, and the README states it plainly.

/**
 * @typedef {Object} Violation
 * @property {number} index        Index of the element that broke monotonicity.
 * @property {number} previousIndex Index of its immediate predecessor.
 * @property {number|string} value  The offending element.
 * @property {number|string} previous The predecessor element.
 */

/**
 * @typedef {Object} CheckResult
 * @property {boolean} ok          True when the whole sequence is non-decreasing.
 * @property {Violation|null} violation The first violation, or null when ok.
 */

/**
 * Check whether a sequence of timestamps is non-decreasing.
 *
 * Returns a result object rather than throwing: an out-of-order timestamp is
 * data, not an exceptional condition, and callers usually want to log or
 * repair it rather than unwind the stack.
 *
 * @param {Array<number|string>} timestamps
 * @returns {CheckResult}
 */
export function checkMonotonic(timestamps) {
  if (!Array.isArray(timestamps)) {
    throw new TypeError('timestamps must be an array');
  }
  for (let i = 1; i < timestamps.length; i++) {
    const previous = timestamps[i - 1];
    const value = timestamps[i];
    if (!(previous <= value)) {
      // `!(a <= b)` is used instead of `a > b` so that NaN is treated as a
      // violation. A NaN timestamp is almost always a parsing bug, and
      // silently accepting it would let corrupt data through.
      return {
        ok: false,
        violation: {
          index: i,
          previousIndex: i - 1,
          value,
          previous,
        },
      };
    }
  }
  return { ok: true, violation: null };
}

/**
 * Convenience predicate for callers who only need a yes/no answer.
 *
 * @param {Array<number|string>} timestamps
 * @returns {boolean}
 */
export function isMonotonic(timestamps) {
  return checkMonotonic(timestamps).ok;
}
