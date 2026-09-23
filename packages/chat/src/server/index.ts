import type { NextApiRequest, NextApiResponse } from "next";
import { CopilotRuntime } from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";
import { HttpAgent } from "@ag-ui/client";
import { QAG_VERSION } from "../qagVersion";

export interface ChatHandlerOptions {
  verifyToken: (cookie?: string) => Promise<string | null>;
  /** the public path, not /api/*. the rewrite does not change req.url */
  endpoint: string;
}

/** where QAG listens, e.g. <commons>/qag/v3/agui/ */
const getChatAgentUrl = (): string => {
  const base = process.env.GEN3_QAG_BASE_URL;
  if (!base) throw new Error("GEN3_QAG_BASE_URL is not configured");
  return `${base.replace(/\/+$/, "")}/${QAG_VERSION}/agui/`;
};

let runtime: CopilotRuntime | null = null;

// registry of named agents. "default" is the name useChat asks for
const getCopilotRuntime = (): CopilotRuntime => {
  if (runtime) return runtime;
  const agentUrl = getChatAgentUrl();

  runtime = new CopilotRuntime({
    // this needs to be a function as we need token per caller
    agents: ({ request }) => {
      const authorization = request.headers.get("authorization");
      return {
        default: new HttpAgent({
          url: agentUrl,
          headers: {
            ...(authorization ? { Authorization: authorization } : {}),
            // undici would advertise gzip, and a compressing QAG batches the answer
            "Accept-Encoding": "identity",
          },
        }),
      };
    },
  });

  return runtime;
};

export const createChatHandler = ({ verifyToken, endpoint }: ChatHandlerOptions) => {
  let endpointHandler: ReturnType<typeof createCopilotNodeListener> | null = null;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // keeps Next from gzipping the stream - gzip batches it into one blob
      req.headers["accept-encoding"] = "identity";
      // nginx buffers the portal route, only /qag has buffering off
      res.setHeader("X-Accel-Buffering", "no");

      endpointHandler ??= createCopilotNodeListener({
        runtime: getCopilotRuntime(),
        basePath: endpoint,
        // client posts {method, params, body}, v2 defaults to multi-route and 404s it
        mode: "single-route",
        hooks: {
          onBeforeHandler: async (ctx) => {
            // info only lists agent names, and 401ing it makes useAgent throw in render
            if (ctx.route.method === "info") return;

            const token = await verifyToken(ctx.request.headers.get("cookie") ?? undefined);
            if (!token) {
              throw new Response(JSON.stringify({ error: "Authentication required." }), {
                status: 401,
                headers: { "content-type": "application/json" },
              });
            }

            // headers are immutable, so clone. the agents factory reads this back
            const headers = new Headers(ctx.request.headers);
            headers.set("authorization", `Bearer ${token}`);
            return new Request(ctx.request, { headers });
          },
        },
      });

      await endpointHandler(req, res);
    } catch (error) {
      console.error("[chat-server] handler threw:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Chat runtime error." });
        return;
      }
      res.end();
    }
  };
};
