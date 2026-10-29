"use client";

import { useEffect, useState } from "react";
import { loadDownload, type LoadedDownload } from "./loadDownload";

/** One download, loaded once per url. null while it loads, or when there's no url. */
export function useDownload(url: string | null): LoadedDownload | null {
  const [loaded, setLoaded] = useState<{ url: string; result: LoadedDownload } | null>(null);

  useEffect(() => {
    if (!url) return;
    let alive = true;
    void loadDownload(url).then((result) => {
      if (alive) setLoaded({ url, result });
    });
    return () => {
      alive = false;
    };
  }, [url]);

  // keyed by url, so a new url never shows the last one's file
  return url && loaded?.url === url ? loaded.result : null;
}
