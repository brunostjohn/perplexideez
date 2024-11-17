import { Badge } from "$lib/components/ui/badge";
import { renderComponent } from "$lib/components/ui/data-table";
import { cn } from "$lib/utils";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { Actions } from ".";

export interface User {
  id: string;
  name?: string | null;
  email: string;
  role: "User" | "Admin";
  authType: "password" | "oauth";
  isMe: boolean;
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({
      row: {
        original: { role },
      },
    }) =>
      renderComponent(Badge, {
        class: cn(role === "Admin" ? "bg-violet-300" : "bg-blue-300"),
        children: createRawSnippet(() => ({
          render: () => role,
        })),
      }),
  },
  {
    accessorKey: "authType",
    header: "Authenticates With",
    cell: ({
      row: {
        original: { authType },
      },
    }) =>
      renderComponent(Badge, {
        class: cn(authType === "password" ? "bg-cyan-300" : "bg-green-300"),
        children: createRawSnippet(() => ({
          render: () => (authType === "password" ? "Password" : "SSO"),
        })),
      }),
  },
  {
    id: "actions",
    cell: ({
      row: {
        original: { id, isMe, role },
      },
    }) => {
      return renderComponent(Actions, { id, isMe, role });
    },
  },
];
