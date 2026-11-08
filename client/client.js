window.__ModuleLoader__.load({
	id: "dsh-scheduler",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		// src/client/locales.ts
		/**
		* Dictionary for the dsh-scheduler client bundle. Chinese is the key-set
		* source of truth; English mirrors it key for key. Copy is deliberately terse:
		* no exclamation marks, no full stops on one-line labels, Cron/DSH/KNJ stay Latin.
		*/
		const zh = {
			"entry.label": "调度器",
			"panel.title": "定时任务",
			"panel.subtitle": "按时触发：自动新建会话，或启动 KNJ 工作流",
			"btn.new": "新建任务",
			"btn.refresh": "刷新",
			"btn.back": "返回",
			"btn.cancel": "取消",
			"btn.save": "创建任务",
			"btn.saveChanges": "保存更改",
			"btn.close": "关闭",
			"btn.run": "立即执行",
			"btn.edit": "编辑",
			"btn.delete": "删除",
			"btn.history": "执行记录",
			"btn.confirmDelete": "删除这个任务？执行记录仍会保留",
			"col.task": "任务",
			"col.cron": "Cron",
			"col.next": "下次触发",
			"col.status": "状态",
			"col.last": "最近执行",
			"col.actions": "操作",
			"status.enabled": "启用",
			"status.disabled": "停用",
			"status.running": "执行中",
			"status.created": "已触发",
			"status.failed": "失败",
			"status.skipped": "跳过",
			"form.title.new": "新建任务",
			"form.title.edit": "编辑任务",
			"form.group.task": "任务",
			"form.group.trigger": "触发",
			"form.group.execution": "执行",
			"form.group.runtime": "运行",
			"form.name": "任务名称",
			"form.namePlaceholder": "如：每日数据汇总",
			"form.type": "触发方式",
			"form.type.cron": "Cron 表达式",
			"form.type.once": "指定时间",
			"form.type.interval": "固定间隔",
			"form.cron": "Cron 表达式",
			"form.runAt": "执行时间",
			"form.everyMinutes": "间隔分钟数",
			"form.cwd": "工作目录",
			"form.cwdDefault": "默认（当前工作区）",
			"form.cwdHint": "执行时创建的会话落在这个工作区，之后可从执行记录直接打开；工作流任务需选择具体目录",
			"form.prompt": "提示词",
			"form.promptHint": "到点作为首条消息带入新建的 DSH 会话",
			"form.executionKind": "执行方式",
			"form.promptSession": "提示词会话",
			"form.workflow": "工作流（KNJ）",
			"form.workflowSelect": "选择工作流",
			"form.workflowSelectPlaceholder": "请选择工作流",
			"form.workflowTitle": "流程任务标题",
			"form.workflowTitlePlaceholder": "例如：渠道日报",
			"form.workflowDescription": "流程任务描述（可选）",
			"form.workflowStoryCode": "用户故事编码（可选）",
			"form.workflowStoryCodePlaceholder": "如 US-123",
			"form.workflowPathInputs": "文件入参（按路径引用）",
			"form.workflowPathInputsHint": "每次触发时读取路径（不保存快照）；相对路径按工作目录解析，文件不存在会导致本次启动失败",
			"form.workflowPathRequiredPlaceholder": "必填：如 docs/today.md",
			"form.workflowPathPlaceholder": "可留空，如 docs/today.md",
			"form.workflowAttachments": "附件（无需声明）",
			"form.workflowAttachmentsHint": "上传的文件保存在调度器目录，每次触发都使用这份快照",
			"form.workflowAttachmentsPick": "选择文件",
			"form.workflowAttachmentsUploading": "上传中…",
			"form.workflowAttachmentsNone": "未选择文件",
			"form.workflowAttachmentsCount": "已选 {n} 个",
			"form.workflowAttachmentsFailed": "附件上传失败：",
			"btn.remove": "移除",
			"form.workflowNoFileInputs": "该工作流没有「文件」类型入参，因此没有路径字段",
			"form.workflowNoFileInputsDetailsLabel": "如何声明文件入参",
			"form.workflowNoFileInputsDetails": "附件不需要声明，直接把本地文件交给流程；只有需要按路径引用（文件由别的流程产出、每次读最新）时才声明：打开「流程设计」→ 该工作流 → 顶部「输入参数」→ 添加「文件」类型参数并保存。",
			"form.workflowDetails": "路径引用与附件的区别",
			"form.workflowAttachmentsDetails": "节点通过 ${inputs.附件} 取得换行拼接的绝对路径清单，并自行解析文档。附件是上传时的快照；路径入参在每次触发时读取当时的文件。",
			"form.nextRun": "下次执行",
			"form.dayScale": "一天中的时刻",
			"form.nextRunEmpty": "暂无下次触发时间",
			"form.nextRunDisabled": "任务已停用，不会触发",
			"form.upcoming": "接下来几次",
			"form.enabled": "启用任务",
			"form.promptPlaceholder": "例如：汇总昨天各渠道的数据，输出 Markdown 报告",
			"form.cronPlaceholder": "0 9 * * * 或 0 */2 * * *",
			"form.cronValid": "表达式有效",
			"form.cronInvalid": "表达式无效",
			"type.cron": "Cron",
			"type.once": "一次性",
			"type.interval": "间隔",
			"type.everyMinutes": "每 {n} 分钟",
			"history.title": "执行记录",
			"history.forTask": "执行记录 · {name}",
			"history.empty": "暂无执行记录",
			"history.emptyHint": "任务触发后会在这里留下可回看的记录",
			"history.emptyForTask": "这个任务还没有执行记录",
			"history.loading": "加载执行记录…",
			"history.disabledTask": "任务已停用，不会触发",
			"history.retention": "最多保留 500 条",
			"history.openSession": "打开会话",
			"history.openWorkflowTask": "查看流程任务",
			"btn.executions": "执行列表",
			"btn.validate": "校验",
			"tab.tasks": "任务",
			"tab.executions": "执行记录",
			"history.all.retention": "最多保留 500 条",
			"run.pending": "正在启动…",
			"run.promptStarted": "已创建提示词会话",
			"run.workflowStarted": "已启动流程任务；详细状态见流程运行",
			"session.openUnregistered": "该会话位于未注册的工作区（{path}），无法直接打开；请从该目录启动 dsh web 后再查看执行产出",
			"pager.prev": "上一页",
			"pager.next": "下一页",
			"pager.summary": "{p} / {n} 页 · 共 {c} 条",
			"pager.pageSize": "每页条数",
			"pager.pageSizeUnit": "条/页",
			"list.next": "下次",
			"tasks.empty": "还没有任务",
			"tasks.emptyHint": "新建一个任务，到点自动发起会话或工作流",
			"error.load": "加载任务失败",
			"error.save": "保存失败",
			"error.delete": "删除失败",
			"error.run": "执行失败",
			"error.untrusted": "非可信来源",
			"next.unknown": "—"
		};
		const en = {
			"entry.label": "Scheduler",
			"panel.title": "Scheduled Tasks",
			"panel.subtitle": "Fires on schedule: opens a new session or starts a KNJ workflow",
			"btn.new": "New Task",
			"btn.refresh": "Refresh",
			"btn.back": "Back",
			"btn.cancel": "Cancel",
			"btn.save": "Create Task",
			"btn.saveChanges": "Save Changes",
			"btn.close": "Close",
			"btn.run": "Run Now",
			"btn.edit": "Edit",
			"btn.delete": "Delete",
			"btn.history": "Executions",
			"btn.confirmDelete": "Delete this task? Execution records are kept",
			"col.task": "Task",
			"col.cron": "Cron",
			"col.next": "Next Run",
			"col.status": "Status",
			"col.last": "Last Run",
			"col.actions": "Actions",
			"status.enabled": "Enabled",
			"status.disabled": "Disabled",
			"status.running": "Running",
			"status.created": "Triggered",
			"status.failed": "Failed",
			"status.skipped": "Skipped",
			"form.title.new": "New Task",
			"form.title.edit": "Edit Task",
			"form.group.task": "Task",
			"form.group.trigger": "Trigger",
			"form.group.execution": "Execution",
			"form.group.runtime": "Runtime",
			"form.name": "Task name",
			"form.namePlaceholder": "e.g. Daily data summary",
			"form.type": "Trigger type",
			"form.type.cron": "Cron expression",
			"form.type.once": "Specific time",
			"form.type.interval": "Fixed interval",
			"form.cron": "Cron expression",
			"form.runAt": "Run at",
			"form.everyMinutes": "Interval (minutes)",
			"form.cwd": "Working directory",
			"form.cwdDefault": "Default (current workspace)",
			"form.cwdHint": "Sessions are created in this workspace and can be reopened from the execution records. Workflow tasks need a concrete directory",
			"form.prompt": "Prompt",
			"form.promptHint": "Sent as the first message of the new DSH session when the task fires",
			"form.executionKind": "Execution type",
			"form.promptSession": "Prompt session",
			"form.workflow": "Workflow (KNJ)",
			"form.workflowSelect": "Select workflow",
			"form.workflowSelectPlaceholder": "Select a workflow",
			"form.workflowTitle": "Workflow task title",
			"form.workflowTitlePlaceholder": "e.g. Channel digest",
			"form.workflowDescription": "Workflow task description (optional)",
			"form.workflowStoryCode": "User story code (optional)",
			"form.workflowStoryCodePlaceholder": "e.g. US-123",
			"form.workflowPathInputs": "File inputs (by path)",
			"form.workflowPathInputsHint": "The path is read at every fire (no snapshot). Relative paths resolve against the working directory; a missing file fails that launch",
			"form.workflowPathRequiredPlaceholder": "Required: e.g. docs/today.md",
			"form.workflowPathPlaceholder": "Optional, e.g. docs/today.md",
			"form.workflowAttachments": "Attachments (no declaration needed)",
			"form.workflowAttachmentsHint": "Uploaded files are stored in the scheduler directory; every fire uses this snapshot",
			"form.workflowAttachmentsPick": "Choose files",
			"form.workflowAttachmentsUploading": "Uploading…",
			"form.workflowAttachmentsNone": "No files chosen",
			"form.workflowAttachmentsCount": "{n} selected",
			"form.workflowAttachmentsFailed": "Attachment upload failed: ",
			"btn.remove": "Remove",
			"form.workflowNoFileInputs": "This workflow declares no file input, so there is no path field",
			"form.workflowNoFileInputsDetailsLabel": "How to declare a file input",
			"form.workflowNoFileInputsDetails": "Attachments need no declaration and hand local files straight to the workflow. Declare a path input only when another job produces the file and it must be read at fire time: open “Flow Design” → the workflow → “Inputs” at the top → add a “File” parameter and save.",
			"form.workflowDetails": "Path inputs vs. attachments",
			"form.workflowAttachmentsDetails": "Nodes read ${inputs.attachment} — the newline-joined absolute paths — and parse the documents themselves. Attachments are snapshots from upload time; path inputs read whatever exists at fire time.",
			"form.nextRun": "Next run",
			"form.dayScale": "Time of day",
			"form.nextRunEmpty": "No upcoming run",
			"form.nextRunDisabled": "Task is disabled and will not fire",
			"form.upcoming": "Next runs",
			"form.enabled": "Enable task",
			"form.promptPlaceholder": "e.g. Summarize yesterday's channel data into a Markdown report",
			"form.cronPlaceholder": "0 9 * * * or 0 */2 * * *",
			"form.cronValid": "Valid expression",
			"form.cronInvalid": "Invalid expression",
			"type.cron": "Cron",
			"type.once": "Once",
			"type.interval": "Interval",
			"type.everyMinutes": "Every {n} min",
			"history.title": "Executions",
			"history.forTask": "Executions · {name}",
			"history.empty": "No executions yet",
			"history.emptyHint": "Runs appear here once the task fires",
			"history.emptyForTask": "This task has no executions yet",
			"history.loading": "Loading executions…",
			"history.disabledTask": "Task is disabled and will not fire",
			"history.retention": "Up to 500 entries",
			"history.openSession": "Open session",
			"history.openWorkflowTask": "Open workflow task",
			"btn.executions": "Executions",
			"btn.validate": "Validate",
			"tab.tasks": "Tasks",
			"tab.executions": "Executions",
			"history.all.retention": "Up to 500 entries",
			"run.pending": "Starting…",
			"run.promptStarted": "Prompt session created",
			"run.workflowStarted": "Workflow task started; see workflow runs for status",
			"session.openUnregistered": "This session lives in an unregistered workspace ({path}) and cannot be opened here; start dsh web from that directory to view it",
			"pager.prev": "Previous",
			"pager.next": "Next",
			"pager.summary": "Page {p} of {n} · {c} entries",
			"pager.pageSize": "Rows per page",
			"pager.pageSizeUnit": "per page",
			"list.next": "Next",
			"tasks.empty": "No tasks yet",
			"tasks.emptyHint": "Create a task and it will start a session or workflow on schedule",
			"error.load": "Failed to load tasks",
			"error.save": "Failed to save",
			"error.delete": "Failed to delete",
			"error.run": "Failed to run",
			"error.untrusted": "Untrusted origin",
			"next.unknown": "—"
		};
		// src/client/api.ts
		async function api(path, init) {
			const response = await fetch(path, {
				headers: { "content-type": "application/json" },
				...init
			});
			const body = await response.json().catch(() => null);
			if (!response.ok) throw new Error(body?.error ?? `HTTP ${response.status}`);
			return body;
		}
		function listTasks() {
			return api("/dsh-scheduler/tasks");
		}
		function listWorkflows() {
			return api("/dsh-scheduler/workflows");
		}
		function createTask(input) {
			return api("/dsh-scheduler/tasks", {
				method: "POST",
				body: JSON.stringify(input)
			});
		}
		function updateTask(id, input) {
			return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}`, {
				method: "PUT",
				body: JSON.stringify(input)
			});
		}
		function deleteTask(id) {
			return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
		}
		/**
		* Upload one attachment into the scheduler's persistent store (not the workflow plugin's
		* 24h staging area): a scheduled task fires repeatedly and needs the bytes to survive.
		* Returns the stored reference to put on the task input.
		*/
		function uploadAttachment(name, dataBase64) {
			return api("/dsh-scheduler/attachments", {
				method: "POST",
				body: JSON.stringify({
					name,
					dataBase64
				})
			});
		}
		function toggleTask(id, enabled) {
			return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}/toggle`, {
				method: "POST",
				body: JSON.stringify({ enabled })
			});
		}
		function runTask(id) {
			return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}/run`, { method: "POST" });
		}
		function taskHistory(id) {
			return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}/history`);
		}
		/** List recent executions across ALL tasks. */
		function listHistory() {
			return api("/dsh-scheduler/history");
		}
		/** Compute the next run time for a draft (unsaved) schedule. */
		function previewSchedule(params) {
			const q = new URLSearchParams();
			q.set("type", params.type);
			if (params.cron) q.set("cron", params.cron);
			if (params.runAt) q.set("runAt", params.runAt);
			if (params.everyMinutes !== void 0) q.set("everyMinutes", String(params.everyMinutes));
			return api(`/dsh-scheduler/preview?${q.toString()}`);
		}
		// src/client/icons.tsx
		function Svg({ children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: 16,
				height: 16,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.5,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": true,
				style: {
					flexShrink: 0,
					display: "block"
				},
				children
			});
		}
		function IconClock() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "8",
				cy: "8",
				r: "6.25"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 4.5V8l2.4 1.5" })] });
		}
		function IconPlus() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 3.2v9.6M3.2 8h9.6" }) });
		}
		function IconRefresh() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.2 8a5.2 5.2 0 1 1-1.5-3.7" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.4 2.6v3h-3" })] });
		}
		function IconEdit() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11.3 2.7a1.4 1.4 0 0 1 2 2L5 13l-3 .7.7-3 8.6-8z" }) });
		}
		function IconPlay() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5.2 3.4v9.2l7.1-4.6z" }) });
		}
		function IconHistory() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.8 8a5.2 5.2 0 1 1 1.5 3.7" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.8 6.5V9.5h3" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 4.6V8l2.3 1.4" })
			] });
		}
		function IconCheck() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.2 8.4l3 3 6.6-6.8" }) });
		}
		function IconCross() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 4l8 8M12 4l-8 8" }) });
		}
		function IconChevronLeft() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 3.5L5.5 8l4.5 4.5" }) });
		}
		function IconChevronDown() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.5 6L8 10.5 12.5 6" }) });
		}
		// src/client/pager.ts
		/**
		* Client-side pagination helpers for the history views. Pure functions with
		* no React dependency so they stay unit-testable (pager.test.mjs).
		*/
		const PAGE_SIZES = [
			10,
			25,
			50,
			100
		];
		/** Slice `items` into pages of `pageSize`, clamping an out-of-range page. */
		function pageSlice(items, page, pageSize) {
			const total = items.length;
			const pages = Math.max(1, Math.ceil(total / pageSize));
			const pageSafe = Math.min(Math.max(page, 0), pages - 1);
			const start = pageSafe * pageSize;
			return {
				rows: items.slice(start, start + pageSize),
				pages,
				pageSafe
			};
		}
		/** Substitute {key} placeholders in a locale template. */
		function fmt(template, vars) {
			return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
		}
		// src/client/SchedulerPanel.tsx
		/**
		* Scheduler panel: task list / create-edit form / execution history. Rendered
		* inline as the Settings → 定时任务 section (`embedded`), or as a standalone
		* modal when `embedded` is false. Styled only with host aliases: a neutral
		* paper surface, black ticks, one cobalt signal (--dsw-static-deepseek-500)
		* for the scale, focus rings and the active tab. No emoji, no gradients.
		*
		* Trigger types: cron (expression), once (specific time), interval (every N min).
		* The form previews the next run time live via /dsh-scheduler/preview.
		*/
		const CRON_RE = /^[0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+(\s+[0-9*,/\-?L#w]+)?$/;
		const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
		const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
		const T = {
			bg: "var(--dsw-alias-bg-base)",
			layer: "var(--dsw-alias-bg-layer-1)",
			text: "var(--dsw-alias-label-primary)",
			text2: "var(--dsw-alias-label-secondary)",
			hairline: "color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent)",
			strong: "color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)",
			surface: "color-mix(in srgb, var(--dsw-alias-label-primary) 3%, var(--dsw-alias-bg-layer-1))",
			surfaceHover: "color-mix(in srgb, var(--dsw-alias-label-primary) 6%, var(--dsw-alias-bg-layer-1))",
			tick: "color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent)",
			signal: "var(--dsw-static-deepseek-500)",
			primary: "var(--dsw-alias-brand-primary)",
			onPrimary: "var(--dsw-alias-bg-base)",
			success: "var(--dsw-static-green-500)",
			danger: "var(--dsw-alias-state-error-primary)",
			warn: "var(--dsw-alias-state-warn-primary)",
			font: "var(--dsw-font-family)"
		};
		const S = {
			overlay: {
				position: "fixed",
				inset: 0,
				zIndex: 1e3,
				background: "rgba(0,0,0,.45)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: T.font,
				color: T.text,
				fontSize: 14,
				lineHeight: "20px"
			},
			panel: {
				width: 720,
				maxWidth: "94vw",
				height: "80vh",
				display: "flex",
				flexDirection: "column",
				background: T.layer,
				border: `1px solid ${T.hairline}`,
				borderRadius: 16,
				boxShadow: "0 24px 64px rgba(0,0,0,.28)",
				overflow: "hidden"
			},
			embedRoot: {
				display: "flex",
				flexDirection: "column",
				height: "100%",
				minHeight: 0,
				width: "100%",
				fontFamily: T.font,
				color: T.text,
				fontSize: 14,
				lineHeight: "20px",
				boxSizing: "border-box"
			},
			embedPanel: {
				display: "flex",
				flexDirection: "column",
				flex: 1,
				minHeight: 0,
				overflow: "hidden"
			},
			head: {
				display: "flex",
				alignItems: "center",
				gap: 12,
				flexShrink: 0,
				padding: "0 0 16px",
				borderBottom: `1px solid ${T.hairline}`
			},
			embedHead: {
				display: "flex",
				alignItems: "center",
				gap: 12,
				flexShrink: 0,
				padding: "0 0 16px",
				borderBottom: `1px solid ${T.hairline}`
			},
			headTitleCol: {
				display: "flex",
				flexDirection: "column",
				gap: 4,
				flex: 1,
				minWidth: 0
			},
			titleIcon: {
				color: T.text,
				display: "inline-flex",
				flexShrink: 0
			},
			title: {
				fontSize: 16,
				lineHeight: "22px",
				fontWeight: 500,
				color: T.text,
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			sub: {
				color: T.text2,
				fontSize: 12,
				lineHeight: "16px",
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			spacer: { flex: 1 },
			tabBar: {
				display: "flex",
				gap: 20,
				alignItems: "center",
				flexShrink: 0,
				borderBottom: `1px solid ${T.hairline}`,
				padding: "0 20px"
			},
			embedTabBar: {
				display: "flex",
				gap: 20,
				alignItems: "center",
				flexShrink: 0,
				borderBottom: `1px solid ${T.hairline}`,
				padding: 0
			},
			body: {
				flex: 1,
				overflow: "auto",
				padding: "16px 20px"
			},
			embedBody: {
				flex: 1,
				overflow: "auto",
				padding: "16px 0 0"
			},
			footer: {
				flexShrink: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 8,
				padding: "12px 20px",
				borderTop: `1px solid ${T.hairline}`,
				background: T.layer
			},
			embedFooter: {
				flexShrink: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 8,
				padding: "12px 0 0",
				borderTop: `1px solid ${T.hairline}`
			},
			pagerBar: {
				flexShrink: 0,
				borderTop: `1px solid ${T.hairline}`,
				padding: "12px 20px"
			},
			embedPagerBar: {
				flexShrink: 0,
				borderTop: `1px solid ${T.hairline}`,
				padding: "12px 0 0"
			},
			pager: {
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 8,
				flexWrap: "wrap"
			},
			pagerGroup: {
				display: "flex",
				alignItems: "center",
				gap: 8,
				flexWrap: "wrap"
			},
			pagerInfo: {
				fontSize: 12,
				lineHeight: "16px",
				color: T.text2,
				whiteSpace: "nowrap"
			},
			toolbar: {
				display: "flex",
				gap: 8,
				marginBottom: 16,
				alignItems: "center",
				flexWrap: "wrap"
			},
			metaText: {
				color: T.text2,
				fontSize: 12,
				lineHeight: "16px"
			},
			banner: {
				display: "flex",
				alignItems: "center",
				gap: 8,
				borderRadius: 8,
				padding: "8px 12px",
				marginBottom: 16,
				fontSize: 13,
				lineHeight: "18px",
				color: T.text,
				border: "1px solid"
			},
			taskList: {
				background: T.surface,
				border: `1px solid ${T.hairline}`,
				borderRadius: 12,
				overflow: "hidden"
			},
			taskRow: {
				display: "flex",
				flexDirection: "column",
				gap: 8,
				padding: 16,
				color: T.text
			},
			taskHead: {
				display: "flex",
				alignItems: "flex-start",
				gap: 12
			},
			taskIdentity: {
				display: "flex",
				flexDirection: "column",
				gap: 2,
				flex: 1,
				minWidth: 0
			},
			taskName: {
				fontSize: 14,
				lineHeight: "20px",
				fontWeight: 500,
				color: T.text,
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			taskCwd: {
				color: T.text2,
				fontSize: 12,
				lineHeight: "16px",
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			taskActions: {
				display: "flex",
				alignItems: "center",
				gap: 4,
				flexWrap: "wrap",
				marginTop: 4,
				paddingTop: 12,
				borderTop: `1px solid ${T.hairline}`
			},
			taskActionsEnd: { marginLeft: "auto" },
			triggerMono: {
				fontFamily: MONO,
				fontVariantNumeric: "tabular-nums",
				fontFeatureSettings: "\"tnum\" 1",
				fontSize: 12,
				lineHeight: "16px",
				color: T.text2,
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			summary: {
				margin: 0,
				color: T.text2,
				fontSize: 13,
				lineHeight: "18px",
				display: "-webkit-box",
				WebkitBoxOrient: "vertical",
				WebkitLineClamp: 2,
				overflow: "hidden",
				overflowWrap: "anywhere"
			},
			dayScale: {
				display: "flex",
				flexDirection: "column",
				gap: 4,
				marginTop: 4
			},
			dayScaleLabel: {
				color: T.text2,
				fontSize: 12,
				lineHeight: "16px",
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			dayTrack: {
				position: "relative",
				height: 16,
				marginTop: 2,
				marginBottom: 2
			},
			dayBaseline: {
				position: "absolute",
				left: 0,
				right: 0,
				top: 6,
				height: 1,
				background: T.hairline
			},
			dayTick: {
				position: "absolute",
				top: 0,
				width: 1,
				transform: "translateX(-50%)"
			},
			dayLabels: {
				display: "flex",
				justifyContent: "space-between",
				color: T.text2,
				fontSize: 12,
				lineHeight: "16px"
			},
			dayMarkerWrap: {
				position: "absolute",
				top: 0,
				height: 16,
				width: 0,
				transform: "translateX(-50%)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 2
			},
			dayMarkerBar: {
				width: 2,
				height: 8,
				borderRadius: 1,
				background: T.signal
			},
			dayMarkerDot: {
				width: 6,
				height: 6,
				borderRadius: "50%",
				background: T.signal,
				boxShadow: `0 0 0 2px ${T.surface}`
			},
			empty: {
				padding: "48px 24px",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 8,
				textAlign: "center"
			},
			emptyTitle: {
				color: T.text,
				fontSize: 14,
				lineHeight: "20px",
				fontWeight: 500
			},
			emptyHint: {
				color: T.text2,
				fontSize: 13,
				lineHeight: "18px",
				maxWidth: 320
			},
			emptyAction: { marginTop: 8 },
			logSurface: {
				position: "relative",
				background: T.surface,
				border: `1px solid ${T.hairline}`,
				borderRadius: 12,
				padding: "4px 0",
				overflow: "hidden"
			},
			rail: {
				position: "absolute",
				left: 19,
				top: 12,
				bottom: 12,
				width: 1,
				background: T.hairline,
				zIndex: 2,
				pointerEvents: "none"
			},
			logRow: {
				position: "relative",
				display: "grid",
				columnGap: 12,
				alignItems: "center",
				minHeight: 44,
				padding: "8px 16px 8px 40px",
				color: T.text,
				zIndex: 1
			},
			logDot: {
				position: "absolute",
				left: 16,
				top: "50%",
				width: 7,
				height: 7,
				marginTop: -3.5,
				borderRadius: "50%",
				zIndex: 3,
				boxShadow: `0 0 0 2px ${T.surface}`
			},
			logName: {
				fontSize: 13,
				lineHeight: "18px",
				color: T.text,
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			logTime: {
				fontFamily: MONO,
				fontVariantNumeric: "tabular-nums",
				fontFeatureSettings: "\"tnum\" 1",
				fontSize: 12,
				lineHeight: "16px",
				color: T.text2,
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			logStatus: {
				fontSize: 12,
				lineHeight: "16px",
				color: T.text2,
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			logDuration: {
				fontFamily: MONO,
				fontVariantNumeric: "tabular-nums",
				fontSize: 12,
				lineHeight: "16px",
				color: T.text2,
				textAlign: "right"
			},
			logActions: {
				display: "flex",
				alignItems: "center",
				justifyContent: "flex-end",
				gap: 4,
				flexShrink: 0
			},
			group: {
				paddingTop: 24,
				marginTop: 24,
				borderTop: `1px solid ${T.hairline}`
			},
			groupFirst: {
				paddingTop: 0,
				marginTop: 0,
				borderTop: "none"
			},
			groupTitle: {
				display: "flex",
				alignItems: "center",
				gap: 8,
				fontSize: 13,
				lineHeight: "18px",
				fontWeight: 500,
				color: T.text,
				marginBottom: 16
			},
			groupTick: {
				width: 4,
				height: 12,
				borderRadius: 1,
				background: T.signal,
				display: "inline-block",
				flexShrink: 0
			},
			field: { marginBottom: 20 },
			fieldLast: { marginBottom: 0 },
			label: {
				display: "block",
				fontSize: 13,
				lineHeight: "18px",
				fontWeight: 500,
				color: T.text2,
				marginBottom: 8
			},
			required: {
				color: T.text,
				fontWeight: 500
			},
			hint: {
				marginTop: 8,
				fontSize: 12,
				lineHeight: "16px",
				color: T.text2
			},
			errorText: {
				marginTop: 8,
				fontSize: 12,
				lineHeight: "16px",
				color: T.danger
			},
			inputRow: {
				display: "flex",
				gap: 8,
				alignItems: "flex-start"
			},
			selectWrap: {
				position: "relative",
				width: "100%"
			},
			selectChevron: {
				position: "absolute",
				right: 12,
				top: "50%",
				transform: "translateY(-50%)",
				color: T.text2,
				pointerEvents: "none",
				display: "inline-flex"
			},
			segRow: {
				display: "flex",
				gap: 8,
				flexWrap: "wrap"
			},
			upcoming: { marginTop: 8 },
			upcomingLabel: {
				color: T.text2,
				fontSize: 12,
				lineHeight: "16px",
				marginBottom: 4
			},
			upcomingList: {
				display: "flex",
				flexDirection: "column",
				gap: 4,
				fontFamily: MONO,
				fontVariantNumeric: "tabular-nums",
				fontSize: 12,
				lineHeight: "16px",
				color: T.text2
			},
			nextValue: {
				fontFamily: MONO,
				fontVariantNumeric: "tabular-nums",
				fontSize: 14,
				lineHeight: "20px",
				color: T.text
			},
			nextEmpty: {
				fontFamily: MONO,
				fontSize: 13,
				lineHeight: "18px",
				color: T.text2
			},
			details: {
				marginTop: 12,
				fontSize: 13,
				lineHeight: "18px",
				color: T.text2
			},
			detailSummary: {
				cursor: "pointer",
				width: "fit-content",
				color: T.text2
			},
			detailText: { margin: "8px 0 0" },
			chipName: {
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
				maxWidth: 240
			},
			pathRow: {
				display: "grid",
				gridTemplateColumns: "minmax(96px, 140px) minmax(0, 1fr) auto",
				gap: 8,
				alignItems: "center",
				marginTop: 8
			},
			pathName: {
				fontSize: 12,
				lineHeight: "16px",
				color: T.text2,
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			code: {
				fontFamily: MONO,
				fontSize: 12,
				lineHeight: "16px",
				color: T.text2,
				whiteSpace: "nowrap"
			},
			switchLabel: {
				fontSize: 13,
				lineHeight: "18px",
				color: T.text2
			}
		};
		/** Interaction states that inline style objects cannot express. Scoped to this panel. */
		const PANEL_CSS = `
.dss-root, .dss-root *, .dss-root *::before, .dss-root *::after { box-sizing: border-box; }
.dss-root button, .dss-root input, .dss-root select, .dss-root textarea, .dss-root summary { font-family: inherit; outline: none; }
.dss-root button:focus-visible, .dss-root input:focus-visible, .dss-root select:focus-visible,
.dss-root textarea:focus-visible, .dss-root summary:focus-visible, .dss-root [role="switch"]:focus-visible {
  outline: 2px solid var(--dsw-static-deepseek-500); outline-offset: 2px;
}
.dss-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid transparent;
  background: transparent; color: var(--dsw-alias-label-primary);
  font-size: 13px; line-height: 18px; font-weight: 400; white-space: nowrap; cursor: pointer;
  transition: background-color .12s ${EASE}, border-color .12s ${EASE}, color .12s ${EASE}, opacity .12s ${EASE}, transform .12s ${EASE};
}
.dss-btn:active:not(:disabled) { transform: scale(.98); }
.dss-btn:disabled { opacity: .4; cursor: default; }
.dss-btn-sm { height: 28px; padding: 0 8px; border-radius: 6px; font-size: 13px; }
.dss-btn-field { height: 36px; padding: 0 12px; }
.dss-btn-primary {
  background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base);
  border-color: transparent; font-weight: 500;
}
.dss-btn-primary:hover:not(:disabled) { opacity: .9; }
.dss-btn-primary:disabled {
  opacity: 1; cursor: default;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);
  color: var(--dsw-alias-label-secondary);
}
.dss-btn-outline {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent);
  color: var(--dsw-alias-label-primary); font-weight: 500;
}
.dss-btn-outline:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent); }
.dss-btn-ghost { color: var(--dsw-alias-label-secondary); }
.dss-btn-ghost:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-primary);
}
.dss-btn-danger {
  --dss-danger-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 76%, var(--dsw-alias-label-primary));
  color: var(--dss-danger-ink);
}
.dss-btn-danger:hover:not(:disabled) {
  color: var(--dss-danger-ink);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
}
.dss-icon-btn { width: 32px; height: 32px; padding: 0; border-radius: 8px; color: var(--dsw-alias-label-secondary); }
.dss-icon-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-primary);
}
.dss-seg {
  display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);
  border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary);
  font-size: 13px; line-height: 18px; cursor: pointer;
  transition: background-color .12s ${EASE}, border-color .12s ${EASE}, color .12s ${EASE};
}
.dss-seg:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent); color: var(--dsw-alias-label-primary); }
.dss-seg[aria-pressed="true"] {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent);
  color: var(--dsw-alias-label-primary); font-weight: 500;
}
.dss-tab {
  display: inline-flex; align-items: center; height: 32px; padding: 0 2px; margin-bottom: -1px;
  border: 0; border-bottom: 2px solid transparent; background: transparent;
  color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 18px; cursor: pointer;
  transition: color .12s ${EASE}, border-color .12s ${EASE};
}
.dss-tab:hover { color: var(--dsw-alias-label-primary); }
.dss-tab[aria-current="page"] {
  color: var(--dsw-alias-label-primary); border-bottom-color: var(--dsw-static-deepseek-500); font-weight: 500;
}
.dss-input {
  width: 100%; height: 36px; padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 3%, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 20px;
  transition: border-color .12s ${EASE}, background-color .12s ${EASE};
}
.dss-input:hover { border-color: color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent); }
.dss-input:focus { border-color: var(--dsw-static-deepseek-500); }
.dss-input::placeholder { color: var(--dsw-alias-label-secondary); }
.dss-input:disabled { opacity: .4; cursor: default; }
textarea.dss-input { height: auto; min-height: 96px; padding: 8px 12px; resize: vertical; }
select.dss-input { appearance: none; -webkit-appearance: none; padding-right: 36px; cursor: pointer; }
select.dss-select-sm { height: 32px; padding: 0 28px 0 8px; font-size: 13px; }
.dss-root input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
.dss-root input[type="number"]::-webkit-outer-spin-button,
.dss-root input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.dss-row { transition: background-color .12s ${EASE}; }
.dss-row:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, var(--dsw-alias-bg-layer-1)); }
.dss-switch {
  position: relative; display: inline-block; width: 36px; height: 20px; flex: none;
  padding: 0; border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent);
  border-radius: 10px; background: transparent; cursor: pointer;
  transition: background-color .12s ${EASE}, border-color .12s ${EASE};
}
.dss-switch::after {
  content: ""; position: absolute; left: 1px; top: 1px; width: 16px; height: 16px; border-radius: 50%;
  background: var(--dsw-alias-label-secondary);
  transition: transform .12s ${EASE}, background-color .12s ${EASE};
}
.dss-switch[aria-checked="true"] {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
}
.dss-switch[aria-checked="true"]::after {
  transform: translateX(16px);
  background: var(--dsw-alias-bg-base);
}
.dss-switch:hover { border-color: color-mix(in srgb, var(--dsw-alias-label-primary) 36%, transparent); }
.dss-chip {
  display: inline-flex; align-items: center; gap: 4px; max-width: 100%;
  padding: 2px 2px 2px 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary);
  font-size: 12px; line-height: 16px;
}
.dss-chip-remove {
  display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px;
  padding: 0; border: 0; border-radius: 4px; background: transparent;
  color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.dss-chip-remove:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); color: var(--dsw-alias-label-primary); }
.dss-view { animation: dss-view-in .16s ${EASE} both; }
@keyframes dss-view-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  .dss-root *, .dss-root *::before, .dss-root *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important;
  }
  .dss-btn:active:not(:disabled) { transform: none; }
  .dss-view { animation: none !important; }
}
`;
		const TRIGGER_TYPES = [
			"cron",
			"once",
			"interval"
		];
		function SchedulerPanel({ onClose, embedded = false, t, sessions, workspaces, uiWorkspace, resolveUiWorkspace, describeContext }) {
			const [view, setView] = (0, react.useState)("list");
			const [tasks, setTasks] = (0, react.useState)([]);
			const [history, setHistory] = (0, react.useState)([]);
			/** Display-only: the task whose history is open, used for the history title. */
			const [histTaskName, setHistTaskName] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [runningTaskId, setRunningTaskId] = (0, react.useState)(null);
			const [runNotice, setRunNotice] = (0, react.useState)(null);
			const [editId, setEditId] = (0, react.useState)(null);
			const [name, setName] = (0, react.useState)("");
			const [type, setType] = (0, react.useState)("cron");
			const [cron, setCron] = (0, react.useState)("");
			const [runAt, setRunAt] = (0, react.useState)("");
			const [everyMinutes, setEveryMinutes] = (0, react.useState)(60);
			const [prompt, setPrompt] = (0, react.useState)("");
			const [executionKind, setExecutionKind] = (0, react.useState)("prompt-session");
			const [workflows, setWorkflows] = (0, react.useState)([]);
			const [workflowId, setWorkflowId] = (0, react.useState)("");
			const [workflowTitle, setWorkflowTitle] = (0, react.useState)("");
			const [workflowDescription, setWorkflowDescription] = (0, react.useState)("");
			const [workflowStoryCode, setWorkflowStoryCode] = (0, react.useState)("");
			/** File-typed workflow inputs given by path (declared parameter name → path). */
			const [workflowPathInputs, setWorkflowPathInputs] = (0, react.useState)({});
			/**
			* Attachments uploaded from the browser and persisted by the scheduler. Unlike the path
			* fields above these are snapshots handed to every fire, and they need no workflow
			* declaration (mirrors the workflow plugin's built-in attachments).
			*/
			const [workflowAttachments, setWorkflowAttachments] = (0, react.useState)([]);
			const [attaching, setAttaching] = (0, react.useState)(0);
			const [attachError, setAttachError] = (0, react.useState)(null);
			const attachInputRef = (0, react.useRef)(null);
			const [cwd, setCwd] = (0, react.useState)("");
			const [enabled, setEnabled] = (0, react.useState)(true);
			const [nextRun, setNextRun] = (0, react.useState)(null);
			const [cronChecked, setCronChecked] = (0, react.useState)(false);
			const [upcoming, setUpcoming] = (0, react.useState)([]);
			const [allHistory, setAllHistory] = (0, react.useState)([]);
			const [execPage, setExecPage] = (0, react.useState)(0);
			const [execPageSize, setExecPageSize] = (0, react.useState)(25);
			const [histPage, setHistPage] = (0, react.useState)(0);
			const [histPageSize, setHistPageSize] = (0, react.useState)(25);
			const bodyRef = (0, react.useRef)(null);
			const taskNameById = (0, react.useMemo)(() => new Map(tasks.map((task) => [task.id, task.name])), [tasks]);
			const cwdOptions = (0, react.useMemo)(() => {
				return (workspaces?.list?.getSnapshot().items ?? []).map((item) => ({
					path: item.path,
					title: item.title ?? item.path.split(/[\\/]/).filter(Boolean).pop() ?? item.path
				})).sort((a, b) => a.title.localeCompare(b.title));
			}, [workspaces]);
			const scrollTop = () => {
				bodyRef.current?.scrollTo({ top: 0 });
			};
			/**
			* Open a session through the host's workspace navigation service.
			*
			* DSH 0.2 moved session selection out of the `sessions` contract into
			* `uiWorkspace.openSession(target)`; the 0.1.x selection method no longer
			* exists, and calling it inside a try/catch surfaced a misleading
			* "session not found" instead of navigating.
			*
			* Sessions live in a workspace (their cwd); when the target session belongs
			* to an unregistered workspace the host UI cannot render it here, so we
			* surface a clear message instead of silently landing on the empty state.
			*/
			const openSession = (sessionId) => {
				const nav = resolveUiWorkspace?.() ?? uiWorkspace;
				if (nav === void 0) {
					const visible = describeContext?.() ?? "";
					setError(`宿主未提供会话导航服务 / session navigation service unavailable${visible ? `（可见服务：${visible}）` : ""}`);
					return;
				}
				const cwd = sessions?.list?.getSnapshot()?.byId[sessionId]?.cwd;
				const wsItems = workspaces?.list?.getSnapshot().items ?? [];
				if (cwd !== void 0) {
					if (wsItems.find((w) => w.path === cwd) === void 0) {
						setError(fmt(t("session.openUnregistered"), { path: cwd }));
						return;
					}
				}
				try {
					nav.openSession(sessionId);
					onClose?.();
				} catch {
					setError("会话不存在或已被清理 / session not found");
				}
			};
			const reload = async () => {
				try {
					const res = await listTasks();
					setTasks(res.tasks);
					setError(null);
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			};
			(0, react.useEffect)(() => {
				reload();
				if (embedded === true) return;
				const onKey = (e) => {
					if (e.key === "Escape") onClose?.();
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, []);
			(0, react.useEffect)(() => {
				let cancelled = false;
				const load = async () => {
					let next = null;
					try {
						if (type === "once" && runAt === "") next = null;
						else {
							const params = { type };
							if (type === "cron") params.cron = cron;
							else if (type === "once") params.runAt = new Date(runAt).toISOString();
							else params.everyMinutes = everyMinutes;
							next = (await previewSchedule(params)).nextRun;
						}
					} catch {
						next = null;
					}
					if (!cancelled) setNextRun(next);
				};
				load();
				return () => {
					cancelled = true;
				};
			}, [
				type,
				cron,
				runAt,
				everyMinutes
			]);
			const loadWorkflows = async () => {
				try {
					const result = await listWorkflows();
					setWorkflows(result.workflows);
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			};
			const openNew = () => {
				setEditId(null);
				setName("");
				setType("cron");
				setCron("");
				setRunAt("");
				setEveryMinutes(60);
				setCwd("");
				setPrompt("");
				setExecutionKind("prompt-session");
				setWorkflowId("");
				setWorkflowTitle("");
				setWorkflowDescription("");
				setWorkflowStoryCode("");
				setWorkflowPathInputs({});
				setWorkflowAttachments([]);
				setAttachError(null);
				setEnabled(true);
				setError(null);
				setRunNotice(null);
				setNextRun(null);
				setCronChecked(false);
				setUpcoming([]);
				setView("form");
			};
			const openEdit = (task) => {
				setEditId(task.id);
				setName(task.name);
				setType(task.type);
				setCron(task.cron);
				setRunAt(task.type === "once" && task.runAt ? toLocalInput(task.runAt) : "");
				setEveryMinutes(task.everyMinutes ?? 60);
				setCwd(task.cwd ?? "");
				setPrompt(task.prompt ?? "");
				setExecutionKind(task.executionKind);
				setWorkflowId(task.workflowId ?? "");
				setWorkflowTitle(task.workflowTitle ?? "");
				setWorkflowDescription(task.workflowDescription ?? "");
				setWorkflowStoryCode(task.workflowStoryCode ?? "");
				setWorkflowPathInputs(task.workflowPathInputs ?? {});
				setWorkflowAttachments(task.workflowAttachments ?? []);
				setAttachError(null);
				if (task.executionKind === "knj-workflow") loadWorkflows();
				setEnabled(task.enabled);
				setError(null);
				setRunNotice(null);
				setCronChecked(false);
				setUpcoming([]);
				setView("form");
			};
			/** Human-readable byte size for attachment chips. */
			function formatBytes(size) {
				if (size >= 1048576) return `${(size / 1024 / 1024).toFixed(1)} MB`;
				if (size >= 1024) return `${Math.round(size / 1024)} KB`;
				return `${size} B`;
			}
			/** File → base64 in chunks (large files must not blow the argument stack). */
			const fileToBase64 = (file) => new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onerror = () => reject(/* @__PURE__ */ new Error("读取文件失败"));
				reader.onload = () => {
					const bytes = new Uint8Array(reader.result);
					let binary = "";
					const CHUNK = 32768;
					for (let i = 0; i < bytes.length; i += CHUNK) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
					resolve(btoa(binary));
				};
				reader.readAsArrayBuffer(file);
			});
			/**
			* Upload the chosen files into the scheduler's own store, appending the returned refs.
			* Files are read from the event target **synchronously** by the caller: holding a live
			* FileList across the async boundary loses it once the input value is reset.
			*/
			const uploadAttachments = async (files) => {
				if (files.length === 0) return;
				setAttachError(null);
				setAttaching((n) => n + files.length);
				for (const file of files) try {
					const dataBase64 = await fileToBase64(file);
					const ref = await uploadAttachment(file.name, dataBase64);
					setWorkflowAttachments((list) => [...list, ref]);
				} catch (e) {
					setAttachError(`${file.name}：${e instanceof Error ? e.message : String(e)}`);
				} finally {
					setAttaching((n) => Math.max(0, n - 1));
				}
			};
			const onAttachmentInputChange = (event) => {
				const picked = event.currentTarget.files === null ? [] : Array.from(event.currentTarget.files);
				event.currentTarget.value = "";
				uploadAttachments(picked);
			};
			const removeAttachment = (index) => {
				setWorkflowAttachments((list) => list.filter((_, i) => i !== index));
			};
			const openHistory = async (task) => {
				try {
					const res = await taskHistory(task.id);
					setHistory(res.history);
					setHistPage(0);
					setHistTaskName(task.name);
					setView("history");
					setError(null);
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			};
			const reloadExecutions = async () => {
				try {
					const res = await listHistory();
					setAllHistory(res.history);
					setExecPage(0);
					setError(null);
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			};
			const openExecutions = async () => {
				await reloadExecutions();
				setView("executions");
			};
			const save = async () => {
				setBusy(true);
				setError(null);
				try {
					const input = {
						name,
						type,
						executionKind,
						enabled
					};
					if (executionKind === "knj-workflow") {
						input.workflowId = workflowId;
						if (workflowTitle.trim() !== "") input.workflowTitle = workflowTitle.trim();
						input.workflowDescription = workflowDescription;
						input.workflowStoryCode = workflowStoryCode;
						input.workflowAttachments = workflowAttachments;
						const paths = {};
						for (const decl of selectedWorkflowFileInputs) {
							const value = (workflowPathInputs[decl.name] ?? "").trim();
							if (value !== "") paths[decl.name] = value;
						}
						if (Object.keys(paths).length > 0) input.workflowPathInputs = paths;
					} else input.prompt = prompt;
					if (type === "cron") input.cron = cron;
					else if (type === "once") input.runAt = new Date(runAt).toISOString();
					else input.everyMinutes = everyMinutes;
					if (cwd.trim() !== "") input.cwd = cwd.trim();
					if (editId === null) await createTask(input);
					else await updateTask(editId, input);
					await reload();
					setView("list");
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				} finally {
					setBusy(false);
				}
			};
			const toggle = async (task) => {
				try {
					await toggleTask(task.id, !task.enabled);
					await reload();
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			};
			const run = async (task) => {
				if (runningTaskId !== null) return;
				setRunningTaskId(task.id);
				setRunNotice(null);
				setError(null);
				try {
					const response = await runTask(task.id);
					if (response.result.status !== "created") throw new Error(response.result.error ?? t("error.run"));
					setRunNotice({
						message: task.executionKind === "knj-workflow" ? t("run.workflowStarted") : t("run.promptStarted"),
						...response.result.workflowTaskId ? { workflowTaskId: response.result.workflowTaskId } : {}
					});
					await reload();
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				} finally {
					setRunningTaskId(null);
				}
			};
			const remove = async (task) => {
				if (!window.confirm(t("btn.confirmDelete"))) return;
				try {
					await deleteTask(task.id);
					await reload();
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			};
			const cronOk = CRON_RE.test(cron.trim());
			const triggerValid = type === "cron" ? cronOk : type === "once" ? runAt !== "" : Number.isInteger(everyMinutes) && everyMinutes >= 1;
			const timesForScale = upcoming.length > 0 ? upcoming : nextRun !== null ? [nextRun] : [];
			const selectedWorkflowFileInputs = (workflows.find((workflow) => workflow.id === workflowId)?.inputs ?? []).filter((decl) => decl.type === "file");
			const missingRequiredPaths = selectedWorkflowFileInputs.filter((decl) => decl.required && (workflowPathInputs[decl.name] ?? "").trim() === "");
			const executionValid = executionKind === "knj-workflow" ? workflowId.trim() !== "" && workflowTitle.trim() !== "" && cwd.trim() !== "" && missingRequiredPaths.length === 0 : prompt.trim() !== "";
			const checkCron = async () => {
				setError(null);
				setCronChecked(true);
				try {
					const res = await previewSchedule({
						type: "cron",
						cron
					});
					setUpcoming(res.nextRuns ?? []);
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
					setUpcoming([]);
				}
			};
			const execResult = view === "executions" ? pageSlice(allHistory, execPage, execPageSize) : null;
			const histResult = view === "history" ? pageSlice(history, histPage, histPageSize) : null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: PANEL_CSS }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dss-root",
				style: embedded ? S.embedRoot : S.overlay,
				onClick: embedded ? void 0 : (e) => {
					if (e.target === e.currentTarget) onClose?.();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: embedded ? S.embedPanel : S.panel,
					role: embedded ? void 0 : "dialog",
					"aria-modal": embedded ? void 0 : true,
					"aria-label": t("panel.title"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: embedded ? S.embedHead : S.head,
							children: view === "form" || view === "history" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dss-btn dss-icon-btn",
									"aria-label": t("btn.back"),
									title: t("btn.back"),
									onClick: () => setView("list"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronLeft, {})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									style: S.headTitleCol,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: S.title,
										title: view === "history" && histTaskName !== "" ? fmt(t("history.forTask"), { name: histTaskName }) : void 0,
										children: view === "form" ? editId === null ? t("form.title.new") : t("form.title.edit") : histTaskName !== "" ? fmt(t("history.forTask"), { name: histTaskName }) : t("history.title")
									})
								}),
								view === "history" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: S.metaText,
									children: t("history.retention")
								}),
								!embedded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dss-btn dss-icon-btn",
									"aria-label": t("btn.close"),
									title: t("btn.close"),
									onClick: onClose,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCross, {})
								})
							] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: S.titleIcon,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClock, {})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: S.headTitleCol,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: S.title,
										children: t("panel.title")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: S.sub,
										children: t("panel.subtitle")
									})]
								}),
								!embedded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dss-btn dss-icon-btn",
									"aria-label": t("btn.close"),
									title: t("btn.close"),
									onClick: onClose,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCross, {})
								})
							] })
						}),
						(view === "list" || view === "executions") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: embedded ? S.embedTabBar : S.tabBar,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-current": view === "list" ? "page" : void 0,
								className: "dss-tab",
								onClick: () => setView("list"),
								children: t("tab.tasks")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-current": view === "executions" ? "page" : void 0,
								className: "dss-tab",
								onClick: () => void openExecutions(),
								children: t("tab.executions")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: embedded ? S.embedBody : S.body,
							ref: bodyRef,
							children: [
								error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										...S.banner,
										borderColor: "color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, transparent)",
										background: "color-mix(in srgb, var(--dsw-alias-state-error-primary) 6%, transparent)"
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											color: T.danger,
											display: "inline-flex"
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCross, {})
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											flex: 1,
											minWidth: 0
										},
										children: error
									})]
								}),
								runNotice !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										...S.banner,
										borderColor: "color-mix(in srgb, var(--dsw-static-green-500) 35%, transparent)",
										background: "color-mix(in srgb, var(--dsw-static-green-500) 6%, transparent)"
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											style: {
												color: T.success,
												display: "inline-flex"
											},
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, {})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											style: {
												flex: 1,
												minWidth: 0
											},
											children: runNotice.message
										}),
										runNotice.workflowTaskId !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dss-btn dss-btn-sm dss-btn-ghost",
											onClick: () => window.dispatchEvent(new CustomEvent("dsh-knj-workflow:open-task", { detail: { taskId: runNotice.workflowTaskId } })),
											children: t("history.openWorkflowTask")
										})
									]
								}),
								view === "list" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dss-view",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: S.toolbar,
										children: [tasks.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "dss-btn dss-btn-primary",
											onClick: openNew,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlus, {}), t("btn.new")]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "dss-btn dss-btn-ghost",
											onClick: () => void reload(),
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, {}), t("btn.refresh")]
										})]
									}), tasks.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
										dial: true,
										title: t("tasks.empty"),
										hint: t("tasks.emptyHint"),
										action: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "dss-btn dss-btn-primary",
											onClick: openNew,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlus, {}), t("btn.new")]
										})
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										style: S.taskList,
										children: tasks.map((task, index) => {
											const taskSummary = task.executionKind === "knj-workflow" ? task.workflowTitle !== void 0 && task.workflowTitle !== "" ? task.workflowTitle : "—" : task.prompt !== void 0 && task.prompt !== "" ? task.prompt : "—";
											return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: "dss-row",
												style: {
													...S.taskRow,
													...index > 0 ? { borderTop: `1px solid ${T.hairline}` } : {}
												},
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.taskHead,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															style: S.taskIdentity,
															children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																style: S.taskName,
																title: task.name,
																children: task.name
															}), task.cwd !== void 0 && task.cwd !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
																style: S.taskCwd,
																title: task.cwd,
																children: [
																	t("form.cwd"),
																	"：",
																	baseName(task.cwd)
																]
															})]
														}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
															checked: task.enabled,
															onChange: () => void toggle(task),
															label: `${task.name} · ${t("form.enabled")}`
														})]
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														style: S.triggerMono,
														children: triggerText(task, t)
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DayScale, {
														times: task.enabled && task.nextRun !== null ? [task.nextRun] : [],
														enabled: task.enabled,
														label: !task.enabled ? t("history.disabledTask") : task.nextRun !== null ? `${t("list.next")} ${fmtSchedule(task.nextRun)}` : t("form.nextRunEmpty")
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
														style: S.summary,
														title: taskSummary,
														children: taskSummary
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.taskActions,
														children: [
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
																type: "button",
																className: "dss-btn dss-btn-sm dss-btn-ghost",
																onClick: () => openEdit(task),
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconEdit, {}), t("btn.edit")]
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
																type: "button",
																className: "dss-btn dss-btn-sm dss-btn-outline",
																style: runningTaskId === task.id ? { opacity: .65 } : void 0,
																onClick: () => void run(task),
																disabled: runningTaskId !== null,
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlay, {}), runningTaskId === task.id ? t("run.pending") : t("btn.run")]
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
																type: "button",
																className: "dss-btn dss-btn-sm dss-btn-ghost",
																onClick: () => void openHistory(task),
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconHistory, {}), t("btn.history")]
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: S.taskActionsEnd }),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: "dss-btn dss-btn-sm dss-btn-danger",
																onClick: () => void remove(task),
																children: t("btn.delete")
															})
														]
													})
												]
											}, task.id);
										})
									})]
								}, "list"),
								view === "executions" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dss-view",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: S.toolbar,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "dss-btn dss-btn-ghost",
												onClick: () => void reloadExecutions(),
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, {}), t("btn.refresh")]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: S.spacer }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: S.metaText,
												children: t("history.all.retention")
											})
										]
									}), allHistory.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
										title: t("history.empty"),
										hint: t("history.emptyHint")
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: S.logSurface,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											style: S.rail,
											"aria-hidden": true
										}), (execResult?.rows ?? []).map((entry, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryRow, {
											entry,
											t,
											showName: true,
											name: taskNameById.get(entry.taskId) ?? entry.taskId.slice(0, 8),
											divider: index > 0,
											onOpenSession: openSession
										}, `${entry.at}-${index}`))]
									})]
								}, "executions"),
								view === "form" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dss-view",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.groupTitle,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: S.groupTick,
												"aria-hidden": true
											}), t("form.group.task")]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.field,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												style: S.label,
												children: [t("form.name"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													style: S.required,
													children: " *"
												})]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												className: "dss-input",
												value: name,
												onChange: (e) => setName(e.target.value),
												placeholder: t("form.namePlaceholder"),
												"aria-label": t("form.name")
											})]
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
											style: S.group,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.groupTitle,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														style: S.groupTick,
														"aria-hidden": true
													}), t("form.group.trigger")]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.field,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														style: S.label,
														children: t("form.type")
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														style: S.segRow,
														children: TRIGGER_TYPES.map((tp) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: "dss-seg",
															"aria-pressed": type === tp,
															onClick: () => setType(tp),
															children: tp === "cron" ? t("form.type.cron") : tp === "once" ? t("form.type.once") : t("form.type.interval")
														}, tp))
													})]
												}),
												type === "cron" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.field,
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															style: S.label,
															children: [t("form.cron"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																style: S.required,
																children: " *"
															})]
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															style: S.inputRow,
															children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
																className: "dss-input",
																style: {
																	flex: 1,
																	fontFamily: MONO
																},
																value: cron,
																onChange: (e) => {
																	setCron(e.target.value);
																	setCronChecked(false);
																},
																placeholder: t("form.cronPlaceholder"),
																"aria-label": t("form.cron")
															}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
																type: "button",
																className: "dss-btn dss-btn-outline dss-btn-field",
																onClick: () => void checkCron(),
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, {}), t("btn.validate")]
															})]
														}),
														cronChecked && cron.trim() !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
															style: {
																...S.hint,
																color: cronOk ? T.text2 : T.danger
															},
															children: cronOk ? t("form.cronValid") : t("form.cronInvalid")
														}),
														cronChecked && cronOk && upcoming.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															style: S.upcoming,
															children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																style: S.upcomingLabel,
																children: t("form.upcoming")
															}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																style: S.upcomingList,
																children: upcoming.slice(0, 4).map((iso) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: fmtSchedule(iso) }, iso))
															})]
														})
													]
												}),
												type === "once" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.field,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.label,
														children: [t("form.runAt"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
															style: S.required,
															children: " *"
														})]
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
														type: "datetime-local",
														className: "dss-input",
														value: runAt,
														onChange: (e) => setRunAt(e.target.value),
														"aria-label": t("form.runAt")
													})]
												}),
												type === "interval" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.field,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.label,
														children: [t("form.everyMinutes"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
															style: S.required,
															children: " *"
														})]
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
														type: "number",
														min: 1,
														className: "dss-input",
														value: everyMinutes,
														onChange: (e) => setEveryMinutes(Number(e.target.value) || 1),
														"aria-label": t("form.everyMinutes")
													})]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													style: S.fieldLast,
													children: !enabled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
															style: S.label,
															children: t("form.nextRun")
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
															style: S.nextEmpty,
															children: t("form.nextRunDisabled")
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DayScale, {
															times: timesForScale,
															enabled: false,
															label: t("form.dayScale")
														})
													] }) : type === "cron" && cronChecked && cronOk && upcoming.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DayScale, {
														times: upcoming,
														enabled: true,
														label: t("form.dayScale")
													}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														style: S.label,
														children: t("form.nextRun")
													}), triggerValid && nextRun !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														style: S.nextValue,
														children: fmtSchedule(nextRun)
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DayScale, {
														times: upcoming.length > 0 ? upcoming : [nextRun],
														enabled: true,
														label: t("form.dayScale")
													})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														style: S.nextEmpty,
														children: t("form.nextRunEmpty")
													})] })
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
											style: S.group,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.groupTitle,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														style: S.groupTick,
														"aria-hidden": true
													}), t("form.group.execution")]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.field,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														style: S.label,
														children: t("form.executionKind")
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.segRow,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: "dss-seg",
															"aria-pressed": executionKind === "prompt-session",
															onClick: () => setExecutionKind("prompt-session"),
															children: t("form.promptSession")
														}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: "dss-seg",
															"aria-pressed": executionKind === "knj-workflow",
															onClick: () => {
																setExecutionKind("knj-workflow");
																loadWorkflows();
															},
															children: t("form.workflow")
														})]
													})]
												}),
												executionKind === "knj-workflow" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.field,
														children: [
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																style: S.label,
																children: [t("form.workflowSelect"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	style: S.required,
																	children: " *"
																})]
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Select, {
																value: workflowId,
																onChange: setWorkflowId,
																ariaLabel: t("form.workflowSelect"),
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
																	value: "",
																	children: t("form.workflowSelectPlaceholder")
																}), workflows.map((workflow) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
																	value: workflow.id,
																	children: workflow.name
																}, workflow.id))]
															}),
															workflowId.trim() !== "" && selectedWorkflowFileInputs.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																style: S.hint,
																children: t("form.workflowNoFileInputs")
															}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
																style: S.details,
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
																	style: S.detailSummary,
																	children: t("form.workflowNoFileInputsDetailsLabel")
																}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
																	style: S.detailText,
																	children: t("form.workflowNoFileInputsDetails")
																})]
															})] })
														]
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.field,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															style: S.label,
															children: [t("form.workflowTitle"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																style: S.required,
																children: " *"
															})]
														}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
															className: "dss-input",
															value: workflowTitle,
															placeholder: t("form.workflowTitlePlaceholder"),
															onChange: (e) => setWorkflowTitle(e.target.value),
															"aria-label": t("form.workflowTitle")
														})]
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.field,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
															style: S.label,
															children: t("form.workflowDescription")
														}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
															className: "dss-input",
															style: { minHeight: 72 },
															value: workflowDescription,
															onChange: (e) => setWorkflowDescription(e.target.value),
															"aria-label": t("form.workflowDescription")
														})]
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.field,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
															style: S.label,
															children: t("form.workflowStoryCode")
														}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
															className: "dss-input",
															value: workflowStoryCode,
															onChange: (e) => setWorkflowStoryCode(e.target.value),
															placeholder: t("form.workflowStoryCodePlaceholder"),
															"aria-label": t("form.workflowStoryCode")
														})]
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.field,
														children: [
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																style: S.label,
																children: t("form.workflowAttachments")
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																style: S.hint,
																children: t("form.workflowAttachmentsHint")
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
																style: S.details,
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
																	style: S.detailSummary,
																	children: t("form.workflowDetails")
																}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
																	style: S.detailText,
																	children: t("form.workflowAttachmentsDetails")
																})]
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
																ref: attachInputRef,
																type: "file",
																multiple: true,
																style: { display: "none" },
																onChange: onAttachmentInputChange
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																style: {
																	display: "flex",
																	alignItems: "center",
																	gap: 8,
																	flexWrap: "wrap",
																	marginTop: 12
																},
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
																	type: "button",
																	className: "dss-btn dss-btn-outline",
																	disabled: attaching > 0,
																	onClick: () => attachInputRef.current?.click(),
																	children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlus, {}), attaching > 0 ? t("form.workflowAttachmentsUploading") : t("form.workflowAttachmentsPick")]
																}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	style: S.metaText,
																	children: workflowAttachments.length > 0 ? fmt(t("form.workflowAttachmentsCount"), { n: String(workflowAttachments.length) }) : t("form.workflowAttachmentsNone")
																})]
															}),
															workflowAttachments.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																style: {
																	display: "flex",
																	flexWrap: "wrap",
																	gap: 8,
																	marginTop: 8
																},
																children: workflowAttachments.map((att, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
																	className: "dss-chip",
																	children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
																		style: S.chipName,
																		title: att.name,
																		children: [att.name, att.size === void 0 ? "" : ` (${formatBytes(att.size)})`]
																	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																		type: "button",
																		className: "dss-chip-remove",
																		"aria-label": `${t("btn.remove")} ${att.name}`,
																		title: t("btn.remove"),
																		onClick: () => removeAttachment(index),
																		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCross, {})
																	})]
																}, att.uploadId))
															}),
															attachError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																style: S.errorText,
																children: [t("form.workflowAttachmentsFailed"), attachError]
															})
														]
													}),
													selectedWorkflowFileInputs.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: S.field,
														children: [
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																style: S.label,
																children: t("form.workflowPathInputs")
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																style: S.hint,
																children: t("form.workflowPathInputsHint")
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																style: { marginTop: 12 },
																children: selectedWorkflowFileInputs.map((decl) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																	style: S.pathRow,
																	children: [
																		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
																			style: S.pathName,
																			title: decl.name,
																			children: [decl.label || decl.name, decl.required ? " *" : ""]
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
																			className: "dss-input",
																			value: workflowPathInputs[decl.name] ?? "",
																			placeholder: decl.required ? t("form.workflowPathRequiredPlaceholder") : t("form.workflowPathPlaceholder"),
																			"aria-label": decl.label || decl.name,
																			onChange: (e) => setWorkflowPathInputs({
																				...workflowPathInputs,
																				[decl.name]: e.target.value
																			})
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
																			style: S.code,
																			children: `\${inputs.${decl.name}}`
																		})
																	]
																}, decl.name))
															})
														]
													})
												] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.field,
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															style: S.label,
															children: [t("form.prompt"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																style: S.required,
																children: " *"
															})]
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
															className: "dss-input",
															style: { minHeight: 96 },
															value: prompt,
															onChange: (e) => setPrompt(e.target.value),
															placeholder: t("form.promptPlaceholder"),
															"aria-label": t("form.prompt")
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
															style: S.hint,
															children: t("form.promptHint")
														})
													]
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
											style: {
												...S.group,
												marginBottom: 0
											},
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.groupTitle,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														style: S.groupTick,
														"aria-hidden": true
													}), t("form.group.runtime")]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: S.field,
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															style: S.label,
															children: [t("form.cwd"), executionKind === "knj-workflow" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																style: S.required,
																children: " *"
															})]
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Select, {
															value: cwd,
															onChange: setCwd,
															ariaLabel: t("form.cwd"),
															children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
																value: "",
																children: t("form.cwdDefault")
															}), cwdOptions.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
																value: option.path,
																title: option.path,
																children: option.title
															}, option.path))]
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
															style: S.hint,
															children: t("form.cwdHint")
														})
													]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: {
														display: "flex",
														alignItems: "center",
														gap: 8
													},
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
														checked: enabled,
														onChange: () => setEnabled((value) => !value),
														label: t("form.enabled")
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														style: S.switchLabel,
														children: t("form.enabled")
													})]
												})
											]
										})
									]
								}, "form"),
								view === "history" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dss-view",
									children: history.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
										title: t("history.emptyForTask"),
										hint: t("history.emptyHint")
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: S.logSurface,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											style: S.rail,
											"aria-hidden": true
										}), (histResult?.rows ?? []).map((entry, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryRow, {
											entry,
											t,
											divider: index > 0,
											onOpenSession: openSession
										}, `${entry.at}-${index}`))]
									})
								}, "history")
							]
						}),
						view === "form" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: embedded ? S.embedFooter : S.footer,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dss-btn dss-btn-ghost",
								onClick: () => setView("list"),
								disabled: busy,
								children: t("btn.cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dss-btn dss-btn-primary",
								onClick: () => void save(),
								disabled: busy || name.trim() === "" || !executionValid || !triggerValid,
								children: editId === null ? t("btn.save") : t("btn.saveChanges")
							})]
						}),
						view === "executions" && execResult !== null && allHistory.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: embedded ? S.embedPagerBar : S.pagerBar,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pager, {
								page: execResult.pageSafe,
								pages: execResult.pages,
								total: allHistory.length,
								pageSize: execPageSize,
								onPage: (p) => {
									setExecPage(p);
									scrollTop();
								},
								onPageSize: (n) => {
									setExecPageSize(n);
									setExecPage(0);
									scrollTop();
								},
								t
							})
						}),
						view === "history" && histResult !== null && history.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: embedded ? S.embedPagerBar : S.pagerBar,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pager, {
								page: histResult.pageSafe,
								pages: histResult.pages,
								total: history.length,
								pageSize: histPageSize,
								onPage: (p) => {
									setHistPage(p);
									scrollTop();
								},
								onPageSize: (n) => {
									setHistPageSize(n);
									setHistPage(0);
									scrollTop();
								},
								t
							})
						})
					]
				})
			})] });
		}
		/** 24-hour ruler: one tick every hour, a taller tick every 6 hours, a cobalt mark per run. */
		function DayScale({ times, enabled, label }) {
			const marks = enabled ? times.map(clockMark).filter((mark) => mark !== null) : [];
			const tickColor = enabled ? T.tick : T.hairline;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: S.dayScale,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: S.dayScaleLabel,
						children: label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: S.dayTrack,
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { style: {
								...S.dayBaseline,
								opacity: enabled ? 1 : .5
							} }),
							Array.from({ length: 25 }, (_, hour) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: {
								...S.dayTick,
								left: `${hour / 24 * 100}%`,
								height: hour % 6 === 0 ? 8 : 4,
								background: tickColor
							} }, hour)),
							marks.map((mark, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								style: {
									...S.dayMarkerWrap,
									left: `${mark * 100}%`
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: S.dayMarkerBar }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: S.dayMarkerDot })]
							}, `${mark}-${index}`))
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: S.dayLabels,
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "0" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "6" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "12" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "18" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "24" })
						]
					})
				]
			});
		}
		/** Drawn dial for the empty state: 24 ticks, three cobalt signal ticks. */
		function Dial() {
			const ticks = Array.from({ length: 24 }, (_, index) => {
				const angle = index / 24 * Math.PI * 2 - Math.PI / 2;
				const inner = index % 6 === 0 ? 23 : 25;
				return {
					index,
					x1: 32 + Math.cos(angle) * inner,
					y1: 32 + Math.sin(angle) * inner,
					x2: 32 + Math.cos(angle) * 29,
					y2: 32 + Math.sin(angle) * 29,
					signal: index % 8 === 3
				};
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: 64,
				height: 64,
				viewBox: "0 0 64 64",
				"aria-hidden": true,
				style: { display: "block" },
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 32,
						cy: 32,
						r: 30,
						fill: "none",
						stroke: T.hairline,
						strokeWidth: 1
					}),
					ticks.map((tick) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
						x1: tick.x1,
						y1: tick.y1,
						x2: tick.x2,
						y2: tick.y2,
						stroke: tick.signal ? T.signal : T.tick,
						strokeWidth: tick.index % 6 === 0 ? 1.5 : 1,
						strokeLinecap: "round"
					}, tick.index)),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 32,
						cy: 32,
						r: 2.5,
						fill: T.signal
					})
				]
			});
		}
		function EmptyState({ title, hint, action, dial = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: S.empty,
				children: [
					dial && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dial, {}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: S.emptyTitle,
						children: title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: S.emptyHint,
						children: hint
					}),
					action !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: S.emptyAction,
						children: action
					})
				]
			});
		}
		/** Shared history row used by both the executions list and the per-task history view. */
		function HistoryRow({ entry, name, t, divider = false, showName = false, onOpenSession }) {
			const running = entry.status === "running";
			const ok = entry.status === "created";
			const fail = entry.status === "failed";
			const dotColor = running ? T.signal : ok ? T.success : fail ? T.danger : T.text2;
			const statusText = running ? t("status.running") : ok ? t("status.created") : fail ? t("status.failed") : t("status.skipped");
			const columns = showName ? "minmax(0,1fr) 124px 64px 56px auto" : "140px minmax(0,1fr) 72px auto";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dss-row",
				style: {
					...S.logRow,
					gridTemplateColumns: columns,
					...divider ? { borderTop: `1px solid ${T.hairline}` } : {}
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							...S.logDot,
							background: dotColor
						},
						"aria-hidden": true
					}),
					showName && name !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: S.logName,
						title: typeof name === "string" ? name : void 0,
						children: name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: S.logTime,
						title: fullTime(entry.at),
						children: fmtLogTime(entry.at)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: S.logStatus,
						title: fail && entry.error !== void 0 ? entry.error : statusText,
						children: statusText
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: S.logDuration,
						children: entry.ms !== void 0 ? `${entry.ms} ms` : "—"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						style: S.logActions,
						children: [!running && entry.workflowTaskId !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dss-btn dss-btn-sm dss-btn-ghost",
							onClick: () => window.dispatchEvent(new CustomEvent("dsh-knj-workflow:open-task", { detail: { taskId: entry.workflowTaskId } })),
							children: t("history.openWorkflowTask")
						}), !running && entry.sessionId !== void 0 && onOpenSession !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dss-btn dss-btn-sm dss-btn-ghost",
							onClick: () => onOpenSession(entry.sessionId),
							children: t("history.openSession")
						})]
					})
				]
			});
		}
		/** Pagination bar: prev/next, page summary and a per-page size selector. */
		function Pager({ page, pages, total, pageSize, onPage, onPageSize, t }) {
			if (total <= 0) return null;
			const first = page <= 0;
			const last = page >= pages - 1;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: S.pager,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: S.pagerGroup,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dss-btn dss-btn-sm dss-btn-outline",
							disabled: first,
							onClick: () => onPage(page - 1),
							children: t("pager.prev")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dss-btn dss-btn-sm dss-btn-outline",
							disabled: last,
							onClick: () => onPage(page + 1),
							children: t("pager.next")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: S.pagerInfo,
						children: fmt(t("pager.summary"), {
							p: page + 1,
							n: pages,
							c: total
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: S.pagerGroup,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							value: String(pageSize),
							onChange: (value) => onPageSize(Number(value)),
							ariaLabel: t("pager.pageSize"),
							small: true,
							children: PAGE_SIZES.map((size) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: size,
								children: size
							}, size))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: S.pagerInfo,
							children: t("pager.pageSizeUnit")
						})]
					})
				]
			});
		}
		function Select({ value, onChange, ariaLabel, children, small = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: small ? {
					position: "relative",
					width: 64
				} : S.selectWrap,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
					className: small ? "dss-input dss-select-sm" : "dss-input",
					value,
					"aria-label": ariaLabel,
					onChange: (e) => onChange(e.target.value),
					style: small ? { width: "100%" } : void 0,
					children
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						...S.selectChevron,
						...small ? { right: 8 } : {}
					},
					"aria-hidden": true,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronDown, {})
				})]
			});
		}
		/** Plain switch: 36×20, 16px knob, label via aria-label (text sits beside it). */
		function Switch({ checked, onChange, label }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				role: "switch",
				"aria-checked": checked,
				"aria-label": label,
				className: "dss-switch",
				onClick: onChange
			});
		}
		/** 2026-11-09 09:00 — compact, stable width for lists and previews. */
		function fmtSchedule(iso) {
			const d = new Date(iso);
			if (Number.isNaN(d.getTime())) return iso;
			return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
		}
		/** 11-09 09:00:03 — history rows; full timestamp stays in the title attribute. */
		function fmtLogTime(iso) {
			const d = new Date(iso);
			if (Number.isNaN(d.getTime())) return iso;
			return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
		}
		function fullTime(iso) {
			const d = new Date(iso);
			return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
		}
		/** Fraction of the day (0…1) for the 24h ruler. */
		function clockMark(iso) {
			const d = new Date(iso);
			if (Number.isNaN(d.getTime())) return null;
			return (d.getHours() * 60 + d.getMinutes()) / 1440;
		}
		function pad2(n) {
			return String(n).padStart(2, "0");
		}
		/** Convert an ISO datetime to a `datetime-local` input value (local timezone). */
		function toLocalInput(iso) {
			const d = new Date(iso);
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
		}
		/** Human-readable trigger description for the list view. */
		function triggerText(task, t) {
			if (task.type === "once") return `${t("type.once")} · ${task.runAt ? fmtSchedule(task.runAt) : "—"}`;
			if (task.type === "interval") return fmt(t("type.everyMinutes"), { n: task.everyMinutes ?? 0 });
			return task.cron;
		}
		/** Last path segment for the compact working-directory line. */
		function baseName(path) {
			const parts = path.split(/[\\/]/).filter(Boolean);
			return parts.length > 0 ? parts[parts.length - 1] ?? path : path;
		}
		// src/client/SchedulerSection.tsx
		/**
		* The Settings → 定时任务 section. The host renders `settings.section` entries
		* inside its own dialog and passes the dialog's `close` down as an owner prop,
		* so this is a thin adapter: the scheduler UI itself stays in SchedulerPanel.
		*/
		function SchedulerSection({ close, ...panel }) {
			return (0, react.createElement)(SchedulerPanel, {
				...panel,
				embedded: true,
				onClose: () => close?.()
			});
		}
		// src/client/index.ts
		/**
		* dsh-scheduler client: registers the scheduler as a Settings → 定时任务
		* section (`settings.section`), so it opens from the host's Settings dialog
		* and no longer needs the dsh-knj-menu sidebar. Built by tsdown into the
		* __ModuleLoader__ factory bundle at client/client.js.
		*/
		const NS = "dsh-scheduler";
		const SECTION_ID = "dsh-scheduler";
		const name = "dsh-scheduler";
		const inject = [
			"locale",
			"slots",
			"sessions",
			"workspaces",
			"uiWorkspace"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-scheduler: dictionaries");
			const t = ctx.locale.bind(NS);
			const sessions = ctx.sessions;
			const workspaces = ctx.workspaces;
			/**
			* Read navigation at click time, not at apply time: the Settings section is
			* registered once and captures this closure, so a service provided later in
			* boot would otherwise stay frozen as `undefined`.
			*/
			const resolveUiWorkspace = () => {
				if (ctx.uiWorkspace !== void 0) return ctx.uiWorkspace;
				return typeof ctx.get === "function" ? ctx.get("uiWorkspace") : void 0;
			};
			/** Visible service names, for diagnosing a host that does not expose navigation. */
			const describeContext = () => {
				const names = [];
				for (const key of Object.keys(ctx)) {
					if (key.startsWith("_")) continue;
					const value = ctx[key];
					if (value !== null && (typeof value === "object" || typeof value === "function")) names.push(key);
				}
				return names.slice(0, 24).join(",");
			};
			ctx.effect(() => {
				if (!ctx.slots) return;
				ctx.slots.inject("settings.section", () => ctx.slots.register({
					name: "settings.section",
					id: SECTION_ID,
					order: 30,
					label: () => t("panel.title"),
					locale: NS
				}, (props) => {
					const close = props?.close;
					return (0, react.createElement)(SchedulerSection, {
						close,
						t,
						sessions,
						workspaces,
						uiWorkspace: ctx.uiWorkspace,
						resolveUiWorkspace,
						describeContext
					});
				}));
			}, "dsh-scheduler: settings section");
		}
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map