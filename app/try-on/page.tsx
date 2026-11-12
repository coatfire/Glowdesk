import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TryOnStudio } from "@/features/try-on/try-on-studio";
import { paths } from "@/lib/urls";
import { getCatalogIndex } from "@/server/public-catalog";

export const metadata: Metadata = {
  title: "Try on",
  // A tool page, not content: keep it out of search and share previews.
  robots: { index: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function TryOnPage({ searchParams }: Props) {
  const params = await searchParams;
  const lookId = first(params.look);
  const revisionId = first(params.revision);
  const index = await getCatalogIndex();

  if (!lookId) {
    const previewable = index.catalog.looks.filter((look) =>
      index.lookVariantViews(look).some(({ view }) => view.capability),
    );
    return (
      <section className="saved-page">
        <header className="page-heading">
          <div>
            <p className="eyebrow">Optional preview</p>
            <h1>
              Choose a look
              <br />
              to preview.
            </h1>
          </div>
        </header>
        <p className="page-intro">
          Preview is illustrative and optional. Every look can be shopped
          without it.
        </p>
        <div className="saved-look-grid">
          {previewable.map((look) => (
            <article className="saved-look-card" key={look.id}>
              <Link
                className="saved-look-image"
                href={paths.tryOn(look.id, look.revisionId)}
                aria-label={`Preview ${look.title}`}
              >
                <Image src={look.coverImage} alt="" fill sizes="(max-width: 767px) 50vw, 280px" />
              </Link>
              <p className="eyebrow">{look.occasion}</p>
              <h2>{look.title}</h2>
              <span>by {index.expert(look.expertId)?.displayName}</span>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const look = index.look(lookId);
  if (!look) notFound();
  // A link to an older revision still opens the look, but says so plainly.
  const stale = Boolean(revisionId) && revisionId !== look.revisionId;

  return (
    <>
      {stale && (
        <p className="stale-notice" role="status">
          This look has been updated since that link was shared. You&apos;re
          seeing the current version.
        </p>
      )}
      <TryOnStudio key={look.revisionId} look={look} />
    </>
  );
}
