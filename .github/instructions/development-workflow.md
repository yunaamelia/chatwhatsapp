# Development Workflow

## Running Locally

```bash
npm install
npm start  # Displays QR code - scan with WhatsApp to link
```

## Development Commands

```bash
npm run dev          # Start in dev mode (alias for npm start)
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm test             # Run all Jest tests with coverage
npm run test:watch   # Run tests in watch mode
npm run check        # Lint + test (pre-commit validation)
```

## Pre-Push Checklist

```bash
npm run check        # This runs lint + test
# Wait for: ✨ 0 errors, 0 warnings AND all tests passing
git add .
git commit -m "your message"
git push
```

**CRITICAL:** Always run `npm run check` before pushing!

## VPS Deployment

- Use `install-vps.sh` for automated setup (Node.js, Chromium, dependencies)
- Use PM2 for process management: `pm2 start index.js --name whatsapp-bot`
- Sessions auto-cleanup every 10 minutes; inactive sessions expire after 30 minutes

### PM2 Commands

```bash
pm2 start index.js --name whatsapp-bot   # Start bot
pm2 logs whatsapp-bot                     # View logs
pm2 restart whatsapp-bot                  # Restart bot
pm2 stop whatsapp-bot                     # Stop bot
pm2 delete whatsapp-bot                   # Remove from PM2
```

## GitHub Actions Workflows

- **Quick Scan** (< 5 min): Linter, secrets check, file size check - BLOCKING
- **Deep Review** (< 15 min): Code complexity, unused deps, JSDoc - warnings only
- **AI Code Guardian** (< 2 min): AI-powered code quality review - informational

## GitHub Actions Rules (MUST FOLLOW)

- 🚨 **File size limit:** Max 700 lines per .js file in `src/` (BLOCKING CI/CD)
- 🚨 **No hardcoded secrets:** No `xnd_production`, API keys in code (BLOCKING)
- 🚨 **ESLint clean:** 0 errors required (BLOCKING)
- 🚨 **Tests passing:** All 1121 Jest tests must pass (BLOCKING)
- ⚠️ **Pre-push checklist:** Run `npm run lint && npm test` locally before pushing

Check `.github/memory/github-workflows-rules.md` for detailed CI/CD requirements.

## Testing Strategy

**Framework:** Jest with 1121 total tests

### Test Structure

```
tests/
├── unit/                 # Unit tests (isolated components)
│   ├── handlers/        # Handler tests (CustomerHandler, AdminHandler, etc.)
│   ├── services/        # Service tests (ProductService, ReviewService, etc.)
│   ├── utils/           # Utility tests (FuzzySearch, ValidationHelpers, etc.)
│   └── lib/             # Library tests (MessageRouter, UIMessages, etc.)
├── integration/         # Integration tests (service interactions)
└── e2e/                # End-to-end tests (complete flows)
```

### Running Tests

```bash
npm test              # Run all tests with coverage
npm run test:unit     # Run unit tests only
npm run test:watch    # Watch mode for development
npm run check         # Lint + test (pre-commit)
```

### Test Patterns

- Use AAA pattern (Arrange-Act-Assert)
- Mock external dependencies (Redis, WhatsApp client, file system)
- Test edge cases (null, undefined, empty strings, large values)
- Each new feature requires corresponding tests
- Target: 80%+ code coverage

### Example Test Structure

```javascript
describe("ServiceName", () => {
  let service;
  let mockDependency;

  beforeEach(() => {
    mockDependency = { method: jest.fn() };
    service = new ServiceName(mockDependency);
  });

  describe("methodName()", () => {
    test("should handle valid input", () => {
      // Arrange
      const input = "valid";
      mockDependency.method.mockReturnValue("result");

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toBe("expected");
      expect(mockDependency.method).toHaveBeenCalledWith(input);
    });

    test("should handle invalid input", () => {
      expect(() => service.methodName(null)).toThrow();
    });
  });
});
```

**Run tests after changes to core logic** - catches state machine errors before deployment.

## Feature Documentation Workflow (MANDATORY)

**CRITICAL:** For any new feature request or modification, you **MUST** follow this two-stage documentation cycle:

### Stage 1: Implementation Plan (BEFORE coding)

**When:** Before writing any code for a new feature

**Action:** Create an "Implementation Plan" document in `docs/plans/` or update memory

**Required Sections:**

1. **Timestamp:** When the plan was created
2. **Requirements Analysis:** Understanding of the requested feature
3. **Technical Approach:**
   - Libraries/dependencies to be used
   - Database changes (if any)
   - API endpoints to be created
   - Architecture changes
