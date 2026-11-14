"use client";

import type React from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type NotificationType =
  "default" | "success" | "info" | "warning" | "error";

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: NotificationType;
  timestamp?: string;
  read: boolean;
  avatarUrl?: string;
  icon?: React.ReactNode;
  duration?: number;
  action?: NotificationAction;
}

export type NotifyOptions = Omit<NotificationItem, "id" | "title" | "read"> & {
  id?: string;
  silent?: boolean;
};

interface NotificationStoreState {
  items: NotificationItem[];
  popupIds: string[];
}

let state: NotificationStoreState = {
  items: [],
  popupIds: [],
};

const listeners = new Set<() => void>();
let idCounter = 0;

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function createId() {
  idCounter += 1;
  return `notif-${Date.now()}-${idCounter}`;
}

function addNotification(
  title: React.ReactNode,
  options: NotifyOptions = {},
  overrideType?: NotificationType,
): string {
  const id = options.id ?? createId();
  const item: NotificationItem = {
    id,
    title,
    description: options.description,
    type: overrideType ?? options.type ?? "default",
    timestamp: options.timestamp ?? "Just now",
    read: false,
    avatarUrl: options.avatarUrl,
    icon: options.icon,
    duration: options.duration ?? 4000,
    action: options.action,
  };

  state = {
    items: [item, ...state.items.filter((i) => i.id !== id)],
    popupIds: options.silent
      ? state.popupIds
      : [...state.popupIds.filter((pid) => pid !== id), id],
  };
  emit();
  return id;
}

export const notify = Object.assign(
  (title: React.ReactNode, options?: NotifyOptions) =>
    addNotification(title, options),
  {
    success: (title: React.ReactNode, options?: NotifyOptions) =>
      addNotification(title, options, "success"),
    info: (title: React.ReactNode, options?: NotifyOptions) =>
      addNotification(title, options, "info"),
    warning: (title: React.ReactNode, options?: NotifyOptions) =>
      addNotification(title, options, "warning"),
    error: (title: React.ReactNode, options?: NotifyOptions) =>
      addNotification(title, options, "error"),
    seed: (items: NotificationItem[]) => {
      state = { items, popupIds: [] };
      emit();
    },
    dismissPopup: (id: string) => {
      if (!state.popupIds.includes(id)) return;
      state = {
        ...state,
        popupIds: state.popupIds.filter((pid) => pid !== id),
      };
      emit();
    },
    markAsRead: (id: string) => {
      state = {
        items: state.items.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
        popupIds: state.popupIds.filter((pid) => pid !== id),
      };
      emit();
    },
    markAllRead: () => {
      state = {
        items: state.items.map((item) => ({ ...item, read: true })),
        popupIds: [],
      };
      emit();
    },
    remove: (id: string) => {
      state = {
        items: state.items.filter((item) => item.id !== id),
        popupIds: state.popupIds.filter((pid) => pid !== id),
      };
      emit();
    },
    clear: () => {
      state = { items: [], popupIds: [] };
      emit();
    },
  },
);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

const DEFAULT_POPUP_DURATION = 4000;
const TICK_MS = 50;

export function useNotifications(
  isPaused: boolean,
  defaultDuration = DEFAULT_POPUP_DURATION,
) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [selectedPopupId, setSelectedPopupId] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [progressState, setProgressState] = useState<{
    id: string | null;
    value: number;
  }>({
    id: null,
    value: 1,
  });

  const timersRef = useRef<
    Map<string, { remaining: number; duration: number }>
  >(new Map());

  const popupItems = snapshot.popupIds
    .map((id) => snapshot.items.find((item) => item.id === id))
    .filter((item): item is NotificationItem => Boolean(item));

  const selectedIndex =
    selectedPopupId !== null
      ? popupItems.findIndex((item) => item.id === selectedPopupId)
      : -1;
  const activeIndex =
    popupItems.length === 0
      ? 0
      : selectedIndex !== -1
        ? selectedIndex
        : popupItems.length - 1;
  const activePopup = popupItems.length > 0 ? popupItems[activeIndex] : null;

  // Sync popup timer map via ref only
  useEffect(() => {
    const nextMap = new Map<string, { remaining: number; duration: number }>();
    for (const item of popupItems) {
      const existing = timersRef.current.get(item.id);
      const targetDuration = item.duration ?? defaultDuration;
      if (existing) {
        nextMap.set(item.id, existing);
      } else {
        nextMap.set(item.id, {
          remaining: targetDuration,
          duration: targetDuration,
        });
      }
    }
    timersRef.current = nextMap;
  }, [popupItems, defaultDuration]);

  // Countdown tick for the currently visible live popup
  useEffect(() => {
    if (!activePopup || isPaused) return;
    const duration = activePopup.duration ?? defaultDuration;
    if (duration === Infinity) return;

    let lastTick = performance.now();
    const activeId = activePopup.id;

    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTick;
      lastTick = now;

      const current = timersRef.current.get(activeId);
      if (!current || current.duration === Infinity) return;

      const nextRemaining = Math.max(0, current.remaining - delta);
      current.remaining = nextRemaining;
      setProgressState({
        id: activeId,
        value: current.duration > 0 ? nextRemaining / current.duration : 0,
      });

      if (nextRemaining <= 0) {
        clearInterval(interval);
        setDirection(1);
        if (popupItems.length > 1) {
          const nextIdx = (activeIndex + 1) % popupItems.length;
          const nextItem = popupItems[nextIdx];
          setSelectedPopupId(
            nextItem && nextItem.id !== activeId ? nextItem.id : null,
          );
        } else {
          setSelectedPopupId(null);
        }
        notify.dismissPopup(activeId);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [activePopup, activeIndex, popupItems, isPaused, defaultDuration]);

  const nextPopup = useCallback(() => {
    if (popupItems.length <= 1) return;
    setDirection(1);
    const nextIdx = (activeIndex + 1) % popupItems.length;
    setSelectedPopupId(popupItems[nextIdx].id);
  }, [popupItems, activeIndex]);

  const unreadCount = snapshot.items.filter((i) => !i.read).length;
  const activeProgress =
    !activePopup ||
    (activePopup.duration ?? defaultDuration) === Infinity ||
    progressState.id !== activePopup.id
      ? 1
      : progressState.value;

  return {
    notifications: snapshot.items,
    unreadCount,
    popupItems,
    activePopup,
    activeIndex,
    direction,
    activeProgress,
    nextPopup,
  };
}
