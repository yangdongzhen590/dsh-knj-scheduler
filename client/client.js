window.__ModuleLoader__.load({
	id: "dsh-scheduler",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/**
		* Dictionary for the dsh-scheduler client bundle. Chinese is the key-set
		* source of truth; English mirrors it.
		*/
		const zh = {
			"entry.label": "调度器",
			"panel.title": "定时任务",
			"panel.subtitle": "按 Cron 自动新建会话并注入提示词",
			"btn.new": "新建任务",
			"btn.refresh": "刷新",
			"btn.back": "返回",
			"btn.cancel": "取消",
			"btn.save": "保存任务",
			"btn.close": "关闭",
			"btn.run": "立即执行",
			"btn.edit": "编辑",
			"btn.delete": "删除",
			"btn.history": "历史",
			"btn.confirmDelete": "确认删除？",
			"col.task": "任务",
			"col.cron": "Cron",
			"col.next": "下次触发",
			"col.status": "状态",
			"col.last": "最近执行",
			"col.actions": "操作",
			"status.enabled": "启用",
			"status.disabled": "停用",
			"status.running": "执行中",
			"status.created": "成功",
			"status.failed": "失败",
			"status.skipped": "跳过",
			"form.name": "任务名称",
			"form.type": "触发方式",
			"form.type.cron": "Cron 表达式",
			"form.type.once": "指定时间",
			"form.type.interval": "间隔时间",
			"form.cron": "Cron 表达式",
			"form.runAt": "执行时间",
			"form.everyMinutes": "间隔分钟数",
			"form.cwd": "工作目录",
			"form.cwdDefault": "默认（当前工作区）",
			"form.cwdHint": "执行时创建的会话将落在该工作区，之后可从执行列表直接打开",
			"form.prompt": "提示词（到点作为首条消息带入新建的 DSH 会话）",
			"form.enabled": "启用任务",
			"form.nextRun": "下次执行",
			"btn.validate": "校验",
			"form.upcoming": "最近几次执行",
			"form.promptPlaceholder": "例如：请汇总昨天各渠道的数据，输出一份 Markdown 报告。",
			"form.cronPlaceholder": "如 0 9 * * * 或 0 0 2 * * ?",
			"form.cronValid": "有效",
			"form.cronInvalid": "表达式无效",
			"type.cron": "Cron",
			"type.once": "一次性",
			"type.interval": "间隔",
			"history.title": "执行历史",
			"history.empty": "暂无执行记录",
			"history.retention": "保留上限 500 条/任务",
			"history.openSession": "打开会话",
			"btn.executions": "执行列表",
			"tab.tasks": "任务列表",
			"tab.executions": "执行记录",
			"history.all.retention": "保留上限 500 条",
			"session.openCrossWorkspace": "该会话属于工作区 {path}，请先切换到该工作区再打开",
			"session.openUnregistered": "该会话位于未注册的工作区（{path}），无法直接打开；请从该目录启动 dsh web 后再查看执行产出",
			"pager.prev": "上一页",
			"pager.next": "下一页",
			"pager.summary": "第 {p}/{n} 页 · 共 {c} 条",
			"pager.pageSize": "每页条数",
			"tasks.empty": "还没有任务，点击「新建任务」创建一个",
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
			"panel.subtitle": "Create a new session with your prompt on a cron schedule",
			"btn.new": "New Task",
			"btn.refresh": "Refresh",
			"btn.back": "Back",
			"btn.cancel": "Cancel",
			"btn.save": "Save Task",
			"btn.close": "Close",
			"btn.run": "Run Now",
			"btn.edit": "Edit",
			"btn.delete": "Delete",
			"btn.history": "History",
			"btn.confirmDelete": "Delete this task?",
			"col.task": "Task",
			"col.cron": "Cron",
			"col.next": "Next Run",
			"col.status": "Status",
			"col.last": "Last Run",
			"col.actions": "Actions",
			"status.enabled": "Enabled",
			"status.disabled": "Disabled",
			"status.running": "Running",
			"status.created": "Success",
			"status.failed": "Failed",
			"status.skipped": "Skipped",
			"form.name": "Task name",
			"form.type": "Trigger type",
			"form.type.cron": "Cron expression",
			"form.type.once": "Specific time",
			"form.type.interval": "Interval",
			"form.cron": "Cron expression",
			"form.runAt": "Run at",
			"form.everyMinutes": "Interval (minutes)",
			"form.cwd": "Working directory",
			"form.cwdDefault": "Default (current workspace)",
			"form.cwdHint": "Executions create sessions in this workspace, so they stay openable from the executions list",
			"form.prompt": "Prompt (injected as the first message of a new session)",
			"form.enabled": "Enable task",
			"form.nextRun": "Next run",
			"btn.validate": "Validate",
			"form.upcoming": "Upcoming runs",
			"form.promptPlaceholder": "e.g. Summarize yesterday's data into a Markdown report.",
			"form.cronPlaceholder": "e.g. 0 9 * * * or 0 0 2 * * ?",
			"form.cronValid": "valid",
			"form.cronInvalid": "invalid expression",
			"type.cron": "Cron",
			"type.once": "Once",
			"type.interval": "Interval",
			"history.title": "Execution History",
			"history.empty": "No executions yet",
			"history.retention": "retained up to 500 entries per task",
			"history.openSession": "Open session",
			"btn.executions": "Executions",
			"tab.tasks": "Tasks",
			"tab.executions": "Executions",
			"history.all.retention": "retained up to 500 entries",
			"session.openCrossWorkspace": "This session belongs to workspace {path} — switch to it first to open",
			"session.openUnregistered": "This session lives in an unregistered workspace ({path}) and cannot be opened here; start dsh web from that directory to view it",
			"pager.prev": "Previous",
			"pager.next": "Next",
			"pager.summary": "Page {p} of {n} · {c} entries",
			"pager.pageSize": "per page",
			"tasks.empty": "No tasks yet — create one with \"New Task\"",
			"error.load": "Failed to load tasks",
			"error.save": "Failed to save",
			"error.delete": "Failed to delete",
			"error.run": "Failed to run",
			"error.untrusted": "Untrusted origin",
			"next.unknown": "—"
		};
		//#endregion
		//#region src/client/api.ts
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
		//#endregion
		//#region src/client/icons.tsx
		function Svg({ size = 16, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
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
		function IconClock({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				size,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "6.25"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 4.5V8l2.4 1.5" })]
			});
		}
		function IconPlus({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				size,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 3.2v9.6M3.2 8h9.6" })
			});
		}
		function IconRefresh({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				size,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.2 8a5.2 5.2 0 1 1-1.5-3.7" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.4 2.6v3h-3" })]
			});
		}
		function IconEdit({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				size,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11.3 2.7a1.4 1.4 0 0 1 2 2L5 13l-3 .7.7-3 8.6-8z" })
			});
		}
		function IconPlay({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				size,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M5 3.2v9.6l7.4-4.8z",
					fill: "currentColor",
					stroke: "none"
				})
			});
		}
		function IconHistory({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				size,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.8 8a5.2 5.2 0 1 1 1.5 3.7" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.8 6.5V9.5h3" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 4.6V8l2.3 1.4" })
				]
			});
		}
		function IconTrash({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				size,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.8 4.4h10.4M6.4 4.4V3.2a.8.8 0 0 1 .8-.8h1.6a.8.8 0 0 1 .8.8v1.2M4.4 4.4l.6 8a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.6-8" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6.6 7v3.6M9.4 7v3.6" })]
			});
		}
		function IconCheck({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				size,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.2 8.4l3 3 6.6-6.8" })
			});
		}
		function IconCross({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				size,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 4l8 8M12 4l-8 8" })
			});
		}
		function IconChevronLeft({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				size,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 3.5L5.5 8l4.5 4.5" })
			});
		}
		//#endregion
		//#region src/client/pager.ts
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
		//#endregion
		//#region src/client/SchedulerPanel.tsx
		/**
		* Scheduler panel: task list / create-edit form / execution history, rendered
		* inside a modal. Styled with the host's --dsw-alias design tokens so it reads
		* as a native DSH surface (no hardcoded palette, no emoji icons).
		*
		* Trigger types: cron (expression), once (specific time), interval (every N min).
		* The form previews the next run time live via /dsh-scheduler/preview.
		*/
		const CRON_RE = /^[0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+(\s+[0-9*,/\-?L#w]+)?$/;
		const T = {
			text: "var(--dsw-alias-label-primary)",
			text2: "var(--dsw-alias-label-secondary)",
			text3: "var(--dsw-alias-label-tertiary)",
			card: "var(--dsw-alias-bg-layer-1)",
			surface: "var(--dsw-alias-bg-layer-2)",
			border: "var(--dsw-alias-border-l2)",
			accent: "var(--dsw-alias-brand-primary)",
			success: "var(--dsw-static-green-500)",
			danger: "var(--dsw-alias-state-error-primary)",
			warn: "var(--dsw-static-yellow-500)",
			hover: "var(--dsw-alias-interactive-bg-hover)",
			font: "var(--dsw-font-family)"
		};
		const S = {
			overlay: {
				position: "fixed",
				inset: 0,
				zIndex: 1e3,
				background: "rgba(0,0,0,.55)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: T.font,
				color: T.text,
				fontSize: 14,
				lineHeight: 1.5
			},
			panel: {
				width: 720,
				maxWidth: "94vw",
				height: "80vh",
				display: "flex",
				flexDirection: "column",
				background: T.surface,
				border: `1px solid ${T.border}`,
				borderRadius: 14,
				boxShadow: "0 24px 80px rgba(0,0,0,.45)",
				overflow: "hidden"
			},
			tabBar: {
				display: "flex",
				gap: 4,
				alignItems: "center",
				flexShrink: 0,
				borderBottom: `1px solid ${T.border}`,
				padding: "0 16px"
			},
			tab: {
				display: "inline-flex",
				alignItems: "center",
				gap: 6,
				height: 38,
				padding: "0 14px",
				border: "none",
				background: "transparent",
				color: T.text2,
				fontSize: 13.5,
				cursor: "pointer",
				fontFamily: T.font,
				marginBottom: -1,
				borderBottom: "2px solid transparent",
				transition: "color .15s"
			},
			tabOn: {
				color: T.accent,
				borderBottomColor: T.accent,
				fontWeight: 500
			},
			pagerBar: {
				flexShrink: 0,
				borderTop: `1px solid ${T.border}`,
				background: T.surface,
				padding: "12px 20px"
			},
			head: {
				display: "flex",
				alignItems: "center",
				gap: 12,
				padding: "16px 20px",
				borderBottom: `1px solid ${T.border}`
			},
			title: {
				fontSize: 16,
				fontWeight: 600,
				display: "flex",
				alignItems: "center",
				gap: 10
			},
			sub: {
				color: T.text3,
				fontSize: 12
			},
			spacer: { flex: 1 },
			body: {
				flex: 1,
				overflow: "auto",
				padding: "16px 20px"
			},
			err: {
				display: "flex",
				alignItems: "center",
				gap: 8,
				background: "color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent)",
				border: `1px solid ${T.danger}`,
				color: T.danger,
				borderRadius: 10,
				padding: "10px 14px",
				marginBottom: 14,
				fontSize: 13
			},
			toolbar: {
				display: "flex",
				gap: 8,
				marginBottom: 16,
				alignItems: "center"
			},
			card: {
				border: `1px solid ${T.border}`,
				background: T.card,
				borderRadius: 12,
				padding: "14px 16px",
				marginBottom: 10
			},
			cardTop: {
				display: "flex",
				alignItems: "center",
				gap: 10
			},
			name: {
				fontWeight: 600,
				fontSize: 14,
				flex: 1,
				minWidth: 0,
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			meta: {
				display: "flex",
				alignItems: "center",
				gap: 12,
				marginTop: 6,
				flexWrap: "wrap"
			},
			metaItem: {
				display: "inline-flex",
				alignItems: "center",
				gap: 5,
				color: T.text3,
				fontSize: 12
			},
			cron: {
				fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
				color: T.accent,
				fontSize: 12
			},
			prompt: {
				color: T.text2,
				fontSize: 12.5,
				marginTop: 8,
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			actions: {
				display: "flex",
				gap: 8,
				marginTop: 12,
				paddingTop: 12,
				borderTop: `1px solid ${T.border}`,
				alignItems: "center"
			},
			pill: {
				display: "inline-flex",
				alignItems: "center",
				gap: 5,
				padding: "2px 10px",
				borderRadius: 999,
				fontSize: 12,
				fontWeight: 500
			},
			btn: {
				display: "inline-flex",
				alignItems: "center",
				gap: 6,
				height: 32,
				padding: "0 13px",
				borderRadius: 999,
				border: `1px solid ${T.border}`,
				background: T.card,
				color: T.text,
				cursor: "pointer",
				fontSize: 13,
				fontFamily: T.font,
				transition: "background .15s,color .15s"
			},
			btnPrimary: {
				display: "inline-flex",
				alignItems: "center",
				gap: 6,
				height: 32,
				padding: "0 14px",
				borderRadius: 999,
				border: "none",
				background: T.accent,
				color: "#fff",
				cursor: "pointer",
				fontSize: 13,
				fontWeight: 500,
				fontFamily: T.font
			},
			btnDanger: {
				display: "inline-flex",
				alignItems: "center",
				gap: 6,
				height: 32,
				padding: "0 13px",
				borderRadius: 999,
				border: `1px solid ${T.danger}`,
				background: "transparent",
				color: T.danger,
				cursor: "pointer",
				fontSize: 13,
				fontFamily: T.font
			},
			iconBtn: {
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: 32,
				height: 32,
				borderRadius: 8,
				border: "none",
				background: "transparent",
				color: T.text3,
				cursor: "pointer",
				transition: "background .15s,color .15s"
			},
			input: {
				width: "100%",
				boxSizing: "border-box",
				background: T.card,
				border: `1px solid ${T.border}`,
				borderRadius: 10,
				padding: "9px 12px",
				color: T.text,
				fontSize: 14,
				outline: "none",
				fontFamily: T.font
			},
			label: {
				display: "block",
				fontSize: 13,
				color: T.text2,
				marginBottom: 6
			},
			field: { marginBottom: 16 },
			hint: {
				marginTop: 6,
				fontSize: 12
			},
			nextRun: {
				display: "inline-flex",
				alignItems: "center",
				gap: 5,
				marginTop: 8,
				fontSize: 12,
				color: T.text2
			},
			seg: {
				display: "inline-flex",
				alignItems: "center",
				gap: 6,
				height: 32,
				padding: "0 14px",
				borderRadius: 999,
				border: `1px solid ${T.border}`,
				background: "transparent",
				color: T.text2,
				cursor: "pointer",
				fontSize: 13,
				fontFamily: T.font,
				transition: "background .15s,color .15s"
			},
			segOn: {
				background: "color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent)",
				borderColor: T.accent,
				color: T.accent,
				fontWeight: 500
			},
			formCard: {
				maxWidth: 560,
				background: T.card,
				border: `1px solid ${T.border}`,
				borderRadius: 12,
				padding: 18
			},
			foot: {
				display: "flex",
				justifyContent: "flex-end",
				gap: 8,
				marginTop: 4
			},
			empty: {
				color: T.text3,
				textAlign: "center",
				padding: "48px 0",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 10
			},
			row: {
				display: "flex",
				alignItems: "center",
				gap: 12,
				padding: "12px 14px",
				border: `1px solid ${T.border}`,
				borderRadius: 10,
				marginBottom: 6,
				background: T.card
			}
		};
		function Pill({ ok, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				style: {
					...S.pill,
					...ok ? {
						background: "color-mix(in srgb, var(--dsw-static-green-500) 14%, transparent)",
						color: T.success
					} : {
						background: "color-mix(in srgb, var(--dsw-alias-label-tertiary) 16%, transparent)",
						color: T.text3
					}
				},
				children
			});
		}
		const TRIGGER_TYPES = [
			"cron",
			"once",
			"interval"
		];
		function SchedulerPanel({ onClose, t, sessions, workspaces }) {
			const [view, setView] = (0, react.useState)("list");
			const [tasks, setTasks] = (0, react.useState)([]);
			const [history, setHistory] = (0, react.useState)([]);
			const [error, setError] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [editId, setEditId] = (0, react.useState)(null);
			const [name, setName] = (0, react.useState)("");
			const [type, setType] = (0, react.useState)("cron");
			const [cron, setCron] = (0, react.useState)("");
			const [runAt, setRunAt] = (0, react.useState)("");
			const [everyMinutes, setEveryMinutes] = (0, react.useState)(60);
			const [prompt, setPrompt] = (0, react.useState)("");
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
			* Open a session through the host sessions service, then close the panel so
			* the session is visible. Sessions live in a workspace (their cwd); when the
			* target session belongs to another workspace the host UI cannot render it
			* here, so we surface a clear message instead of silently landing on the
			* empty state.
			*/
			const openSession = (sessionId) => {
				if (sessions === void 0) {
					setError("宿主未提供会话服务 / sessions service unavailable");
					return;
				}
				const snapshot = sessions.list?.getSnapshot();
				const cwd = snapshot?.byId[sessionId]?.cwd;
				const wsItems = workspaces?.list?.getSnapshot().items ?? [];
				if (cwd !== void 0) {
					const targetWs = wsItems.find((w) => w.path === cwd);
					if (targetWs === void 0) {
						setError(fmt(t("session.openUnregistered"), { path: cwd }));
						return;
					}
					const currentId = snapshot?.current;
					const currentWs = currentId === void 0 ? void 0 : wsItems.find((w) => w.path === snapshot?.byId[currentId]?.cwd);
					if (currentWs !== void 0 && currentWs.workspaceId !== targetWs.workspaceId) {
						setError(fmt(t("session.openCrossWorkspace"), { path: targetWs.path }));
						return;
					}
				}
				try {
					sessions.open(sessionId);
					onClose();
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
				const onKey = (e) => {
					if (e.key === "Escape") onClose();
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
			const openNew = () => {
				setEditId(null);
				setName("");
				setType("cron");
				setCron("");
				setRunAt("");
				setEveryMinutes(60);
				setCwd("");
				setPrompt("");
				setEnabled(true);
				setError(null);
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
				setPrompt(task.prompt);
				setEnabled(task.enabled);
				setError(null);
				setCronChecked(false);
				setUpcoming([]);
				setView("form");
			};
			const openHistory = async (task) => {
				try {
					const res = await taskHistory(task.id);
					setHistory(res.history);
					setHistPage(0);
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
						prompt,
						enabled
					};
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
				try {
					await runTask(task.id);
					await reload();
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: S.overlay,
				onClick: (e) => {
					if (e.target === e.currentTarget) onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: S.panel,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: S.head,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: {
										...S.title,
										color: T.accent
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClock, { size: 17 })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: S.title,
									children: t("panel.title")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: S.sub,
									children: t("panel.subtitle")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: S.spacer }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: S.iconBtn,
									title: t("btn.close"),
									onClick: onClose,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCross, {})
								})
							]
						}),
						(view === "list" || view === "executions") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: S.tabBar,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: {
									...S.tab,
									...view === "list" ? S.tabOn : {}
								},
								onClick: () => setView("list"),
								children: t("tab.tasks")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: {
									...S.tab,
									...view === "executions" ? S.tabOn : {}
								},
								onClick: () => void openExecutions(),
								children: t("tab.executions")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: S.body,
							ref: bodyRef,
							children: [
								error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: S.err,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCross, { size: 15 }), error]
								}),
								view === "list" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: S.toolbar,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										style: S.btnPrimary,
										onClick: openNew,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlus, { size: 15 }), t("btn.new")]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										style: S.btn,
										onClick: () => void reload(),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 15 }), t("btn.refresh")]
									})]
								}), tasks.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: S.empty,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: { color: T.text3 },
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClock, { size: 28 })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("tasks.empty") })]
								}) : tasks.map((task) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: S.card,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.cardTop,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												style: S.name,
												title: task.name,
												children: task.name
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Pill, {
												ok: task.enabled,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, { size: 12 }), task.enabled ? t("status.enabled") : t("status.disabled")]
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.meta,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													style: S.metaItem,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClock, { size: 13 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														style: S.cron,
														children: triggerText(task, t)
													})]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													style: S.metaItem,
													children: [
														t("col.next"),
														"：",
														task.enabled && task.nextRun !== null ? formatTime(task.nextRun) : t("next.unknown")
													]
												}),
												task.cwd !== void 0 && task.cwd !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													style: S.metaItem,
													children: [
														t("form.cwd"),
														"：",
														task.cwd
													]
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											style: S.prompt,
											title: task.prompt,
											children: task.prompt
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.actions,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													style: S.btn,
													onClick: () => openEdit(task),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconEdit, { size: 14 }), t("btn.edit")]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													style: S.btn,
													onClick: () => void toggle(task),
													children: task.enabled ? t("status.disabled") : t("status.enabled")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													style: S.btn,
													onClick: () => void run(task),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlay, { size: 13 }), t("btn.run")]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													style: S.btn,
													onClick: () => void openHistory(task),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconHistory, { size: 14 }), t("btn.history")]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: S.spacer }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													style: S.iconBtn,
													title: t("btn.delete"),
													onClick: () => void remove(task),
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconTrash, { size: 15 })
												})
											]
										})
									]
								}, task.id))] }),
								view === "executions" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: S.toolbar,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											style: S.btn,
											onClick: () => void reloadExecutions(),
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 15 }), t("btn.refresh")]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: S.spacer }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											style: {
												...S.sub,
												fontSize: 12
											},
											children: t("history.all.retention")
										})
									]
								}), allHistory.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									style: S.empty,
									children: t("history.empty")
								}) : (execResult?.rows ?? []).map((entry, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryRow, {
									entry,
									t,
									name: taskNameById.get(entry.taskId) ?? entry.taskId.slice(0, 8),
									onOpenSession: openSession
								}, `${entry.at}-${index}`))] }),
								view === "form" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: S.formCard,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.field,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
												style: S.label,
												children: t("form.type")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												style: {
													display: "flex",
													gap: 8
												},
												children: TRIGGER_TYPES.map((tp) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													style: {
														...S.seg,
														...type === tp ? S.segOn : {}
													},
													onClick: () => setType(tp),
													children: tp === "cron" ? t("form.type.cron") : tp === "once" ? t("form.type.once") : t("form.type.interval")
												}, tp))
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.field,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												style: S.label,
												children: [t("form.name"), " *"]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												style: S.input,
												value: name,
												onChange: (e) => setName(e.target.value),
												placeholder: t("form.name")
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.field,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
													style: S.label,
													children: t("form.cwd")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
													style: {
														...S.input,
														height: 38
													},
													value: cwd,
													onChange: (e) => setCwd(e.target.value),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: "",
														children: t("form.cwdDefault")
													}), cwdOptions.map((o) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: o.path,
														title: o.path,
														children: o.title
													}, o.path))]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													style: {
														...S.hint,
														color: T.text3
													},
													children: t("form.cwdHint")
												})
											]
										}),
										type === "cron" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.field,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
													style: S.label,
													children: [t("form.cron"), " *"]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: {
														display: "flex",
														gap: 8
													},
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
														style: {
															...S.input,
															flex: 1,
															fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
														},
														value: cron,
														onChange: (e) => {
															setCron(e.target.value);
															setCronChecked(false);
														},
														placeholder: t("form.cronPlaceholder")
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
														style: S.btn,
														onClick: () => void checkCron(),
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, { size: 14 }), t("btn.validate")]
													})]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													style: {
														...S.hint,
														color: cron.trim() === "" ? T.text3 : cronOk ? T.success : T.danger
													},
													children: cron.trim() === "" ? t("form.cronPlaceholder") : cronOk ? t("form.cronValid") : t("form.cronInvalid")
												}),
												cronChecked && cronOk && upcoming.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: {
														marginTop: 10,
														fontSize: 12,
														color: T.text2
													},
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														style: {
															marginBottom: 4,
															color: T.text3
														},
														children: [t("form.upcoming"), "："]
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														style: {
															display: "flex",
															flexDirection: "column",
															gap: 3,
															fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
														},
														children: upcoming.map((iso) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: formatTime(iso) }, iso))
													})]
												})
											]
										}),
										type === "once" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.field,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												style: S.label,
												children: [t("form.runAt"), " *"]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												type: "datetime-local",
												style: S.input,
												value: runAt,
												onChange: (e) => setRunAt(e.target.value)
											})]
										}),
										type === "interval" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.field,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												style: S.label,
												children: [t("form.everyMinutes"), " *"]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												type: "number",
												min: 1,
												style: S.input,
												value: everyMinutes,
												onChange: (e) => setEveryMinutes(Number(e.target.value) || 1)
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.field,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												style: S.label,
												children: [t("form.prompt"), " *"]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
												style: {
													...S.input,
													minHeight: 96,
													resize: "vertical",
													lineHeight: 1.5
												},
												value: prompt,
												onChange: (e) => setPrompt(e.target.value),
												placeholder: t("form.promptPlaceholder")
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											style: S.field,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												style: S.nextRun,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClock, { size: 13 }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
													t("form.nextRun"),
													"：",
													triggerValid && nextRun !== null ? formatTime(nextRun) : "—"
												] })]
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: 10,
												marginBottom: 18
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: enabled,
												onChange: (e) => setEnabled(e.target.checked)
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: {
													fontSize: 13,
													color: T.text2
												},
												children: t("form.enabled")
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: S.foot,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												style: S.btn,
												onClick: () => setView("list"),
												disabled: busy,
												children: t("btn.cancel")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												style: S.btnPrimary,
												onClick: () => void save(),
												disabled: busy || name.trim() === "" || prompt.trim() === "" || !triggerValid,
												children: t("btn.save")
											})]
										})
									]
								}),
								view === "history" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: 10,
										marginBottom: 14
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										style: S.btn,
										onClick: () => setView("list"),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronLeft, { size: 14 }), t("btn.back")]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											...S.sub,
											fontSize: 12
										},
										children: t("history.retention")
									})]
								}), history.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									style: S.empty,
									children: t("history.empty")
								}) : (histResult?.rows ?? []).map((entry, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryRow, {
									entry,
									t,
									onOpenSession: openSession
								}, `${entry.at}-${index}`))] })
							]
						}),
						view === "executions" && execResult !== null && allHistory.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: S.pagerBar,
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
							style: S.pagerBar,
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
			});
		}
		/** Shared history row used by both the executions list and the per-task history view. */
		function HistoryRow({ entry, name, t, onOpenSession }) {
			const running = entry.status === "running";
			const ok = entry.status === "created";
			const fail = entry.status === "failed";
			const iconColor = running ? T.accent : ok ? T.success : fail ? T.danger : T.warn;
			const statusText = running ? t("status.running") : ok ? t("status.created") : fail ? `${t("status.failed")}${entry.error !== void 0 ? `: ${entry.error}` : ""}` : t("status.skipped");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: S.row,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							color: iconColor,
							display: "inline-flex"
						},
						children: running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClock, { size: 14 }) : ok ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, { size: 14 }) : fail ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCross, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClock, { size: 14 })
					}),
					name !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							fontSize: 13,
							fontWeight: 500,
							maxWidth: 180,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap"
						},
						children: name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							...S.sub,
							minWidth: 140
						},
						children: formatTime(entry.at)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							flex: 1,
							fontSize: 13
						},
						children: statusText
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							...S.sub,
							fontSize: 12,
							flexShrink: 0
						},
						children: entry.ms !== void 0 ? `${entry.ms}ms` : "—"
					}),
					!running && entry.sessionId !== void 0 && onOpenSession !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						style: {
							...S.btn,
							height: 28,
							padding: "0 10px",
							fontSize: 12,
							flexShrink: 0,
							whiteSpace: "nowrap"
						},
						onClick: () => onOpenSession(entry.sessionId),
						children: t("history.openSession")
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
				style: {
					display: "flex",
					alignItems: "center",
					gap: 10,
					justifyContent: "center",
					flexWrap: "wrap"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						style: {
							...S.btn,
							...first ? {
								opacity: .45,
								cursor: "default"
							} : {}
						},
						disabled: first,
						onClick: () => onPage(page - 1),
						children: t("pager.prev")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							fontSize: 12,
							color: T.text3,
							whiteSpace: "nowrap"
						},
						children: fmt(t("pager.summary"), {
							p: page + 1,
							n: pages,
							c: total
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						style: {
							...S.btn,
							...last ? {
								opacity: .45,
								cursor: "default"
							} : {}
						},
						disabled: last,
						onClick: () => onPage(page + 1),
						children: t("pager.next")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						"aria-label": t("pager.pageSize"),
						value: pageSize,
						onChange: (e) => onPageSize(Number(e.target.value)),
						style: {
							height: 32,
							borderRadius: 10,
							border: `1px solid ${T.border}`,
							background: T.card,
							color: T.text,
							padding: "0 8px",
							fontSize: 13,
							fontFamily: T.font
						},
						children: PAGE_SIZES.map((n) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: n,
							children: n
						}, n))
					})
				]
			});
		}
		function formatTime(iso) {
			try {
				return new Date(iso).toLocaleString();
			} catch {
				return iso;
			}
		}
		/** Convert an ISO datetime to a `datetime-local` input value (local timezone). */
		function toLocalInput(iso) {
			const d = new Date(iso);
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
		}
		/** Human-readable trigger description for the list view. */
		function triggerText(task, t) {
			if (task.type === "once") return `${t("type.once")} · ${task.runAt ? formatTime(task.runAt) : "—"}`;
			if (task.type === "interval") return `${t("type.interval")} · ${task.everyMinutes} min`;
			return task.cron;
		}
		//#endregion
		//#region src/client/SchedulerEntry.tsx
		/**
		* Sidebar footer entry: a native-looking "调度器" row (icon + label) mounted in
		* the left sidebar's footer.action slot. Clicking opens the scheduler panel.
		*/
		function SchedulerEntry({ t, sessions, workspaces }) {
			const [open, setOpen] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				title: t("entry.label"),
				onClick: () => setOpen(true),
				style: {
					boxSizing: "border-box",
					cursor: "pointer",
					width: "calc(100% + 4px)",
					height: 42,
					color: "var(--dsw-alias-label-primary)",
					background: "transparent",
					border: "none",
					borderRadius: 12,
					display: "flex",
					alignItems: "center",
					gap: 10,
					margin: "4px -2px",
					padding: "0 10px 0 8px",
					fontFamily: "inherit",
					fontSize: 14,
					lineHeight: "22px",
					justifyContent: "flex-start",
					transition: "background .15s"
				},
				onMouseEnter: (e) => {
					e.currentTarget.style.background = "var(--dsw-alias-interactive-bg-hover)";
				},
				onMouseLeave: (e) => {
					e.currentTarget.style.background = "transparent";
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						display: "inline-flex",
						color: "var(--dsw-alias-label-secondary)",
						flexShrink: 0
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClock, { size: 16 })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						whiteSpace: "nowrap",
						overflow: "hidden",
						flex: 1,
						textAlign: "left"
					},
					children: t("entry.label")
				})]
			}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SchedulerPanel, {
				onClose: () => setOpen(false),
				t,
				sessions,
				workspaces
			})] });
		}
		//#endregion
		//#region src/client/index.ts
		/**
		* dsh-scheduler client: registers a "调度器" entry in the left sidebar's
		* footer.action slot (same pattern as dsh-knj-workflow's "新建任务" entry).
		* Built by tsdown into the __ModuleLoader__ factory bundle at client/client.js.
		*/
		const NS = "dsh-scheduler";
		const name = "dsh-scheduler";
		const inject = [
			"locale",
			"slots",
			"sessions",
			"workspaces"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-scheduler: dictionaries");
			const t = ctx.locale.bind(NS);
			const sessions = ctx.sessions;
			const workspaces = ctx.workspaces;
			ctx.effect(() => {
				if (!ctx.slots) return;
				ctx.slots.inject("knj.menu.item", () => ctx.slots.register({
					name: "knj.menu.item",
					id: "dsh-scheduler",
					order: 20,
					locale: "zh"
				}, () => (0, react.createElement)(SchedulerEntry, {
					t,
					sessions,
					workspaces
				})));
			}, "dsh-scheduler: sidebar entry");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map