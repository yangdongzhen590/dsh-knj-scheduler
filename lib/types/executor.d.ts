import type { Context } from '@deepseek-ai/cordis';
import type { SessionId } from '@deepseek-ai/dsh-session';
import type { TaskDef } from './types.ts';
export interface ExecuteResult {
    status: 'created' | 'failed';
    sessionId?: string;
    workflowTaskId?: string;
    ms: number;
    error?: string;
}
/** Resolves persisted attachment ids to stored file paths (see attachments.ts). */
export interface AttachmentResolver {
    resolve(uploadId: string): Promise<{
        uploadId: string;
        name: string;
        path: string;
    } | null>;
}
/** Structural subset of the host `agents` service we use (see dsh-agent). */
export interface AgentsServiceLike {
    create(options: {
        sessionId: SessionId;
        meta?: {
            cwd: string;
        };
        setup?: (agentCtx: Context) => void;
    }): Promise<{
        agent: {
            id: SessionId;
            followup(message: unknown): void;
        };
    }>;
}
export declare function executeTask(ctx: Context, task: TaskDef, attachments?: AttachmentResolver): Promise<ExecuteResult>;
