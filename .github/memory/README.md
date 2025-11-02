# Memory Directory Index

**Last Updated:** November 3, 2025

This directory contains institutional knowledge, decisions, and learnings from the WhatsApp Shopping Chatbot project.

## Files

### 1. [current-state.md](./current-state.md)
**Purpose:** Current system status and configuration  
**Contains:**
- Bot configuration and status
- Product catalog (6 products, all Rp 15,800)
- Payment methods
- Recent major changes
- Deployment info
- Production readiness checklist

**Update when:** Bot config changes, products added/modified, major deployment

---

### 2. [pricing-system-migration.md](./pricing-system-migration.md)
**Purpose:** USD to direct IDR pricing migration  
**Contains:**
- Decision rationale
- Before/after comparison
- Files modified
- Critical checkout bug discovered and fixed
- Testing results

**Key learning:** Always search for ALL usages when changing data structure, especially in payment/checkout code.

---

### 3. [env-variables-integration.md](./env-variables-integration.md)
**Purpose:** Environment variable integration process  
**Contains:**
- Problems with hardcoded values
- Solution: centralized app.config.js
- Files modified
- Testing verification
- Pattern to follow

**Key learning:** Never hardcode configurable values, always use config.js

---

### 4. [critical-bugs-pitfalls.md](./critical-bugs-pitfalls.md)
**Purpose:** Known issues and how to avoid them  
**Contains:**
- Double conversion bug (checkout)
- Session persistence issues (past)
- Hardcoded values problems
- Test module path errors
- Quick checklist for future changes

**Read this:** Before making any pricing/payment changes!

---

### 5. [testing-framework-mocha.md](./testing-framework-mocha.md)
**Purpose:** Why Mocha was chosen  
**Contains:**
- Decision context (pre-existing choice)
- Why it works well (CommonJS, lightweight)
- Test structure (251 tests)
- Alternatives considered
- Migration considerations

**Note:** Don't change testing framework without strong reason.

---

### 6. [code-patterns.md](./code-patterns.md)
**Purpose:** Reusable coding patterns and best practices  
**Contains:**
- Environment variable integration pattern
- Pricing system change pattern
- Multi-file edit pattern
- Testing workflow
- Git commit format
- Debugging checklist
- Bot restart protocol
- Code search commands

**Reference this:** When making any code changes.

---

## Quick Reference

### Most Critical Documents
1. **current-state.md** - Know the current system
2. **critical-bugs-pitfalls.md** - Avoid known issues
3. **code-patterns.md** - Follow best practices

### For Specific Tasks

**Adding new product:**
- Read: current-state.md (product catalog section)
- Follow: code-patterns.md (configuration pattern)

**Changing prices:**
- Read: pricing-system-migration.md
- Read: critical-bugs-pitfalls.md (#1 Double Conversion Bug)
- Follow: code-patterns.md (Pattern 2: Pricing System Changes)

**Adding .env variable:**
- Read: env-variables-integration.md
- Follow: code-patterns.md (Pattern 1: Environment Variable Integration)

**Debugging issue:**
- Read: critical-bugs-pitfalls.md
- Follow: code-patterns.md (Pattern 8: Debugging Checklist)

**Before deploying:**
- Read: current-state.md (Production Readiness Checklist)
- Read: critical-bugs-pitfalls.md (Quick Checklist)

---

## Maintenance

**When to update this directory:**

- After fixing critical bugs → Update critical-bugs-pitfalls.md
- After major system changes → Update current-state.md
- After discovering new patterns → Update code-patterns.md
- After deployment → Update current-state.md (bot status)

**Keep it organized:**
- Delete obsolete information
- Update timestamps
- Keep files focused on specific topics
- Cross-reference related files

---

## For Future AI Agents

**Always read these files BEFORE starting work:**
1. current-state.md - Understand the system
2. critical-bugs-pitfalls.md - Don't repeat mistakes

**When making changes:**
1. Follow patterns in code-patterns.md
2. Update memory files with new learnings
3. Document decisions for future reference

**This memory directory exists to prevent:**
- Repeating fixed bugs
- Ignoring known pitfalls
- Inconsistent code patterns
- Loss of institutional knowledge
