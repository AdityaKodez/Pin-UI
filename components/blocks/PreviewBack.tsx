"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { BLOCX_STAR } from "./icons";

/**
 * The way back from a block opened on its own.
 *
 * The same page is what the block page's frame shows in its iframe, so the
 * pill only appears when the page is the whole window — never inside the
 * frame, where it would sit on top of the block being previewed.
 */
export default function PreviewBack({ slug, name }: { slug: string; name: string }) {
  const [alone, setAlone] = useState(false);

  useEffect(() => {
    let framed = true;
    try {
      framed = window.self !== window.top;
    } catch {
      framed = true;
    }
    setAlone(!framed);
  }, []);

  if (!alone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.6 }}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 1000,
      }}
    >
      <Link
        href={`/blocx/${slug}`}
        aria-label={`Back to ${name} on Blocx`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 38,
          padding: "0 14px 0 8px",
          borderRadius: "10px 0 10px 0",
          background: "#0a0b0f",
          color: "#ffffff",
          boxShadow: "0 0 0 1px rgb(255 255 255 / 0.12), 0 10px 30px -12px rgb(0 0 0 / 0.5)",
          font: "500 13px/1 Inter, ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "-0.01em",
          textDecoration: "none",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "grid",
            placeItems: "center",
            width: 24,
            height: 24,
            borderRadius: "6px 0 6px 0",
            background: "#e60024",
            color: "#ffffff",
          }}
        >
          <svg viewBox="0 0 14.4 14.4" width="12" height="12">
            <path d={BLOCX_STAR} fill="currentColor" />
          </svg>
        </span>
        ← Back to Blocx
      </Link>
    </motion.div>
  );
}
