"use client";

import { Menu, type MenuProps } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { ReactElement } from "react";

export interface ChatActionsMenuProps {
  /** the button that opens the menu */
  children: ReactElement;
  position: MenuProps["position"];
  deleteDisabled?: boolean;
  onRename: () => void;
  onDelete?: () => void;
}

export function ChatActionsMenu({
  children,
  position,
  deleteDisabled,
  onRename,
  onDelete,
}: ChatActionsMenuProps) {
  return (
    <Menu position={position} withinPortal>
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconPencil size={14} />} onClick={onRename}>
          Rename
        </Menu.Item>
        <Menu.Item
          color="var(--chat-error)"
          leftSection={<IconTrash size={14} />}
          disabled={deleteDisabled}
          onClick={onDelete}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
