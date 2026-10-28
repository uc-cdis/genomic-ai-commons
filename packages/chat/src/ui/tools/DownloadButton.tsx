"use client";

import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

/** One of the agent's /download links as a small button; `download` saves it in place. */
export function DownloadButton({ href, label }: { href: string; label: string }) {
  return (
    <Button
      component="a"
      href={href}
      download
      variant="subtle"
      color="var(--chat-action)"
      size="compact-xs"
      leftSection={<IconDownload size={14} />}
    >
      {label}
    </Button>
  );
}
