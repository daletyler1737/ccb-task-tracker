/**
 * Task Tracker - Core module
 */
import { spawn, execSync, exec } from 'child_process'
import { writeFileSync, mkdirSync, readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const TASKS_DIR = join(homedir(), '.openclaw', 'tasks')
const MAX_OUTPUT = 100 * 1024 // 100KB

interface TaskMeta {
  id: string
  command: string
  cwd: string
  startedAt: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  pid: number
  exitCode?: number
  endedAt?: string
  duration?: number
  tags: string[]
}

function getDateStr(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
}

function getTaskId(): string {
  mkdirSync(TASKS_DIR, { recursive: true })
  const existing = readdirSync(TASKS_DIR)
    .filter(f => f.startsWith(`task_${getDateStr()}`))
  const num = existing.length + 1
  return `${getDateStr()}_${String(num).padStart(3,'0')}`
}

function createTaskDir(id: string): string {
  const dir = join(TASKS_DIR, `task_${id}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

export function trackCommand(command: string, options: { tags?: string[], cwd?: string, background?: boolean } = {}): TaskMeta {
  const id = getTaskId()
  const dir = createTaskDir(id)
  const cwd = options.cwd || process.cwd()

  const meta: TaskMeta = {
    id,
    command,
    cwd,
    startedAt: new Date().toISOString(),
    status: 'running',
    pid: 0,
    tags: options.tags || []
  }

  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2))
  writeFileSync(join(dir, 'status.txt'), 'running')

  const child = spawn('sh', ['-c', command], {
    cwd,
    detached: options.background || false,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  meta.pid = child.pid

  let output = ''
  child.stdout?.on('data', (data: Buffer) => {
    output += data.toString()
    if (output.length > MAX_OUTPUT) {
      output = output.slice(-MAX_OUTPUT)
    }
  })

  child.stderr?.on('data', (data: Buffer) => {
    output += data.toString()
    if (output.length > MAX_OUTPUT) {
      output = output.slice(-MAX_OUTPUT)
    }
  })

  child.on('close', (code) => {
    meta.status = code === 0 ? 'completed' : 'failed'
    meta.exitCode = code ?? undefined
    meta.endedAt = new Date().toISOString()
    meta.duration = new Date(meta.endedAt).getTime() - new Date(meta.startedAt).getTime()
    writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2))
    writeFileSync(join(dir, 'status.txt'), meta.status)
    writeFileSync(join(dir, 'output.txt'), output)
  })

  child.on('error', (err) => {
    meta.status = 'failed'
    meta.endedAt = new Date().toISOString()
    writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2))
    writeFileSync(join(dir, 'status.txt'), 'failed')
    writeFileSync(join(dir, 'output.txt'), err.message)
  })

  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2))

  return meta
}

export function listTasks(): TaskMeta[] {
  mkdirSync(TASKS_DIR, { recursive: true })
  const dirs = readdirSync(TASKS_DIR).filter(f => f.startsWith('task_'))
  const tasks: TaskMeta[] = []
  for (const dir of dirs) {
    try {
      const meta = JSON.parse(readFileSync(join(TASKS_DIR, dir, 'meta.json'), 'utf-8'))
      tasks.push(meta)
    } catch {}
  }
  return tasks.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export function getTaskOutput(id: string): { meta: TaskMeta, output: string } | null {
  const dir = join(TASKS_DIR, `task_${id}`)
  if (!existsSync(dir)) return null
  try {
    const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf-8'))
    const output = readFileSync(join(dir, 'output.txt'), 'utf-8')
    return { meta, output }
  } catch {
    return null
  }
}

export function stopTask(id: string): boolean {
  const dir = join(TASKS_DIR, `task_${id}`)
  if (!existsSync(dir)) return false
  try {
    const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf-8'))
    process.kill(meta.pid, 'SIGTERM')
    meta.status = 'stopped'
    meta.endedAt = new Date().toISOString()
    writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2))
    writeFileSync(join(dir, 'status.txt'), 'stopped')
    return true
  } catch {
    return false
  }
}

// CLI
if (import.meta.url.endsWith(process.argv[1]?.replace(/^file:\/\//, '') || '')) {
  const cmd = process.argv.slice(2).join(' ')
  if (!cmd) {
    console.error('Usage: node track.ts "<command>"')
    process.exit(1)
  }
  const result = trackCommand(cmd)
  console.log(JSON.stringify(result, null, 2))
}
