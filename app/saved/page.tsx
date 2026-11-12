import type { Metadata } from "next";
import { SavedCollections } from "@/features/briefs/saved-collections";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default function SavedPage() {
  return <SavedCollections />;
}
