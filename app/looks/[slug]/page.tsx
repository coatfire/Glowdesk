import { WandSparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_PREVIEW_LABEL, TRY_ON_DISCLAIMER } from "@/core/try-on";
import { DisclosureNote } from "@/features/commerce/disclosure";
import { ExpertSignature } from "@/features/experts/expert-signature";
import { LookActions, ShopThisLook } from "@/features/looks/look-detail-client";
import { getAppMode } from "@/lib/app-mode";
import { paths } from "@/lib/urls";
import { getCatalogIndex } from "@/server/public-catalog";

type Props = { params: Promise<{ slug: string }> };

// Only approved, published looks exist as routes. Anything else is a 404 with
// no hint about drafts or moderation state.
export const dynamicParams = false;

export async function generateStaticParams() {
  const index = await getCatalogIndex();
  return index.catalog.looks.map((look) => ({ slug: look.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const index = await getCatalogIndex();
  const look = index.lookBySlug(slug);
  if (!look) return {};
  const author = index.expert(look.expertId);
  // The disclosure travels with the share text so a shared card is labelled.
  const description = `${look.disclosure.text} ${look.description}`;
  return {
    title: author ? `${look.title} by ${author.displayName}` : look.title,
    description,
    alternates: { canonical: paths.look(look.slug) },
    openGraph: {
      title: look.title,
      description,
      url: paths.look(look.slug),
      images: [{ url: look.coverImage }],
      type: "article",
    },
  };
}

export default async function LookPage({ params }: Props) {
  const { slug } = await params;
  const index = await getCatalogIndex();
  const look = index.lookBySlug(slug);
  if (!look) notFound();
  const author = index.expert(look.expertId);
  if (!author) notFound();
  const mode = getAppMode();
  const entries = index.lookVariantViews(look);
  const supported = entries.filter(({ view }) => view.capability);
  const unsupported = entries.filter(({ view }) => !view.capability);

  return (
    <article className="look-page">
      <div className="look-hero">
        <div className="look-hero-image">
          <Image
            src={look.coverImage}
            alt={`${look.title}, a ${look.occasion.toLowerCase()} look by ${author.displayName}`}
            fill
            priority
            sizes="(max-width: 899px) 100vw, 46vw"
          />
        </div>
        <div className="look-hero-copy">
          <p className="eyebrow">{look.occasion} look</p>
          <h1>{look.title}</h1>
          <p className="look-lede">{look.description}</p>
          <Link className="look-author" href={paths.expert(author.slug)}>
            <span className="eyebrow">Created by</span>
            <ExpertSignature expert={author} compact />
          </Link>
          <DisclosureNote disclosure={look.disclosure} mode={mode} />
          <div className="look-cta-row">
            <a className="primary-button" href="#shop">
              Shop this look
            </a>
            <LookActions look={look} />
          </div>
        </div>
      </div>

      <section className="look-section" aria-labelledby="steps-heading">
        <h2 id="steps-heading">How to recreate it</h2>
        <ol className="look-steps">
          {look.steps.map((step, position) => (
            <li key={position}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="look-section" id="shop" aria-labelledby="shop-heading">
        <h2 id="shop-heading">Shop this look</h2>
        <p className="page-intro">
          {entries.length} exact products, in application order.
        </p>
        <DisclosureNote disclosure={look.disclosure} mode={mode} />
        <ShopThisLook look={look} />
      </section>

      <section className="look-section" aria-labelledby="tryon-heading">
        <h2 id="tryon-heading">Optional preview</h2>
        {supported.length ? (
          <>
            <p className="page-intro">
              You can preview{" "}
              {supported
                .map(({ view }) => `${view.product.name} (${view.variant.shadeName})`)
                .join(", ")}{" "}
              on a photo or your camera.
              {unsupported.length > 0 &&
                ` Not previewable: ${unsupported
                  .map(({ view }) => view.product.name)
                  .join(", ")}.`}
            </p>
            <p className="variant-meta">
              {index.catalog.tryOnProvider === "mock" && `${MOCK_PREVIEW_LABEL} `}
              {TRY_ON_DISCLAIMER}
            </p>
            <Link
              className="secondary-button"
              href={paths.tryOn(look.id, look.revisionId)}
            >
              <WandSparkles />
              Open the try-on studio
            </Link>
          </>
        ) : (
          <p className="page-intro">
            Preview is not supported for the products in this look. You can
            still shop every product above.
          </p>
        )}
      </section>

      {author.services.length > 0 && (
        <section className="look-section" aria-labelledby="brief-heading">
          <h2 id="brief-heading">Want this done for you?</h2>
          <p className="page-intro">
            Send {author.displayName} a private brief with this look and request
            an appointment.
          </p>
          <Link className="secondary-button" href={paths.newBrief(author.id)}>
            Start a brief for {author.displayName}
          </Link>
        </section>
      )}
    </article>
  );
}
