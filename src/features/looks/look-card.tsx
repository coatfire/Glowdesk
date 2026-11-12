"use client";

import { Heart, Share2, WandSparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PublicLook } from "@/core/looks";
import { DisclosureNote } from "@/features/commerce/disclosure";
import { useApp } from "@/features/shell/app-providers";
import { cx } from "@/lib/format";
import { paths } from "@/lib/urls";

export function LookCard({
  look,
  wide = false,
  curatedBy,
  priority = false,
}: {
  look: PublicLook;
  wide?: boolean;
  /** Set when shown in another expert's studio: curated ≠ authored. */
  curatedBy?: string;
  priority?: boolean;
}) {
  const { index, mode, saved, dispatchSaved, share, openVariant } = useApp();
  const author = index.expert(look.expertId);
  const items = index.lookVariantViews(look);
  const isSaved = saved.lookIds.includes(look.id);
  const previewable = items.some(({ view }) => view.capability);

  return (
    <article className={cx("feed-card", wide && "feed-card-wide")}>
      <Image
        src={look.coverImage}
        alt={`${look.title}, a ${look.occasion.toLowerCase()} look`}
        fill
        priority={priority}
        sizes="(max-width: 767px) 100vw, 50vw"
      />
      <div className="feed-shade" />
      {author && (
        <Link className="feed-creator" href={paths.expert(author.slug)}>
          <Image src={author.image} alt="" width={38} height={38} />
          <span>
            <strong>{author.displayName}</strong>
            <small>{author.specialty}</small>
          </span>
        </Link>
      )}
      <div className="feed-actions">
        <button
          className={cx("camera-action", isSaved && "active")}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${look.title} from saved` : `Save ${look.title}`}
          onClick={() => dispatchSaved({ type: "toggleLook", lookId: look.id })}
        >
          <span>
            <Heart />
          </span>
          <small>{isSaved ? "Saved" : "Save"}</small>
        </button>
        <button
          className="camera-action"
          aria-label={`Share ${look.title}`}
          onClick={() => void share(look.title, paths.look(look.slug))}
        >
          <span>
            <Share2 />
          </span>
          <small>Share</small>
        </button>
      </div>
      <div className="feed-content">
        <p className="eyebrow">
          {look.occasion}
          {author && ` / by ${author.displayName}`}
          {curatedBy && ` / curated by ${curatedBy}`}
        </p>
        <h2>
          <Link href={paths.look(look.slug)}>{look.title}</Link>
        </h2>
        <p>{look.description}</p>
        <div className="product-stack">
          <div>
            {items.map(({ view }) => (
              <button
                key={view.variant.id}
                style={{ background: view.variant.swatchColor }}
                aria-label={`View ${view.product.name} in ${view.variant.shadeName}`}
                onClick={() =>
                  openVariant({
                    variantId: view.variant.id,
                    lookRevisionId: look.revisionId,
                  })
                }
              />
            ))}
          </div>
          <span>{items.length} exact products</span>
        </div>
        <DisclosureNote disclosure={look.disclosure} mode={mode} onDark />
        <div className="feed-ctas">
          <Link className="primary-button light" href={paths.look(look.slug)}>
            View and shop this look
          </Link>
          {previewable && (
            <Link
              className="icon-button glass"
              href={paths.tryOn(look.id, look.revisionId)}
              aria-label={`Preview ${look.title} in the try-on studio`}
            >
              <WandSparkles />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
