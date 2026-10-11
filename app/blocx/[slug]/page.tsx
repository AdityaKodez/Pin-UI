import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockView from "@/components/blocks/BlockView";
import { type CodePane } from "@/components/library/CodeBlock";
import { BLOCKS, blockBySlug, categoryName, type Block } from "@/lib/blocks";
import { readBlockSource } from "@/lib/source";

/* every block page is known up front, so all of them are prerendered */
export function generateStaticParams() {
  return BLOCKS.map((block) => ({ slug: block.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const block = blockBySlug((await params).slug);
  if (!block) return { title: "Blocx — Pin UI" };
  return {
    title: `${block.name} — Blocx`,
    description: `${categoryName(block.category)} block. ${block.note}`.slice(0, 160),
    alternates: { canonical: `/blocx/${block.slug}` },
  };
}

/*
 * The source on the Code tab is read off disk during the build, so it is
 * literally the code running in the preview beside it.
 */
async function sourceFor(block: Block): Promise<CodePane[]> {
  return Promise.all(
    block.files.map(async (name) => ({
      name,
      lang: name.endsWith(".css") ? ("css" as const) : ("tsx" as const),
      code: await readBlockSource(name),
    })),
  );
}

export default async function BlockPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const block = blockBySlug(slug);
  if (!block) notFound();
  return <BlockView block={block} panes={await sourceFor(block)} />;
}
