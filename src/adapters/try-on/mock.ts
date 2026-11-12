import type { ProductCategory } from "../../core/catalog";
import type {
  TryOnCapability,
  TryOnCategory,
  TryOnProvider,
  TryOnSession,
} from "../../core/try-on";

const SUPPORTED: readonly ProductCategory[] = ["lips", "blush", "eyes"];

/**
 * Deterministic development provider. It performs NO face tracking and NO
 * rendering: the UI draws a fixed illustrative tint. Every capability is
 * `calibrated: false`, so the preview must carry the "not calibrated" label.
 * Never selected automatically outside demo mode.
 */
export class MockTryOnProvider implements TryOnProvider {
  readonly name = "mock";

  constructor(
    private readonly categoryOf: (variantId: string) => ProductCategory | undefined,
  ) {}

  async getCapabilities(variantIds: string[]): Promise<TryOnCapability[]> {
    return variantIds.flatMap((variantId) => {
      const category = this.categoryOf(variantId);
      if (!category || !SUPPORTED.includes(category)) return [];
      return [
        {
          variantId,
          category: category as TryOnCategory,
          supportedModes: ["live", "photo"],
          calibrated: false,
        },
      ];
    });
  }

  async createSession(): Promise<TryOnSession> {
    // No capturePreview: the mock cannot produce a real frame artifact.
    return { stop: async () => undefined };
  }
}
