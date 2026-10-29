"use client";

import type { ReactNode } from "react";
import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

export function DownloadButton({ href, label }: { href: string; label: ReactNode }) {
  return (
    <Button
      component="a"
      href={href}
      download
      className="chat-download"
      variant="outline"
      color="var(--chat-download)"
      size="compact-xs"
      leftSection={<IconDownload size={14} />}
    >
      {label}
    </Button>
  );
}
