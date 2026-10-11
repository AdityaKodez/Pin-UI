"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePinTheme } from "@/lib/theme";
import "./theme-hint.css";

/**
 * A pencilled note beside the logo: "switch theme", and a scribbled arrow that
 * arcs over the wordmark and lands on the mark — because the mark is the
 * switch, and nothing about a logo says so.
 *
 * It is drawn against the real lockup rather than a guess at it: it reads
 * where the mark and the wordmark actually are in their shared box and lays
 * the arrow out in those pixels, again whenever the lockup changes size. So
 * the arrow lands on the mark in the hero, in a header bar and in the sidebar
 * alike, at any width.
 *
 * The arrow draws itself in and the words write on after it; then the arrow
 * keeps rocking gently on its tail, a note that is still being pointed at.
 * Each switch of the theme draws it again, and it rocks quicker while the
 * mark is under the pointer. Where it should simply be there — Blocx — it can
 * be `still`: drawn in place from the first frame, and never moving again. It
 * is decoration — `aria-hidden`, no pointer events — the button it points at
 * already says what it does.
 */

type Geometry = {
  /* text box */
  tx: number;
  ty: number;
  fs: number;
  /* arrow */
  d: string;
  head: string;
  ox: number;
  oy: number;
};

export default function ThemeHint({
  mark,
  word,
  under = false,
  still = false,
}: {
  mark: string;
  word: string;
  /**
   * Route the arrow beneath the lockup rather than over it — for a lockup that
   * sits right under the edge of something that clips, like the hero's frame,
   * where an arc over the top is cut off by the frame's own edge.
   */
  under?: boolean;
  /** Drawn in place and left there: no draw-in, no rocking, no redraw on a switch. */
  still?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [g, setG] = useState<Geometry | null>(null);
  const { turns } = usePinTheme();

  useLayoutEffect(() => {
    const self = ref.current;
    const host = self?.parentElement;
    if (!self || !host) return;

    /*
     * A piece's box in the host's own pixels. Its layout box, not its painted
     * one, where it can: the mark scales on hover and turns on a switch, and
     * neither should ever nudge the note.
     */
    const boxOf = (el: HTMLElement | null, h: DOMRect) => {
      if (!el) return null;
      if (el.offsetParent === host) {
        return { l: el.offsetLeft, t: el.offsetTop, r: el.offsetLeft + el.offsetWidth, b: el.offsetTop + el.offsetHeight };
      }
      const r = el.getBoundingClientRect();
      return { l: r.left - h.left, t: r.top - h.top, r: r.right - h.left, b: r.bottom - h.top };
    };

    const layout = () => {
      const h = host.getBoundingClientRect();
      const M = boxOf(host.querySelector<HTMLElement>(mark), h);
      const W = boxOf(host.querySelector<HTMLElement>(word), h);
      if (!M || !W || M.r === M.l || W.r === W.l) return;
      const fs = Math.max(15, Math.min(24, (W.b - W.t) * 0.62));

      /* the note sits just past the wordmark, a little below its middle */
      const tx = W.r + fs * 0.75;
      const ty = (W.t + W.b) / 2 - fs * 0.1;

      /*
       * Still (Blocx): one deliberate stroke, drawn once. It leaves from just
       * above the note, swings high over the wordmark and comes down steeply
       * onto the mark, stopping a hair short of it — pointing at the mark, not
       * touching it, and never at the wordmark.
       */
      if (still) {
        const top = Math.min(M.t, W.t);
        const sx = tx + fs * 0.2;
        const sy = ty - fs * 0.6;
        const ex = M.l + (M.r - M.l) * 0.6;
        const ey = M.t - fs * 0.24;
        /* a tall arc where there is room above, never off the top of the screen */
        const lift = Math.max(fs * 0.9, Math.min(fs * 1.6, (h.top + top - 4) / 0.75));
        const cy = top - lift;
        const c1 = [sx - fs * 0.35, cy];
        const c2 = [ex + fs * 0.7, cy - fs * 0.15];
        const d = `M ${sx} ${sy} C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${ex} ${ey}`;

        /* the head follows the stroke's own direction where it lands */
        const ang = Math.atan2(ey - c2[1], ex - c2[0]);
        const len = fs * 0.48;
        const spread = 0.5;
        const p1 = [ex - len * Math.cos(ang - spread), ey - len * Math.sin(ang - spread)];
        const p2 = [ex - len * Math.cos(ang + spread), ey - len * Math.sin(ang + spread)];
        const head = `M ${p1[0]} ${p1[1]} L ${ex} ${ey} L ${p2[0]} ${p2[1]}`;

        setG({ tx, ty, fs, d, head, ox: sx, oy: sy });
        return;
      }

      /* +1 draws the arc over the lockup, −1 beneath it */
      const dir = under ? -1 : 1;

      /*
       * The tail leaves from just beside the note's first letters — above them
       * for an arc over the top, below them for one underneath — clear of the
       * wordmark, so it never reads as one more letter after it. The head lands
       * on the mark's top right or bottom right.
       */
      const sx = tx + fs * 0.25;
      const sy = ty - dir * fs * 0.62;
      const ex = M.l + (M.r - M.l) * 0.74;
      const ey = under ? M.b + fs * 0.08 : M.t - fs * 0.08;
      /*
       * How far the arc bows out from the lockup: its natural depth where there
       * is room, and only as much as there is where the lockup sits close to
       * the top of the screen, as it does in a header bar.
       */
      const room = under ? Infinity : h.top + Math.min(M.t, W.t) - 3;
      const rise = Math.min(fs * 0.85, Math.max(fs * 0.3, room));
      const peak = under ? Math.max(M.b, W.b) + rise : Math.min(M.t, W.t) - rise;
      const mid = (W.l + W.r) / 2;

      /*
       * A hand's stroke, not a geometric one: a short lift off the page, a long
       * arc past the wordmark that leans a touch beyond its middle, and a turn
       * onto the mark that steepens at the end like a flick of the wrist.
       */
      const d = [
        `M ${sx} ${sy}`,
        `C ${sx - fs * 0.1} ${peak + dir * rise * 0.55} ${mid + fs * 1.3} ${peak} ${mid} ${peak}`,
        `S ${ex + fs * 0.55} ${ey - dir * rise * 0.75} ${ex} ${ey}`,
      ].join(" ");

      /* the head: two short strokes splayed about the direction of arrival */
      const ax = ex + fs * 0.55;
      const ay = ey - dir * rise * 0.75;
      const ang = Math.atan2(ey - ay, ex - ax);
      const len = fs * 0.5;
      const spread = 0.55;
      const p1 = [ex - len * Math.cos(ang - spread), ey - len * Math.sin(ang - spread)];
      const p2 = [ex - len * Math.cos(ang + spread), ey - len * Math.sin(ang + spread)];
      const head = `M ${p1[0]} ${p1[1]} L ${ex} ${ey} L ${p2[0]} ${p2[1]}`;

      setG({ tx, ty, fs, d, head, ox: sx, oy: sy });
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(host);
    void document.fonts?.ready.then(layout);
    /*
     * The mark can arrive on a shared-layout flight, and a page can still be
     * settling its fonts and entrances; measure again as it does.
     */
    const timers = [250, 700, 1500, 3000].map((ms) => window.setTimeout(layout, ms));
    window.addEventListener("load", layout);
    return () => {
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("load", layout);
    };
  }, [mark, word, under, still]);

  return (
    <span className={`thint${still ? " thint--still" : ""}`} ref={ref} aria-hidden="true">
      {g && (
        /* keyed on the theme's turns, so every switch draws it again — unless it is still */
        <span className="thint__draw" key={still ? "still" : turns} data-replay={(!still && turns > 0) || undefined}>
          <svg className="thint__svg" width="1" height="1">
            <g className="thint__rock" style={{ transformOrigin: `${g.ox}px ${g.oy}px` }}>
              <path className="thint__line" d={g.d} pathLength={1} />
              <path className="thint__head" d={g.head} pathLength={1} />
            </g>
          </svg>
          <span
            className="thint__text"
            style={{ left: g.tx, top: g.ty, fontSize: g.fs }}
          >
            switch theme
          </span>
        </span>
      )}
    </span>
  );
}
