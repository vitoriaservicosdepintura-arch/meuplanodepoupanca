"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { computeSummary } from "@/lib/compute";
import type { AppState, Settings, Transaction, Week } from "@/lib/types";

const CACHE_KEY = "mpp_state_cache_v1";
const QUEUE_KEY = "mpp_pending_week_updates_v1";

type WeekPatch = Partial<
  Pick<Week, "received" | "food" | "realSaved" | "confirmed" | "notes" | "savedNovoBanco" | "savedWise" | "savedBrl" | "workedSaturday">
>;

type Ctx = {
  state: AppState;
  online: boolean;
  pending: number;
  saving: boolean;
  error: string | null;
  updateWeek: (weekNumber: number, patch: WeekPatch) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  addTransaction: (input: Omit<Transaction, "id">) => Promise<boolean>;
  updateTransaction: (input: Transaction) => Promise<boolean>;
  removeTransaction: (id: number) => Promise<void>;
  importBackup: (payload: unknown) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const StateContext = createContext<Ctx | null>(null);

function readQueue(): Record<number, WeekPatch> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeQueue(queue: Record<number, WeekPatch>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function StateProvider({
  initialState,
  children,
}: {
  initialState: AppState;
  children: ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<AppState>(initialState);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flushing = useRef(false);

  // Hydrate from the offline cache when the network is unavailable.
  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      if (cached && !navigator.onLine) setState(JSON.parse(cached) as AppState);
    } catch {
      /* ignore */
    }
    setOnline(navigator.onLine);
    setPending(Object.keys(readQueue()).length);

    // Register Service Worker for PWA & Notifications
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW Registered:", reg.scope))
        .catch((err) => console.error("SW Registration failed:", err));

      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const applyState = useCallback((next: AppState) => {
    setState(next);
  }, []);

  const request = useCallback(
    async (input: RequestInfo, init?: RequestInit): Promise<AppState | null> => {
      const response = await fetch(input, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      });
      if (response.status === 401) {
        router.replace("/?expirada=1");
        return null;
      }
      const data = (await response.json().catch(() => null)) as
        | (AppState & { error?: string })
        | null;
      if (!response.ok) {
        setError(data?.error ?? "Não foi possível salvar.");
        return null;
      }
      setError(null);
      return data as AppState;
    },
    [router],
  );

  const flushQueue = useCallback(async () => {
    if (flushing.current) return;
    const queue = readQueue();
    const entries = Object.entries(queue);
    if (entries.length === 0) return;
    flushing.current = true;
    try {
      for (const [weekNumber, patch] of entries) {
        const next = await request("/api/weeks", {
          method: "PATCH",
          body: JSON.stringify({ weekNumber: Number(weekNumber), ...patch }),
        });
        if (!next) return;
        delete queue[Number(weekNumber)];
        writeQueue(queue);
        applyState(next);
      }
      setPending(Object.keys(readQueue()).length);
    } finally {
      flushing.current = false;
    }
  }, [applyState, request]);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      void flushQueue();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    if (navigator.onLine) void flushQueue();
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [flushQueue]);

  const refresh = useCallback(async () => {
    const next = await request("/api/state", { method: "GET" });
    if (next) applyState(next);
  }, [applyState, request]);

  const updateWeek = useCallback(
    async (weekNumber: number, patch: WeekPatch) => {
      // Optimistic local update so the UI never waits on the network.
      setState((current) => {
        const weeks = current.weeks.map((week) =>
          week.weekNumber === weekNumber ? { ...week, ...patch } : week,
        );
        return {
          ...current,
          weeks,
          summary: computeSummary(current.settings, weeks, current.transactions),
        };
      });

      if (!navigator.onLine) {
        const queue = readQueue();
        queue[weekNumber] = { ...(queue[weekNumber] ?? {}), ...patch };
        writeQueue(queue);
        setPending(Object.keys(queue).length);
        return;
      }

      setSaving(true);
      const next = await request("/api/weeks", {
        method: "PATCH",
        body: JSON.stringify({ weekNumber, ...patch }),
      });
      setSaving(false);
      if (next) applyState(next);
      else {
        const queue = readQueue();
        queue[weekNumber] = { ...(queue[weekNumber] ?? {}), ...patch };
        writeQueue(queue);
        setPending(Object.keys(queue).length);
      }
    },
    [applyState, request],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      setSaving(true);
      const next = await request("/api/settings", {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setSaving(false);
      if (next) applyState(next);
    },
    [applyState, request],
  );

  const addTransaction = useCallback(
    async (input: Omit<Transaction, "id">) => {
      setSaving(true);
      const next = await request("/api/transactions", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setSaving(false);
      if (next) applyState(next);
      return Boolean(next);
    },
    [applyState, request],
  );

  const removeTransaction = useCallback(
    async (id: number) => {
      setSaving(true);
      const next = await request(`/api/transactions?id=${id}`, { method: "DELETE" });
      setSaving(false);
      if (next) applyState(next);
    },
    [applyState, request],
  );

  const updateTransaction = useCallback(
    async (input: Transaction) => {
      setSaving(true);
      const next = await request("/api/transactions", {
        method: "PUT",
        body: JSON.stringify(input),
      });
      setSaving(false);
      if (next) applyState(next);
      return Boolean(next);
    },
    [applyState, request],
  );

  const importBackup = useCallback(
    async (payload: unknown) => {
      setSaving(true);
      const next = await request("/api/backup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSaving(false);
      if (next) applyState(next);
      return Boolean(next);
    },
    [applyState, request],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      online,
      pending,
      saving,
      error,
      updateWeek,
      updateSettings,
      addTransaction,
      updateTransaction,
      removeTransaction,
      importBackup,
      refresh,
    }),
    [
      state,
      online,
      pending,
      saving,
      error,
      updateWeek,
      updateSettings,
      addTransaction,
      removeTransaction,
      importBackup,
      refresh,
    ],
  );

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export function useAppState(): Ctx {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAppState deve ser usado dentro de StateProvider");
  return ctx;
}
