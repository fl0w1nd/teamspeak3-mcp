import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** Create a standard text response for an MCP tool. */
export function toolResponse(text: string): CallToolResult {
  return { content: [{ type: "text", text }] };
}

/**
 * Wraps an MCP tool handler with error handling.
 * On failure, returns `{ isError: true }` with a descriptive message
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
        content: [{ type: "text" as const, text: `[${toolName}] Error: ${message}` }],
      } satisfies CallToolResult;
    }
  };
  return wrapped as unknown as F;
}
