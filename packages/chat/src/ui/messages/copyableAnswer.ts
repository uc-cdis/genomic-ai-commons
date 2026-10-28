import { isAgentDownloadLink } from "../../core/downloadLinks";

// a markdown link's target: ](…)
const LINK_TARGET = /\]\(([^)\s]+)\)/g;

// the agent's download links are relative to the portal; made absolute, they work once pasted
export function copyableAnswer(markdown: string, origin: string): string {
  return markdown.replace(LINK_TARGET, (match, target: string) =>
    isAgentDownloadLink(target) ? `](${origin}${target})` : match,
  );
}
