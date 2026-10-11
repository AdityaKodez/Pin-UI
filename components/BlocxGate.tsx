"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";
import { BLOCX_ENTER } from "./BlocksLink";
import { BLOCX_STAR } from "./blocks/icons";
import "./blocx-gate.css";

/**
 * The way in to Blocx.
 *
 * Blocx is a new room in Pin UI, so going there is an arrival rather than a
 * page load. A curtain sweeps up — ink first, Pin UI's red a beat behind it —
 * and while it holds, nine blocks fly in from all sides, lock into a grid and
 * fold into the Blocx badge as the wordmark writes on. Underneath, the site has
 * already moved to /blocx; once that page is there, the curtain lifts away
 * upward, red then ink, and the shelf is simply waiting.
 *
 * It lives in the root layout so it survives the change of page. Reduced
 * motion skips it and just goes; so does a modifier-click, which the link
 * leaves to the browser.
 */

type Phase = "idle" | "cover" | "show" | "leave";

const SWEEP: Transition = { duration: 0.62, ease: [0.76, 0, 0.24, 1] };
const LIFT: Transition = { duration: 0.7, ease: [0.76, 0, 0.24, 1] };
const snap: Transition = { type: "spring", stiffness: 300, damping: 22, mass: 0.8 };
const pop: Transition = { type: "spring", stiffness: 420, damping: 18 };

/* where each block starts, flung out around the middle */
const FLING = [
  [-190, -120, -70],
  [10, -210, 40],
  [200, -140, 85],
  [-240, 20, 120],
  [0, 0, 0],
  [250, 30, -95],
  [-180, 170, 60],
  [-20, 230, -45],
  [190, 160, -110],
] as const;

const WORD = "Blocx".split("");
/* how long the badge and the word are given to land before the curtain may lift */
const HOLD_MS = 1100;
const GIVE_UP_MS = 8000;

export default function BlocxGate() {
  const reduced = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [merged, setMerged] = useState(false);
  const shownAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  /* the shelf is fetched ahead, so the curtain is never waiting on it */
  useEffect(() => {
    router.prefetch("/blocx");
  }, [router]);

  const open = useCallback(() => {
    if (phase !== "idle") return;
    if (reduced) {
      router.push("/blocx");
      return;
    }
    setMerged(false);
    setPhase("cover");
  }, [phase, reduced, router]);

  useEffect(() => {
    window.addEventListener(BLOCX_ENTER, open);
    return () => window.removeEventListener(BLOCX_ENTER, open);
  }, [open]);

  /* nothing behind the curtain scrolls while it is down */
  useEffect(() => {
    if (phase === "idle") return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [phase]);

  /* covered: go, and start the badge */
  const onCovered = () => {
    if (phase !== "cover") return;
    shownAt.current = performance.now();
    setPhase("show");
    router.push("/blocx");
    timers.current.push(setTimeout(() => setMerged(true), 620));
    timers.current.push(setTimeout(() => setPhase("leave"), GIVE_UP_MS));
  };

  /* arrived, and the badge has had its moment: lift */
  useEffect(() => {
    if (phase !== "show" || pathname !== "/blocx") return;
    const wait = Math.max(0, HOLD_MS - (performance.now() - shownAt.current));
    const t = setTimeout(() => setPhase("leave"), wait);
    return () => clearTimeout(t);
  }, [phase, pathname]);

  const onLifted = () => {
    if (phase !== "leave") return;
    clear();
    setMerged(false);
    setPhase("idle");
  };

  useEffect(() => () => clear(), []);

  if (phase === "idle") return null;

  const covered = { clipPath: "inset(0% 0% 0% 0%)" };
  const below = { clipPath: "inset(100% 0% 0% 0%)" };
  const above = { clipPath: "inset(0% 0% 100% 0%)" };
  const leaving = phase === "leave";

  return (
    <div className="bgate" role="status" aria-live="polite">
      <span className="bgate__sr">Opening Blocx</span>

      {/* ink, then red a beat behind it; leaving, red goes first and ink after */}
      <motion.div
        className="bgate__curtain bgate__curtain--ink"
        initial={below}
        animate={leaving ? above : covered}
        transition={leaving ? { ...LIFT, delay: 0.14 } : SWEEP}
        onAnimationComplete={() => leaving && onLifted()}
      />
      <motion.div
        className="bgate__curtain bgate__curtain--red"
        initial={below}
        animate={leaving ? above : covered}
        transition={leaving ? LIFT : { ...SWEEP, delay: 0.09 }}
        onAnimationComplete={() => !leaving && onCovered()}
      />

      <AnimatePresence>
        {phase === "show" && (
          <motion.div
            key="lockup"
            className="bgate__center"
            exit={{ opacity: 0, y: -24, filter: "blur(8px)", transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } }}
          >
            <div className="bgate__lockup">
              <div className="bgate__mark">
                {/* nine blocks, flying in and locking into a grid */}
                <motion.div
                  className="bgate__tiles"
                  animate={merged ? { scale: 0.55, opacity: 0, rotate: 45 } : { scale: 1, opacity: 1, rotate: 0 }}
                  transition={merged ? { duration: 0.28, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
                >
                  {FLING.map(([x, y, r], i) => (
                    <motion.span
                      key={i}
                      className="bgate__tile"
                      initial={{ x, y, rotate: r, scale: 0.3, opacity: 0 }}
                      animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                      transition={{ ...snap, delay: 0.04 + i * 0.035, opacity: { duration: 0.2, delay: 0.04 + i * 0.035 } }}
                    />
                  ))}
                </motion.div>

                {/* which fold into the badge */}
                <motion.span
                  className="bgate__badge"
                  initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
                  animate={merged ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.4, opacity: 0, rotate: -25 }}
                  transition={pop}
                >
                  <motion.svg
                    viewBox="0 0 14.4 14.4"
                    className="bgate__star"
                    aria-hidden="true"
                    initial={{ rotate: 120, scale: 0.4 }}
                    animate={merged ? { rotate: 0, scale: 1 } : { rotate: 120, scale: 0.4 }}
                    transition={{ ...pop, delay: 0.05 }}
                  >
                    <path d={BLOCX_STAR} fill="currentColor" />
                  </motion.svg>
                </motion.span>
              </div>

              {/* and the wordmark writes on */}
              <span className="bgate__word" aria-hidden="true">
                {WORD.map((ch, i) => (
                  <span key={i} className="bgate__letterBox">
                    <motion.span
                      className="bgate__letter"
                      initial={{ y: "110%" }}
                      animate={merged ? { y: "0%" } : { y: "110%" }}
                      transition={{ ...snap, delay: merged ? 0.08 + i * 0.045 : 0 }}
                    >
                      {ch}
                    </motion.span>
                  </span>
                ))}
              </span>
            </div>

            <motion.p
              className="bgate__note"
              initial={{ opacity: 0, y: 8 }}
              animate={merged ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: merged ? 0.3 : 0 }}
            >
              Whole sections, ready to drop in.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
