import Link from "next/link";
import { paths } from "@/lib/urls";

export default function NotFound() {
  return (
    <section className="discover-page">
      <div className="empty-state">
        <h2>This page isn&apos;t available.</h2>
        <p>The look or expert may have been removed, or the link is incorrect.</p>
        <Link className="secondary-button" href={paths.home}>
          Browse looks
        </Link>
      </div>
    </section>
  );
}
