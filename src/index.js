// Public entry point for timestamp-monotonicity-checker.
//
// Keeping the barrel file separate from the core lets tests import the core
// directly while consumers get a stable, documented surface.

export { checkMonotonic, isMonotonic } from './core.js';
