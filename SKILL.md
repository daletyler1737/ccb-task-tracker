---
name: ccb-task-tracker
description: |
  Persistent task tracking inspired by Claude Code Best's TaskTool.
  Automatically tracks long-running commands as tasks, persists output to disk,
  supports background tasks with notification on completion.
  Use when: running long build/test/deploy commands, tracking multi-step workflows,
  or monitoring background processes. Triggers: "track this task", "run in background",
  "task output", "background job", "long running command".
---

# Task Tracker

Persistent task tracking with disk output storage and background monitoring.

## Usage

```bash
# Track a command as a task
node track.ts "npm run build"

# Run in background and notify on complete
node background.ts "python3 train.py --epochs 100"

# List tracked tasks
node list.ts

# Get task output
node output.ts <task-id>

# Stop a task
node stop.ts <task-id>
```

## Task Storage

Tasks stored in `~/.openclaw/tasks/`
```
~/.openclaw/tasks/
  task_20260402_001/
    meta.json      # Task metadata
    output.txt     # stdout/stderr
    status.txt    # running | completed | failed | stopped
```

## Task Metadata (meta.json)

```json
{
  "id": "20260402_001",
  "command": "npm run build",
  "cwd": "/path/to/project",
  "startedAt": "2026-04-02T18:00:00+08:00",
  "status": "running",
  "pid": 12345,
  "tags": ["build"]
}
```

## Features

- **Auto-cleanup**: Tasks older than 7 days auto-removed
- **Output truncation**: Large outputs truncated to last 100KB
- **Exit code tracking**: Records exit code on completion
- **Duration tracking**: Records start/end time
- **Tag support**: Tag tasks for filtering
