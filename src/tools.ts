import fs from "node:fs";
import path from "node:path";
import open from "open";
import {
	getGuidelines,
	getHtmlBoilerplate,
} from "./constants.js";
import { fsManager } from "./filesystem.js";
import { quickfillServer } from "./server.js";

let isFirstRun = true;

export async function handleRenderUi(
	htmlBody: string,
	requiredLibs: string[] = [],
	openInBrowser?: boolean,
	streaming: boolean = false,
) {
	const isInVSCode =
		process.env.VSCODE_PID || process.env.TERM_PROGRAM === "vscode";

	if (streaming) {
		streamingContent = htmlBody;
		if (isInVSCode) {
			quickfillServer.broadcastHtmlUpdate(htmlBody);
		}
		return {
			content: [{ type: "text", text: "Streaming update sent" }],
		};
	}

	const fullHtml = getHtmlBoilerplate(
		htmlBody,
		requiredLibs,
		quickfillServer.port,
	);
	fsManager.writeIndexHtml(fullHtml);

	const shouldOpen = (openInBrowser ?? isFirstRun) && !isInVSCode;

	if (shouldOpen) {
		process.stderr.write(
			`[Tools] Attempting to open browser: ${quickfillServer.getUrl()}\n`,
		);
		try {
			await open(quickfillServer.getUrl());
			process.stderr.write(
				`[Tools] Browser open command issued successfully\n`,
			);
		} catch (err) {
			process.stderr.write(`[Tools] Failed to open browser: ${err}\n`);
		}
		isFirstRun = false;
	}

	if (isInVSCode) {
		process.stderr.write(
			`[Tools] Running in VS Code, using Simple Browser or URL\n`,
		);
	}

	quickfillServer.broadcastReload();

	let status = `UI updated. Preview available at ${quickfillServer.getUrl()}`;
	if (shouldOpen) {
		status += ` (Attempted to open browser)`;
	}
	if (isInVSCode) {
		status += ` (VS Code detected - use Simple Browser: ${quickfillServer.getUrl()})`;
	}

	return {
		content: [{ type: "text", text: status }],
	};
}

