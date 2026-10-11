import BlocxMark from "./BlocxMark";
import { IconGitHub, IconX } from "./icons";
import { LINKS } from "@/lib/links";

/** The foot of every Blocx page: the signature, and where to say something is wrong. */
export default function BlocxFooter() {
  return (
    <footer className="blx-foot">
      <BlocxMark size="lg" switchTheme={false} />
      <p className="blx-foot__help">
        <span>Facing an issue?? DM-</span>
        <a className="blx-foot__icon" href={LINKS.x} target="_blank" rel="noopener noreferrer" aria-label="Message Pin UI on X">
          <IconX />
        </a>
        <a className="blx-foot__icon" href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="Pin UI on GitHub">
          <IconGitHub />
        </a>
      </p>
    </footer>
  );
}
