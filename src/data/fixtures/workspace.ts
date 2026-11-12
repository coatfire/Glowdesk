/**
 * FICTIONAL workspace scenario for the demo expert (Maya Clarke). These
 * clients do not exist. Shown only inside the labelled demo workspace.
 */

export type DemoBriefStatus = "new" | "reviewing" | "reply drafted";

export interface DemoBrief {
  id: string;
  clientName: string;
  initials: string;
  submittedLabel: string;
  serviceId: string;
  /** A customer preference — not a confirmed appointment. */
  preferredDateLabel: string;
  note: string;
  status: DemoBriefStatus;
  lookIds: string[];
  variantIds: string[];
}

export const DEMO_WORKSPACE_EXPERT_ID = "maya-clarke";

export const demoBriefs: DemoBrief[] = [
  {
    id: "DEMO-1042",
    clientName: "Leah Morgan",
    initials: "LM",
    submittedLabel: "12 min ago",
    serviceId: "occasion",
    preferredDateLabel: "Prefers 14 September",
    note: "Warm evening look, polished but still like me. I usually avoid a heavy base.",
    status: "new",
    lookIds: ["soft-signal", "electric-hour"],
    variantIds: ["vs-ember", "cf-guava-hour", "lc-molten-tea"],
  },
  {
    id: "DEMO-1041",
    clientName: "Priya Shah",
    initials: "PS",
    submittedLabel: "Yesterday",
    serviceId: "bridal",
    preferredDateLabel: "Prefers 28 October",
    note: "Soft luminous skin and defined eyes. The ceremony starts early afternoon.",
    status: "reviewing",
    lookIds: ["heirloom-light", "bare-focus"],
    variantIds: ["btt-18", "lc-molten-tea", "dp-moon-milk"],
  },
  {
    id: "DEMO-1038",
    clientName: "Amina Cole",
    initials: "AC",
    submittedLabel: "2 days ago",
    serviceId: "skin-consult",
    preferredDateLabel: "No date given",
    note: "My skin feels tight after cleansing. I want a simple routine I can keep up with.",
    status: "reviewing",
    lookIds: ["bare-focus"],
    variantIds: ["bc-50", "qw-100"],
  },
];
