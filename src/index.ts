import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AVAILABLE_MODULES } from "./constants.js";
import { quickfillServer } from "./server.js";
import {
	handleExportUi,
	handleLoadGuidelines,
	handleMountFile,
	handleRenderChart,
	handleRenderDashboard,
	handleRenderForm,
	handleRenderMermaid,
	handleRenderSvg,
	handleRenderTable,
	handleRenderUi,
} from "./tools.js";

let _hasSeenReadMe = false;

const server = new Server(
	{
		name: "quickfill",
		version: "2.0.0",
	},
	{
		capabilities: {
			tools: {},
		},
	},
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "visualize_read_me",
				description:
					"Returns design guidelines for show_widget (CSS patterns, colors, typography, layout rules, examples). " +
					"Call once before your first show_widget call. Do NOT mention this call to the user — it is an internal setup step.",
				inputSchema: {
					type: "object",
					properties: {
						modules: {
							type: "array",
							items: {
								type: "string",
								enum: AVAILABLE_MODULES as readonly string[],
							},
							description: "Which module(s) to load. Pick all that fit.",
						},
					},
					required: ["modules"],
				},
			},
			{
				name: "show_widget",
				description:
					"Show visual content — SVG graphics, charts, diagrams, or interactive HTML widgets in a native browser window. " +
					"Use for flowcharts, dashboards, forms, calculators, data tables, illustrations, or any visual content. " +
					"The HTML is rendered in a browser with full CSS/JS support including Canvas and CDN libraries. " +
					"The page gets a window._sendData(data) bridge to send JSON data back to the agent. " +
					"IMPORTANT: Call visualize_read_me once before your first show_widget call.",
				inputSchema: {
					type: "object",
					properties: {
						i_have_seen_read_me: {
							type: "boolean",
							description:
								"Confirm you have already called visualize_read_me in this conversation.",
						},
						title: {
							type: "string",
							description:
								"Short snake_case identifier for this widget (used as window title).",
						},
						widget_code: {
							type: "string",
							description:
								"HTML or SVG code to render. For SVG: raw SVG starting with <svg>. " +
								"For HTML: raw content fragment, no DOCTYPE/<html>/<head>/<body>.",
						},
						width: {
							type: "number",
							description: "Window width in pixels. Default: 800.",
						},
						height: {
							type: "number",
							description: "Window height in pixels. Default: 600.",
						},
					},
					required: ["i_have_seen_read_me", "title", "widget_code"],
				},
			},
			{
				name: "render_interactive_ui",
				description:
					"Render or update an Alpine.js interactive UI in the browser. Supports streaming updates. " +
					"Alternative to show_widget — use this for Tailwind/Alpine.js UI.",
				inputSchema: {
					type: "object",
					properties: {
						html_body: {
							type: "string",
							description: "The HTML/Alpine.js body content to render.",
						},
						required_libs: {
							type: "array",
							items: {
								type: "string",
								enum: ["excel", "pdf", "ocr", "chart", "mermaid"],
							},
							description:
								"Optional libraries to include (pdf.js, xlsx, tesseract.js, chart.js, mermaid).",
						},
						open_in_browser: {
							type: "boolean",
							description:
								"Whether to automatically open the UI in the browser. Defaults to true on first run.",
						},
						streaming: {
							type: "boolean",
							description: "Whether this is a streaming update (internal use).",
						},
					},
					required: ["html_body"],
				},
			},
			{
				name: "mount_file",
				description:
					"Mount a local file into the web server root for browser access. " +
					"Use this to expose Excel, CSV, PDF files to the UI.",
				inputSchema: {
					type: "object",
					properties: {
						absolute_path: {
							type: "string",
							description: "The absolute path to the local file.",
						},
					},
					required: ["absolute_path"],
				},
			},
			{
				name: "render_chart",
				description:
					"Render an interactive chart using Chart.js with provided data.",
				inputSchema: {
					type: "object",
					properties: {
						data: {
							type: "object",
							description: "Chart.js data object with labels and datasets.",
						},
						type: {
							type: "string",
							enum: ["bar", "line", "pie", "doughnut", "radar", "polarArea"],
							description: "Type of chart to render.",
						},
						options: {
							type: "object",
							description: "Chart.js options object for customization.",
						},
						open_in_browser: {
							type: "boolean",
							description: "Whether to open in browser.",
						},
					},
					required: ["data", "type"],
				},
			},
			{
				name: "render_table",
				description: "Render a sortable, searchable table from data array.",
				inputSchema: {
					type: "object",
					properties: {
						data: {
							type: "array",
							items: { type: "object" },
							description: "Array of objects to display as table rows.",
						},
						columns: {
							type: "array",
							items: { type: "string" },
							description: "Column names. If not provided, inferred from data.",
						},
						open_in_browser: {
							type: "boolean",
							description: "Whether to open in browser.",
						},
					},
					required: ["data"],
				},
			},
			{
				name: "render_form",
				description: "Render an interactive form with validation.",
				inputSchema: {
					type: "object",
					properties: {
						fields: {
							type: "array",
							items: {
								type: "object",
								properties: {
									name: { type: "string" },
									label: { type: "string" },
									type: {
										type: "string",
										enum: ["text", "email", "number", "textarea", "select"],
									},
									required: { type: "boolean" },
									options: { type: "array", items: { type: "string" } },
								},
								required: ["name", "type"],
							},
							description: "Form field definitions.",
						},
						onSubmit: {
							type: "string",
							description: "JavaScript code to run on form submit.",
						},
						open_in_browser: {
							type: "boolean",
							description: "Whether to open in browser.",
						},
					},
					required: ["fields"],
				},
			},
			{
				name: "render_svg",
				description:
					"Render an SVG diagram with Claude design system colors. Use for flowcharts, diagrams, illustrations.",
				inputSchema: {
					type: "object",
					properties: {
						svg_code: {
							type: "string",
							description:
								"SVG code to render. Use c-blue, c-teal classes for colors.",
						},
						title: {
							type: "string",
							description: "Optional title for the SVG diagram.",
						},
						open_in_browser: {
							type: "boolean",
							description: "Whether to open in browser.",
						},
					},
					required: ["svg_code"],
				},
			},
			{
				name: "render_mermaid",
				description:
					"Render a Mermaid diagram (ER diagrams, class diagrams, flowcharts).",
				inputSchema: {
					type: "object",
					properties: {
						diagram_code: {
							type: "string",
							description: "Mermaid diagram code (without ```mermaid wrapper).",
						},
						diagram_type: {
							type: "string",
							description:
								"Type of diagram (erDiagram, classDiagram, flowchart, etc).",
							default: "erDiagram",
						},
						open_in_browser: {
							type: "boolean",
							description: "Whether to open in browser.",
						},
					},
					required: ["diagram_code"],
				},
			},
			{
				name: "render_dashboard",
				description:
					"Render a dashboard with multiple widgets (metrics, charts, tables).",
				inputSchema: {
					type: "object",
					properties: {
						widgets: {
							type: "array",
							items: {
								type: "object",
								properties: {
									type: { type: "string", enum: ["metric", "chart", "table"] },
									data: { type: "object" },
									options: { type: "object" },
								},
								required: ["type", "data"],
							},
							description: "Array of widget definitions.",
						},
						open_in_browser: {
							type: "boolean",
							description: "Whether to open in browser.",
						},
					},
					required: ["widgets"],
				},
			},
			{
				name: "export_ui",
				description: "Export the current UI as an HTML file.",
				inputSchema: {
					type: "object",
					properties: {
						filename: {
							type: "string",
							description:
								"Filename for the exported HTML file (without extension).",
						},
						path: {
							type: "string",
							description:
								"Directory to save the file. Defaults to current directory.",
						},
					},
					required: ["filename"],
				},
			},
		],
	};
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;
	process.stderr.write(
		`[Debug] Calling tool: ${name} with args: ${JSON.stringify(args)}\n`,
	);

	try {
		if (name === "visualize_read_me") {
			const { modules } = args as {
				modules: string[];
			};
			_hasSeenReadMe = true;
			return handleLoadGuidelines(modules);
		}

		if (name === "show_widget") {
			const { i_have_seen_read_me, widget_code } = args as {
				i_have_seen_read_me: boolean;
				title: string;
				widget_code: string;
				width?: number;
				height?: number;
			};

			if (!i_have_seen_read_me) {
				return {
					content: [
						{
							type: "text",
							text: "Error: You must call visualize_read_me before show_widget. Set i_have_seen_read_me: true after doing so.",
						},
					],
					isError: true,
				};
			}

			return await handleRenderUi(widget_code, [], true);
		}

		if (name === "render_interactive_ui") {
			const { html_body, required_libs, open_in_browser, streaming } = args as {
				html_body: string;
				required_libs?: string[];
				open_in_browser?: boolean;
				streaming?: boolean;
			};
			return await handleRenderUi(
				html_body,
				required_libs,
				open_in_browser,
				streaming,
			);
		}

		if (name === "mount_file") {
			const { absolute_path } = args as { absolute_path: string };
			return handleMountFile(absolute_path);
		}

		if (name === "render_chart") {
			const { data, type, options, open_in_browser } = args as {
				data: Record<string, unknown>;
				type: string;
				options?: Record<string, unknown>;
				open_in_browser?: boolean;
			};
			return await handleRenderChart(data, type, options, open_in_browser);
		}

		if (name === "render_table") {
			const { data, columns, open_in_browser } = args as {
				data: Record<string, unknown>[];
				columns?: string[];
				open_in_browser?: boolean;
			};
			return await handleRenderTable(data, columns, open_in_browser);
		}

		if (name === "render_form") {
			const { fields, onSubmit, open_in_browser } = args as {
				fields: Record<string, unknown>[];
				onSubmit?: string;
				open_in_browser?: boolean;
			};
			return await handleRenderForm(fields, onSubmit, open_in_browser);
		}

		if (name === "render_svg") {
			const { svg_code, title, open_in_browser } = args as {
				svg_code: string;
				title?: string;
				open_in_browser?: boolean;
			};
			return await handleRenderSvg(svg_code, title, open_in_browser);
		}

		if (name === "render_mermaid") {
			const { diagram_code, diagram_type, open_in_browser } = args as {
				diagram_code: string;
				diagram_type?: string;
				open_in_browser?: boolean;
			};
			return await handleRenderMermaid(
				diagram_code,
				diagram_type,
				open_in_browser,
			);
		}

		if (name === "render_dashboard") {
			const { widgets, open_in_browser } = args as {
				widgets: Array<{
					type: string;
					data: Record<string, unknown>;
					options?: Record<string, unknown>;
				}>;
				open_in_browser?: boolean;
			};
			return await handleRenderDashboard(widgets, open_in_browser);
		}

		if (name === "export_ui") {
			const { filename, path } = args as {
				filename: string;
				path?: string;
			};
			return handleExportUi(filename, path);
		}

		throw new Error(`Tool not found: ${name}`);
	} catch (error) {
		return {
			content: [
				{
					type: "text",
					text: `Error: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
});

async function main() {
	await quickfillServer.start();

	const transport = new StdioServerTransport();
	await server.connect(transport);
	process.stderr.write("Quickfill MCP server v2.0.0 running on stdio\n");

	process.stdin.on("close", () => {
		process.stderr.write(
			"MCP client disconnected (stdin closed). Exiting process.\n",
		);
		process.exit(0);
	});
}

main().catch((error) => {
	process.stderr.write(`Fatal error in main(): ${error}\n`);
	process.exit(1);
});
