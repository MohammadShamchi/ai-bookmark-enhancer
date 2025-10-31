# AI Bookmark Enhancer - Project Structure

## 🎯 Critical: Project Root Directory

**✅ CORRECT PROJECT ROOT**: `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer`

**✅ Git Repository Root**: `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer`

**❌ PARENT DIRECTORY (DO NOT USE)**: `/Users/amohii/dev/UI-update-ai-bookmar-enhancer`

### ⚠️ CRITICAL RULES FOR AI AGENTS

1. **NEVER create files in `/Users/amohii/dev/UI-update-ai-bookmar-enhancer`** (parent directory)
2. **ALWAYS work in `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer`** (project root)
3. **NEVER use `../` to go to parent directory**
4. **ALWAYS verify you're in the git repository root before creating files**
5. **ALL code changes must be within the git repository**

### 🚨 Directory Confusion Warning

The parent directory `/Users/amohii/dev/UI-update-ai-bookmar-enhancer` is **NOT** the project directory.

Some AI agents mistakenly create files there. **DO NOT DO THIS**.

**Correct**: `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/core/myfile.js`
**Wrong**: `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/myfile.js`
**Wrong**: `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/src/core/myfile.js`

### Verification Commands

Before making any changes, AI agents should run:

```bash
# Verify current directory
pwd
# Expected output: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer

# Verify git root
git rev-parse --show-toplevel
# Expected output: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer

# Verify you're on the correct branch
git branch --show-current
# Should show: main or a feature branch
```

## 📁 Directory Structure

```
ai-bookmark-enhancer/                    # PROJECT ROOT - Work ONLY within this directory
├── .claude/                             # Claude Code settings (DO NOT COMMIT)
│   └── settings.local.json             # Local settings file
│
├── src/                                 # Source code directory
│   ├── core/                           # Core business logic modules
│   │   ├── bookmark-operations.js      # ✅ Bookmark CRUD operations
│   │   ├── decision-engine.js          # ✅ Processing flow decisions
│   │   ├── single-shot-processor.js    # ✅ Single-shot processing
│   │   ├── chunking-processor.js       # ✅ Chunking processing
│   │   ├── context-generator.js        # ✅ Global context generation
│   │   └── operation-executor.js       # ✅ Operation execution
│   │
│   ├── api/                            # API clients
│   │   └── openai-client.js            # ✅ OpenAI API client
│   │
│   ├── utils/                          # Utility functions
│   │   ├── metrics.js                  # ✅ Bookmark metrics calculation
│   │   ├── compression.js              # ✅ Gzip compression utilities
│   │   └── export.js                   # ✅ Export utilities
│   │
│   ├── validators/                     # Validation modules
│   │   └── response-validator.js       # ✅ AI response validation
│   │
│   └── config/                         # Configuration files
│       ├── models.json                 # ✅ Model configurations
│       └── prompts.js                  # ✅ AI prompt templates
│
├── background.js                        # ✅ Main service worker (397 lines)
├── background.js.backup                 # ✅ Backup of original (1072 lines)
├── popup.html                           # ✅ Extension popup UI
├── popup.js                             # ✅ Popup logic
├── options.html                         # Extension options page
├── options.js                           # Options page logic
├── manifest.json                        # Chrome extension manifest
│
├── AUDIT_REPORT.md                      # 📄 Implementation audit
├── IMPLEMENTATION_COMPLETE.md           # 📄 Implementation summary
├── INTEGRATION_GUIDE.md                 # 📄 Testing guide
├── PROJECT_STRUCTURE.md                 # 📄 This file
│
└── .gitignore                          # Git ignore rules
```

## 🚫 Files/Directories to NEVER Modify

1. **`.claude/settings.local.json`** - Local Claude Code settings
2. **`node_modules/`** - If it exists (dependencies)
3. **`*.crx`, `*.pem`, `*.zip`** - Build artifacts
4. **Files outside the project root** - NEVER touch parent directories

## ✅ Safe to Modify

1. **All files in `src/` directory** - Core application code
2. **`background.js`** - Main service worker
3. **`popup.html`, `popup.js`** - Popup UI
4. **`options.html`, `options.js`** - Options page
5. **Documentation files** - `*.md` files in project root
6. **`manifest.json`** - Extension configuration (with caution)

## 🔧 Development Workflow

### For AI Agents

1. **Before Starting Work**:
   ```bash
   # Verify location
   pwd  # Must be: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer

   # Check git status
   git status

   # Ensure you're on correct branch
   git branch --show-current
   ```

