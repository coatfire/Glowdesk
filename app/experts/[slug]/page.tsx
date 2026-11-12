import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpertSignature, VerificationNote } from "@/features/experts/expert-signature";
import { LookFeed } from "@/features/looks/look-feed";
import { getAppMode } from "@/lib/app-mode";
import { paths } from "@/lib/urls";
import { getCatalogIndex } from "@/server/public-catalog";

type Props = { params: Promise<{ slug: string }> };

// Applicants, experts under review, rejected and suspended experts have no
// public route at all.
export const dynamicParams = false;

export async function generateStaticParams() {
  const index = await getCatalogIndex();
  return index.catalog.experts.map((expert) => ({ slug: expert.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const expert = (await getCatalogIndex()).expertBySlug(slug);
  if (!expert) return {};
  return {
    title: expert.studioName ?? expert.displayName,
    description: expert.bio,
    alternates: { canonical: paths.expert(expert.slug) },
    openGraph: {
      title: expert.displayName,
      description: expert.bio,
      url: paths.expert(expert.slug),
      images: [{ url: expert.image }],
      type: "profile",
    },
  };
}

export default async function ExpertPage({ params }: Props) {
  const { slug } = await params;
  const index = await getCatalogIndex();
  const expert = index.expertBySlug(slug);
  if (!expert) notFound();
  const mode = getAppMode();
  const authored = index.looksByExpert(expert.id);
  const curated = index.curatedLooks(expert.id);

  return (
    <section className="discover-page">
      <div className="storefront-hero">
        <div className="storefront-profile">
          <ExpertSignature expert={expert} />
          <p>{expert.bio}</p>
          <div className="storefront-meta">
            {expert.serviceRegion && <span>{expert.serviceRegion}</span>}
            <span>{expert.handle}</span>
          </div>
          {expert.services.length > 0 && (
            <Link className="primary-button" href={paths.newBrief(expert.id)}>
              Send {expert.displayName.split(" ")[0]} a private brief
            </Link>
          )}
        </div>
        {expert.services.length > 0 && (
          <div className="service-strip">
            {expert.services.map((service) => (
              <article key={service.id}>
                <span>{service.duration}</span>
                <h2>{service.name}</h2>
                <p>{service.description}</p>
                <strong>{service.priceLabel}</strong>
              </article>
            ))}
          </div>
        )}
        <p className="powered-mark">Expert studio powered by glowdesk</p>
      </div>
      <VerificationNote expert={expert} mode={mode} />

      <header className="page-heading">
        <div>
          <p className="eyebrow">Created by {expert.displayName}</p>
          <h1>Looks</h1>
        </div>
      </header>
      <LookFeed looks={authored} filter={false} />

      {curated.length > 0 && (
        <>
          <header className="page-heading page-heading-secondary">
            <div>
              <p className="eyebrow">By other experts</p>
              <h1>Curated by {expert.displayName.split(" ")[0]}</h1>
            </div>
          </header>
          <p className="page-intro">
            {expert.displayName} recommends these looks but did not create them.
            Each one credits its own author.
          </p>
          <LookFeed looks={curated} curatedBy={expert.displayName} filter={false} />
        </>
      )}
    </section>
  );
}
