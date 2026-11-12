import type { Metadata } from "next";
import Link from "next/link";
import { BriefComposer } from "@/features/briefs/brief-composer";
import { ExpertSignature } from "@/features/experts/expert-signature";
import { paths } from "@/lib/urls";
import { getCatalogIndex } from "@/server/public-catalog";

export const metadata: Metadata = { title: "New brief", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function NewBriefPage({ searchParams }: Props) {
  const raw = (await searchParams).expert;
  const expertId = Array.isArray(raw) ? raw[0] : raw;
  const index = await getCatalogIndex();
  const expert = expertId ? index.expert(expertId) : undefined;

  // A brief has exactly one recipient, and only experts offering services
  // can receive one.
  if (!expert || !expert.services.length) {
    const recipients = index.catalog.experts.filter((item) => item.services.length);
    return (
      <section className="saved-page">
        <header className="page-heading">
          <div>
            <p className="eyebrow">New private brief</p>
            <h1>Who is it for?</h1>
          </div>
        </header>
        <p className="page-intro">
          {expertId
            ? "That expert isn't accepting briefs. Choose one who is."
            : "A brief goes to one expert's studio. Choose who should receive it."}
        </p>
        <ul className="recipient-list">
          {recipients.map((item) => (
            <li key={item.id}>
              <Link href={paths.newBrief(item.id)}>
                <ExpertSignature expert={item} compact />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <BriefComposer key={expert.id} expert={expert} />;
}
