import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

type TextContent = { type: "text"; text: string };

/**
 * Create a standard JSON response for an MCP tool.
 * An optional human-readable note is appended as a second content item
 * to give the AI model additional context (e.g. explaining empty results).
 */
export function toolResponse(data: unknown, note?: string): CallToolResult {
  const content: TextContent[] = [
    { type: "text", text: JSON.stringify(data) },
  ];
  if (note) {
    content.push({ type: "text", text: note });
  }
  return { content };
}

/**
 * Wraps an MCP tool handler with error handling.
 * On failure, returns `{ isError: true }` with a structured JSON error
 * instead of crashing the server process.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleToolError<F extends (...args: any[]) => Promise<any>>(
  toolName: string,
  fn: F,
): F {
  const wrapped = async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text" as const, text: JSON.stringify({ error: message, tool: toolName }) }],
      } satisfies CallToolResult;
    }
  };
  return wrapped as unknown as F;
}
