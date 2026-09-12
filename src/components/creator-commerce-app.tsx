"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Check,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Heart,
  ImagePlus,
  LayoutGrid,
  Minus,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  creatorById,
  creators,
  lookById,
  looks,
  productById,
  products,
  type Creator,
  type Look,
  type Product,
} from "@/data/catalog";
import styles from "./creator-commerce-app.module.css";

type View = "feed" | "try" | "bag" | "studio";
type BagState = Record<string, number>;

const feedDetails: Record<
  string,
  { hook: string; views: string; duration: string; sound: string }
> = {
  "soft-signal": {
    hook: "The berry lip combo I use when the brief says effortless.",
    views: "182K",
    duration: "0:24",
    sound: "Amara's studio mix",
  },
  "star-skin": {
    hook: "Keep the freckles. Add the stars. Let skin stay skin.",
    views: "341K",
    duration: "0:31",
    sound: "Inés · original audio",
  },
  "electric-hour": {
    hook: "One electric detail changes the whole face.",
    views: "526K",
    duration: "0:18",
    sound: "Mina's colour theory",
  },
  "heirloom-light": {
    hook: "Modern bridal glow without covering what makes you, you.",
    views: "214K",
    duration: "0:42",
    sound: "Zara · bridal notes",
  },
  "bare-focus": {
    hook: "My five-minute base for real texture and quiet radiance.",
    views: "402K",
    duration: "0:27",
    sound: "Inés · skin first",
  },
  "blue-note": {
    hook: "Midnight blue, but make it soft enough for every day.",
    views: "288K",
    duration: "0:22",
    sound: "Amara's after-dark edit",
  },
  "new-romantic": {
    hook: "Petal tones for people who do not want traditional bridal.",
    views: "167K",
    duration: "0:36",
    sound: "Zara · new romantic",
  },
  "silver-lining": {
    hook: "Statement colour has absolutely no age limit.",
    views: "613K",
    duration: "0:29",
    sound: "Celeste · wear the colour",
  },
};

const DEFAULT_BAG: BagState = {
  "lip-ember": 1,
  "blush-plum": 1,
};

