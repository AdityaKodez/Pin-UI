"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";
import { enterBlocx } from "../BlocksLink";
import { BLOCX_STAR } from "../blocks/icons";
import { BLOCKS } from "@/lib/blocks";
import { lenisRef } from "@/lib/lenis";
import "./blocx-intro.css";

/**
 * The announcement a visitor meets on the landing page: Blocx is new.
 *
 * It waits until the hero has arrived, then rises in the middle of the screen
 * over a soft scrim — the newest blocks fanned out on Blocx's dotted stage, a
 * line on what Blocx is, and two answers: Explore Blocx, which closes it and
 * plays the way in to Blocx, or Maybe later. The cross, Escape and a click
 * outside all mean "later" too.
 *
 * It greets every visit: a first landing, a reload, a return later on, a new
 * tab. Within one visit it shows once — move around the site and come back to
 * the landing page and it does not pop up again, because it has had its say.
 * While it is open it behaves as a dialog should: focus moves into it and
 * stays there, the page behind holds still, and focus goes back where it was
 * when it closes.
 */

/* long enough for the hero's own entrance to finish first */
const DELAY_MS = 1600;

const rise: Transition = { type: "spring", visualDuration: 0.5, bounce: 0.18 };
const settle: Transition = { type: "spring", visualDuration: 0.6, bounce: 0.22 };

/* the newest blocks, as the shelf has them: what the card shows off */
const FEATURED = BLOCKS.filter((b) => b.isNew).slice(0, 3);
const FEATURED_COUNT = BLOCKS.filter((b) => b.isNew).length;
/* where each picture lands in the fan: x and y in %, then degrees */
const FAN = [
  [-46, 12, -10],
  [0, 0, 0],
  [46, 12, 10],
] as const;

/*
 * Whether it has shown in this page load. It lives in the module, so a reload
 * or a fresh visit starts it over, while moving between pages of the site —
 * which keeps the same page load — does not.
 */
let shownThisLoad = false;

export default function BlocxIntro() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const bodyId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  /* what to do once the card has finished leaving */
  const after = useRef<(() => void) | null>(null);

  /* on every visit, once the hero has had its moment */
  useEffect(() => {
    if (!FEATURED.length || shownThisLoad) return;
    const t = window.setTimeout(() => {
      shownThisLoad = true;
      returnTo.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback((then?: () => void) => {
    after.current = then ?? null;
    setOpen(false);
  }, []);

  /* while open: the page holds still, Escape closes, and Tab stays inside */
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    lenisRef.current?.stop();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const card = cardRef.current;
      if (!card) return;
      const items = [...card.querySelectorAll<HTMLElement>("button, a[href]")].filter((el) => !el.hasAttribute("disabled"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !card.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !card.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    /* the main answer is where focus starts, without drawing a ring on it */
    const focusTimer = window.setTimeout(() => exploreRef.current?.focus({ preventScroll: true }), 60);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      root.style.overflow = prevOverflow;
      lenisRef.current?.start();
    };
  }, [open, close]);

  const onExitComplete = () => {
    const then = after.current;
    after.current = null;
    if (then) then();
    else returnTo.current?.focus?.({ preventScroll: true });
  };

  const word = FEATURED_COUNT === 1 ? "block" : "blocks";

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <motion.div
          key="blocx-intro"
          className="bxi"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.22, delay: 0.06 } }}
          transition={{ duration: 0.3 }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            ref={cardRef}
            className="bxi__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.15 } }
                : { opacity: 0, y: 14, scale: 0.97, filter: "blur(6px)", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }
            }
            transition={rise}
          >
            <div className="bxi__stage" aria-hidden="true">
              <div className="bxi__fan">
                {FEATURED.map((block, i) => {
                  const [x, y, r] = FAN[FEATURED.length === 1 ? 1 : FEATURED.length === 2 ? i * 2 : i];
                  return (
                    <motion.span
                      key={block.slug}
                      className="bxi__shot"
                      style={{ background: block.canvas, zIndex: i === 1 ? 2 : 1 }}
                      initial={reduced ? false : { x: "0%", y: "40%", rotate: 0, opacity: 0, scale: 0.9 }}
                      animate={{ x: `${x}%`, y: `${y}%`, rotate: r, opacity: 1, scale: i === 1 ? 1.04 : 1 }}
                      transition={{ ...settle, delay: 0.12 + (i === 1 ? 0 : 0.08) }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.thumb} alt="" width={960} height={756} decoding="async" />
                    </motion.span>
                  );
                })}
              </div>
            </div>

            <button type="button" className="bxi__close" aria-label="Close" onClick={() => close()}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>

            <div className="bxi__body">
              <p className="bxi__eyebrow">
                <span className="bxi__badge" aria-hidden="true">
                  <svg viewBox="0 0 14.4 14.4">
                    <path d={BLOCX_STAR} fill="currentColor" />
                  </svg>
                </span>
                Blocx
                <span className="bxi__new">New</span>
              </p>
              <h2 className="bxi__title" id={titleId}>
                Whole sections, ready to drop in.
              </h2>
              <p className="bxi__text" id={bodyId}>
                Meet Blocx — heroes, pricing and footers you can preview at any width and copy straight into your
                project. {FEATURED_COUNT} new {word} to start.
              </p>

              <div className="bxi__actions">
                <button
                  ref={exploreRef}
                  type="button"
                  className="bxi__explore"
                  onClick={() => close(enterBlocx)}
                >
                  Explore Blocx
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" className="bxi__later" onClick={() => close()}>
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
