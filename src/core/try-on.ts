import type { Money } from "./catalog";

/**
 * Vendor-independent try-on contract (handover §9 sketch). Provider selection
 * is unresolved; only the mock adapter exists. Live/still providers will need
 * extra rendering-target parameters defined after the vendor spike.
 */

export type TryOnCategory = "lips" | "blush" | "eyes";
export type TryOnMode = "live" | "photo";

export interface TryOnCapability {
  variantId: string;
  category: TryOnCategory;
  supportedModes: TryOnMode[];
  /** False ⇒ the preview must be labelled as not calibrated to the product. */
  calibrated: boolean;
}

export interface TryOnUsage {
  requestId: string;
  provider: string;
  status: "completed" | "failed" | "cancelled";
  /** Undefined means unknown. Never NaN, never assumed zero. */
  usageUnits?: number;
  measuredCost?: Money;
}

export interface TryOnSession {
  stop(): Promise<void>;
  capturePreview?(): Promise<Blob>;
}

export interface TryOnProvider {
  readonly name: string;
  getCapabilities(variantIds: string[]): Promise<TryOnCapability[]>;
  createSession(input: {
    lookRevisionId: string;
    variantIds: string[];
    mode: TryOnMode;
    consentReceiptId: string;
  }): Promise<TryOnSession>;
}

export const TRY_ON_DISCLAIMER =
  "Virtual visualization only. Colour and finish vary with lighting, skin tone, device, and application.";

export const MOCK_PREVIEW_LABEL =
  "Demo preview — not calibrated to this product.";
