"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import ThemeHint from "../ThemeHint";
import { usePinTheme } from "@/lib/theme";
import { softSpring } from "@/lib/motion";
import { BLOCX_STAR } from "./icons";

/**
 * The Blocx lockup: the badge and the wordmark.
 *
 * As on the rest of Pin UI, the mark is the theme switch — the whole badge
 * turns over, tile and star together, on the same spring and in the same depth
 * as Pin UI's own pin, and the page changes face — and a pencilled "switch theme" beside it
 * says so — drawn still, a label rather than a moving part. Only the badge is the button; the wordmark is a link home to the
 * shelf. The badge is the leaf shape Pin UI uses: two corners rounded, two
 * square.
 */
export default function BlocxMark({
  size = "md",
  switchTheme = true,
  hint = true,
  className = "",
}: {
  size?: "md" | "lg";
  /** Make the badge the theme switch. The footer's lockup is a plain signature. */
  switchTheme?: boolean;
  hint?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { theme, turns, toggleTheme } = usePinTheme();

  const badge = (
    <motion.span
      className="blx-mark__face"
      animate={{ rotateY: reduced ? 0 : turns * 360 }}
      transition={softSpring}
    >
      <svg viewBox="0 0 14.4 14.4" className="blx-mark__star" aria-hidden="true">
        <path d={BLOCX_STAR} fill="currentColor" />
      </svg>
    </motion.span>
  );

  return (
    <span className={`blx-mark blx-mark--${size} ${className}`}>
      {switchTheme ? (
        <motion.button
          type="button"
          className="blx-mark__badge"
          onClick={toggleTheme}
          whileHover={reduced ? undefined : { scale: 1.08 }}
          whileTap={reduced ? undefined : { scale: 0.92 }}
          transition={softSpring}
          title="Switch theme"
        >
          <span className="blx-sr">Switch to the {theme === "light" ? "dark" : "light"} theme</span>
          {badge}
        </motion.button>
      ) : (
        <span className="blx-mark__badge" aria-hidden="true">
          {badge}
        </span>
      )}
      <Link className="blx-mark__word" href="/blocx">
        Blocx
      </Link>
      {switchTheme && hint && <ThemeHint still mark=".blx-mark__badge" word=".blx-mark__word" />}
    </span>
  );
}
