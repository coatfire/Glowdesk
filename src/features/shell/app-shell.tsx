"use client";

import {
  Bookmark,
  BriefcaseBusiness,
  ClipboardList,
  ScanFace,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { paths } from "@/lib/urls";
import { useApp } from "./app-providers";

const consumerNav = [
  { href: paths.home, label: "Looks", icon: <Sparkles />, match: ["/", "/looks", "/experts"] },
  { href: "/try-on", label: "Try on", icon: <ScanFace />, match: ["/try-on"] },
  { href: paths.saved, label: "Saved", icon: <Bookmark />, match: ["/saved"] },
  { href: paths.briefs, label: "My briefs", icon: <ClipboardList />, match: ["/briefs"] },
];

const isActive = (pathname: string, match: string[]) =>
  match.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

function NavLinks({ pathname }: { pathname: string }) {
  return consumerNav.map((item) => {
    const active = isActive(pathname, item.match);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cx("nav-button", active && "nav-button-active")}
        aria-current={active ? "page" : undefined}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  });
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { mode } = useApp();
  const proActive = isActive(pathname, ["/pro"]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {mode === "demo" && (
        <p className="demo-banner">Demo · fictional data · nothing is sent or sold</p>
      )}

      <aside className="desktop-rail">
        <Link className="wordmark" href={paths.home} aria-label="Glowdesk home">
          glow<span>desk</span>
        </Link>
        <nav className="rail-nav" aria-label="Primary">
          <NavLinks pathname={pathname} />
        </nav>
        <Link
          className={cx("nav-button rail-pro", proActive && "nav-button-active")}
          href={paths.pro}
          aria-current={proActive ? "page" : undefined}
        >
          <BriefcaseBusiness />
          <span>Expert workspace</span>
        </Link>
      </aside>

      <header className="mobile-header">
        <Link className="wordmark" href={paths.home} aria-label="Glowdesk home">
          glow<span>desk</span>
        </Link>
        <Link
          className="icon-button quiet"
          href={paths.pro}
          aria-label="Expert workspace"
        >
          <BriefcaseBusiness />
        </Link>
      </header>

      <main className="app-main" id="main">
        {children}
      </main>

      <nav className="mobile-nav" aria-label="Primary">
        <NavLinks pathname={pathname} />
      </nav>
    </div>
  );
}
