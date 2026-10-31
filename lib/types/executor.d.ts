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
        /**
         * Session metadata. `agentPreset` is the ONLY preset channel the host
         * records: it is snapshotted into the session header before any async
         * setup runs. A top-level `agentPreset` option is not part of the host's
         * create contract and is silently ignored.
         */
        meta?: {
            cwd: string;
            agentPreset?: string;
        };
        /**
         * Creation-time composition of the agent's scoped world. This is where the
         * preset composition is mounted (`agentPresets.mount`) and the model
         * selection installed.
         */
        setup?: (agentCtx: Context) => void | Promise<void>;
    }): Promise<{
        agent: {
            id: SessionId;
            followup(message: unknown): void;
        };
    }>;
}
/**
 * The preset a GUI-created session would run.
 *
 * The registry owns that choice as `defaultId`; fall back to its config for
 * registries that predate the getter, unwrapping the volatile ref first.
 *
 * Resolving the id is not enough on its own: the host composes an agent's tool
 * plane only when that preset is mounted (see {@link resolvePresetId} and the
 * `setup` callback in {@link executeTask}).
 */
export declare function defaultAgentPreset(ctx: Context): string | undefined;
export declare function executeTask(ctx: Context, task: TaskDef, attachments?: AttachmentResolver): Promise<ExecuteResult>;
