"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Bell, CheckCheck, ChevronRight, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationCard, NotificationStatusIcon } from "./notification-card";
import {
  notify,
  useNotifications,
  type NotificationAction,
  type NotificationItem,
  type NotificationType,
  type NotifyOptions,
} from "./use-notifications";

export {
  notify,
  useNotifications,
  type NotificationAction,
  type NotificationItem,
  type NotificationType,
  type NotifyOptions,
};

export interface NotificationIslandProps {
  /** Alignment anchor inside a header bar ("center" expands symmetrically, "right" expands leftward). */
  align?: "center" | "left" | "right";
  /** Default live popup preview duration in milliseconds before collapsing back to the bell. */
  popupDuration?: number;
  /** Optional custom bell icon element. */
  bellIcon?: React.ReactNode;
  className?: string;
}

export function NotificationIsland({
  align = "center",
  popupDuration = 4000,
  bellIcon,
  className,
}: NotificationIslandProps) {
  const [isPopupHovered, setIsPopupHovered] = useState(false);
  const [isArrowHovered, setIsArrowHovered] = useState(false);
  const [isClickedOpen, setIsClickedOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isExpandedRequest = isPopupHovered || isClickedOpen;

  const {
    notifications,
    unreadCount,
    popupItems,
    activePopup,
    activeIndex,
    direction,
    activeProgress,
    nextPopup,
  } = useNotifications(isExpandedRequest || isArrowHovered, popupDuration);

  const hasActivePopup = popupItems.length > 0 && activePopup !== null;
  const isOpen = isClickedOpen;
  const hasMultiplePopups = popupItems.length > 1;
  const isCompactPopup = hasActivePopup && !isOpen;

  // Close drawer when clicking outside
  useEffect(() => {
    function handleOutsidePointerDown(event: PointerEvent) {
      if (
        isClickedOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsClickedOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [isClickedOpen]);

  function handleMouseEnter() {
    if (!hasActivePopup) return;
    setIsPopupHovered(true);
  }

  function handleMouseLeave() {
    setIsPopupHovered(false);
  }

  const wrapperAlignClass = {
    center: "justify-center",
    left: "justify-start",
    right: "justify-end",
  }[align];

  const dropdownAlignClass = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-0",
    right: "right-0",
  }[align];

  return (
    <MotionConfig
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 32,
        mass: 0.85,
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative flex items-center",
          wrapperAlignClass,
          className,
        )}
      >
        <div className="relative flex items-center">
          {/* Main Fixed-Height Bell / Compact Popup Pill (never expands navbar height) */}
          <motion.div
            initial={false}
            animate={{
              width: isCompactPopup ? 280 : 40,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              setIsClickedOpen((prev) => !prev);
            }}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-label={
              unreadCount > 0
                ? `Notifications (${unreadCount} unread)`
                : "Notifications"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsClickedOpen((prev) => !prev);
              } else if (e.key === "Escape" && isOpen) {
                setIsClickedOpen(false);
                setIsPopupHovered(false);
              }
            }}
            className={cn(
              "relative flex h-10 max-w-[92vw] cursor-pointer items-center overflow-hidden rounded-full border border-accent/40 inset-shadow-sm shadow-accent backdrop-blur-3xl transition-colors select-none",
              !isCompactPopup && "bg-surface/40 hover:border-accent/70",
              isCompactPopup && "bg-surface/70",
              isOpen && "border-accent/75 bg-surface/65",
            )}
          >
            {/* Idle Bell Icon (stays visible when menu is open, hides only during compact live toast) */}
            <motion.div
              aria-hidden={isCompactPopup}
              initial={false}
              animate={{
                opacity: isCompactPopup ? 0 : 1,
                scale: isCompactPopup ? 0.55 : 1,
                filter: isCompactPopup ? "blur(4px)" : "blur(0px)",
              }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="pointer-events-none absolute top-1/2 left-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-foreground"
            >
              {bellIcon ?? <Bell className="size-4" />}
            </motion.div>

            <AnimatePresence mode="wait" initial={false}>
              {/* COMPACT LIVE POPUP STATE */}
              {isCompactPopup && activePopup && (
                <motion.div
                  key="compact-popup"
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.18, delay: 0.04 }}
                  className="relative flex h-10 w-full items-center overflow-hidden px-3.5"
                >
                  <AnimatePresence
                    mode="popLayout"
                    custom={direction}
                    initial={false}
                  >
                    <motion.div
                      key={activePopup.id}
                      custom={direction}
                      initial={{
                        opacity: 0,
                        x: direction * 22,
                        filter: "blur(3px)",
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        x: direction * -22,
                        filter: "blur(3px)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 440,
                        damping: 32,
                      }}
                      className="flex w-full min-w-0 items-center gap-2.5"
                    >
                      <NotificationStatusIcon item={activePopup} />
                      <span className="truncate text-xs font-medium text-foreground">
                        {activePopup.title}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Subtle bottom countdown progress bar */}
                  {(activePopup.duration ?? popupDuration) !== Infinity && (
                    <span
                      aria-hidden
                      style={{ transform: `scaleX(${activeProgress})` }}
                      className="pointer-events-none absolute right-3 bottom-0 left-3 h-[1.5px] origin-left rounded-full bg-accent/65 transition-transform duration-75"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Idle Bell Unread Badge */}
          <AnimatePresence>
            {!isCompactPopup && unreadCount > 0 && (
              <motion.span
                key="bell-unread-badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="pointer-events-none absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-bold text-white shadow-sm"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>

          {/* OnePlus-style Detached Rounded Arrow Switcher Pill (anchored on the right in the bell's spot; island slides out left) */}
          <AnimatePresence initial={false}>
            {isCompactPopup && hasMultiplePopups && (
              <motion.button
                key="island-next-arrow"
                type="button"
                onMouseEnter={() => setIsArrowHovered(true)}
                onMouseLeave={() => setIsArrowHovered(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  nextPopup();
                }}
                aria-label={`Next notification (${activeIndex + 1} of ${popupItems.length})`}
                title={`Switch notification (${activeIndex + 1}/${popupItems.length})`}
                initial={{
                  opacity: 0,
                  scale: 0.4,
                  width: 0,
                  marginLeft: 0,
                }}
                animate={{ opacity: 1, scale: 1, width: 40, marginLeft: 8 }}
                exit={{
                  opacity: 0,
                  scale: 0.4,
                  width: 0,
                  marginLeft: 0,
                }}
                whileTap={{ scale: 0.9 }}
                className="group relative z-20 flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-accent/40 bg-surface/65 inset-shadow-sm shadow-accent backdrop-blur-3xl transition-colors hover:border-accent/70 hover:bg-surface/85"
              >
                <ChevronRight className="size-4 text-foreground transition-transform group-hover:translate-x-0.5" />
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-accent font-mono text-[9px] font-bold text-white shadow-sm">
                  {popupItems.length}
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Floating Glassy Notification Center Popover Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="notification-center"
                initial={{
                  opacity: 0,
                  y: -8,
                  scale: 0.96,
                  filter: "blur(4px)",
                }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(4px)" }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                  mass: 0.85,
                }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "absolute top-[calc(100%+10px)] z-50 flex w-[min(92vw,372px)] flex-col gap-2.5 rounded-3xl border border-accent/25 bg-background/72 bg-[linear-gradient(color-mix(in_srgb,var(--accent)_9%,transparent),color-mix(in_srgb,var(--accent)_9%,transparent))] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.16)] ring-1 inset-shadow-[0_0_20px_rgba(255,59,0,0.08)] ring-white/40 backdrop-blur-[80px] backdrop-saturate-150 dark:bg-background/75 dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] dark:ring-white/12",
                  dropdownAlignClass,
                )}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-1 pb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {bellIcon ?? <Bell className="size-3.5" />}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => notify.markAllRead()}
                        title="Mark all as read"
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface/80 hover:text-foreground"
                      >
                        <CheckCheck className="size-3" />
                        <span>Mark read</span>
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => notify.clear()}
                        title="Clear all notifications"
                        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface/80 hover:text-foreground"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                    {isClickedOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsClickedOpen(false);
                          setIsPopupHovered(false);
                        }}
                        aria-label="Close notifications"
                        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface/80 hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Solid Notification List */}
                <div className="thin-scrollbar flex max-h-[320px] flex-col gap-1.5 overflow-y-auto pr-0.5">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-card/95 py-8 text-center">
                      <Bell className="size-5 text-muted-foreground/60" />
                      <p className="text-xs font-medium text-muted-foreground">
                        All caught up
                      </p>
                      <p className="text-[11px] text-muted-foreground/70">
                        New notifications will appear here.
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {notifications.map((item) => (
                        <NotificationCard
                          key={item.id}
                          item={item}
                          onMarkRead={(id) => notify.markAsRead(id)}
                          onRemove={(id) => notify.remove(id)}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
