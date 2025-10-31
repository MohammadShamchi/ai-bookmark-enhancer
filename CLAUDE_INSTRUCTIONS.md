# Instructions for Claude Code and AI Agents

## 🚨 CRITICAL: Working Directory

**YOU MUST WORK IN THIS DIRECTORY ONLY:**
```
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer
```

**NEVER WORK IN THE PARENT DIRECTORY:**
```
/Users/amohii/dev/UI-update-ai-bookmar-enhancer  ❌ WRONG!
```

### Before Creating ANY File

Run this command FIRST:
```bash
pwd
```

The output MUST be:
```
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer
```

If it shows anything else, **STOP** and notify the user.

## 📁 Project Context

This is a Chrome Extension (Manifest V3) for AI-powered bookmark organization.

**Architecture**: Modular ES6 modules
**Current Version**: 2.0.0
**Implementation Status**: Phases 1-3 Complete (100%)

## 🎯 Key Constraints

1. **Directory**: ONLY work in `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer`
2. **No Parent Access**: NEVER use `../` or create files in parent directory
3. **Git-Only Changes**: ALL changes must be within git repository
4. **Module Paths**: Use absolute paths starting with project root

## 📂 Where to Create Files

- **Core logic**: `src/core/`
- **API clients**: `src/api/`
- **Utilities**: `src/utils/`
- **Validators**: `src/validators/`
- **Configuration**: `src/config/`
- **Documentation**: Project root (where this file is)

## 🚫 Never Modify

- `.claude/settings.local.json` - Local Claude settings
- `node_modules/` - Dependencies (if exists)
- Parent directory `/Users/amohii/dev/UI-update-ai-bookmar-enhancer`

## 📚 Important Documentation

Before starting work, read:
1. **PROJECT_STRUCTURE.md** - Complete project structure and rules
2. **INTEGRATION_GUIDE.md** - Testing procedures
3. **IMPLEMENTATION_COMPLETE.md** - What's been implemented

## ✅ Pre-Flight Checklist

Before making ANY changes:

```bash
# 1. Verify directory
pwd
# Must output: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer

# 2. Verify git root
git rev-parse --show-toplevel
# Must output: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer

# 3. Check current state
git status

# 4. Review recent work
git log --oneline -5
```

## 🎨 Code Style

- ES6 modules with `import/export`
- Use `assert { type: 'json' }` for JSON imports
- Comprehensive error handling with try/catch
- JSDoc comments for complex functions
- Descriptive variable and function names

## 🔧 Common Tasks

### Creating a New Module

```bash
# Example: Creating a new utility
# Path: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/utils/my-util.js
```

### Modifying Existing Files

1. Read the file first with Read tool
2. Understand the context and structure
3. Use Edit tool for precise changes
4. Never overwrite without reading first

### Running Tests

```bash
# Load extension in Chrome
# Navigate to: chrome://extensions/
# Enable Developer Mode
# Load unpacked: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer
```

## 📦 Git Workflow

```bash
# 1. Create feature branch
git checkout -b feat/description

# 2. Make changes (in project directory only!)

# 3. Stage changes
git add .

# 4. Commit with descriptive message
git commit -m "feat: description"

# 5. Push to remote
git push -u origin feat/description

# 6. Create PR
gh pr create --title "Title" --body "Description"
```

## ⚠️ Warning Signs You're in Wrong Directory

If you see these, **STOP IMMEDIATELY**:

1. `pwd` shows `/Users/amohii/dev/UI-update-ai-bookmar-enhancer`
2. `git rev-parse --show-toplevel` shows different path
3. Creating files and they don't appear in git status
4. Parent directory path without `/ai-bookmark-enhancer` at end

## 💡 Quick Reference

**Project Root**: `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer`
**Git Remote**: `github.com:MohammadShamchi/ai-bookmark-enhancer.git`
**Main Branch**: `main`
**Current Phase**: Phase 4 (UI & Testing)

## 🆘 If You Make a Mistake

If you accidentally create files in the wrong directory:

```bash
# Navigate to correct directory
cd /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer

# Notify the user immediately
# DO NOT try to fix it yourself without user approval
```

---

**Remember**: When in doubt, run `pwd` first! 🎯
