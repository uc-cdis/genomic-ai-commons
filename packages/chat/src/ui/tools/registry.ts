import type { ToolRenderer } from "./types";
import { FilterToolResult } from "./filter/FilterToolResult";
import { ManifestToolResult } from "./manifest/ManifestToolResult";
import { SurvivalToolResult } from "./survival/SurvivalToolResult";

/** Tools whose result gets its own card under the tool call, keyed by tool name. */
export const toolRenderers: Record<string, ToolRenderer | undefined> = {
  create_filter: FilterToolResult,
  get_file_manifest: ManifestToolResult,
  get_survival_data: SurvivalToolResult,
};

export const hasToolCard = (name: string): boolean => toolRenderers[name] !== undefined;
