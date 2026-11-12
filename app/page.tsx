import Image from "next/image";
import Link from "next/link";
import { LookFeed } from "@/features/looks/look-feed";
import { paths } from "@/lib/urls";
import { getPublicCatalog } from "@/server/public-catalog";

export default async function DiscoveryPage() {
  const catalog = await getPublicCatalog();
  return (
    <section className="discover-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Expert looks · exact products</p>
          <h1>
            Looks you can
            <br />
            actually recreate.
          </h1>
        </div>
      </header>
      <p className="page-intro">
        Each look lists the exact products and shades its author used, with
        application steps and retailer choices. This is a curated list, not a
        personalised feed.
      </p>
      <LookFeed looks={catalog.looks} />
      <section className="expert-strip" aria-labelledby="experts-heading">
        <h2 id="experts-heading">Experts</h2>
        <ul>
          {catalog.experts.map((expert) => (
            <li key={expert.id}>
              <Link href={paths.expert(expert.slug)}>
                <Image src={expert.image} alt="" width={56} height={56} />
                <span>
                  <strong>{expert.displayName}</strong>
                  <small>{expert.specialty}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