export function handleMountFile(absolutePath: string) {
	try {
		const relativePath = fsManager.mountFile(absolutePath);
		return {
			content: [
				{
					type: "text",
					text: `File mounted successfully. Relative path: ${relativePath}`,
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text",
					text: `Error mounting file: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
}

export async function handleRenderChart(
	data: any,
	type: string,
	options: any = {},
	openInBrowser?: boolean,
) {
	const chartHtml = `
		<div class="max-w-4xl mx-auto p-6">
			<canvas id="chart" width="400" height="200"></canvas>
		</div>
		<script>
			function initChart() {
				const ctx = document.getElementById('chart').getContext('2d');
				new Chart(ctx, {
					type: '${type}',
					data: ${JSON.stringify(data)},
					options: ${JSON.stringify(options)}
				});
			}
			if (window.Chart) {
				initChart();
			} else {
				document.querySelector('[src*="chart"]').onload = initChart;
			}
		</script>
	`;

	return await handleRenderUi(chartHtml, ["chart"], openInBrowser);
}

export async function handleRenderTable(
	data: any[],
	columns?: string[],
	openInBrowser?: boolean,
) {
	const cols = columns || (data.length > 0 ? Object.keys(data[0]) : []);
	const tableHtml = `
		<div class="max-w-6xl mx-auto p-6">
			<div x-data="{ search: '', sortKey: '', sortAsc: true }" class="space-y-4">
				<input x-model="search" type="text" placeholder="Search..." class="w-full p-2 border rounded">
				<table class="w-full border-collapse border border-gray-300">
					<thead>
						<tr class="bg-gray-100">
							${cols.map((col: string) => `<th @click="sortKey='${col}'; sortAsc=!sortAsc" class="p-2 border cursor-pointer hover:bg-gray-200">${col}</th>`).join("")}
						</tr>
					</thead>
					<tbody>
						<template x-for="row in data.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())).sort((a,b) => {
							if (!sortKey) return 0;
							const aVal = a[sortKey], bVal = b[sortKey];
							if (sortAsc) return aVal > bVal ? 1 : -1;
							return aVal < bVal ? 1 : -1;
						})" :key="$index">
							<tr class="border">
								${cols.map((col: string) => `<td class="p-2 border" x-text="row['${col}']"></td>`).join("")}
							</tr>
						</template>
					</tbody>
				</table>
			</div>
		</div>
		<script>
			document.addEventListener('alpine:init', () => {
				Alpine.store('tableData', ${JSON.stringify(data)});
			});
		</script>
	`;

	return await handleRenderUi(tableHtml, [], openInBrowser);
}

export async function handleRenderForm(
	fields: any[],
	onSubmit?: string,
	openInBrowser?: boolean,
) {
	const formHtml = `
		<div class="max-w-md mx-auto p-6">
			<form x-data="{ formData: {} }" @submit.prevent="${onSubmit || "console.log(formData)"}">
				${fields
					.map(
						(field: any) => `
					<div class="mb-4">
						<label class="block text-sm font-medium mb-1">${field.label || field.name}</label>
						${
							field.type === "textarea"
								? `<textarea x-model="formData.${field.name}" ${field.required ? "required" : ""} class="w-full p-2 border rounded"></textarea>`
								: field.type === "select"
									? `<select x-model="formData.${field.name}" ${field.required ? "required" : ""} class="w-full p-2 border rounded">
								${field.options?.map((opt: string) => `<option value="${opt}">${opt}</option>`).join("") || ""}
							</select>`
									: `<input type="${field.type}" x-model="formData.${field.name}" ${field.required ? "required" : ""} class="w-full p-2 border rounded">`
						}
					</div>
				`,
					)
					.join("")}
				<button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Submit</button>
			</form>
		</div>
	`;

	return await handleRenderUi(formHtml, [], openInBrowser);
}

export function handleExportUi(filename: string, exportPath?: string) {
	try {
		const currentHtml = fs.readFileSync(
			path.join(fsManager.tempDir, "index.html"),
			"utf-8",
		);
		const dir = exportPath || process.cwd();
		const filePath = path.join(dir, `${filename}.html`);
		fs.writeFileSync(filePath, currentHtml);
		return {
			content: [
				{
					type: "text",
					text: `UI exported successfully to ${filePath}`,
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text",
					text: `Error exporting UI: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
}

export async function handleRenderSvg(
	svgCode: string,
	_title?: string,
	openInBrowser?: boolean,
) {
	const svgHtml = `
		<div class="max-w-4xl mx-auto p-6 flex items-center justify-center">
			${svgCode}
		</div>
	`;

	return await handleRenderUi(svgHtml, [], openInBrowser);
}

export function handleLoadGuidelines(modules: string[]) {
	const guidelines = getGuidelines(modules);
	return {
		content: [{ type: "text", text: guidelines }],
	};
}

export async function handleRenderMermaid(
	diagramCode: string,
	diagramType: string = "erDiagram",
	openInBrowser?: boolean,
) {
	const chartId = `chart-${Math.random().toString(36).substring(2, 11)}`;
	const mermaidHtml = `
		<div class="max-w-4xl mx-auto p-6">
			<div id="mermaid-output"></div>
		</div>
		<script type="module">
			import mermaid from 'https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs';
			const dark = matchMedia('(prefers-color-scheme: dark)').matches;
			await document.fonts.ready;
			mermaid.initialize({
				startOnLoad: false,
				theme: 'base',
				fontFamily: 'system-ui, sans-serif',
				themeVariables: {
					darkMode: dark,
					fontSize: '13px',
					fontFamily: 'system-ui, sans-serif',
					lineColor: dark ? '#9c9a92' : '#73726c',
					textColor: dark ? '#c2c0b6' : '#3d3d3a',
				},
			});
			const { svg } = await mermaid.render('${chartId}', \`${diagramType}
${diagramCode}\`);
			document.getElementById('mermaid-output').innerHTML = svg;
		</script>
	`;

	return await handleRenderUi(mermaidHtml, ["mermaid"], openInBrowser);
}

export async function handleRenderDashboard(
	widgets: Array<{ type: string; data: any; options?: any }>,
	openInBrowser?: boolean,
) {
	let dashboardHtml = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;

	for (const widget of widgets) {
		if (widget.type === "metric") {
			dashboardHtml += `
				<div class="bg-white p-6 rounded-lg shadow">
					<h3 class="text-sm font-medium text-gray-500">${widget.data.label}</h3>
					<p class="text-3xl font-bold mt-2">${widget.data.value}</p>
				</div>
			`;
		} else if (widget.type === "chart") {
			const chartId = `chart-${Math.random().toString(36).substring(2, 11)}`;
			dashboardHtml += `
				<div class="bg-white p-6 rounded-lg shadow col-span-2">
					<canvas id="${chartId}"></canvas>
				</div>
			`;
		}
	}

	dashboardHtml += `</div>`;

	return await handleRenderUi(dashboardHtml, ["chart"], openInBrowser);
}
