# WhatsApp Shopping Chatbot - Copilot Instructions

## 📚 Documentation Structure

This file is the **main index**. Detailed instructions are split into focused files:

- **[Architecture](instructions/architecture.md)** - System design, components, patterns
- **[Development Workflow](instructions/development-workflow.md)** - Commands, testing, deployment
- **[Patterns](instructions/patterns.md)** - Message flow, state machine, best practices
- **[Integration](instructions/integration.md)** - WhatsApp, Payment, Redis, Media
- **[Common Tasks](instructions/common-tasks.md)** - Adding commands, modifying features
- **[Gotchas](instructions/gotchas.md)** - Critical issues & troubleshooting
- **[File Reference](instructions/file-reference.md)** - Quick file lookup
- **[Recent Features](instructions/recent-features.md)** - Latest updates & roadmap

---

## ⚡ Quick Reference

### Critical Rules (Read First)

1. **Keep responses concise** - Save detailed summaries to agent memory instead of long replies
2. **Test Framework is Jest** - Use `describe()`, `test()`, `expect()` for all new tests (not Mocha)
3. **Reference memory** - Check `.github/memory/` for project context and previous decisions
4. **Document in memory** - Update memory with implementation summaries, not user-facing responses
5. **CHECK WORKFLOWS BEFORE PUSH** - Read `.github/memory/github-workflows-rules.md` for CI/CD requirements
6. **FEATURE DOCUMENTATION MANDATORY** - Follow two-stage workflow: Plan → Implement → Summary (see [Development Workflow](instructions/development-workflow.md#feature-documentation-workflow-mandatory))

### GitHub Actions Rules (MUST FOLLOW)

- 🚨 **File size limit:** Max 700 lines per .js file in \`src/\` (BLOCKING CI/CD)
- 🚨 **No hardcoded secrets:** No \`xnd_production\`, API keys in code (BLOCKING)
- 🚨 **ESLint clean:** 0 errors required (BLOCKING)
- 🚨 **Tests passing:** All 1121 Jest tests must pass (BLOCKING)
- ⚠️ **Pre-push checklist:** Run \`npm run lint && npm test\` locally before pushing

---

## 📊 Quick Stats

| Metric          | Value     | Status           |
| --------------- | --------- | ---------------- |
| **Tests**       | 1121/1124 | ✅ 99.7% passing |
| **Test Suites** | 37/37     | ✅ 100% passing  |
| **Coverage**    | 45%+      | 🟡 Good          |
| **Lint**        | 0 errors  | ✅ Clean         |
| **Files**       | 80+ files | ✅ Modular       |

---

## ��️ Architecture Quick View

\`\`\`
chatbot/
├── src/ # Modular source code
│ ├── handlers/ # CustomerHandler, AdminHandler, AIFallbackHandler
│ ├── services/ # Business logic (session, payment, AI, etc.)
│ ├── middleware/ # RelevanceFilter, InputSanitizer
│ ├── utils/ # FuzzySearch, ValidationHelpers
│ └── config/ # app, products, payment, ai configs
├── lib/ # Legacy core (messageRouter, uiMessages)
├── tests/ # Unit + Integration tests
├── docs/ # Comprehensive documentation
└── index.js # Entry point
\`\`\`

**Key Principle:** Each handler < 700 lines. Use delegation pattern for large handlers.

---

## 🚀 Quick Start

### Development

\`\`\`bash
npm install # Install dependencies
npm start # Start bot (QR code or pairing)
npm test # Run all tests
npm run check # Lint + test (pre-commit)
\`\`\`

### Pre-Push Checklist

\`\`\`bash
npm run check # This runs lint + test

# Wait for: ✨ 0 errors, 0 warnings AND all tests passing

git add .
git commit -m "your message"
git push
\`\`\`

---

## 🎯 Recent Features (November 2025)

### ✅ Phase 3: AI Features (Nov 6, 2025)

**AI Fallback Handler** - Intelligently responds to unrecognized messages

- 72 new tests, all passing
- 4 new components (RelevanceFilter, IntentClassifier, PromptBuilder, FallbackHandler)
- Gemini 2.5 Flash integration (~$0.000002 per call)
- See: \`docs/AI_FALLBACK_COMPLETE.md\`

### ✅ Phase 2: Customer Features

- **Wishlist/Favorites** - Save products (\`simpan <product>\`)
- **Promo Codes** - Discount system (\`promo CODE\`)
- **Product Reviews** - Ratings & reviews (\`/review <product> <rating> <text>\`)
- **Admin Dashboard** - Enhanced analytics (\`/stats [days]\`)

### ✅ Phase 1: Quick Wins

- Order Tracking (\`/track\`)
- Rate Limiting (20 msg/min)
- Auto Screenshot Detection
- Payment Reminders (cron)
- Webhook Auto-Retry

See [Recent Features](instructions/recent-features.md) for details.

---

## 🔍 Common Tasks Quick Links

**Need to:**

- Add a new command? → [Common Tasks - Adding Commands](instructions/common-tasks.md#adding-a-new-command)
- Modify messages? → [File Reference - uiMessages.js](instructions/file-reference.md#libuimessagesjs)
- Change payment flow? → [Integration - Payment Patterns](instructions/integration.md#payment-integration-patterns)
- Customize AI behavior? → [Common Tasks - Customizing AI](instructions/common-tasks.md#customizing-ai-behavior)
- Add new products? → [Common Tasks - Adding Products](instructions/common-tasks.md#adding-new-products)
- Debug issues? → [Gotchas - Troubleshooting](instructions/gotchas.md#troubleshooting-common-issues)

---

## 💡 Key Patterns

### Message Flow

\`WhatsApp Message\` → \`MessageRouter\` → \`Handler\` → \`Response\`

- Global commands always accessible (\`menu\`, \`cart\`, \`help\`)
- Admin commands start with \`/\`
- Step-based routing (menu/browsing/checkout)
- AI fallback for unrecognized messages

See [Patterns - Message Processing Flow](instructions/patterns.md#message-processing-flow)

### Handler Delegation

\`\`\`javascript
class AdminHandler extends BaseHandler {
constructor() {
this.inventoryHandler = new AdminInventoryHandler(...);
this.reviewHandler = new AdminReviewHandler(...);
// Delegate to keep file size < 700 lines
}
}
\`\`\`

See [Architecture - Handler Delegation](instructions/architecture.md#handler-delegation-pattern-critical)

### AI Integration

\`\`\`javascript
// MessageRouter - AI fallback for unknown commands
if (response.includes('tidak valid')) {
const aiResponse = await this.aiFallbackHandler.handle(customerId, message);
if (aiResponse) return aiResponse;
}
\`\`\`

See [Patterns - AI Integration](instructions/patterns.md#aigemini-integration-pattern)

---

## 🛡️ Critical Gotchas

1. **Session data not persisted** - Use Redis for production
2. **Product stock decorative** - Add enforcement in checkout
3. **Payment manual** - Automate with Xendit webhooks
4. **WhatsApp rate limits** - Already implemented (20 msg/min)
5. **File size limit** - Max 700 lines in \`src/\` (CI/CD blocker)

See [Gotchas](instructions/gotchas.md) for full list and solutions.

---

## 📖 When to Read What

**Starting a new feature?** → Read [Architecture](instructions/architecture.md) + [Patterns](instructions/patterns.md)

**Modifying existing code?** → Read [File Reference](instructions/file-reference.md)

**Integrating external service?** → Read [Integration](instructions/integration.md)

**Stuck on something?** → Read [Gotchas](instructions/gotchas.md)

**Need examples?** → Read [Common Tasks](instructions/common-tasks.md)

**Want to deploy?** → Read [Development Workflow](instructions/development-workflow.md)

---

## 🎓 For AI Agents

**Before making changes:**

1. Check relevant instruction file (don't load all)
2. Check \`.github/memory/\` for previous decisions
3. Run tests after changes
4. Update memory with summary

**When stuck:**

1. Read [Gotchas](instructions/gotchas.md) first
2. Check test files for usage examples
3. Search memory for similar tasks

**Best practices:**

- Keep files < 700 lines
- Test coverage > 80% for new code
- Mock external services in tests
- Use existing patterns and services
- Document in memory, not user responses

---

**Last Updated:** November 6, 2025  
**Version:** 3.0 (Modular Documentation)  
**Total Lines:** Reduced from 664 → ~180 (main file)
