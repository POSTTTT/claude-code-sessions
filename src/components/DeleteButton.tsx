"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTarget } from "@/app/actions";

export function DeleteButton({
  target,
  label,
  confirm,
}: {
  target: string;
  label: string;
  confirm: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(confirm)) return;
        start(async () => {
          await deleteTarget(target);
          router.refresh();
        });
      }}
      className="shrink-0 rounded-md border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}
