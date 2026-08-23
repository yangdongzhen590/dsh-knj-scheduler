import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-scheduler";
export interface Config {
    /** Override the data directory (default: $DSH_HOME/profiles/<profile>/dsh-scheduler). */
    dataDir?: string;
    /** Per-task execution-history retention (default 500). */
    historyRetention?: number;
    /** IANA timezone for cron evaluation (e.g. 'Asia/Shanghai'). Default: system local timezone. */
    timezone?: string;
}
export declare function apply(ctx: Context, config?: Config): void;
