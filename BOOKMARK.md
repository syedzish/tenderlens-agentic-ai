# TenderLens Agentic AI Bookmark

This file is the operational handoff point. Update it at the start and completion of every task, before long pauses, and before handoff.

## Current State

- Last updated: 2026-07-03 00:08 Asia/Riyadh
- Current milestone: Milestone 2 - Data, OKF, And Validator
- Current task: Commit data/OKF/workflow foundation and continue MCP/backend integration
- Status: In progress
- Working directory: `D:\Projects\kaggle\tenderlens-agentic-ai`
- Repo URL: https://github.com/syedzish/tenderlens-agentic-ai

## Active Task

### 2026-07-02 23:05 Asia/Riyadh - Start Foundation Docs

- Status: Started
- Files touched:
  - `PLAN.md`
  - `BOOKMARK.md`
  - `.agents-cli-spec.md`
  - `README.md`
  - `LICENSE`
  - `DATA_SOURCES.md`
  - `docs/`
- Decisions made:
  - Build in a new separate project folder under `D:\Projects\kaggle\tenderlens-agentic-ai`.
  - Follow the approved plan: ADK 2.0, Agents CLI, Agent Runtime, Vercel, mandatory A2A Evidence Audit Agent, Bounded Evidence Quality Loop, OKF + RAG, MCP, typed mode, voice mode, 5 MB upload, English default, Arabic RTL.
  - Create documentation before implementation code.
- Tests run: None yet.
- Known blockers: None.
- Next exact action: Finish the required foundation documentation, then run `agents-cli info` from the project root.

### 2026-07-02 23:09 Asia/Riyadh - Complete Foundation Docs

- Status: Completed
- Files touched:
  - `PLAN.md`
  - `BOOKMARK.md`
  - `.agents-cli-spec.md`
  - `README.md`
  - `LICENSE`
  - `DATA_SOURCES.md`
  - `.env.example`
  - `.gitignore`
  - `docs/SDD.md`
  - `docs/SOFTWARE_DESIGN.md`
  - `docs/ARCHITECTURE.md`
  - `docs/PRIVACY.md`
  - `docs/CONCEPT_MAP.md`
  - `docs/DEPLOYMENT.md`
  - `docs/EVALS.md`
  - `docs/diagrams/architecture.mmd`
- Decisions made:
  - Root foundation files are self-contained enough for handoff.
  - `docs/SDD.md` is used for Specification-Driven Development.
  - `docs/SOFTWARE_DESIGN.md` is the separate engineering blueprint.
  - `docs/CONCEPT_MAP.md` is the judge-facing concept evidence matrix.
- Tests run:
  - `rg --files`
- Known blockers: None.
- Next exact action: Run `agents-cli info`, then read the Agents CLI scaffold skill before enhancing/scaffolding the ADK project.

### 2026-07-02 23:15 Asia/Riyadh - Complete GitHub Baseline

- Status: Completed
- Files touched:
  - local git repository
  - GitHub repo `syedzish/tenderlens-agentic-ai`
  - `README.md`
  - `BOOKMARK.md`
- Decisions made:
  - Repository is public as required for Kaggle.
  - Branch name is `main`.
  - Remote is `origin` at `https://github.com/syedzish/tenderlens-agentic-ai.git`.
- Tests run:
  - `agents-cli info`
  - `git status --short`
  - initial `git push -u origin main`
- Known blockers:
  - Git normal commands require a per-command safe-directory override because the sandbox-created folder ownership differs from the current Windows user.
  - `agents-cli info` can run, but npm skill discovery logged an EPERM warning against the npm cache. This does not block scaffold yet.
- Next exact action: Run `agents-cli scaffold enhance . --deployment-target agent_runtime` or a compatible scaffold command after confirming the exact required flags.

### 2026-07-02 23:35 Asia/Riyadh - Correct TenderLens Naming

- Status: Completed
- Files touched:
  - Project docs and scaffold metadata containing product/repo names
  - GitHub repo rename
  - Local git remote URL
  - `uv.lock` package metadata line
- Decisions made:
  - Correct product/display name is `TenderLens Agentic AI`.
  - Correct repo/package slug is `tenderlens-agentic-ai`.
  - The prior misspelled product and repo names must not remain in project text.
