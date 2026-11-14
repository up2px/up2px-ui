"use client";

import React, { useEffect } from "react";
import {
  NotificationIsland,
  notify,
} from "@/registry/components/notification-island";

const INITIAL_NOTIFICATIONS = [
  {
    id: "seed-1",
    title: "Production deploy succeeded",
    description: "up2px-ui v0.4.2 is live on Cloudflare Pages edge.",
    type: "success" as const,
    timestamp: "4m ago",
    read: false,
  },
  {
    id: "seed-2",
    title: "Sarah mentioned you in #design-system",
    description: "Can we align the pill radius with the new sidebar cards?",
    type: "info" as const,
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    timestamp: "18m ago",
    read: false,
  },
  {
    id: "seed-3",
    title: "Invoice #1042 paid",
    description: "$49.00 received from Acme Studio.",
    type: "default" as const,
    timestamp: "2h ago",
    read: true,
  },
];

export default function NotificationIslandDemo() {
  useEffect(() => {
    notify.seed(INITIAL_NOTIFICATIONS);
  }, []);

  function sendBurstAlerts() {
    notify.info("Alex commented on Pull Request #84", {
      description: "Looks clean — ready to merge once CI passes.",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
    });
    setTimeout(() => {
      notify.warning("API rate limit at 85%", {
        description: "Consider enabling edge caching on /r/*.json.",
      });
    }, 160);
    setTimeout(() => {
      notify.success("Build exported in 1.4s", {
        description: "All 12 static component pages generated.",
        action: {
          label: "Inspect",
          onClick: () => notify.info("Opened build inspector"),
        },
      });
    }, 320);
  }

  return (
    <div className="flex w-full flex-col items-center gap-20 py-6">
      {/* Simulated SaaS Dashboard Header Bar */}
      <div className="relative flex w-full max-w-2xl items-center justify-between rounded-3xl border border-accent/25 bg-background/25 bg-[linear-gradient(155deg,color-mix(in_srgb,var(--accent)_9%,transparent),transparent_48%)] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-1 inset-shadow-[0_0_14px_rgba(255,59,0,0.07)] ring-white/35 backdrop-blur-2xl backdrop-saturate-150 dark:bg-background/30 dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)] dark:ring-white/12">
        <div className="flex items-center gap-2.5">
          <span className="size-2.5 rounded-full bg-accent" />
          <span className="text-xs font-semibold text-foreground">
            Acme Workspace
          </span>
          <span className="rounded bg-surface-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            PRO
          </span>
        </div>

        <div className="relative z-20 flex items-center gap-3">
          <NotificationIsland align="right" />
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"
            alt="Workspace Member"
            className="size-8 rounded-full border border-border object-cover"
          />
        </div>
      </div>

      {/* Interactive Demo Controls */}
      <div className="flex max-w-xl flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() =>
            notify.success("Changes synced", {
              description: "Workspace preferences saved to cloud.",
            })
          }
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-secondary"
        >
          Trigger Success Alert
        </button>

        <button
          type="button"
          onClick={sendBurstAlerts}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          Burst 3 Alerts (Split Arrow)
        </button>

        <button
          type="button"
          onClick={() =>
            notify.error("Webhook delivery failed", {
              description: "Endpoint returned HTTP 502 after 3 retries.",
              action: {
                label: "Retry",
                onClick: () => notify.success("Webhook delivered"),
              },
            })
          }
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-surface-secondary"
        >
          Trigger Error + Action
        </button>

        <button
          type="button"
          onClick={() => notify.seed(INITIAL_NOTIFICATIONS)}
          className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset History
        </button>
      </div>
    </div>
  );
}