2. **Creating New Files**:
   - ✅ **DO**: Use absolute paths starting with `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/`
   - ✅ **DO**: Create files in appropriate subdirectories (`src/core/`, `src/utils/`, etc.)
   - ❌ **DON'T**: Create files in parent directory
   - ❌ **DON'T**: Use relative paths that go outside project root (`../`)

3. **Modifying Existing Files**:
   - ✅ **DO**: Read file first to understand structure
   - ✅ **DO**: Use Edit tool for precise changes
   - ❌ **DON'T**: Overwrite entire files without reading first
   - ❌ **DON'T**: Modify `.claude/` directory

4. **Committing Changes**:
   - ✅ **DO**: Stage only relevant code changes
   - ✅ **DO**: Write descriptive commit messages
   - ❌ **DON'T**: Commit `.claude/settings.local.json`
   - ❌ **DON'T**: Commit build artifacts or temp files

## 📊 Current Implementation Status

### Phase 1: Foundation ✅ 100%
- All 8 core modules implemented
- Decision engine operational
- Metrics calculation complete

### Phase 2: Single-Shot Flow ✅ 100%
- Compression utilities implemented
- Prompt templates configured
- Single-shot processor operational
- Operation executor ready

### Phase 3: Chunking Fallback ✅ 100%
- Context generator implemented
- Chunking processor complete
- Reconciliation logic ready

### Phase 4: UI & Testing 🔄 In Progress
- Popup UI enhanced with pre-processing info
- Consent modal added
- Manual testing pending
- End-to-end validation pending

## 🎯 Project Goals

1. **Transform from monolithic to modular architecture** ✅
2. **Implement intelligent dual-flow processing** ✅
3. **Optimize for speed and cost** ✅
4. **Ensure safe operation execution** ✅
5. **Provide comprehensive testing and documentation** ✅

## 📝 Documentation Files

- **`IMPLEMENTATION_SPEC.md`** - Detailed specification (if exists)
- **`AI_PROMPTS.md`** - Ready-to-use prompts for AI agents (if exists)
- **`AUDIT_REPORT.md`** - Implementation audit and findings
- **`IMPLEMENTATION_COMPLETE.md`** - Completion summary
- **`INTEGRATION_GUIDE.md`** - Testing procedures
- **`PROJECT_STRUCTURE.md`** - This file

## 🔒 Security Notes

1. **API Keys**: Never commit API keys to git
2. **User Data**: Handle bookmark data with care
3. **Permissions**: Only request necessary Chrome permissions
4. **Data Processing**: Always create backups before processing

## 🚀 Quick Start for New AI Agents

When starting a new task:

1. **Verify location**: `pwd` should show project root
2. **Read relevant docs**: Check existing `.md` files
3. **Understand context**: Review recent commits with `git log --oneline -5`
4. **Check current state**: Run `git status` to see what's changed
5. **Start work**: Always work within the project directory

## ⚠️ Common Mistakes to Avoid

### 🚫 Most Critical Mistake: Wrong Directory

**NEVER work in `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/`**

This is a common mistake that AI agents make. They sometimes:
- Create files in the parent directory
- Build modules outside the git repository
- Place documentation in the wrong location

**Why this happens**:
- Path autocomplete might stop at parent directory
- AI agents might truncate the full path
- Directory name similarity causes confusion

**How to prevent**:
```bash
# ALWAYS verify before creating ANY file
pwd
# Must show: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer
#            Not: /Users/amohii/dev/UI-update-ai-bookmar-enhancer
```

### Other Common Mistakes

1. ❌ Creating files in `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/` (parent dir)
2. ❌ Using paths like `../something.js` to escape project root
3. ❌ Modifying files in `.claude/` directory
4. ❌ Committing local settings or build artifacts
5. ❌ Working without verifying current directory first
6. ❌ Assuming relative paths when parent directory has same structure
7. ❌ Creating `src/` directory in parent instead of project root

## ✅ Checklist Before Any File Operation

- [ ] **CRITICAL**: Run `pwd` and confirm output is `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer`
- [ ] **CRITICAL**: Verified NOT in parent directory `/Users/amohii/dev/UI-update-ai-bookmar-enhancer`
- [ ] Confirmed git repository root with `git rev-parse --show-toplevel`
- [ ] Checked no uncommitted critical changes
- [ ] Using absolute paths starting with `/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/`
- [ ] Creating files in appropriate subdirectories (src/core/, src/utils/, etc.)
- [ ] Following existing code structure and patterns
- [ ] NOT using `../` in any file paths

---

**Last Updated**: 2025-10-31
**Project Version**: 2.0.0
**Architecture**: Modular ES6 Modules
**Status**: Phases 1-3 Complete, Phase 4 In Progress
