import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import type { PublicExpert } from "@/core/looks";
import type { AppMode } from "@/lib/app-mode";
import { cx } from "@/lib/format";

const CHECK_LABEL = {
  identity: "identity",
  portfolio: "portfolio",
  credentials: "professional credentials",
} as const;

export function ExpertSignature({
  expert,
  compact = false,
}: {
  expert: PublicExpert;
  compact?: boolean;
}) {
  const size = compact ? 46 : 64;
  return (
    <div className={cx("professional-signature", compact && "compact")}>
      <Image
        src={expert.image}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
      <span>
        <small>{expert.studioName ?? expert.handle}</small>
        <strong>
          {expert.displayName}
          {expert.verification && <BadgeCheck aria-hidden="true" />}
        </strong>
        <em>{expert.specialty}</em>
      </span>
    </div>
  );
}

/** Says what the badge means. No verification record ⇒ renders nothing. */
export function VerificationNote({
  expert,
  mode,
}: {
  expert: PublicExpert;
  mode: AppMode;
}) {
  if (!expert.verification) return null;
  const checks = expert.verification.checks.map((c) => CHECK_LABEL[c]).join(" and ");
  return (
    <p className="verification-note">
      <BadgeCheck aria-hidden="true" />
      <span>
        <strong>{expert.verification.label}.</strong>{" "}
        {mode === "demo"
          ? `This is a fictional profile; no real review took place. In the pilot the badge will mean Glowdesk reviewed this expert's ${checks}.`
          : `Glowdesk reviewed this expert's ${checks} (criteria ${expert.verification.criteriaVersion}).`}{" "}
        It is not a clinical qualification and does not certify any product.
      </span>
    </p>
  );
}
