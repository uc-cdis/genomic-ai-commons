export type DownloadFailure = "expired" | "login" | "failed";
export type LoadedDownload = { ok: true; text: string } | { ok: false; reason: DownloadFailure };

/**
 * One of the agent's /download links, through the portal's route. The login cookie goes along on
 * its own: same site, so no token handling here.
 */
export async function loadDownload(
  url: string,
  fetchImpl: (url: string, init?: RequestInit) => Promise<Response> = fetch,
): Promise<LoadedDownload> {
  try {
    const res = await fetchImpl(url, { credentials: "same-origin" });
    // the agent's handles live 3h after their last use; then it answers 404
    if (res.status === 404) return { ok: false, reason: "expired" };
    if (res.status === 401) return { ok: false, reason: "login" };
    if (!res.ok) return { ok: false, reason: "failed" };
    return { ok: true, text: await res.text() };
  } catch (error) {
    console.error("[chat-ui:download]", error);
    return { ok: false, reason: "failed" };
  }
}