const money = (value: number) => `£${value.toFixed(2)}`;

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function CreatorCommerceApp() {
  const [view, setView] = useState<View>("feed");
  const [onboarding, setOnboarding] = useState(true);
  const [activeLookId, setActiveLookId] = useState(looks[0].id);
  const [bag, setBag] = useState<BagState>(DEFAULT_BAG);
  const [savedLooks, setSavedLooks] = useState<string[]>([
    "star-skin",
    "bare-focus",
  ]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeCreator, setActiveCreator] = useState<Creator | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (window.localStorage.getItem("glowdesk-commerce-onboarding")) {
        setOnboarding(false);
      }
      const storedBag = window.localStorage.getItem("glowdesk-commerce-bag");
      const storedLooks = window.localStorage.getItem(
        "glowdesk-commerce-saved-looks",
      );
      try {
        if (storedBag) setBag(JSON.parse(storedBag) as BagState);
        if (storedLooks) setSavedLooks(JSON.parse(storedLooks) as string[]);
      } catch {
        window.localStorage.removeItem("glowdesk-commerce-bag");
        window.localStorage.removeItem("glowdesk-commerce-saved-looks");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const bagCount = Object.values(bag).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const updateBag = (next: BagState) => {
    setBag(next);
    window.localStorage.setItem("glowdesk-commerce-bag", JSON.stringify(next));
  };

  const addProduct = (product: Product, quantity = 1) => {
    updateBag({
      ...bag,
      [product.id]: (bag[product.id] ?? 0) + quantity,
    });
    setToast(`${product.name} added to your bag`);
  };

  const addLook = (look: Look) => {
    const next = { ...bag };
    look.productIds.forEach((productId) => {
      next[productId] = (next[productId] ?? 0) + 1;
    });
    updateBag(next);
    setToast(`${look.title} added as a complete edit`);
  };

  const toggleSavedLook = (lookId: string) => {
    const next = savedLooks.includes(lookId)
      ? savedLooks.filter((id) => id !== lookId)
      : [lookId, ...savedLooks];
    setSavedLooks(next);
    window.localStorage.setItem(
      "glowdesk-commerce-saved-looks",
      JSON.stringify(next),
    );
  };

  const tryLook = (look: Look) => {
    setActiveLookId(look.id);
    setView("try");
    setToast(`${look.title} is ready to try`);
  };

  const share = async (look: Look) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${look.title} on Glowdesk`,
          text: `Try ${look.title}, a shoppable edit on Glowdesk.`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setToast("Look link copied");
      }
    } catch {
      setToast("Sharing cancelled");
    }
  };

  const dismissOnboarding = () => {
    window.localStorage.setItem("glowdesk-commerce-onboarding", "seen");
    setOnboarding(false);
  };

  return (
    <div className={styles.shell}>
      <DesktopRail view={view} setView={setView} bagCount={bagCount} />
      <MobileHeader
        bagCount={bagCount}
        onBag={() => setView("bag")}
        onStudio={() => setView("studio")}
      />

      <main className={styles.main}>
        {view === "feed" && (
          <CreatorFeed
            savedLooks={savedLooks}
            toggleSaved={toggleSavedLook}
            tryLook={tryLook}
            addLook={addLook}
            openProduct={setActiveProduct}
            openCreator={setActiveCreator}
            share={share}
          />
        )}
        {view === "try" && (
          <TryOnStudio
            activeLookId={activeLookId}
            setActiveLookId={setActiveLookId}
            addProduct={addProduct}
            addLook={addLook}
            openProduct={setActiveProduct}
            openCreator={setActiveCreator}
            notify={setToast}
            onBack={() => setView("feed")}
          />
        )}
        {view === "bag" && (
          <ShoppingBagView
            bag={bag}
            updateBag={updateBag}
            openProduct={setActiveProduct}
            continueShopping={() => setView("feed")}
            notify={setToast}
          />
        )}
        {view === "studio" && (
          <CreatorStudio
            openProduct={setActiveProduct}
            previewLook={(look) => {
              setActiveLookId(look.id);
              setView("try");
            }}
            notify={setToast}
          />
        )}
      </main>

      <MobileNav
        view={view}
        setView={setView}
        bagCount={bagCount}
      />

      {activeProduct && (
        <ProductDrawer
          product={activeProduct}
          close={() => setActiveProduct(null)}
          addProduct={(product) => {
            addProduct(product);
            setActiveProduct(null);
          }}
          tryProduct={(product) => {
            const matchingLook = looks.find((look) =>
              look.productIds.includes(product.id),
            );
            if (matchingLook) setActiveLookId(matchingLook.id);
            setActiveProduct(null);
            setView("try");
          }}
          openCreator={(creator) => {
            setActiveProduct(null);
            setActiveCreator(creator);
          }}
        />
      )}

      {activeCreator && (
        <CreatorDrawer
          creator={activeCreator}
          close={() => setActiveCreator(null)}
          tryLook={(look) => {
            setActiveCreator(null);
            tryLook(look);
          }}
          addLook={(look) => {
            setActiveCreator(null);
            addLook(look);
          }}
        />
      )}

      {onboarding && <CommerceOnboarding dismiss={dismissOnboarding} />}

      <div
        className={classNames(styles.toast, toast && styles.toastVisible)}
        role="status"
        aria-live="polite"
      >
        <Sparkles />
        {toast}
      </div>
    </div>
  );
}

function DesktopRail({
  view,
  setView,
  bagCount,
}: {
  view: View;
  setView: (view: View) => void;
  bagCount: number;
}) {
  return (
    <aside className={styles.desktopRail}>
      <button
        className={styles.wordmark}
        onClick={() => setView("feed")}
        aria-label="Glowdesk creator feed"
      >
        glow<span>desk</span>
      </button>
      <nav aria-label="Primary navigation">
        <NavItem
          icon={<Play />}
          label="Feed"
          active={view === "feed"}
          onClick={() => setView("feed")}
        />
        <NavItem
          icon={<WandSparkles />}
          label="Try"
          active={view === "try"}
          onClick={() => setView("try")}
        />
        <NavItem
          icon={<ShoppingBag />}
          label="Bag"
          active={view === "bag"}
          badge={bagCount}
          onClick={() => setView("bag")}
        />
        <NavItem
          icon={<LayoutGrid />}
          label="Studio"
          active={view === "studio"}
          onClick={() => setView("studio")}
        />
      </nav>
      <button
        className={styles.railAvatar}
        onClick={() => setView("studio")}
        aria-label="Open creator studio"
      >
        <Image src={creators[0].image} alt="" width={46} height={46} />
      </button>
    </aside>
  );
}

function MobileHeader({
  bagCount,
  onBag,
  onStudio,
}: {
  bagCount: number;
  onBag: () => void;
  onStudio: () => void;
}) {
  return (
    <header className={styles.mobileHeader}>
      <button className={styles.mobileBrand} aria-label="Glowdesk feed">
        glow<span>desk</span>
        <small>beta</small>
      </button>
      <div>
        <button aria-label="Search creators and looks">
          <Search />
        </button>
        <button aria-label="Open shopping bag" onClick={onBag}>
          <ShoppingBag />
          {bagCount > 0 && <span>{bagCount}</span>}
        </button>
        <button aria-label="Open creator studio" onClick={onStudio}>
          <Image src={creators[0].image} alt="" width={32} height={32} />
        </button>
      </div>
    </header>
  );
}

function MobileNav({
  view,
  setView,
  bagCount,
}: {
  view: View;
  setView: (view: View) => void;
  bagCount: number;
}) {
  return (
    <nav className={styles.mobileNav} aria-label="Primary navigation">
      <NavItem
        icon={<Play />}
        label="Feed"
        active={view === "feed"}
        onClick={() => setView("feed")}
      />
      <NavItem
        icon={<WandSparkles />}
        label="Try"
        active={view === "try"}
        onClick={() => setView("try")}
      />
      <button
        className={styles.cameraNav}
        onClick={() => setView("try")}
        aria-label="Open virtual try-on"
      >
        <Camera />
      </button>
      <NavItem
        icon={<ShoppingBag />}
        label="Bag"
        active={view === "bag"}
        badge={bagCount}
        onClick={() => setView("bag")}
      />
      <NavItem
        icon={<LayoutGrid />}
        label="Studio"
        active={view === "studio"}
        onClick={() => setView("studio")}
      />
    </nav>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      className={classNames(styles.navItem, active && styles.navItemActive)}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      <span>
        {icon}
        {Boolean(badge) && <em>{badge}</em>}
      </span>
      <small>{label}</small>
    </button>
  );
}

function CreatorFeed({
  savedLooks,
  toggleSaved,
  tryLook,
  addLook,
  openProduct,
  openCreator,
  share,
}: {
  savedLooks: string[];
  toggleSaved: (lookId: string) => void;
  tryLook: (look: Look) => void;
  addLook: (look: Look) => void;
  openProduct: (product: Product) => void;
  openCreator: (creator: Creator) => void;
  share: (look: Look) => Promise<void>;
}) {
  const [playingId, setPlayingId] = useState(looks[0].id);
  const [filter, setFilter] = useState("For you");
  const filters = ["For you", "Following", "Fresh skin", "Statement", "Bridal"];
  const visibleLooks =
    filter === "Bridal"
      ? looks.filter((look) => look.mood === "Bridal")
      : filter === "Statement"
        ? looks.filter((look) =>
            ["Bold", "Editorial"].includes(look.mood),
          )
        : looks;

  return (
    <section className={styles.feedPage}>
      <div className={styles.feedIntro}>
        <div>
          <p className={styles.eyebrow}>Beauty, demonstrated</p>
          <h1>See it. Try it.<br />Make it yours.</h1>
        </div>
        <p>
          Creator-made beauty looks you can wear virtually and shop product by
          product.
        </p>
      </div>

      <div className={styles.creatorStories} aria-label="Featured creators">
        {creators.map((creator, index) => (
          <button key={creator.id} onClick={() => openCreator(creator)}>
            <span className={index < 3 ? styles.storyNew : undefined}>
              <Image src={creator.image} alt="" width={62} height={62} />
            </span>
            <small>{creator.name.split(" ")[0]}</small>
          </button>
        ))}
      </div>

      <div className={styles.feedFilters} aria-label="Filter creator feed">
        {filters.map((item) => (
          <button
            key={item}
            className={filter === item ? styles.active : undefined}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className={styles.videoFeed}>
        {visibleLooks.map((look) => {
          const creator = creatorById(look.creatorId) ?? creators[0];
          const lookProducts = look.productIds
            .map(productById)
            .filter((product): product is Product => Boolean(product));
          const total = lookProducts.reduce(
            (sum, product) => sum + product.price,
            0,
          );
          const details = feedDetails[look.id];
          const isPlaying = playingId === look.id;

          return (
            <article className={styles.videoCard} key={look.id}>
              <Image
                src={look.image}
                alt={`${look.title} demonstrated by ${creator.name}`}
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1199px) 65vw, 620px"
                priority={look.id === looks[0].id}
              />
              <div className={styles.videoTint} style={{ "--look-tint": look.tint } as CSSProperties} />
              <div className={styles.videoShade} />

              <div className={styles.videoTopline}>
                <span><Zap /> Shoppable demo</span>
                <button aria-label="More options"><MoreHorizontal /></button>
              </div>

              <button
                className={styles.playControl}
                onClick={() => setPlayingId(isPlaying ? "" : look.id)}
                aria-label={isPlaying ? "Pause demo" : "Play demo"}
              >
                {isPlaying ? <Pause /> : <Play />}
              </button>

              <div className={styles.videoActions}>
                <button
                  onClick={() => toggleSaved(look.id)}
                  aria-label={
                    savedLooks.includes(look.id)
                      ? `Unsave ${look.title}`
                      : `Save ${look.title}`
                  }
                >
                  <span><Heart className={savedLooks.includes(look.id) ? styles.filled : undefined} /></span>
                  <small>{look.savedCount}</small>
                </button>
                <button onClick={() => void share(look)} aria-label={`Share ${look.title}`}>
                  <span><Share2 /></span>
                  <small>Share</small>
                </button>
                <button onClick={() => addLook(look)} aria-label={`Add ${look.title} products to bag`}>
                  <span><ShoppingBag /></span>
                  <small>{money(total)}</small>
                </button>
              </div>

              <div className={styles.videoContent}>
                <button
                  className={styles.creatorIdentity}
                  onClick={() => openCreator(creator)}
                >
                  <Image src={creator.image} alt="" width={46} height={46} />
                  <span>
                    <strong>{creator.handle} <BadgeCheck /></strong>
                    <small>{details.sound}</small>
                  </span>
                  <em>Follow</em>
                </button>
                <p>{details.hook}</p>
                <div className={styles.videoMeta}>
                  <span><Eye /> {details.views}</span>
                  <span>{details.duration}</span>
                  <span>{look.mood}</span>
                </div>

                <div className={styles.taggedProducts}>
                  {lookProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => openProduct(product)}
                    >
                      <i style={{ background: product.shadeColor }} />
                      <span>
                        <small>{product.brand}</small>
                        <strong>{product.name}</strong>
                      </span>
                      <em>£{product.price}</em>
                    </button>
                  ))}
                </div>

                <div className={styles.videoCtas}>
                  <button onClick={() => tryLook(look)}>
                    <WandSparkles />
                    Try this look
                  </button>
                  <button onClick={() => addLook(look)}>
                    <ShoppingBag />
                    Add edit · {money(total)}
                  </button>
                </div>
              </div>

              <div
                className={classNames(
                  styles.videoProgress,
                  isPlaying && styles.videoProgressPlaying,
                )}
              >
                <span />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TryOnStudio({
  activeLookId,
  setActiveLookId,
  addProduct,
  addLook,
  openProduct,
  openCreator,
  notify,
  onBack,
}: {
  activeLookId: string;
  setActiveLookId: (lookId: string) => void;
  addProduct: (product: Product) => void;
  addLook: (look: Look) => void;
  openProduct: (product: Product) => void;
  openCreator: (creator: Creator) => void;
  notify: (message: string) => void;
  onBack: () => void;
}) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(68);
  const [compare, setCompare] = useState(false);
  const [mapping, setMapping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeLook = lookById(activeLookId) ?? looks[0];
  const creator = creatorById(activeLook.creatorId) ?? creators[0];
  const lookProducts = activeLook.productIds
    .map(productById)
    .filter((product): product is Product => Boolean(product));
  const total = lookProducts.reduce((sum, product) => sum + product.price, 0);

  const chooseLook = (look: Look) => {
    setMapping(true);
    window.setTimeout(() => {
      setActiveLookId(look.id);
      setMapping(false);
      notify(`${look.title} mapped to your preview`);
    }, 700);
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(URL.createObjectURL(file));
    setMapping(true);
    window.setTimeout(() => {
      setMapping(false);
      notify("Your image is ready — nothing was uploaded");
    }, 900);
  };

  useEffect(
    () => () => {
      if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    },
    [uploadedImage],
  );

  const tryStyle = {
    "--try-tint": activeLook.tint,
    "--try-opacity": intensity / 130,
  } as CSSProperties;

  return (
    <section className={styles.tryPage}>
      <div className={styles.tryCopy}>
        <button className={styles.backLink} onClick={onBack}>
          <ArrowLeft /> Back to feed
        </button>
        <p className={styles.eyebrow}>Virtual beauty studio</p>
        <h1>Wear the<br />whole idea.</h1>
        <p>
          Try a creator&apos;s complete edit, tune the intensity, then shop the
          exact products they tagged.
        </p>
        <div className={styles.tryTrust}>
          <span><Check /> Your uploaded image stays on this device</span>
          <span><Sparkles /> Visual preview — shade results can vary</span>
        </div>
      </div>

      <div className={styles.tryPhone} style={tryStyle}>
        <Image
          src={uploadedImage ?? activeLook.image}
          alt={
            uploadedImage
              ? "Your locally uploaded image with virtual makeup"
              : `${activeLook.title} virtual try-on model`
          }
          fill
          priority
          sizes="(max-width: 767px) 100vw, 520px"
        />
        <div
          className={classNames(
            styles.tryEffect,
            compare && styles.tryEffectCompare,
          )}
        />
        <div className={styles.tryVignette} />
        <header className={styles.tryTopbar}>
          <span><i /> {uploadedImage ? "Your photo" : "Creator demo"}</span>
          <button onClick={() => setCompare((value) => !value)}>
            {compare ? "After" : "Compare"}
          </button>
        </header>

        <div className={styles.tryLookIdentity}>
          <button onClick={() => openCreator(creator)}>
            <Image src={creator.image} alt="" width={42} height={42} />
            <span>
              <small>{creator.handle}</small>
              <strong>{activeLook.title}</strong>
            </span>
          </button>
          <span>{activeLook.mood} edit</span>
        </div>

        <div className={styles.tryControls}>
          <div className={styles.lookCarousel}>
            {looks.map((look) => (
              <button
                key={look.id}
                className={look.id === activeLook.id ? styles.active : undefined}
                onClick={() => chooseLook(look)}
                aria-label={`Try ${look.title}`}
              >
                <Image src={look.image} alt="" fill sizes="64px" />
              </button>
            ))}
          </div>
          <label className={styles.intensity}>
            <span>Look intensity</span>
            <input
              type="range"
              min="15"
              max="100"
              value={intensity}
              onChange={(event) => setIntensity(Number(event.target.value))}
            />
            <output>{intensity}%</output>
          </label>
          <div className={styles.tryButtons}>
            <button onClick={() => inputRef.current?.click()}>
              <ImagePlus />
              Upload selfie
            </button>
            <input
              ref={inputRef}
              className={styles.visuallyHidden}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleUpload}
            />
            <button onClick={() => addLook(activeLook)}>
              <ShoppingBag />
              Add edit · {money(total)}
            </button>
          </div>
        </div>

        {mapping && (
          <div className={styles.mappingState} role="status">
            <div><i /><i /><i /></div>
            <strong>Mapping creator&apos;s edit</strong>
            <span>Matching placement and intensity</span>
          </div>
        )}
      </div>

      <aside className={styles.tryProducts}>
        <p className={styles.eyebrow}>Products in this edit</p>
        <h2>{activeLook.title}</h2>
        <p>{activeLook.caption}</p>
        <div>
          {lookProducts.map((product) => (
            <article key={product.id}>
              <button
                className={styles.productSwatch}
                style={{ background: product.shadeColor }}
                onClick={() => openProduct(product)}
                aria-label={`View ${product.name}`}
              />
              <button
                className={styles.productCopy}
                onClick={() => openProduct(product)}
              >
                <small>{product.brand} · {product.shade}</small>
                <strong>{product.name}</strong>
                <span>£{product.price}</span>
              </button>
              <button
                className={styles.quickAdd}
                onClick={() => addProduct(product)}
                aria-label={`Add ${product.name} to bag`}
              >
                <Plus />
              </button>
            </article>
          ))}
        </div>
        <button className={styles.primaryAction} onClick={() => addLook(activeLook)}>
          <ShoppingBag /> Shop the complete look · {money(total)}
        </button>
        <small className={styles.disclosure}>
          {creator.name} may earn commission from purchases attributed to this
          edit. Demo checkout only.
        </small>
      </aside>
    </section>
  );
}

function ShoppingBagView({
  bag,
  updateBag,
  openProduct,
  continueShopping,
  notify,
}: {
  bag: BagState;
  updateBag: (bag: BagState) => void;
  openProduct: (product: Product) => void;
  continueShopping: () => void;
  notify: (message: string) => void;
}) {
  const items = Object.entries(bag)
    .map(([productId, quantity]) => {
      const product = productById(productId);
      return product ? { product, quantity } : null;
    })
    .filter(
      (
        item,
      ): item is {
        product: Product;
        quantity: number;
      } => Boolean(item),
    );
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const creatorEarnings = subtotal * 0.08;

  const setQuantity = (productId: string, quantity: number) => {
    const next = { ...bag };
    if (quantity <= 0) delete next[productId];
    else next[productId] = quantity;
    updateBag(next);
  };

  return (
    <section className={styles.bagPage}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Your beauty bag</p>
          <h1>From their edit<br />to your shelf.</h1>
        </div>
        <div className={styles.bagCount}>
          <strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
          <span>items</span>
        </div>
      </header>

      {items.length ? (
        <div className={styles.bagLayout}>
          <div className={styles.bagItems}>
            <div className={styles.creatorCredit}>
              <Image src={creators[0].image} alt="" width={54} height={54} />
              <span>
                <small>Creator attribution active</small>
                <strong>Shopping Amara&apos;s recommendations</strong>
                <em>Your price stays the same.</em>
              </span>
              <BadgeCheck />
            </div>
            {items.map(({ product, quantity }) => {
              const creator = product.creatorId
                ? creatorById(product.creatorId)
                : undefined;
              return (
                <article className={styles.bagItem} key={product.id}>
                  <button
                    className={styles.bagArt}
                    onClick={() => openProduct(product)}
                    style={{
                      "--product-colour": product.shadeColor,
                    } as CSSProperties}
                    aria-label={`View ${product.name}`}
                  >
                    <i />
                  </button>
                  <button
                    className={styles.bagProductCopy}
                    onClick={() => openProduct(product)}
                  >
                    <small>{product.brand}</small>
                    <strong>{product.name}</strong>
                    <span>{product.shade}</span>
                    {creator && <em>via {creator.name}</em>}
                  </button>
                  <strong className={styles.linePrice}>
                    {money(product.price * quantity)}
                  </strong>
                  <div className={styles.quantity}>
                    <button
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      aria-label={`Decrease ${product.name} quantity`}
                    >
                      {quantity === 1 ? <Trash2 /> : <Minus />}
                    </button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      aria-label={`Increase ${product.name} quantity`}
                    >
                      <Plus />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className={styles.orderSummary}>
            <p className={styles.eyebrow}>Order summary · demo</p>
            <h2>Your edit</h2>
            <dl>
              <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
              <div><dt>Estimated delivery</dt><dd>Free</dd></div>
              <div><dt>Creator commission</dt><dd>Included</dd></div>
              <div><dt>Total</dt><dd>{money(subtotal)}</dd></div>
            </dl>
            <button
              className={styles.primaryAction}
              onClick={() =>
                notify("Checkout handoff previewed — no payment taken")
              }
            >
              Checkout securely <ChevronRight />
            </button>
            <div className={styles.commissionCard}>
              <CircleDollarSign />
              <span>
                <strong>{money(creatorEarnings)} supports creators</strong>
                <small>
                  Estimated commission shared across attributed creators.
                </small>
              </span>
            </div>
            <p>
              A live version would connect participating brand or retailer
              inventory before offering one checkout.
            </p>
          </aside>
        </div>
      ) : (
        <div className={styles.emptyBag}>
          <ShoppingBag />
          <h2>Your next look is waiting.</h2>
          <p>Explore creator demos, try an edit, then add its exact products.</p>
          <button className={styles.primaryAction} onClick={continueShopping}>
            Discover shoppable looks
          </button>
        </div>
      )}
    </section>
  );
}

function CreatorStudio({
  openProduct,
  previewLook,
  notify,
}: {
  openProduct: (product: Product) => void;
  previewLook: (look: Look) => void;
  notify: (message: string) => void;
}) {
  const [selectedLookId, setSelectedLookId] = useState(looks[0].id);
  const [taggedProducts, setTaggedProducts] = useState<string[]>(
    looks[0].productIds,
  );
  const [caption, setCaption] = useState(
    "The soft berry edit I reach for when you want impact without a heavy base.",
  );
  const [published, setPublished] = useState(false);
  const selectedLook = lookById(selectedLookId) ?? looks[0];

  const selectLook = (look: Look) => {
    setSelectedLookId(look.id);
    setTaggedProducts(look.productIds);
    setPublished(false);
  };

  return (
    <section className={styles.studioPage}>
      <header className={styles.studioHeader}>
        <div>
          <p className={styles.eyebrow}>Creator Studio · demo</p>
          <h1>Make the look.<br />Tag the shelf.</h1>
          <p>
            Publish beauty people can watch, wear virtually, and shop without
            losing your attribution.
          </p>
        </div>
        <div className={styles.studioProfile}>
          <Image src={creators[0].image} alt="" width={64} height={64} />
          <span>
            <small>Creator account</small>
            <strong>{creators[0].name} <BadgeCheck /></strong>
            <em>{creators[0].handle}</em>
          </span>
          <button onClick={() => notify("Public creator storefront previewed")}>
            View storefront <ChevronRight />
          </button>
        </div>
      </header>

      <div className={styles.creatorMetrics}>
        <article>
          <Eye />
          <span><strong>1.8M</strong> look views</span>
          <small>+18% this month</small>
        </article>
        <article>
          <WandSparkles />
          <span><strong>46.2K</strong> virtual tries</span>
          <small>2.6% of viewers</small>
        </article>
        <article>
          <ShoppingBag />
          <span><strong>3,284</strong> product clicks</span>
          <small>7.1% of try-ons</small>
        </article>
        <article>
          <CircleDollarSign />
          <span><strong>£2,406</strong> est. earnings</span>
          <small>pending attribution</small>
        </article>
      </div>

      <div className={styles.studioGrid}>
        <section className={styles.publishPanel}>
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>New shoppable demo</p>
              <h2>Build your post</h2>
            </div>
            <span className={published ? styles.published : undefined}>
              {published ? <Check /> : <i />} {published ? "Published" : "Draft"}
            </span>
          </div>

          <div className={styles.demoBuilder}>
            <div className={styles.uploadPreview}>
              <Image
                src={selectedLook.image}
                alt={`Preview of ${selectedLook.title}`}
                fill
                sizes="(max-width: 767px) 100vw, 420px"
              />
              <span><Play /> 0:24</span>
              <button onClick={() => notify("Video picker previewed")}>
                <Upload /> Replace demo
              </button>
            </div>
            <div className={styles.builderFields}>
              <label>
                Demo caption
                <textarea
                  value={caption}
                  rows={4}
                  onChange={(event) => setCaption(event.target.value)}
                />
              </label>
              <fieldset>
                <legend>Virtual look</legend>
                <div className={styles.lookPicker}>
                  {looks.slice(0, 5).map((look) => (
                    <button
                      type="button"
                      key={look.id}
                      className={
                        look.id === selectedLook.id ? styles.active : undefined
                      }
                      onClick={() => selectLook(look)}
                    >
                      <Image src={look.image} alt="" fill sizes="70px" />
                      <span>{look.title}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className={styles.productTagger}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Product tags</p>
                <h3>{taggedProducts.length} products in this look</h3>
              </div>
              <button onClick={() => notify("Catalog search previewed")}>
                <Search /> Search catalog
              </button>
            </div>
            <div>
              {products.slice(0, 9).map((product) => {
                const selected = taggedProducts.includes(product.id);
                return (
                  <button
                    type="button"
                    key={product.id}
                    className={selected ? styles.active : undefined}
                    onClick={() =>
                      setTaggedProducts((current) =>
                        selected
                          ? current.filter((id) => id !== product.id)
                          : [...current, product.id],
                      )
                    }
                    aria-pressed={selected}
                  >
                    <i style={{ background: product.shadeColor }} />
                    <span>
                      <strong>{product.name}</strong>
                      <small>{product.brand} · £{product.price}</small>
                    </span>
                    {selected ? <Check /> : <Plus />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.publishActions}>
            <button
              onClick={() => previewLook(selectedLook)}
            >
              Preview virtual look
            </button>
            <button
              disabled={!caption || !taggedProducts.length}
              onClick={() => {
                setPublished(true);
                notify("Shoppable demo published to your profile");
              }}
            >
              <Sparkles /> Publish shoppable demo
            </button>
          </div>
          <p className={styles.disclosure}>
            Product tags keep creator attribution attached through try-on and
            checkout handoff. Earnings and publishing are mocked.
          </p>
        </section>

        <aside className={styles.contentPanel}>
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Your content</p>
              <h2>Top shoppable looks</h2>
            </div>
            <button aria-label="Content filters"><MoreHorizontal /></button>
          </div>
          <div className={styles.contentList}>
            {looks
              .filter((look) => look.creatorId === creators[0].id)
              .map((look, index) => (
                <article key={look.id}>
                  <button onClick={() => previewLook(look)}>
                    <Image src={look.image} alt="" fill sizes="100px" />
                    <Play />
                  </button>
                  <span>
                    <small>{index === 0 ? "Trending" : "Published"}</small>
                    <strong>{look.title}</strong>
                    <em>{feedDetails[look.id].views} views · {look.savedCount} saves</em>
                  </span>
                  <button
                    onClick={() => {
                      const firstProduct = productById(look.productIds[0]);
                      if (firstProduct) openProduct(firstProduct);
                    }}
                    aria-label={`View products tagged in ${look.title}`}
                  >
                    {look.productIds.length}
                    <ShoppingBag />
                  </button>
                </article>
              ))}
          </div>
          <div className={styles.storeHealth}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Store health</p>
                <h3>Ready to earn</h3>
              </div>
              <span>82%</span>
            </div>
            <ul>
              <li><Check /> Creator profile complete</li>
              <li><Check /> 6 approved brands connected</li>
              <li><Check /> Affiliate disclosure active</li>
              <li><i /> Connect payout details</li>
            </ul>
            <button onClick={() => notify("Payout setup previewed")}>
              Finish store setup <ChevronRight />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ProductDrawer({
  product,
  close,
  addProduct,
  tryProduct,
  openCreator,
}: {
  product: Product;
  close: () => void;
  addProduct: (product: Product) => void;
  tryProduct: (product: Product) => void;
  openCreator: (creator: Creator) => void;
}) {
  const creator = product.creatorId
    ? creatorById(product.creatorId)
    : undefined;

  return (
    <Drawer title="Shoppable product" close={close}>
      <div className={styles.productDrawer}>
        <div
          className={styles.productHero}
          style={{ "--product-colour": product.shadeColor } as CSSProperties}
        >
          <span>{product.brand}</span>
          <i><em>{product.name}</em></i>
          <small>Fictional product · demo only</small>
        </div>
        <div className={styles.productDetails}>
          <p className={styles.eyebrow}>{product.brand}</p>
          <h2>{product.name}</h2>
          <div className={styles.productRating}>
            <span>★ {product.rating}</span>
            <span>{product.reviews} reviews</span>
            <strong>£{product.price}</strong>
          </div>
          <p>{product.description}</p>
          <div className={styles.productBenefit}>
            <Sparkles />
            <span><small>Creator note</small><strong>{product.benefit}</strong></span>
          </div>
          <div className={styles.selectedShade}>
            <span>Shade <strong>{product.shade}</strong></span>
            <i style={{ background: product.shadeColor }} />
          </div>
          {creator && (
            <button
              className={styles.attribution}
              onClick={() => openCreator(creator)}
            >
              <Image src={creator.image} alt="" width={44} height={44} />
              <span>
                <small>Tagged by</small>
                <strong>{creator.name} <BadgeCheck /></strong>
              </span>
              <ChevronRight />
            </button>
          )}
          <div className={styles.drawerActions}>
            <button onClick={() => tryProduct(product)}>
              <WandSparkles /> Try it
            </button>
            <button onClick={() => addProduct(product)}>
              <ShoppingBag /> Add to bag · £{product.price}
            </button>
          </div>
          <small className={styles.disclosure}>
            Creator affiliate attribution is disclosed and remains attached to
            this product. Checkout is mocked.
          </small>
        </div>
      </div>
    </Drawer>
  );
}

function CreatorDrawer({
  creator,
  close,
  tryLook,
  addLook,
}: {
  creator: Creator;
  close: () => void;
  tryLook: (look: Look) => void;
  addLook: (look: Look) => void;
}) {
  const creatorLooks = looks.filter((look) => look.creatorId === creator.id);

  return (
    <Drawer title="Creator storefront" close={close}>
      <div className={styles.creatorDrawer}>
        <header>
          <Image src={creator.image} alt={creator.name} width={96} height={96} />
          <div>
            <p className={styles.eyebrow}>Glowdesk creator</p>
            <h2>{creator.name} <BadgeCheck /></h2>
            <span>{creator.handle}</span>
          </div>
          <button>Follow</button>
        </header>
        <p>{creator.bio}</p>
        <div className={styles.creatorStats}>
          <span><strong>{creator.followers}</strong> followers</span>
          <span><strong>{creatorLooks.length}</strong> shoppable looks</span>
          <span><strong>4.9</strong> community rating</span>
        </div>
        <div className={styles.creatorSpecialty}>
          <Sparkles /> {creator.specialty}
        </div>
        <div className={styles.creatorLooks}>
          {creatorLooks.map((look) => {
            const lookProducts = look.productIds
              .map(productById)
              .filter((product): product is Product => Boolean(product));
            const total = lookProducts.reduce(
              (sum, product) => sum + product.price,
              0,
            );
            return (
              <article key={look.id}>
                <div>
                  <Image src={look.image} alt={look.title} fill sizes="260px" />
                  <span><Play /> {feedDetails[look.id].duration}</span>
                </div>
                <small>{look.mood}</small>
                <h3>{look.title}</h3>
                <p>{look.caption}</p>
                <div>
                  <button onClick={() => tryLook(look)}>
                    <WandSparkles /> Try
                  </button>
                  <button onClick={() => addLook(look)}>
                    <ShoppingBag /> {money(total)}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
}

function Drawer({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const first = drawerRef.current?.querySelector<HTMLElement>("button");
    first?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  return (
    <div className={styles.drawerLayer}>
      <div className={styles.drawerBackdrop} onClick={close} aria-hidden="true" />
      <section
        ref={drawerRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <span>{title}</span>
          <button onClick={close} aria-label={`Close ${title}`}>
            <X />
          </button>
        </header>
        <div className={styles.drawerBody}>{children}</div>
      </section>
    </div>
  );
}

function CommerceOnboarding({ dismiss }: { dismiss: () => void }) {
  return (
    <section className={styles.onboarding}>
      <div className={styles.onboardingVisual}>
        <Image
          src="/images/look-starlight.jpg"
          alt="Editorial makeup creator demonstrating a shoppable look"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 56vw"
        />
        <div />
        <header>
          <span className={styles.wordmark}>glow<span>desk</span></span>
          <button onClick={dismiss}>Skip</button>
        </header>
        <div className={styles.onboardingCreator}>
          <Image src={creators[2].image} alt="" width={46} height={46} />
          <span>
            <small>{creators[2].handle}</small>
            <strong>Star Skin tutorial</strong>
          </span>
          <Play />
        </div>
      </div>
      <div className={styles.onboardingCopy}>
        <p className={styles.eyebrow}>Watch · wear · shop</p>
        <h1>Beauty inspiration that leaves the screen.</h1>
        <p>
          Watch creators build the look, try their edit on your own face, then
          shop every product with credit kept where it belongs.
        </p>
        <div className={styles.onboardingLoop}>
          <span><Play /> Watch the demo</span>
          <i />
          <span><WandSparkles /> Try the look</span>
          <i />
          <span><ShoppingBag /> Shop the edit</span>
        </div>
        <button onClick={dismiss}>
          Enter the creator feed <ChevronRight />
        </button>
        <small>Frontend concept · products, checkout, and earnings are mocked.</small>
      </div>
    </section>
  );
}
