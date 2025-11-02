# GitHub Workflows Rules & Requirements

**Purpose:** Critical CI/CD rules that MUST be followed to pass GitHub Actions workflows

---

## 📋 Quick Reference

**CRITICAL RULES:**
1. **File size limit:** Max 700 lines per .js file in `src/`
2. **No hardcoded secrets:** No `xnd_production`, hardcoded passwords
3. **ESLint clean:** 0 errors required, warnings acceptable
4. **No circular dependencies:** Check with madge
5. **Tests must pass:** All unit tests must pass (251 tests)

---

## 🔍 Quick Scan Job (< 5 minutes) - BLOCKING

### 1. Linter Check ✅
```bash
npm run lint
```
- **Rule:** 0 errors required
- **Warning:** Warnings acceptable but create workflow warnings
- **Fix:** Run `npm run lint` locally before push
- **Common issues:**
  * Unused variables (prefix with `_` if intentional)
  * Duplicate identifiers
  * Missing semicolons (if configured)

### 2. Secrets Check 🔐 - CRITICAL
```bash
grep -r "xnd_production" . --exclude-dir=node_modules
grep -r "password.*=.*['\"]" .
```
- **Rule:** NO production secrets in code
- **Allowed:** Test secrets (xnd_development, xnd_test)
- **Allowed:** Environment variable references (process.env.*)
- **Fix:** Move secrets to .env file
- **Blocks:** Push if production secrets found

### 3. File Size Check 📏 - CRITICAL
```bash
find src -name "*.js" -exec wc -l {} \; | awk '$1 > 700'
```
- **Rule:** Max 700 lines per JavaScript file in `src/`
- **Why:** Enforce modular architecture, maintainability
- **Fix:** Split large files into smaller modules (see Phase 34 example)
- **Pattern:** Extract related methods into separate handlers/services
- **Example violation:** AdminHandler.js was 885 lines → split to 686 lines

**How to split:**
1. Identify logical groupings (inventory, reporting, etc.)
2. Create new handler extending BaseHandler
3. Move methods to new handler
4. Update main handler to delegate
5. Update tests (add async methods to mocks)

### 4. Circular Dependencies 🔄
```bash
npx madge --circular --extensions js src/
```
- **Rule:** No circular dependencies
- **Fix:** Restructure imports, use dependency injection
- **Pattern:** Use DependencyContainer for service management

---

## 🧐 Deep Review Job (< 15 minutes) - NON-BLOCKING

### 1. Code Complexity
- **Tool:** complexity-report
- **Warning only:** High complexity triggers warning
- **Best practice:** Keep cyclomatic complexity < 15

### 2. Unused Dependencies
- **Tool:** depcheck
- **Warning only:** Suggests cleanup
- **Fix:** `npm uninstall <package>`

### 3. JSDoc Coverage
- **Rule soft:** > 50 functions without JSDoc triggers warning
- **Best practice:** Document public APIs

### 4. Naming Conventions
- **Rule:** Use camelCase for function names
- **Violation:** snake_case function names
- **Fix:** Rename to camelCase

---

## 🧪 Testing Suite (< 20 minutes) - BLOCKING ON ERRORS

### 1. Unit Tests
```bash
npm test
```
- **Rule:** All tests must pass
- **Current:** 251 tests passing
- **Fix:** Debug failing tests before push
- **Common issues:**
  * Async method mocks (must return promises)
  * Missing mock methods (getStep, setData, getData)
  * Session manager compatibility

### 2. Coverage Threshold
- **Soft rule:** 70% coverage minimum
- **Warning only:** Below threshold triggers warning
- **Best practice:** Add tests for new features

### 3. Multi-node Testing
- **Versions:** Node 18, Node 20
- **Rule:** Tests must pass on both versions
- **ES Module compatibility:** May skip on GitHub runners

---

## 🔒 Security Audit (< 10 minutes) - NON-BLOCKING

### 1. NPM Audit
```bash
npm audit --audit-level=moderate
```
- **Rule:** Moderate+ vulnerabilities trigger warning
- **Action:** Update vulnerable packages
- **Command:** `npm audit fix`

### 2. Secret Scanning (TruffleHog)
- **Tool:** trufflesecurity/trufflehog
- **Scans:** Entire codebase for leaked secrets
- **Action:** Remove secrets if found

### 3. Security Best Practices
**Forbidden patterns:**
- `eval()` usage → Security risk ❌
- `process.env.VAR` without fallback → Warning ⚠️
- SQL injection patterns (`SELECT.*\${`) → Critical ❌

**Example violation:**
```javascript
// ❌ BAD
const apiKey = "xnd_production_12345";
const query = `SELECT * FROM users WHERE id=${userId}`;

// ✅ GOOD
const apiKey = process.env.XENDIT_SECRET_KEY || "";
const query = `SELECT * FROM users WHERE id=?`;
```

---

## 🐛 Bug Detection (< 10 minutes) - NON-BLOCKING

### 1. Unawaited Promises
- **Pattern:** Async calls without `await` or `return`
- **Warning:** May cause race conditions
- **Fix:** Add `await` or `.catch()`

### 2. Missing Error Handling
- **Pattern:** Async functions without try-catch
- **Warning:** Unhandled promise rejections
- **Fix:** Wrap in try-catch or use .catch()

### 3. Memory Leaks
- **Pattern:** `setInterval` without `clearInterval`
- **Warning:** Potential memory leak
- **Fix:** Store interval ID, clear on cleanup

