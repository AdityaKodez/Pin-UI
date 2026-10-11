"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Transition } from "motion/react";
import BlocxMark from "./BlocxMark";
import BlocxFooter from "./BlocxFooter";
import GitHubStars from "../hero/GitHubStars";
import { IconArrowLeft, IconArrowUpRight, IconBookmark } from "./icons";
import { useSaved } from "./useSaved";
import { SHELF_ORDER, blocksIn, shelfName, type Block } from "@/lib/blocks";
import "./blocks.css";

const rise: Transition = { type: "spring", stiffness: 210, damping: 28, mass: 0.9 };

/**
 * Blocx — the shelf.
 *
 * Every block, sorted into the section of a page it is for. Each card is a
 * soft tile holding the block's picture, inset, with its name, a "New" tag for
 * the latest arrivals and one line on what it is underneath. Hovering lifts the
 * tile, eases the picture in and sends the arrow out and back. A block you have
 * bookmarked wears the bookmark in the picture's corner.
 */
export default function BlocksIndex() {
  const reduced = useReducedMotion();
  const { isSaved } = useSaved();

  return (
    <div className="blx blx--index">
      <header className="blx-head">
        <Link className="blx-back" href="/">
          <IconArrowLeft />
          Back to Pin UI
        </Link>
        <motion.div
          className="blx-head__mark"
          initial={reduced ? false : { opacity: 0, y: -10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={rise}
        >
          <BlocxMark size="lg" />
        </motion.div>
        {/* the repository, as in Pin UI's masthead: the octocat lifts away and the stars rise in */}
        <div className="blx-head__end">
          <GitHubStars
            initial={reduced ? false : { opacity: 0, y: -10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ ...rise, delay: 0.08 }}
          />
        </div>
      </header>

      <main className="blx-shelves">
        {SHELF_ORDER.map((category, s) => {
          const blocks = blocksIn(category);
          if (!blocks.length) return null;
          return (
            <section key={category} id={category} className="blx-shelf" aria-labelledby={`shelf-${category}`}>
              <motion.h2
                id={`shelf-${category}`}
                className="blx-shelf__title"
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ ...rise, delay: s === 0 ? 0.1 : 0 }}
              >
                {shelfName(category)}:
              </motion.h2>
              <ul className="blx-grid">
                {blocks.map((block, i) => (
                  <motion.li
                    key={block.slug}
                    initial={reduced ? false : { opacity: 0, y: 22, filter: "blur(6px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ ...rise, delay: (s === 0 ? 0.16 : 0.04) + i * 0.07 }}
                  >
                    <BlockCard block={block} saved={isSaved(block.slug)} />
                  </motion.li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>

      <BlocxFooter />
    </div>
  );
}

function BlockCard({ block, saved }: { block: Block; saved: boolean }) {
  return (
    <Link className="blx-card" href={`/blocx/${block.slug}`} aria-label={`${block.name}${block.isNew ? ", new" : ""} — ${block.summary}`}>
      <span className="blx-card__frame" style={{ background: block.canvas }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="blx-card__img" src={block.thumb} alt="" width={960} height={756} loading="lazy" decoding="async" />
        {saved && (
          <span className="blx-card__saved" title="Bookmarked">
            <IconBookmark filled />
          </span>
        )}
      </span>
      <span className="blx-card__caption" aria-hidden="true">
        <span className="blx-card__head">
          <span className="blx-card__name">{block.name}</span>
          {block.isNew && <span className="blx-card__new">New</span>}
          <span className="blx-card__arrow">
            <IconArrowUpRight />
            <IconArrowUpRight />
          </span>
        </span>
        <span className="blx-card__summary">{block.summary}</span>
      </span>
    </Link>
  );
}
