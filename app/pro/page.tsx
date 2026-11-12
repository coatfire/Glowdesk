import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toPublicExpert } from "@/core/looks";
import { experts } from "@/data/fixtures/experts";
import { looks } from "@/data/fixtures/looks";
import { DEMO_WORKSPACE_EXPERT_ID, demoBriefs } from "@/data/fixtures/workspace";
import { ProWorkspace } from "@/features/pro/pro-workspace";
import { getAppMode } from "@/lib/app-mode";

export const metadata: Metadata = {
  title: "Expert workspace",
  robots: { index: false },
};

/**
 * DEMO ONLY. There is no authentication yet, so this route never shows real
 * data: it renders one fictional expert's scenario. In the pilot it must be
 * session-protected server-side (Phase 2) before any real brief exists.
 */
export default function ProPage() {
  if (getAppMode() !== "demo") notFound();
  const record = experts.find((item) => item.id === DEMO_WORKSPACE_EXPERT_ID);
  const expert = record && toPublicExpert(record);
  if (!record || !expert) notFound();

  const ownLooks = looks
    .filter((look) => look.tenantId === record.tenantId)
    .flatMap((look) =>
      look.revisions.map((revision) => ({
        id: revision.id,
        title: revision.title,
        version: revision.version,
        status: revision.status,
        live: revision.id === look.currentApprovedRevisionId,
      })),
    );

  return (
    <ProWorkspace
      expert={expert}
      enabledBrandIds={record.enabledBrandIds}
      briefs={demoBriefs}
      ownLooks={ownLooks}
    />
  );
}
