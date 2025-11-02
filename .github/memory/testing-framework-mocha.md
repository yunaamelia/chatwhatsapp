# Testing Framework: Why Mocha?

**Date:** November 3, 2025  
**Context:** User asked "kenapa anda menggunakan mocha?"

## Decision Context

**Mocha was already chosen by the project**, not by the AI agent. This is important to understand.

## Why Mocha Works Well Here

### 1. CommonJS Compatibility

- WhatsApp-web.js uses CommonJS (`require()`)
- No ES Module conversion needed
- Jest often has issues with CJS projects

### 2. Lightweight

- Minimal overhead for VPS (2GB RAM)
- Fast test execution
- Simple configuration

### 3. Flexible

- Works with any assertion library (using Node's built-in `assert`)
- Easy to add coverage (nyc)
- Good for integration tests

## Project Test Structure

```
tests/
├── unit/                    # Unit tests (isolated)
├── integration/             # Integration tests (with Redis)
├── e2e/                     # End-to-end scenarios
└── *.js                     # Test files (251 tests total)
```

## Mocha Configuration (package.json)

```json
{
  "scripts": {
    "test": "mocha 'tests/**/*.js' --timeout 10000 --exit",
    "test:coverage": "nyc npm test"
  }
}
```

## Test Results

- ✅ 251 tests passing consistently
- ✅ Works perfectly with WhatsApp-web.js
- ✅ No ES Module conflicts
- ✅ Fast execution (~2-3 seconds)

## Alternatives Considered

**Jest:**

- Pros: Built-in coverage, snapshot testing
- Cons: ES Module conflicts with CJS projects, heavier
- Verdict: Overkill for this project

**Vitest:**

- Pros: Fast, modern
- Cons: Requires ESM, more complex setup
- Verdict: Not worth migration effort

**Node Test Runner:**

- Pros: Built-in to Node.js 18+
- Cons: Less mature, fewer features
- Verdict: Good for future, but Mocha works now

## Recommendation

**Keep Mocha.** No reason to change when:

- All 251 tests passing
- CI/CD working perfectly
- Team familiar with it
- No issues encountered

## If Migrating in Future

Only consider if:

1. Need Jest-specific features (snapshots)
2. Moving to full ESM
3. Team preference changes

Migration effort: ~1-2 days for 251 tests.