4. **File List:** Files to be created or modified
5. **Potential Risks:** Issues or challenges that may arise
6. **Test Strategy:** How the feature will be tested

**Example Structure:**

```markdown
# Implementation Plan: [Feature Name]

**Created:** November 6, 2025, 10:00 AM
**Status:** Planning

## Requirements Analysis

- User needs X functionality
- Current limitation: Y
- Expected behavior: Z

## Technical Approach

- Use ServiceX for data handling
- Modify HandlerY to add new command
- Add validation in middleware

## File List

- [ ] src/handlers/NewHandler.js (create)
- [ ] src/services/NewService.js (create)
- [ ] tests/unit/handlers/NewHandler.test.js (create)
- [ ] lib/messageRouter.js (modify)

## Potential Risks

- Integration with existing feature X may conflict
- Performance impact on Y

## Test Strategy

- Unit tests for NewHandler (20+ tests)
- Integration test for complete flow
- Manual testing with real WhatsApp messages
```

**Process:**

1. Show the plan to the user
2. Wait for approval (if needed)
3. Only proceed to coding after plan is ready

---

### Stage 2: Implementation Summary (AFTER completion)

**When:** Immediately after feature is successfully implemented

**Action:** Update the same document with "Implementation Summary"

**Required Sections:**

1. **Timestamp:** When implementation was completed
2. **Final Result:** Success statement and brief overview
3. **Change Summary:**
   - What was actually changed/added in code
   - Components created
   - Tests added
4. **Deviations from Plan (if any):**
   - Differences between actual implementation and original plan
   - Reasons for changes
5. **Additional Instructions:**
   - How to test the feature
   - New dependencies to install
   - Configuration changes needed

**Example Structure:**

```markdown
## Implementation Summary

**Completed:** November 6, 2025, 2:30 PM
**Status:** ✅ Success

### Final Result

Feature successfully implemented with all tests passing (1121/1124).
New feature adds X functionality with Y performance.

### Change Summary

**Files Created (3):**

- src/handlers/NewHandler.js (174 lines)
- src/services/NewService.js (198 lines)
- tests/unit/handlers/NewHandler.test.js (45 tests)

**Files Modified (2):**

- lib/messageRouter.js - Added routing logic (lines 123-145)
- src/config/app.config.js - Added feature flag

**Tests Added:** +45 tests (all passing)
**Coverage:** Increased from 45% → 47%

### Deviations from Plan

- Originally planned to use ServiceX, but switched to ServiceY
  for better performance (3x faster)
- Added caching layer not in original plan (improves response time)

### Additional Instructions

1. Install new dependency: `npm install dependency-name`
2. Add to .env: `NEW_FEATURE_ENABLE=true`
3. Test with command: `/newfeature test`
4. See docs/NEW_FEATURE_GUIDE.md for usage
```

---

### Workflow Summary

```
1. Receive Feature Request
   ↓
2. Create Implementation Plan (BEFORE coding)
   ↓
3. Show plan to user → Get approval
   ↓
4. Implement Code
   ↓
5. Update Document with Implementation Summary (AFTER completion)
   ↓
6. Feature Complete ✅
```

**Storage Locations:**

- **Temporary/Active Plans:** `.github/memory/` (for AI agent context)
- **Permanent Documentation:** `docs/plans/` or `docs/features/`
- **Completed Features:** Move to `docs/archive/features/` after 30 days

**Benefits:**

- ✅ Clear documentation trail
- ✅ Easier debugging (know what was changed and why)
- ✅ Better collaboration (others can understand decisions)
- ✅ Accountability (timestamps show when work was done)
- ✅ Learning (deviations explain lessons learned)

---

## Environment Variables

Create `.env` file:

```bash
# WhatsApp
USE_PAIRING_CODE=false           # true for pairing code, false for QR
PAIRING_PHONE_NUMBER=            # Phone number for pairing (e.g., 6281234567890)

# Admin
ADMIN_NUMBER=6281234567890       # Admin WhatsApp number

# Payment (Xendit)
XENDIT_API_KEY=your_key_here
XENDIT_CALLBACK_TOKEN=your_token

# AI (Gemini)
GOOGLE_API_KEY=your_gemini_key
AI_ENABLE=true                   # Enable AI features

# Stock
DEFAULT_STOCK=999
VCC_STOCK=50
```

## Quick Stats

- **Tests:** 1121/1124 passing (99.7%)
- **Coverage:** 45%+
- **Test Suites:** 37/37 passing
- **Lint:** 0 errors, 0 warnings
