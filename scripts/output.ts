import { getTaskOutput } from './track.js'

const id = process.argv[2]
if (!id) {
  console.error('Usage: node output.ts <task-id>')
  process.exit(1)
}

const result = getTaskOutput(id)
if (!result) {
  console.error(`Task ${id} not found`)
  process.exit(1)
}

console.log(`=== Task: ${id} ===`)
console.log(`Status: ${result.meta.status}`)
console.log(`Command: ${result.meta.command}`)
console.log(`Duration: ${result.meta.duration ? Math.floor(result.meta.duration/1000) + 's' : '-'}`)
console.log(`Exit Code: ${result.meta.exitCode ?? 'N/A'}`)
console.log('\n--- Output ---\n')
console.log(result.output)
