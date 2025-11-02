#!/bin/bash

# ==============================================================================
# Transfer Repository Script
# Source: benihutapea/chatbot → Target: yunaamelia/chatwhatsapp
# ==============================================================================

set -e  # Exit on error

echo "🚀 Repository Transfer Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -d ".github/workflows" ]; then
    print_error "Error: .github/workflows directory not found!"
    print_info "Please run this script from the chatbot root directory"
    exit 1
fi

print_success "Current directory verified"

# Check git status
echo ""
print_info "Checking git status..."
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes!"
    echo ""
    git status --short
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Transfer cancelled"
        exit 1
    fi
fi

# Show repository statistics
echo ""
print_info "📊 Repository Statistics:"
echo "  - Total commits: $(git rev-list --count HEAD)"
echo "  - Total files: $(git ls-files | wc -l)"
echo "  - Latest commit: $(git log -1 --oneline)"
echo "  - Workflows: $(ls -1 .github/workflows/ | wc -l) files"
echo ""

# List workflows
print_info "📋 Workflows yang akan dipindahkan:"
ls -1 .github/workflows/ | sed 's/^/  - /'
echo ""

# Authentication method selection
echo ""
print_info "🔐 Pilih metode authentication:"
echo "  1) Personal Access Token (Recommended)"
echo "  2) SSH Key"
echo "  3) GitHub CLI (gh)"
echo "  4) Manual (saya akan setup sendiri)"
echo ""
read -p "Pilih opsi (1-4): " AUTH_METHOD

case $AUTH_METHOD in
    1)
        echo ""
        print_info "📝 Langkah-langkah untuk Personal Access Token:"
        echo "  1. Buka: https://github.com/settings/tokens"
        echo "  2. Klik 'Generate new token (classic)'"
        echo "  3. Pilih scope: repo (full control)"
        echo "  4. Generate dan copy token"
        echo ""
        read -p "Paste your Personal Access Token: " -s TOKEN
        echo ""
        
        if [ -z "$TOKEN" ]; then
            print_error "Token tidak boleh kosong!"
            exit 1
        fi
        
        REMOTE_URL="https://${TOKEN}@github.com/yunaamelia/chatwhatsapp.git"
        ;;
        
    2)
        print_info "🔑 Using SSH key..."
        
        # Check if SSH key exists
        if [ ! -f ~/.ssh/id_ed25519 ] && [ ! -f ~/.ssh/id_rsa ]; then
            print_warning "SSH key tidak ditemukan!"
            echo ""
            read -p "Generate SSH key sekarang? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                read -p "Enter your email: " EMAIL
                ssh-keygen -t ed25519 -C "$EMAIL"
                print_success "SSH key generated!"
                echo ""
                print_info "Copy public key berikut ke GitHub:"
                cat ~/.ssh/id_ed25519.pub
                echo ""
                print_info "Tambahkan ke: https://github.com/settings/keys"
                read -p "Press Enter setelah menambahkan key ke GitHub..."
            else
                print_error "Transfer dibatalkan"
                exit 1
            fi
        fi
        
        REMOTE_URL="git@github.com:yunaamelia/chatwhatsapp.git"
        ;;
        
    3)
        print_info "🔧 Using GitHub CLI..."
        
        # Check if gh is installed
        if ! command -v gh &> /dev/null; then
            print_error "GitHub CLI (gh) not installed!"
            print_info "Install: https://cli.github.com/"
            exit 1
        fi
        
        # Check if logged in
        if ! gh auth status &> /dev/null; then
            print_warning "Not logged in to GitHub CLI"
            gh auth login
        fi
        
        REMOTE_URL="https://github.com/yunaamelia/chatwhatsapp.git"
        ;;
        
    4)
        print_info "Manual mode selected"
        echo ""
        print_warning "Silakan jalankan manual command:"
        echo ""
        echo "  git remote add chatwhatsapp https://github.com/yunaamelia/chatwhatsapp.git"
        echo "  git push chatwhatsapp main --all"
        echo "  git push chatwhatsapp --tags"
        echo ""
        exit 0
        ;;
        
    *)
        print_error "Invalid option!"
        exit 1
        ;;
esac

# Remove existing remote if exists
if git remote get-url chatwhatsapp &> /dev/null; then
    print_info "Removing existing 'chatwhatsapp' remote..."
    git remote remove chatwhatsapp
    print_success "Existing remote removed"
fi

# Add new remote
echo ""
print_info "Adding remote 'chatwhatsapp'..."
git remote add chatwhatsapp "$REMOTE_URL"
print_success "Remote added successfully"

# Verify remote
echo ""
print_info "📡 Configured remotes:"
git remote -v | grep chatwhatsapp | sed 's/^/  /'

# Confirm push
echo ""
read -p "Push ke yunaamelia/chatwhatsapp sekarang? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Push dibatalkan. Remote sudah ditambahkan."
    print_info "Push manual dengan: git push chatwhatsapp main"
    exit 0
fi

# Push to new repository
echo ""
print_info "🚀 Pushing to chatwhatsapp repository..."
echo ""

# Push main branch
print_info "Pushing main branch..."
if git push chatwhatsapp main; then
    print_success "Main branch pushed successfully!"
else
    print_error "Failed to push main branch!"
    print_info "Coba manual: git push chatwhatsapp main --force"
    exit 1
fi

# Push all branches
echo ""
read -p "Push semua branches? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Pushing all branches..."
    git push chatwhatsapp --all
    print_success "All branches pushed!"
fi

# Push tags
echo ""
read -p "Push tags? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Pushing tags..."
    git push chatwhatsapp --tags
    print_success "Tags pushed!"
fi

# Success summary
echo ""
echo "========================================"
print_success "🎉 Transfer Complete!"
echo "========================================"
echo ""
print_info "📦 Repository transferred to:"
echo "  https://github.com/yunaamelia/chatwhatsapp"
echo ""
print_info "🔧 Next steps:"
echo "  1. Verify repo: https://github.com/yunaamelia/chatwhatsapp"
echo "  2. Check workflows: https://github.com/yunaamelia/chatwhatsapp/actions"
echo "  3. Setup GitHub Secrets (XENDIT_SECRET_KEY, etc.)"
echo "  4. Configure branch protection rules"
echo "  5. Enable GitHub Actions"
echo ""
print_info "📚 Documentation:"
echo "  - Transfer guide: TRANSFER_REPOSITORY.md"
echo "  - Workflows guide: .github/memory/github-workflows-rules.md"
echo ""

# Open in browser
if command -v xdg-open &> /dev/null; then
    read -p "Open repo in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open "https://github.com/yunaamelia/chatwhatsapp" &> /dev/null &
    fi
fi

print_success "Done! ✨"
