// dev only: `tsc --watch` copies no CSS, and the app reads @gen3/chat/styles.css from dist.
// run under `node --watch-path=src/styles.css`, so every save copies it again
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync(new URL("../dist/", import.meta.url), { recursive: true });
copyFileSync(
  new URL("../src/styles.css", import.meta.url),
  new URL("../dist/styles.css", import.meta.url),
);
