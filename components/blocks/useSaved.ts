"use client";

import { useCallback, useSyncExternalStore } from "react";

/*
 * Bookmarked blocks, kept in this browser.
 *
 * One store for the whole page — the shelf's cards and the block page's
 * bookmark button read the same list — and it listens for the storage event,
 * so saving in one tab shows in another. Storage can be unavailable (a private
 * window, blocked site data); then bookmarks simply last as long as the page.
 */

const KEY = "blocx:saved";
const EVENT = "blocx:saved-change";
let memory: string[] = [];
let cache: string | null = null;
let parsed: string[] = [];

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return memory;
  }
  if (raw === cache) return parsed;
  cache = raw;
  try {
    const value = raw ? JSON.parse(raw) : [];
    parsed = Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    parsed = [];
  }
  return parsed;
}

function write(next: string[]) {
  memory = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: the in-memory copy carries the page */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, onChange);
  };
}

const EMPTY: string[] = [];

export function useSaved() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((slug: string) => {
    const now = read();
    write(now.includes(slug) ? now.filter((s) => s !== slug) : [...now, slug]);
  }, []);
  return { saved, isSaved: (slug: string) => saved.includes(slug), toggle };
}
