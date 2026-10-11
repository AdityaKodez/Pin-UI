import type { Metadata } from "next";
import BlocksIndex from "@/components/blocks/BlocksIndex";

export const metadata: Metadata = {
  title: "Blocx — Pin UI",
  description: "Blocx: whole page sections from Pin UI — heroes, pricing, contact forms and footers — previewed live at desktop, tablet and phone widths, with the code beside them.",
  alternates: { canonical: "/blocx" },
};

/** Blocx — the shelf of blocks, sorted by the section of a page each is for. */
export default function BlocxPage() {
  return <BlocksIndex />;
}
