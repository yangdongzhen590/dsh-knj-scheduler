/**
 * HTTP routes bridging the browser scheduler panel to the host. This layer
 * only parses requests, calls the store/scheduler/executor, and serializes
 * responses. Security: every mutating route accepts same-origin POST/PUT/
 * DELETE only and validates the body against a whitelist (see validateTask).
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import type { TaskStore } from './store.ts';
import type { TaskScheduler } from './scheduler.ts';
export interface WebServerService {
    register(route: {
        kind: 'exact' | 'prefix';
        path: string;
        handler: (request: IncomingMessage, response: ServerResponse) => void | Promise<void>;
    }): () => void;
}
export interface SchedulerHost {
    webServer: WebServerService;
}
export declare function mountSchedulerRoutes(host: SchedulerHost, ctx: Context, store: TaskStore, scheduler: TaskScheduler): () => void;
