import type { ToolRenderer } from "./types";
import { ManifestToolResult } from "./manifest/ManifestToolResult";
import { SurvivalToolResult } from "./survival/SurvivalToolResult";

/** Tools whose result gets its own card under the tool call, keyed by tool name. */
export const toolRenderers: Record<string, ToolRenderer | undefined> = {
  get_file_manifest: ManifestToolResult,
  get_survival_data: SurvivalToolResult,
};