- Tests run:
  - Text search for old spelling across project files excluding `.git` and `.venv`
  - GitHub repo rename to `syedzish/tenderlens-agentic-ai`
- Known blockers:
  - None for naming.
- Next exact action: Continue scaffold verification from `D:\Projects\kaggle\tenderlens-agentic-ai`.

### 2026-07-02 23:44 Asia/Riyadh - Complete Local Directory Rename

- Status: Completed
- Files touched:
  - Local project folder renamed to `D:\Projects\kaggle\tenderlens-agentic-ai`
  - Git remote verified as `https://github.com/syedzish/tenderlens-agentic-ai.git`
- Decisions made:
  - Continue all future work from the corrected local path.
- Tests run:
  - `git status --short`
  - `git remote -v`
  - Text search confirmed no prior misspelled product or repo names remain outside `.git`/`.venv`.
- Known blockers:
  - Dependency sync remains incomplete and should be revisited after naming correction.
- Next exact action: Re-check `agents-cli info` and Python dependency state from the corrected folder.

### 2026-07-02 23:53 Asia/Riyadh - Start Data/OKF/Workflow Foundation

- Status: Started
- Files touched:
  - `data/samples/`
  - `data/bidder_profiles/`
  - `data/okf/`
  - `app/services/`
  - `app/workflows/`
  - `tests/unit/`
- Decisions made:
  - Keep the ADK scaffold intact.
  - Add deterministic, testable services first so the project has a reliable backend spine even before live model credentials/dependency sync are resolved.
  - Use a synthetic curated tender fixture for the first public demo path and document it in `DATA_SOURCES.md`.
- Tests run: Pending.
- Known blockers:
  - Scaffolded `.venv` dependency sync is incomplete; ADK imports are not available locally yet.
- Next exact action: Create sample data, OKF parser/validator, retrieval, upload validation, workflow synthesis/audit simulation, and unit tests.

### 2026-07-03 00:08 Asia/Riyadh - Complete Data/OKF/Workflow Foundation

- Status: Completed
- Files touched:
  - `data/samples/smart_city_maintenance_tender.json`
  - `data/bidder_profiles/default_profile.json`
  - `data/okf/smart-city-maintenance-2026/`
  - `app/services/`
  - `app/workflows/tender_workflow.py`
  - `app/mcp/tools.py`
  - `app/agent.py`
  - `app/__init__.py`
  - `tests/unit/`
  - `DATA_SOURCES.md`
- Decisions made:
  - Use a synthetic curated tender as the first reliable public demo path.
  - Keep user upload path bounded by metadata validation first: PDF/TXT/MD/DOCX and 5 MB max.
  - Add deterministic OKF/RAG/profile/scenario/voice/sanitization services before deeper LLM wiring.
  - Replace the scaffold weather/time agent with a TenderLens Router Agent that wraps the deterministic tools.
  - Keep a guarded `app.__init__` fallback so deterministic unit tests run even while ADK dependencies are not locally synced.
- Tests run:
  - `python -m unittest discover -s tests/unit -p "test_*.py"` - 11 tests passing.
- Known blockers:
  - Scaffolded `.venv` dependency sync is still incomplete, so ADK runtime smoke tests cannot run yet.
- Next exact action: Commit the implementation slice, then resolve dependency sync or continue with frontend/API components that do not require local ADK imports.

## Handoff Notes

If another coding agent is asked to continue:

1. Read this file first.
2. Read `PLAN.md`.
3. Read `.agents-cli-spec.md`.
4. Check the latest git status.
5. Continue from the "Next exact action" above.

## Task Log

- 2026-07-02 23:09 Asia/Riyadh: Completed Milestone 0 foundation documentation files and project skeleton.
- 2026-07-02 23:15 Asia/Riyadh: Created public GitHub repo and pushed foundation commit.
- 2026-07-02 23:35 Asia/Riyadh: Corrected project/product/repo naming to TenderLens/tenderlens-agentic-ai.
- 2026-07-02 23:44 Asia/Riyadh: Renamed local project folder and verified corrected GitHub remote.
- 2026-07-02 23:53 Asia/Riyadh: Started deterministic data/OKF/workflow implementation slice.
- 2026-07-03 00:08 Asia/Riyadh: Completed sample tender/profile, OKF parser/validator, retrieval, upload validation, sanitization, voice reducer, deterministic workflow, router-agent replacement, and 11 unit tests.
