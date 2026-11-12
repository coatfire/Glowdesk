import { ClipboardList } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "My briefs", robots: { index: false } };

export default function BriefsPage() {
  return (
    <section className="saved-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Private briefs</p>
          <h1>My briefs</h1>
        </div>
      </header>
      <div className="empty-state">
        <ClipboardList />
        <h2>No briefs to show.</h2>
        <p>
          Sent briefs and replies need an account, and sign-in isn&apos;t part
          of this demo. You can still compose a brief and preview exactly what
          an expert would receive — it won&apos;t be sent.
        </p>
        <Link className="secondary-button" href="/briefs/new">
          Compose a brief
        </Link>
      </div>
    </section>
  );
}
