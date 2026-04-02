import { listTasks } from './track.js'

const tasks = listTasks()

console.log('\n  Tracked Tasks\n')
console.log('  ID          STATUS      DURATION  COMMAND')
console.log('  ' + '-'.repeat(70))

for (const task of tasks.slice(0, 20)) {
  const status = task.status.padEnd(10)
  const dur = task.duration
    ? `${Math.floor(task.duration/1000)}s`
    : task.status === 'running' ? 'running' : '-'
  const cmd = task.command.slice(0, 50)
  console.log(`  ${task.id}  ${status}  ${dur.padEnd(9)}  ${cmd}`)
}
console.log()
