---
name: ccb-task-tracker
description: |
  Persistent task tracking / 持久化任务追踪器
  Auto-tracks long-running commands, persists output to disk, background monitoring.
  用途：追踪长时间运行的命令（构建/测试/部署），输出持久化到磁盘，支持后台监控。
  触发词 / Triggers: "track this task", "run in background", "task output", "background job", "追踪任务"
---

# Task Tracker / 任务追踪器

Persistent task tracking with disk output storage and background monitoring.
持久化任务追踪，输出存储到磁盘，支持后台监控和完成通知。

## 功能 / Features

- **Track / 追踪** - 将命令作为任务追踪，自动记录输出
- **Background / 后台** - 后台运行，任务完成时通知
- **Output / 输出** - 获取任务输出（实时/完整）
- **List / 列表** - 查看所有追踪任务
- **Stop / 停止** - 停止运行中的任务

## 任务存储 / Task Storage

```
~/.openclaw/tasks/
  task_20260402_001/
    meta.json      # 任务元数据 / Task metadata
    output.txt     # 标准输出/错误 / stdout/stderr
    status.txt     # running | completed | failed | stopped
```

## 任务元数据 / Task Metadata

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

## 使用方法 / Usage

```bash
# 追踪命令作为任务 / Track a command as a task
node track.ts "npm run build"

# 后台运行，完成时通知 / Run in background, notify on complete
node background.ts "python3 train.py --epochs 100"

# 列出追踪的任务 / List tracked tasks
node list.ts

# 获取任务输出 / Get task output
node output.ts <task-id>

# 停止任务 / Stop a task
node stop.ts <task-id>
```

## 特性 / Features

- **自动清理** - 超过7天的任务自动删除 / Auto-cleanup tasks older than 7 days
- **输出截断** - 大输出只保留最后 100KB / Large outputs truncated to last 100KB
- **退出码追踪** - 记录完成时的退出码 / Record exit code on completion
- **耗时统计** - 记录开始和结束时间 / Record start/end time
- **标签支持** - 为任务打标签便于筛选 / Tag tasks for filtering
