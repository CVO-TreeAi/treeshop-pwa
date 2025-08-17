# TreeAI Git Workflow Guide

## 🌟 Branch Structure

```
main (production/live)     ← Production deployments only
├── dev (development)      ← Active development branch
├── backup-main           ← Production backup
└── backup-dev            ← Development backup
```

## 🔄 Development Workflow

### Daily Development
1. **Work on `dev` branch:**
   ```bash
   git checkout dev
   git pull origin dev
   # Make your changes
   git add .
   git commit -m "Your commit message"
   git push origin dev
   ```

2. **Test thoroughly on `dev` before production**

### Production Deployment
1. **Merge `dev` → `main` when ready for production:**
   ```bash
   git checkout main
   git pull origin main
   git merge dev
   git push origin main
   ```

2. **Vercel will automatically deploy `main` branch**

### Backup Strategy
- **Before major changes, update backups:**
  ```bash
  # Backup main branch
  git checkout backup-main
  git merge main
  git push origin backup-main
  
  # Backup dev branch
  git checkout backup-dev
  git merge dev
  git push origin backup-dev
  ```

## 🚀 Branch Purposes

### `main` (Production/Live)
- **Production-ready code only**
- Automatically deploys to https://treeai.app
- Requires thorough testing before merging
- Protected branch (should require PR reviews)

### `dev` (Development)
- **Active development work**
- Test new features here first
- Can be unstable during development
- Safe to experiment and iterate

### `backup-main` (Production Backup)
- **Safety net for production**
- Manual updates before major releases
- Recovery point if production issues occur

### `backup-dev` (Development Backup)
- **Stable development snapshots**
- Manual updates at stable points
- Recovery for development experiments

## 🔒 Security Best Practices

### Environment Variables
- **Never commit sensitive data**
- Use `.env.example` for templates
- Add actual secrets only to:
  - Local `.env.local` file
  - Vercel environment variables
  - GitHub secrets (if needed)

### Sensitive Files
- `.env.local` - Never commit (in .gitignore)
- API keys - Server-side only
- Database URLs - Environment variables only

## 🛠️ Common Commands

### Switch Branches
```bash
git checkout main        # Production branch
git checkout dev         # Development branch
git checkout backup-main # Production backup
git checkout backup-dev  # Development backup
```

### Create Feature Branch (if needed)
```bash
git checkout dev
git checkout -b feature/new-feature
# Work on feature
git checkout dev
git merge feature/new-feature
git branch -d feature/new-feature
```

### Emergency Rollback
```bash
# If production has issues, rollback from backup
git checkout main
git reset --hard backup-main
git push --force-with-lease origin main
```

### Update from Remote
```bash
git fetch origin
git pull origin dev    # or main
```

## 📋 Commit Message Format

Use clear, descriptive commit messages:

```bash
git commit -m "✨ Add route optimization feature

- Implement Google Distance Matrix API
- Add crew location tracking
- Create RouteOptimizer UI component

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Commit Types
- `✨` New features
- `🐛` Bug fixes
- `🔒` Security fixes
- `⚡` Performance improvements
- `♻️` Code refactoring
- `📝` Documentation
- `🚀` Deployment/release
- `🔧` Configuration changes

## 🎯 Development Guidelines

### Before Committing
1. Test locally (`npm run dev`)
2. Build successfully (`npm run build`)
3. Check for lint errors
4. Review changes with `git diff`

### Before Production Merge
1. Thorough testing on `dev` branch
2. Verify all features work
3. Test Google OAuth and APIs
4. Confirm environment variables are set
5. Update backup branches

### After Production Deploy
1. Verify live site works
2. Test critical features
3. Monitor for errors
4. Update backup-main branch

## 🔍 Troubleshooting

### If Git Push Fails
```bash
# Check for conflicts
git status
git pull origin dev

# If secrets detected
# Remove secrets from files and recommit
```

### If Production Breaks
```bash
# Quick rollback from backup
git checkout main
git reset --hard backup-main
git push --force-with-lease origin main
```

### If Development Gets Messy
```bash
# Reset to backup-dev
git checkout dev
git reset --hard backup-dev
git push --force-with-lease origin dev
```

---

**Current Status:** ✅ All branches created and configured
**Active Branch:** `dev` (for development)
**Production Branch:** `main` (deploys to treeai.app)

Always work on `dev` branch and thoroughly test before merging to `main`!