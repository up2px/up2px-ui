"use client";

import React from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "./use-notifications";

export function NotificationStatusIcon({ item }: { item: NotificationItem }) {
  if (item.avatarUrl) {
    return (
      <img
        src={item.avatarUrl}
        alt=""
        className="size-5 shrink-0 rounded-full object-cover ring-1 ring-border"
      />
    );
  }

  if (item.icon) {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center">
        {item.icon}
      </span>
    );
  }

  switch (item.type) {
    case "success":
      return <CheckCircle2 className="size-4 shrink-0 text-success" />;
    case "error":
      return <AlertCircle className="size-4 shrink-0 text-destructive" />;
    case "warning":
      return <AlertTriangle className="size-4 shrink-0 text-warning" />;
    case "info":
      return <Info className="size-4 shrink-0 text-info" />;
    default:
      return (
        <span className="size-2 shrink-0 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
      );
  }
}

interface NotificationCardProps {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
}

export function NotificationCard({
  item,
  onMarkRead,
  onRemove,
}: NotificationCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, height: 0 }}
      transition={{ duration: 0.16 }}
      onClick={() => {
        if (!item.read) onMarkRead(item.id);
      }}
      className={cn(
        "group relative flex cursor-pointer items-start gap-2.5 rounded-2xl border p-2.5 text-left transition-colors",
        !item.read
          ? "border-accent/35 bg-card shadow-xs hover:bg-surface-secondary"
          : "border-border/80 bg-surface hover:bg-surface-secondary",
      )}
    >
      <div className="mt-0.5 shrink-0">
        <NotificationStatusIcon item={item} />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs leading-snug font-medium text-foreground">
            {item.title}
          </p>
          {item.timestamp && (
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {item.timestamp}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}

        {item.action && (
          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                item.action?.onClick();
                onMarkRead(item.id);
              }}
              className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
            >
              {item.action.label}
            </button>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!item.read && (
          <span
            aria-label="Unread"
            className="size-1.5 rounded-full bg-accent"
          />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          aria-label="Remove notification"
          className="rounded-full p-1 text-muted-foreground opacity-60 transition-colors hover:bg-surface-tertiary hover:text-foreground hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
