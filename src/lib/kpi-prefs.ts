import { useSyncExternalStore } from "react";

export const MIN_KPIS = 4;
export const MAX_KPIS = 5;
export const DEFAULT_KPI_IDS = [
  "total-gp",
  "gp-dollars",
  "aro",
  "elr",
  "proficiency",
];

const STORAGE_KEY = "andys.kpiPrefs";

function load(): string[] {
  if (typeof localStorage === "undefined") return [...DEFAULT_KPI_IDS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_KPI_IDS];
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((x) => typeof x === "string") &&
      parsed.length >= MIN_KPIS &&
      parsed.length <= MAX_KPIS
    ) {
      return parsed;
    }
  } catch {
    // fall through to defaults
  }
  return [...DEFAULT_KPI_IDS];
}

function persist(ids: string[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore quota/availability errors
  }
}

let selected: string[] = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getSelectedKpiIds(): string[] {
  return selected;
}

export function subscribeKpiPrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleKpi(id: string) {
  if (selected.includes(id)) {
    if (selected.length <= MIN_KPIS) return; // enforce floor
    selected = selected.filter((x) => x !== id);
  } else {
    if (selected.length >= MAX_KPIS) return; // enforce ceiling
    selected = [...selected, id];
  }
  persist(selected);
  emit();
}

export function resetKpis() {
  selected = [...DEFAULT_KPI_IDS];
  persist(selected);
  emit();
}

// Test-only: restore in-memory + storage to defaults.
export function _resetForTest() {
  selected = [...DEFAULT_KPI_IDS];
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export function useKpiPrefs(): {
  selectedIds: string[];
  toggle: (id: string) => void;
  reset: () => void;
} {
  const selectedIds = useSyncExternalStore(
    subscribeKpiPrefs,
    getSelectedKpiIds,
    getSelectedKpiIds,
  );
  return { selectedIds, toggle: toggleKpi, reset: resetKpis };
}
