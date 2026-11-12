"use client";

import {
  Bookmark,
  Camera,
  ImagePlus,
  Info,
  RefreshCcw,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PublicLook } from "@/core/looks";
import { MOCK_PREVIEW_LABEL, TRY_ON_DISCLAIMER, type TryOnMode } from "@/core/try-on";
import { useApp } from "@/features/shell/app-providers";
import { cx } from "@/lib/format";
import { paths } from "@/lib/urls";

const DEMO_MODEL = "/images/look-freckled.jpg";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

type Source = "model" | "photo" | "live";

/** Resolves once the browser has actually decoded the image, else rejects. */
function decodes(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const probe = new window.Image();
    probe.onload = () => resolve();
    probe.onerror = () => reject(new Error("decode failed"));
    probe.src = url;
  });
}

/**
 * Optional, illustrative try-on for the supported items of ONE look revision.
 *
 * Honest limits of the mock renderer, all stated in the UI:
 * - one product at a time, drawn as a fixed-position tint (no face tracking);
 * - nothing is uploaded: camera frames and photos stay in this browser tab;
 * - there is no capture — "Save look" bookmarks the look, not an image.
 */
export function TryOnStudio({ look }: { look: PublicLook }) {
  const { index, saved, dispatchSaved, notify, openVariant } = useApp();
  const author = index.expert(look.expertId);
  const entries = index.lookVariantViews(look);
  const supported = entries.filter(({ view }) => view.capability);
  const unsupported = entries.filter(({ view }) => !view.capability);

  // productId → chosen shade. Starts on the look's exact variants.
  const [shadeByProduct, setShadeByProduct] = useState<Record<string, string>>({});
  const [activeProductId, setActiveProductId] = useState(
    supported[0]?.view.product.id ?? "",
  );
  const [intensity, setIntensity] = useState(64);
  const [compare, setCompare] = useState(false);
  const [comparePosition, setComparePosition] = useState(52);
  const [source, setSource] = useState<Source>("model");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);
  const [pendingMode, setPendingMode] = useState<TryOnMode | null>(null);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const photoUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeEntry =
    supported.find(({ view }) => view.product.id === activeProductId) ?? supported[0];
  const activeView = activeEntry
    ? (index.variantView(
        shadeByProduct[activeEntry.view.product.id] ?? activeEntry.view.variant.id,
      ) ?? activeEntry.view)
    : undefined;
  const isSubstitution =
    activeEntry && activeView && activeView.variant.id !== activeEntry.view.variant.id;
  const modes = activeView?.capability?.supportedModes ?? [];

  const stopCamera = useCallback(() => {
    requestRef.current += 1; // invalidates any permission request in flight
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStarting(false);
    setSource((current) => (current === "live" ? "model" : current));
  }, []);

  const clearPhoto = useCallback(() => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = null;
    setPhotoUrl(null);
  }, []);

  // Release the camera and any object URL on unmount, and stop the camera
  // when the tab is hidden so it never runs unseen.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && streamRef.current) {
        stopCamera();
        setMessage("Camera stopped while this tab was in the background.");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      requestRef.current += 1;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = null;
    };
  }, [stopCamera]);

  const startCamera = async () => {
    if (starting || streamRef.current) return; // ignore duplicate starts
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Live camera isn't supported in this browser. Use a photo instead.");
      return;
    }
    const requestId = ++requestRef.current;
    setStarting(true);
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: false,
      });
      if (requestRef.current !== requestId) {
        // Cancelled or unmounted while the permission prompt was open.
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.getVideoTracks().forEach((track) =>
        track.addEventListener("ended", () => {
          if (streamRef.current === stream) {
            stopCamera();
            setMessage("The camera stopped.");
          }
        }),
      );
      streamRef.current = stream;
      clearPhoto();
      setSource("live");
    } catch (error) {
      if (requestRef.current !== requestId) return;
      const denied = error instanceof DOMException && error.name === "NotAllowedError";
      setMessage(
        denied
          ? "Camera access was not allowed. You can use a photo, or keep browsing without try-on."
          : "The camera couldn't start. You can use a photo instead.",
      );
    } finally {
      if (requestRef.current === requestId) setStarting(false);
    }
  };

  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    if (!video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    video.play().catch(() => undefined);
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow choosing the same file again
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMessage("That file type isn't supported. Choose a JPEG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setMessage("That image is larger than 12 MB. Choose a smaller one.");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      await decodes(url);
    } catch {
      URL.revokeObjectURL(url);
      setMessage("That image couldn't be opened. Try a different photo.");
      return;
    }
    stopCamera();
    clearPhoto();
    photoUrlRef.current = url;
    setPhotoUrl(url);
    setSource("photo");
    setMessage("");
  };

  const begin = (mode: TryOnMode) => {
    if (!consented) {
      setPendingMode(mode);
      return;
    }
    if (mode === "live") void startCamera();
    else inputRef.current?.click();
  };

  const reset = () => {
    stopCamera();
    clearPhoto();
    setSource("model");
    setShadeByProduct({});
    setCompare(false);
    setIntensity(64);
    setMessage("");
  };

  const isSaved = saved.lookIds.includes(look.id);
  const stageStyle = {
    "--effect-tint": activeView?.variant.swatchColor ?? "transparent",
    "--effect-opacity": Math.max(0.12, intensity / 125),
    "--compare-position": `${comparePosition}%`,
  } as CSSProperties;

  const limits = (
    <>
      <p>
        <strong>{MOCK_PREVIEW_LABEL}</strong> One product at a time, drawn as a
        tint at a fixed position — it does not track your face.
      </p>
      <p>{TRY_ON_DISCLAIMER}</p>
      {unsupported.length > 0 && (
        <p>
          Not previewable in this look:{" "}
          {unsupported.map(({ view }) => view.product.name).join(", ")}.
        </p>
      )}
    </>
  );

  if (!supported.length || !activeView || !activeEntry) {
    return (
      <section className="discover-page">
        <div className="empty-state">
          <Info />
          <h2>Preview isn&apos;t supported for this look.</h2>
          <p>None of its products can be previewed. You can still shop them all.</p>
          <Link className="secondary-button" href={paths.look(look.slug)}>
            Back to {look.title}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="studio-layout">
      <div className="studio-copy">
        <p className="eyebrow">Optional preview</p>
        <h1>{look.title}</h1>
        {author && <p>A look by {author.displayName}.</p>}
        <div className="tryon-limits">{limits}</div>
        <Link className="secondary-button" href={paths.look(look.slug)}>
          Back to the look
        </Link>
      </div>

      <div className="camera-phone">
        <div className="camera-stage" style={stageStyle}>
          {source === "live" ? (
            <video
              ref={attachVideo}
              className="camera-media camera-video"
              playsInline
              muted
              aria-label="Live front camera preview"
            />
          ) : source === "photo" && photoUrl ? (
            // A local blob URL: next/image optimisation does not apply.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Your photo, shown only in this browser" className="camera-media tryon-photo" />
          ) : (
            <Image
              src={DEMO_MODEL}
              alt="Demo model photograph"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 560px"
              className="camera-media"
            />
          )}

          <div
            className={cx(
              "beauty-effect",
              `effect-${activeView.product.category}`,
              compare && "beauty-effect-compare",
            )}
            aria-hidden="true"
          />
          {compare && (
            <div
              className="compare-line"
              style={{ left: `${comparePosition}%` }}
              aria-hidden="true"
            >
              <span>With tint</span>
              <i />
              <span>Without</span>
            </div>
          )}
          <div className="camera-vignette" aria-hidden="true" />

          <header className="camera-topbar">
            <span className="live-pill">
              <i />
              {source === "live" ? "Live" : source === "photo" ? "Your photo" : "Demo model"}
            </span>
            <div>
              <button className="icon-button glass" aria-label="Reset preview" onClick={reset}>
                <RotateCcw />
              </button>
              <Link
                className="icon-button glass"
                href={paths.look(look.slug)}
                aria-label={`Close preview and return to ${look.title}`}
              >
                <X />
              </Link>
            </div>
          </header>

          <div className="camera-side-actions">
            <button
              className={cx("camera-action", compare && "active")}
              aria-pressed={compare}
              onClick={() => setCompare((value) => !value)}
            >
              <span>
                <RefreshCcw />
              </span>
              <small>Compare</small>
            </button>
            <button
              className={cx("camera-action", isSaved && "active")}
              aria-pressed={isSaved}
              onClick={() => {
                // One reducer transition: bookmark + history, no lost update.
                dispatchSaved({ type: "saveFromTryOn", lookId: look.id });
                notify(isSaved ? "Already in your saved looks" : "Look saved");
              }}
            >
              <span>
                <Bookmark />
              </span>
              <small>{isSaved ? "Saved" : "Save look"}</small>
            </button>
          </div>

          <div className="camera-lower">
            <div className="try-controls">
              <div className="category-tabs" role="group" aria-label="Product to preview">
                {supported.map(({ view }) => (
                  <button
                    key={view.product.id}
                    className={view.product.id === activeView.product.id ? "active" : undefined}
                    aria-pressed={view.product.id === activeView.product.id}
                    onClick={() => setActiveProductId(view.product.id)}
                  >
                    {view.product.name}
                  </button>
                ))}
              </div>
              <div className="shade-strip" role="group" aria-label={`${activeView.product.name} shades`}>
                {activeView.siblings.map((variant) => (
                  <button
                    key={variant.id}
                    className={cx("shade-chip", variant.id === activeView.variant.id && "active")}
                    aria-pressed={variant.id === activeView.variant.id}
                    aria-label={`${activeView.product.name}, ${variant.shadeName}`}
                    onClick={() =>
                      setShadeByProduct((current) => ({
                        ...current,
                        [activeView.product.id]: variant.id,
                      }))
                    }
                  >
                    <span style={{ background: variant.swatchColor }} />
                    <small>{variant.shadeName}</small>
                  </button>
                ))}
              </div>
              <label className="intensity-control">
                <SlidersHorizontal />
                <span>Intensity</span>
                <input
                  type="range"
                  min="15"
                  max="100"
                  value={intensity}
                  onChange={(event) => setIntensity(Number(event.target.value))}
                />
                <output>{intensity}%</output>
              </label>
            </div>

            {compare && (
              <label className="compare-control">
                <span className="sr-only">Comparison position</span>
                <input
                  type="range"
                  min="8"
                  max="92"
                  value={comparePosition}
                  onChange={(event) => setComparePosition(Number(event.target.value))}
                />
              </label>
            )}

            <div className="capture-row tryon-sources">
              {modes.includes("photo") && (
                <button className="mini-capture-action" onClick={() => begin("photo")}>
                  <ImagePlus />
                  <span>Use a photo</span>
                </button>
              )}
              {modes.includes("live") &&
                (source === "live" || starting ? (
                  <button className="mini-capture-action" onClick={stopCamera}>
                    <X />
                    <span>{starting ? "Cancel" : "Stop camera"}</span>
                  </button>
                ) : (
                  <button className="mini-capture-action" onClick={() => begin("live")}>
                    <Camera />
                    <span>Use camera</span>
                  </button>
                ))}
              <input
                ref={inputRef}
                className="sr-only"
                type="file"
                tabIndex={-1}
                aria-hidden="true"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleUpload}
              />
            </div>

            <button
              className="active-tray"
              onClick={() =>
                openVariant({
                  variantId: activeView.variant.id,
                  lookRevisionId: look.revisionId,
                })
              }
            >
              <span className="tray-swatch" style={{ background: activeView.variant.swatchColor }} />
              <span>
                <small>{isSubstitution ? "Substitute shade — not in this look" : "Showing"}</small>
                <strong>
                  {activeView.product.name} · {activeView.variant.shadeName}
                </strong>
              </span>
              <span className="tray-shop">Shop</span>
            </button>
            <p className="simulation-label">
              <Info />
              <span>{MOCK_PREVIEW_LABEL} Fixed-position tint, one product.</span>
            </p>
          </div>

          {pendingMode && (
            <div className="tryon-consent" role="dialog" aria-modal="false" aria-labelledby="tryon-consent-title">
              <h2 id="tryon-consent-title">
                Before you use your {pendingMode === "live" ? "camera" : "photo"}
              </h2>
              <ul>
                <li>
                  In this demo your {pendingMode === "live" ? "camera feed" : "photo"} stays
                  in this browser tab. It is not uploaded, stored or shared.
                </li>
                <li>
                  You can preview:{" "}
                  {supported.map(({ view }) => view.product.name).join(", ")}.
                </li>
                <li>{MOCK_PREVIEW_LABEL} The tint does not track your face.</li>
              </ul>
              <div>
                <button
                  className="primary-button light"
                  autoFocus
                  onClick={() => {
                    const mode = pendingMode;
                    setConsented(true);
                    setPendingMode(null);
                    if (mode === "live") void startCamera();
                    else inputRef.current?.click();
                  }}
                >
                  Continue
                </button>
                <button className="text-button" onClick={() => setPendingMode(null)}>
                  Not now
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="tryon-below">
          <div role="status" aria-live="polite">
            {message && (
              <p className="camera-message">
                <Info />
                {message}
              </p>
            )}
          </div>
          <div className="tryon-limits tryon-limits-mobile">{limits}</div>
        </div>
      </div>

      <aside className="studio-detail">
        <div className="detail-header">
          <span className="eyebrow">Products in this look</span>
        </div>
        <h2>{look.title}</h2>
        <div className="detail-products">
          {entries.map(({ view }) => (
            <button
              key={view.variant.id}
              className="compact-product"
              onClick={() =>
                openVariant({ variantId: view.variant.id, lookRevisionId: look.revisionId })
              }
            >
              <span
                className="compact-product-art"
                style={{
                  background: `radial-gradient(circle at 38% 28%, #fff8, transparent 22%), ${view.variant.swatchColor}`,
                }}
              >
                <i />
              </span>
              <span>
                <small>
                  {view.brand.name} / {view.variant.shadeName}
                </small>
                <strong>{view.product.name}</strong>
                <em>{view.capability ? "Preview available" : "No preview"}</em>
              </span>
            </button>
          ))}
        </div>
        <Link className="primary-button" href={`${paths.look(look.slug)}#shop`}>
          Shop this look
        </Link>
      </aside>
    </section>
  );
}
