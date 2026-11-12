"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { PublicLook } from "@/core/looks";
import { LookCard } from "./look-card";

const ALL = "All looks";

/** Curated feed with an occasion filter. Not personalised. */
export function LookFeed({
  looks,
  curatedBy,
  filter = true,
}: {
  looks: PublicLook[];
  curatedBy?: string;
  filter?: boolean;
}) {
  const [occasion, setOccasion] = useState(ALL);
  const occasions = [ALL, ...new Set(looks.map((look) => look.occasion))];
  const visible =
    occasion === ALL ? looks : looks.filter((look) => look.occasion === occasion);

  if (!looks.length) {
    return (
      <div className="empty-state">
        <Sparkles />
        <h2>No published looks yet.</h2>
        <p>Looks appear here once an approved expert&apos;s look passes review.</p>
      </div>
    );
  }

  return (
    <>
      {filter && occasions.length > 2 && (
        <div className="mood-filter" role="group" aria-label="Filter looks by occasion">
          {occasions.map((item) => (
            <button
              key={item}
              className={occasion === item ? "active" : undefined}
              aria-pressed={occasion === item}
              onClick={() => setOccasion(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="look-feed">
        {visible.map((look, position) => (
          <LookCard
            key={look.id}
            look={look}
            wide={position % 3 === 1}
            curatedBy={curatedBy}
            priority={position === 0}
          />
        ))}
      </div>
    </>
  );
}
