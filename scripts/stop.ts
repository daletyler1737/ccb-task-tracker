import { stopTask } from './track.js'

const id = process.argv[2]
if (!id) {
  console.error('Usage: node stop.ts <task-id>')
  process.exit(1)
}

const ok = stopTask(id)
console.log(ok ? `✓ Stopped task ${id}` : `✗ Failed to stop task ${id}`)
