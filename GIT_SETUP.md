# Git Setup va Yuklash Qo'llanmasi

## 1. Git O'rnatish (Windows)

### Usul 1: Git o'rnatilmagan bo'lsa

1. **Git'ni yuklab oling:**
   - https://git-scm.com/download/win
   - Yuklab oling va o'rnating

2. **PowerShell'ni qayta ishga tushiring** (yoki yangi terminal oching)

3. **Git'ni tekshiring:**
   ```powershell
   git --version
   ```

## 2. Git Repository Yaratish

### Birinchi marta Git'ga yuklash:

```powershell
# 1. Git'ni initialize qiling
git init

# 2. Barcha fayllarni qo'shing
git add .

# 3. Birinchi commit yarating
git commit -m "Initial commit: Operatora Audio project"

# 4. Remote repository qo'shing (GitHub, GitLab, va hokazo)
# GitHub misol:
git remote add origin https://github.com/username/operatora_audio.git

# 5. Branch nomini o'zgartiring (agar kerak bo'lsa)
git branch -M main

# 6. Remote'ga push qiling
git push -u origin main
```

## 3. GitHub'ga Yuklash

### Yangi Repository Yaratish:

1. **GitHub'da yangi repository yarating:**
   - https://github.com/new ga kiring
   - Repository nomi: `operatora_audio`
   - Public yoki Private tanlang
   - "Initialize with README" ni **TIKLAMANG**
   - "Create repository" ni bosing

2. **Local repository'ni GitHub'ga ulang:**

```powershell
# Remote qo'shing (YOUR_USERNAME ni o'zgartiring)
git remote add origin https://github.com/YOUR_USERNAME/operatora_audio.git

# Yoki SSH orqali:
git remote add origin git@github.com:YOUR_USERNAME/operatora_audio.git
```

### Yuklash:

```powershell
# Barcha o'zgarishlarni qo'shing
git add .

# Commit yarating
git commit -m "Your commit message"

# GitHub'ga yuklang
git push -u origin main
```

## 4. Keyingi Yuklashlar

Har safar o'zgarish qilgandan keyin:

```powershell
# 1. O'zgarishlarni ko'rish
git status

# 2. Barcha o'zgarishlarni qo'shish
git add .

# 3. Commit yaratish
git commit -m "Description of changes"

# 4. Remote'ga yuklash
git push
```

## 5. Kerakli Fayllar

Quyidagi fayllar Git'ga yuklanadi:
- ✅ `server.js`
- ✅ `package.json`
- ✅ `README.md`
- ✅ `API_DOCUMENTATION.md`
- ✅ `INSTALL_NODEJS.md`
- ✅ `DEPLOY_INSTRUCTIONS.md`
- ✅ `GIT_SETUP.md`
- ✅ `.gitignore`
- ✅ `upload.sh`
- ✅ `deploy.sh`
- ✅ `remote_setup.sh`
- ✅ `public/` papkasi

Quyidagi fayllar **YUKLANMAYDI** (.gitignore tufayli):
- ❌ `node_modules/`
- ❌ `uploads/`
- ❌ `data/`
- ❌ `.env`
- ❌ `*.log`
- ❌ `*.mp3` (test fayllari)

## 6. Foydali Git Buyruqlari

```powershell
# Statusni ko'rish
git status

# O'zgarishlarni ko'rish
git diff

# Commit tarixini ko'rish
git log

# Remote repository'ni ko'rish
git remote -v

# Branch'lar ro'yxati
git branch

# Remote'dan yangilash
git pull

# Ma'lum bir faylni qo'shish
git add server.js

# Commit'ni bekor qilish (o'zgarishlar saqlanadi)
git reset HEAD~1

# O'zgarishlarni bekor qilish
git checkout -- filename
```

## 7. SSH Key Sozlash (Ixtiyoriy)

SSH orqali yuklash uchun:

```powershell
# SSH key yaratish
ssh-keygen -t ed25519 -C "your_email@example.com"

# SSH key'ni ko'rish
cat ~/.ssh/id_ed25519.pub

# GitHub'ga qo'shing:
# Settings > SSH and GPG keys > New SSH key
```

## 8. Muammolarni Hal Qilish

### Parol so'ralganda:
```powershell
# Personal Access Token ishlating (GitHub)
# Settings > Developer settings > Personal access tokens
```

### Remote already exists:
```powershell
# Remote'ni o'chirish
git remote remove origin

# Yangi remote qo'shish
git remote add origin NEW_URL
```

### Push rejected:
```powershell
# Remote'dan yangilash
git pull origin main --rebase

# Keyin qayta push qiling
git push
```

## 9. Quick Start Script

Quyidagi scriptni `git_setup.ps1` sifatida saqlab, ishlatishingiz mumkin:

```powershell
# Git'ni tekshirish
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Initialize
git init

# Add files
git add .

# First commit
git commit -m "Initial commit: Operatora Audio project"

Write-Host "Git repository initialized!" -ForegroundColor Green
Write-Host "Next: Add remote repository and push" -ForegroundColor Yellow
```
