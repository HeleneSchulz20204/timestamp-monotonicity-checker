# timestamp-monotonicity-checker

Validates that a sequence of timestamps is non-decreasing and reports the first
violation along with its predecessor.

## Usage

```js
import { checkMonotonic, isMonotonic } from './src/index.js';

const result = checkMonotonic([1_000, 1_010, 1_005, 1_020]);
if (!result.ok) {
  const { index, previousIndex, value, previous } = result.violation;
  console.error(
    `timestamp at index ${index} (${value}) is less than its predecessor ` +
    `at index ${previousIndex} (${previous})`
  );
}

isMonotonic([1, 2, 2, 3]); // true
```

## Why this exists

Event streams, log shippers, and test fixtures routinely carry timestamps that
are supposed to be ordered. When one is out of order, the usual debugging loop
is a hand-written scan that stops at the first `a[i] < a[i-1]` and then a
second scan to find the predecessor. This library packages that scan in one
place so the error message is consistent and the comparison rule is explicit.

The trade-off: `checkMonotonic` returns a result object instead of throwing.
An out-of-order timestamp is almost always data to be logged or repaired, not
an exceptional condition, and callers on hot paths should not pay for stack
unwinding. Callers who want a boolean can use `isMonotonic`.

## The awkward edge

Comparison uses JavaScript's `<` operator, so the sequence must be homogeneous.
Numbers compare numerically, strings compare lexicographically, and `NaN` is
always a violation because `!(a <= b)` is true when either side is `NaN`. The
library deliberately does not coerce strings to numbers or `Date` objects to
epoch values; mixing types in one sequence is a caller bug and coercing would
hide it. Parse your timestamps before calling.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

