/** One attachment reference persisted on a scheduled task. */
export interface WorkflowAttachmentRef {
    /** Directory name under `<dataDir>/attachments/` that holds the stored file. */
    uploadId: string;
    /** Display name of the stored file (already reduced to a safe basename). */
    name: string;
    /** Byte size, for the UI. */
    size?: number;
}
/** Per-file cap, mirroring the workflow plugin's MAX_UPLOAD_BYTES. */
export declare const MAX_ATTACHMENT_BYTES: number;
/** Attachment count cap, mirroring the workflow plugin's MAX_ATTACHMENTS. */
export declare const MAX_ATTACHMENTS = 20;
/** Request-body cap for the upload route (base64 inflation + JSON wrapper). */
export declare const ATTACHMENT_BODY_BYTES: number;
/**
 * Reduce an arbitrary upload name to a safe basename (or '' when unusable).
 * Kept local so the scheduler does not import the workflow plugin; the rules
 * match its `sanitizeFileName` so both halves behave identically.
 */
export declare function sanitizeAttachmentName(raw: unknown): string;
/** Normalize a persisted/task-input attachment list; `undefined` when empty. */
export declare function normalizeWorkflowAttachments(value: unknown): WorkflowAttachmentRef[] | undefined;
/** Why an attachment list is unusable, or null when it is fine (shape-only). */
export declare function describeWorkflowAttachmentsError(value: unknown, kind: string): string | null;
/** Persisted attachments of one task (stored file bytes, independent of staging). */
export declare class AttachmentStore {
    private readonly root;
    constructor(root: string);
    dirFor(uploadId: string): string;
    /** Absolute path of a stored attachment, or null when missing/unsafe. */
    resolve(uploadId: string): Promise<{
        uploadId: string;
        name: string;
        path: string;
    } | null>;
    /**
     * Store one uploaded attachment from base64 (the browser hands over content).
     * Throws with a user-facing message when the payload is unusable.
     */
    put(input: {
        name?: unknown;
        dataBase64?: unknown;
    }): Promise<WorkflowAttachmentRef>;
    /** Copy a stored attachment into `destDir`, returning the written path. */
    materialize(uploadId: string, destDir: string): Promise<{
        name: string;
        path: string;
    } | null>;
    /** Drop one stored attachment; safe to call for unknown ids. */
    discard(uploadId: string): Promise<boolean>;
    /** Drop attachment entries no longer referenced by any task. */
    discardUnreferenced(keep: Iterable<string>): Promise<number>;
}
