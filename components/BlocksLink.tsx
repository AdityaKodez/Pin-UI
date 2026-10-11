"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

/** The event the gate in the root layout listens for. */
export const BLOCX_ENTER = "pinui:enter-blocx";

/** Ask the gate to play the way in to Blocx and take the visitor there. */
export function enterBlocx() {
  window.dispatchEvent(new Event(BLOCX_ENTER));
}

/**
 * A link to Blocx that goes in through the gate rather than straight there.
 *
 * It is a real link to /blocx, so it works without script, opens in a new
 * tab on ⌘/Ctrl-click or a middle click, and reads as a link to assistive
 * tech; only a plain click is handed to the gate, which plays the entrance and
 * then navigates.
 */
export default function BlocksLink({
  className,
  children = "Blocx",
  onNavigate,
}: {
  className?: string;
  children?: ReactNode;
  /** Run before the gate opens — a menu closing itself, say. */
  onNavigate?: () => void;
}) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate?.();
    enterBlocx();
  };

  return (
    <Link className={className} href="/blocx" onClick={onClick}>
      {children}
    </Link>
  );
}
