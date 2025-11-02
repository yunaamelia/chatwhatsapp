# 📦 Transfer Repository ke yunaamelia/chatwhatsapp

## 📊 Status Repository

- **Source:** benihutapea/chatbot
- **Target:** yunaamelia/chatwhatsapp
- **Total Commits:** 93
- **Total Files:** 158
- **Latest Commit:** 28cc536 - feat: implement promo code system (Phase 2)

## ✅ Workflows yang Akan Dipindahkan

1. **agent-review.yml** - AI Guardian untuk code review otomatis
2. **ci-cd.yml** - Deployment pipeline
3. **code-review.yml** - PR review automation
4. **daily-health-check.yml** - Health monitoring
5. **lint-and-test.yml** - Quick linting dan testing

## 🔐 Setup Authentication

### Opsi 1: Personal Access Token (Recommended)

1. **Buat Personal Access Token:**

   - Buka: https://github.com/settings/tokens
   - Klik "Generate new token (classic)"
   - Berikan nama: "chatwhatsapp-deploy"
   - Pilih scope: `repo` (full control)
   - Generate dan **simpan token** (tidak akan ditampilkan lagi!)

2. **Tambahkan remote dengan token:**

   ```bash
   cd /home/senarokalie/Desktop/chatbot
   git remote add chatwhatsapp https://YOUR_TOKEN@github.com/yunaamelia/chatwhatsapp.git
   ```

3. **Push ke repo baru:**
   ```bash
   git push chatwhatsapp main --all
   ```

### Opsi 2: GitHub CLI (Jika sudah terinstall)

```bash
# Login dengan GitHub CLI
gh auth login

# Tambahkan remote
git remote add chatwhatsapp https://github.com/yunaamelia/chatwhatsapp.git

# Push ke repo baru
git push chatwhatsapp main --all
```

### Opsi 3: SSH Key

1. **Generate SSH key (jika belum punya):**

   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Tekan Enter untuk default location
   # Buat passphrase (opsional)
   ```

2. **Tambahkan key ke GitHub:**

   ```bash
   # Copy public key
   cat ~/.ssh/id_ed25519.pub

   # Paste ke: https://github.com/settings/keys
   # Klik "New SSH key"
   ```

3. **Tambahkan remote dengan SSH:**
   ```bash
   git remote add chatwhatsapp git@github.com:yunaamelia/chatwhatsapp.git
   git push chatwhatsapp main --all
   ```

## 📝 Langkah Transfer Lengkap

### 1. Persiapan

```bash
# Pastikan semua changes sudah di-commit
cd /home/senarokalie/Desktop/chatbot
git status

# Pastikan di branch main
git branch
```

### 2. Setup Remote (Pilih salah satu opsi di atas)

```bash
# Contoh dengan token:
git remote add chatwhatsapp https://TOKEN@github.com/yunaamelia/chatwhatsapp.git

# Verifikasi remote
git remote -v
```

### 3. Push Everything

```bash
# Push branch main
git push chatwhatsapp main

# Push semua branches (jika ada)
git push chatwhatsapp --all

# Push tags (jika ada)
git push chatwhatsapp --tags
```

### 4. Verifikasi

```bash
# Cek di GitHub:
# https://github.com/yunaamelia/chatwhatsapp

# Verifikasi workflows:
# https://github.com/yunaamelia/chatwhatsapp/actions
```

## 🔧 Konfigurasi Post-Transfer

### 1. Setup GitHub Actions Secrets

Tambahkan secrets berikut di repo baru:

- Buka: https://github.com/yunaamelia/chatwhatsapp/settings/secrets/actions

**Required Secrets:**

```
XENDIT_SECRET_KEY=xnd_production_xxx
ADMIN_NUMBER=6281234567890
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-xxx (jika menggunakan AI features)
```

### 2. Update Branch Protection Rules

- Buka: https://github.com/yunaamelia/chatwhatsapp/settings/branches
- Protect `main` branch:
  - ✅ Require pull request reviews
  - ✅ Require status checks to pass (lint, test)
  - ✅ Require branches to be up to date

### 3. Enable GitHub Actions

- Buka: https://github.com/yunaamelia/chatwhatsapp/settings/actions
- Pilih: "Allow all actions and reusable workflows"
- Save

### 4. Setup Self-Hosted Runner (Opsional untuk CI/CD)

Jika ingin menggunakan self-hosted runner untuk deployment:

```bash
# Di VPS/Server Anda:
mkdir actions-runner && cd actions-runner

# Download runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure (follow prompts)
./config.sh --url https://github.com/yunaamelia/chatwhatsapp --token YOUR_RUNNER_TOKEN

# Install sebagai service
sudo ./svc.sh install
sudo ./svc.sh start
```

## ✅ Checklist Post-Transfer

- [ ] Repo berhasil di-push ke yunaamelia/chatwhatsapp
- [ ] Semua 5 workflows terlihat di tab Actions
- [ ] Secrets sudah ditambahkan (XENDIT_SECRET_KEY, dll)
- [ ] Branch protection rules sudah diaktifkan
- [ ] README.md sudah di-update (jika perlu)
- [ ] .env.example sudah tersedia
- [ ] Dokumentasi workflows sudah tersedia
- [ ] CI/CD pipeline ditest dengan dummy commit

## 🚀 Test Workflows

Setelah transfer, test dengan commit kecil:

```bash
# Buat perubahan kecil
echo "# chatwhatsapp" > TEST.md
git add TEST.md
git commit -m "test: verify workflows"
git push chatwhatsapp main

# Monitor workflows
# Buka: https://github.com/yunaamelia/chatwhatsapp/actions
# Semua 5 workflows harus berjalan
```

## 📚 File Workflows yang Dipindahkan

### 1. agent-review.yml

- **Purpose:** AI-powered code review
- **Triggers:** Pull requests
- **Checks:**
  - Linting (0 errors)
  - File sizes (< 700 lines)
  - Secrets scanning
  - Circular dependencies
  - Code complexity
  - Bug patterns

### 2. lint-and-test.yml

- **Purpose:** Quick checks
- **Triggers:** Push, Pull Request
- **Checks:**
  - ESLint
  - Unit tests (251 tests)
  - Code coverage

### 3. ci-cd.yml

- **Purpose:** Deployment pipeline
- **Triggers:** Push to main
- **Steps:**
  - Install dependencies
  - Run tests
  - Deploy to self-hosted runner (if configured)
  - PM2 restart

### 4. code-review.yml

- **Purpose:** PR automation
- **Triggers:** Pull requests
- **Features:**
  - Auto-label by files changed
  - Complexity analysis
  - Review comments

### 5. daily-health-check.yml

- **Purpose:** Daily monitoring
- **Schedule:** Daily at 00:00 UTC
- **Checks:**
  - Dependencies audit
  - Dead code detection
  - License compliance

## 🔒 Security Notes

**⚠️ PENTING:**

1. **Jangan commit** file `.env` atau secrets
2. **Gunakan** GitHub Secrets untuk credentials
3. **Review** `.gitignore` untuk memastikan sensitive files tidak ter-commit
4. **Enable** secret scanning di repo settings
5. **Setup** 2FA untuk akun yunaamelia

## 📞 Support

Jika ada masalah:

1. Cek GitHub Actions logs
2. Review workflow files di `.github/workflows/`
3. Baca dokumentasi: `.github/memory/github-workflows-rules.md`
4. Contact: benihutapea (original repo owner)

---

**Transfer Date:** November 3, 2025
**Original Repo:** https://github.com/benihutapea/chatbot
**New Repo:** https://github.com/yunaamelia/chatwhatsapp
