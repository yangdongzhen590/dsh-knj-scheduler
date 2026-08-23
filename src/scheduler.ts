/**
 * TaskScheduler: wraps croner with a task-id → Cron job map. `protect: true`
 * prevents overlapping executions of the same task (a late trigger while the
 * previous run is still in flight is dropped by croner).
 *
 * Trigger types:
 *   - cron     → cron expression
 *   - once     → one-shot at a Date (croner fires it exactly once)
 *   - interval → every N minutes (built as a cron minute-step pattern)
 */
import { Cron } from 'croner'
import type { TaskDef } from './types.ts'

/** Build the croner pattern (string for cron/interval, Date for once) from a task. */
export function buildCronPattern(task: { type: string; cron: string; runAt?: string; everyMinutes?: number }): string | Date {
  if (task.type === 'once') return new Date(task.runAt as string)
  if (task.type === 'interval') return `*/${task.everyMinutes} * * * *`
  return task.cron
}

export class TaskScheduler {
  private jobs = new Map<string, Cron>()

  /**
   * @param timezone IANA timezone for cron evaluation (e.g. 'Asia/Shanghai').
   *        Omit to use the system local timezone — what a user expects when
   *        they write a cron like `0 9 * * *`.
   */
  constructor(private readonly timezone?: string) {}

  /** Register (or re-register after an edit) one task. Returns false on an invalid schedule. */
  schedule(task: TaskDef, onFire: (task: TaskDef) => void): boolean {
    this.unschedule(task.id)
    try {
      const pattern = buildCronPattern(task)
      const job = new Cron(
        pattern,
        { protect: true, ...(this.timezone ? { timezone: this.timezone } : {}) },
        () => {
          onFire(task)
        },
      )
      this.jobs.set(task.id, job)
      return true
    } catch {
      return false
    }
  }

  unschedule(id: string): void {
    const job = this.jobs.get(id)
    if (job !== undefined) {
      job.stop()
      this.jobs.delete(id)
    }
  }

  nextRun(id: string): Date | null {
    return this.jobs.get(id)?.nextRun() ?? null
  }

  /** Dispose: stop every timer (plugin unload / HMR safety). */
  clear(): void {
    for (const job of this.jobs.values()) job.stop()
    this.jobs.clear()
  }
}
