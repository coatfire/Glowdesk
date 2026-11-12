"use client";

import { Bookmark, ChevronRight, Send, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PublicLook } from "@/core/looks";
import { useApp } from "@/features/shell/app-providers";
import { paths } from "@/lib/urls";

type Tab = "looks" | "products" | "viewed";
const TAB_LABEL: Record<Tab, string> = {
  looks: "Looks",
  products: "Products",
  viewed: "Recently viewed",
};

export function SavedCollections() {
  const { index, saved, savedHydrated, dispatchSaved, openVariant } = useApp();
  const [tab, setTab] = useState<Tab>("looks");

  const resolveLooks = (ids: string[]) =>
    ids.map(index.look).filter((look): look is PublicLook => Boolean(look));
  const savedLooks = resolveLooks(saved.lookIds);
  const viewedLooks = resolveLooks(saved.viewedLookIds);
  const savedVariants = saved.variantIds
    .map(index.variantView)
    .filter((view): view is NonNullable<typeof view> => Boolean(view));
  const counts: Record<Tab, number> = {
    looks: savedLooks.length,
    products: savedVariants.length,
    viewed: viewedLooks.length,
  };

  const lookGrid = (looks: PublicLook[], removable: boolean) => (
    <div className="saved-look-grid">
      {looks.map((look) => (
        <article className="saved-look-card" key={look.id}>
          <div className="saved-look-image">
            <Image
              src={look.coverImage}
              alt=""
              fill
              sizes="(max-width: 767px) 50vw, 280px"
            />
            {removable && (
              <button
                className="icon-button glass"
                aria-label={`Remove ${look.title} from saved`}
                onClick={() => dispatchSaved({ type: "toggleLook", lookId: look.id })}
              >
                <Bookmark className="filled-icon" />
              </button>
            )}
          </div>
          <p className="eyebrow">{look.occasion}</p>
          <h2>{look.title}</h2>
          <span>by {index.expert(look.expertId)?.displayName}</span>
          <Link className="text-button" href={paths.look(look.slug)}>
            View look <ChevronRight />
          </Link>
        </article>
      ))}
    </div>
  );

  return (
    <section className="saved-page">
      <header className="page-heading saved-heading">
        <div>
          <p className="eyebrow">Saved on this device</p>
          <h1>Saved</h1>
        </div>
        {savedHydrated && (
          <div className="saved-count">
            <strong>{savedLooks.length + savedVariants.length}</strong>
            <span>saved</span>
          </div>
        )}
      </header>
      <p className="page-intro">
        Saves are kept in this browser only. Accounts and cross-device saves
        aren&apos;t available yet.
      </p>

      <div className="saved-tabs" role="tablist" aria-label="Saved content">
        {(Object.keys(TAB_LABEL) as Tab[]).map((item) => (
          <button
            key={item}
            role="tab"
            id={`saved-tab-${item}`}
            aria-selected={tab === item}
            aria-controls="saved-panel"
            className={tab === item ? "active" : undefined}
            onClick={() => setTab(item)}
          >
            {TAB_LABEL[item]}
          </button>
        ))}
      </div>

      <div id="saved-panel" role="tabpanel" aria-labelledby={`saved-tab-${tab}`}>
        {!savedHydrated ? (
          <p className="page-intro" role="status">
            Loading your saved items…
          </p>
        ) : counts[tab] === 0 ? (
          <div className="empty-state">
            <Sparkles />
            <h2>
              {tab === "viewed" ? "Nothing viewed yet." : `No saved ${tab} yet.`}
            </h2>
            <p>Browse looks and save the ones you want to come back to.</p>
            <Link className="secondary-button" href={paths.home}>
              Browse looks
            </Link>
          </div>
        ) : tab === "looks" ? (
          lookGrid(savedLooks, true)
        ) : tab === "viewed" ? (
          lookGrid(viewedLooks, false)
        ) : (
          <div className="saved-product-list">
            {savedVariants.map((view) => (
              <article className="product-row" key={view.variant.id}>
                <button
                  className="product-row-art"
                  aria-label={`View ${view.product.name}`}
                  onClick={() => openVariant({ variantId: view.variant.id })}
                  style={{
                    background: `linear-gradient(145deg, color-mix(in srgb, ${view.variant.swatchColor} 55%, #fff), ${view.variant.swatchColor})`,
                  }}
                >
                  <i />
                </button>
                <button
                  className="product-row-copy"
                  onClick={() => openVariant({ variantId: view.variant.id })}
                >
                  <small>{view.brand.name}</small>
                  <strong>{view.product.name}</strong>
                  <span>{view.variant.shadeName}</span>
                </button>
                <button
                  className="icon-button quiet"
                  aria-label={`Remove ${view.product.name} from saved`}
                  onClick={() =>
                    dispatchSaved({ type: "toggleVariant", variantId: view.variant.id })
                  }
                >
                  <Bookmark className="filled-icon" />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {savedHydrated && savedLooks.length + savedVariants.length > 0 && (
        <div className="saved-brief-cta">
          <div>
            <h2>Turn these into a private brief</h2>
            <p>Choose one expert and preview exactly what they would receive.</p>
          </div>
          <Link className="primary-button" href="/briefs/new">
            <Send />
            Compose a brief
          </Link>
        </div>
      )}
    </section>
  );
}
