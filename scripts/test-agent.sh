# Agent Testing Script
# Run this to test the agent locally before pushing

echo "🤖 Testing AI Agent Checks..."
echo ""

# 1. File Size Check
echo "1️⃣ Checking file sizes..."
find src -name "*.js" -exec wc -l {} + | awk '$1 > 700 {print "❌ FAIL: "$2" ("$1" lines)"; exit 1}'
if [ $? -eq 0 ]; then
  echo "✅ PASS: All files under 700 lines"
fi
echo ""

# 2. Linter
echo "2️⃣ Running linter..."
npx eslint src/ --max-warnings=5 2>&1 | head -20
if [ $? -eq 0 ]; then
  echo "✅ PASS: No critical lint errors"
else
  echo "⚠️ WARN: Lint errors found"
fi
echo ""

# 3. Tests
echo "3️⃣ Running tests..."
npm test 2>&1 | tail -20
if [ $? -eq 0 ]; then
  echo "✅ PASS: Tests passed"
else
  echo "❌ FAIL: Tests failed"
fi
echo ""

# 4. Secret Check
echo "4️⃣ Checking for secrets..."
if grep -r "xnd_production\|password.*=.*['\"]" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" 2>/dev/null; then
  echo "❌ FAIL: Secrets found in code!"
else
  echo "✅ PASS: No secrets detected"
fi
echo ""

# 5. Security Audit
echo "5️⃣ Running security audit..."
npm audit --audit-level=moderate 2>&1 | head -20
if [ $? -eq 0 ]; then
  echo "✅ PASS: No vulnerabilities"
else
  echo "⚠️ WARN: Vulnerabilities found"
fi
echo ""

# 6. Circular Dependencies
echo "6️⃣ Checking circular dependencies..."
npx madge --circular --extensions js src/ 2>&1 | head -10
if [ $? -eq 0 ]; then
  echo "✅ PASS: No circular dependencies"
else
  echo "⚠️ WARN: Circular dependencies found"
fi
echo ""

echo "=========================================="
echo "🎯 Agent Test Summary"
echo "=========================================="
echo "Run 'git push' to trigger full CI/CD pipeline"
echo ""
