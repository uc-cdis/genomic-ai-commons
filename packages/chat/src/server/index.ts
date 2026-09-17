import type { NextApiRequest, NextApiResponse } from "next";
import { copilotRuntimeNextJSPagesRouterEndpoint } from "@copilotkit/runtime";
import { getCopilotRuntime } from "./runtime";

export interface ChatHandlerOptions {
  /** Returns the caller's token, or null to 401. Keeps Fence/Gen3 knowledge in the app. */
  verifyToken: (cookie?: string) => Promise<string | null>;
  /** Must be the PUBLIC path - req.url keeps its pre-rewrite value. */
  endpoint?: string;
}

// CopilotKit probes for the agent list on every page load, which 401d logged-out
// visitors. Safe anonymously: `info` only enumerates the agents map.
const isRuntimeInfoProbe = (req: NextApiRequest) =>
  (req.body as { method?: unknown } | undefined)?.method === "info";

/**
 * Consumers must also `export const config = { api: { bodyParser: true } }` from the
 * route module. Next reads that statically and it cannot be re-exported from here.
 */
export const createChatHandler = ({
  verifyToken,
  endpoint = "/copilot-runtime",
}: ChatHandlerOptions) => {
  let endpointHandler: ReturnType<typeof copilotRuntimeNextJSPagesRouterEndpoint> | null = null;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      if (!isRuntimeInfoProbe(req)) {
        const token = await verifyToken(req.headers.cookie);
        if (!token) {
          res.status(401).json({ error: "Authentication required." });
          return;
        }

        req.headers.authorization = `Bearer ${token}`; // read back in runtime.ts
      }

      // SSE must reach the browser unbuffered and uncompressed, or the client gets one
      // blob at the end. These two guard Next's own gzip and an nginx-style reverse proxy.
      req.headers["accept-encoding"] = "identity";
      res.setHeader("X-Accel-Buffering", "no");

      // The runtime pipes a Readable into res without listening for its errors, so an
      // agent dying mid-answer hangs the socket. Destroy instead.
      res.once("pipe", (source: NodeJS.ReadableStream) => {
        source.on("error", (streamError: Error) => {
          console.error("[copilotkit] Agent stream failed mid-response:", streamError);
          if (!res.writableEnded) res.destroy();
        });
      });

      // Built lazily so missing config is a 500, not a server that won't boot.
      endpointHandler ??= copilotRuntimeNextJSPagesRouterEndpoint({
        runtime: getCopilotRuntime(),
        endpoint,
      });

      await endpointHandler(req, res);
    } catch (error) {
      console.error("[copilotkit] Handler threw:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Copilot runtime error." });
        return;
      }
      res.end();
    }
  };
};

export { getCopilotRuntime } from "./runtime";
export { getChatAgentUrl } from "./env";