### 4. Null Pointer Errors
- **Pattern:** Property access without null check
- **Warning:** May throw TypeError
- **Fix:** Use optional chaining (`?.`) or null checks

---

## ⚡ Performance Analysis (< 10 minutes) - NON-BLOCKING

### 1. Bundle Size
- **Warning threshold:** Source code > 1MB
- **Action:** Review large dependencies
- **Tool:** `du -sh src/`

### 2. Large Files
- **Warning:** Files > 100KB
- **Action:** Review necessity, consider splitting
- **Exception:** Test data, fixtures

---

## 📋 Workflow Summary (PR Comments)

### Success Rate Grading
- **A (90-100%):** 🌟 Excellent - Ready to merge
- **B (80-89%):** ✅ Good - Minor issues
- **C (70-79%):** ⚠️ Fair - Needs attention
- **D (<70%):** ❌ Poor - Major issues

### PR Comment Structure
```markdown
## 🤖 AI Agent Code Review Report

### 📊 Overall Status
- Success Rate: X% (Y/Z checks passed)
- Grade: A/B/C/D

### 🔍 Check Results
| Check | Status | Description |
|-------|--------|-------------|
| Quick Scan | ✅/❌ | Linting, secrets, file sizes |
| Deep Review | ✅/❌ | Code quality, complexity |
| Testing | ✅/❌ | Unit tests, coverage |
| Security | ✅/❌ | Vulnerabilities, audit |
| Bug Detection | ✅/❌ | Pattern analysis |
```

---

## 🚀 CI/CD Pipeline (Self-Hosted Runner)

### Test Job
```yaml
steps:
  - npm ci
  - npm run lint || true  # Non-blocking
  - npm test              # BLOCKING
  - npm run test:integration || true  # Non-blocking
  - redis-cli ping        # Check Redis connectivity
  - npm run coverage || true  # Non-blocking
```

### Deploy Job (main branch only)
```yaml
if: github.ref == 'refs/heads/main'
steps:
  - pm2 restart whatsapp-shop || pm2 start index.js
  - pm2 save
  - Check bot status
  - Send notification
```

**Deployment triggers:**
- Push to `main` branch
- After tests pass
- Self-hosted runner only

---

## 📝 Pre-Push Checklist

**Before pushing code:**

1. ✅ Run `npm run lint` → Must be 0 errors
2. ✅ Run `npm test` → All 251 tests passing
3. ✅ Check file sizes: `find src -name "*.js" -exec wc -l {} \;` → All < 700 lines
4. ✅ Check secrets: `grep -r "xnd_production\|password.*=" .` → None found
5. ✅ Run `git diff` → Review all changes
6. ✅ Update memory: Document changes in `.github/memory/`

**After push:**
- Monitor GitHub Actions (gh run list --limit 1)
- Wait for workflow completion (~2-5 minutes for Quick Scan)
- Check for ✅ green status or ❌ red errors

---

## 🔧 Common Fixes

### Fix: File Too Large (> 700 lines)
```bash
# Example: Split AdminHandler.js
1. Create new handler: AdminInventoryHandler.js
2. Extract related methods (addstock, stockreport, etc.)
3. Add delegation in main handler:
   this.inventoryHandler = new AdminInventoryHandler(...)
4. Update routing to delegate
5. Update tests (add async methods to mocks)
6. Verify: wc -l src/handlers/AdminHandler.js  # Must be < 700
```

### Fix: ESLint Errors
```bash
# Unused variable
const _variableName = value;  # Prefix with underscore

# Duplicate identifier
let response = "...";  # Rename variable

# Missing await
await someAsyncFunction();  # Add await
```

### Fix: Hardcoded Secrets
```bash
# Move to .env
XENDIT_SECRET_KEY=xnd_production_xxx

# Use in code
const apiKey = process.env.XENDIT_SECRET_KEY;
```

### Fix: Circular Dependencies
```bash
# Use dependency injection
// Instead of: require('./ServiceA') in ServiceB
// Do: Pass ServiceA to ServiceB constructor
class ServiceB {
  constructor(serviceA) {
    this.serviceA = serviceA;
  }
}
```

---

## 🎯 Workflow Success Criteria

**Quick Scan MUST pass:**
- ✅ Linter: 0 errors
- ✅ Secrets: No production secrets
- ✅ File size: All < 700 lines
- ✅ Circular deps: None

**Testing SHOULD pass:**
- ✅ Unit tests: 251/251 passing
- ⚠️ Coverage: 70%+ (warning if below)

**Other checks (warnings only):**
- Deep review: Code quality
- Security: Vulnerabilities
- Bug detection: Patterns
- Performance: Bundle size

---

## 📚 References

**Workflow files:**
- `.github/workflows/agent-review.yml` - Main AI guardian
- `.github/workflows/ci-cd.yml` - Deployment pipeline
- `.github/workflows/code-review.yml` - PR reviews
- `.github/workflows/lint-and-test.yml` - Quick checks

**Related memory:**
- `.github/memory/current-state.md` - Phase 34 refactoring example
- `.github/copilot-instructions.md` - Architecture guidelines
- `docs/MODULARIZATION.md` - Modular design patterns

**Commands:**
```bash
# Check workflows locally
npm run lint
npm test
find src -name "*.js" -exec wc -l {} \; | awk '$1 > 700'
grep -r "xnd_production" . --exclude-dir=node_modules

# Monitor workflows
gh run list --limit 5
gh run view <run_id>
gh run watch
```
