"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Popover } from "@base-ui/react/popover";
import { AppWindowIcon } from "@phosphor-icons/react/dist/csr/AppWindow";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CoinsIcon } from "@phosphor-icons/react/dist/csr/Coins";
import { GameControllerIcon } from "@phosphor-icons/react/dist/csr/GameController";
import { GiftIcon } from "@phosphor-icons/react/dist/csr/Gift";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PaletteIcon } from "@phosphor-icons/react/dist/csr/Palette";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { LUNA_LINKS, type LunaCategory, type LunaLink, type LunaProduct } from "./luna-catalog";

const glyphs = {
  games: GameControllerIcon,
  software: AppWindowIcon,
  subscriptions: ArrowsClockwiseIcon,
  gifts: GiftIcon,
  assets: PaletteIcon,
  topups: CoinsIcon,
};
type NavbarProps = {
  links: typeof LUNA_LINKS;
  categories: LunaCategory[];
  navLinks: LunaLink[];
  products: LunaProduct[];
  portalContainer: RefObject<HTMLDivElement | null>;
};

/** Placeholder mark from Luna's logoipsum-409.svg. Logo license: https://logoipsum.com/license */
function BrandMark() {
  return (
    <svg viewBox="0 0 56 40" aria-hidden="true" focusable="false" className="lh-brand-mark">
      <path
        d="M43 0C50.1797 6.44277e-07 56 5.8203 56 13C56 20.1797 50.1797 26 43 26H34.4844L48.4844 40H31.5156L15.7578 24.2422C14.672 23.1564 14 21.6569 14 20C14 16.6863 16.6863 14 20 14H43C43.5523 14 44 13.5523 44 13C44 12.4477 43.5523 12 43 12H20C15.5817 12 12 15.5817 12 20C12 22.3901 13.0482 24.5347 14.71 26H14.6875L28.6875 40H20C8.95431 40 0 31.0457 0 20C0 8.95431 8.9543 0 20 0H43Z"
        fill="currentColor"
      />
      <path d="M56 28V40H51.3125L39.3125 28H56Z" fill="currentColor" />
    </svg>
  );
}

function CategoryLink({ category, onClick }: { category: LunaCategory; onClick?: () => void }) {
  const Glyph = glyphs[category.icon];
  return (
    <a className="lh-category-link" href={category.href} onClick={onClick}>
      <Glyph size={22} aria-hidden="true" />
      <span>
        <strong>{category.label}</strong>
        <span>{category.description}</span>
      </span>
    </a>
  );
}

function CategoryMenu({
  links,
  categories,
  portalContainer,
}: Pick<NavbarProps, "links" | "categories" | "portalContainer">) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="lh-nav-link" openOnHover delay={150} closeDelay={150}>
        Categories <CaretDownIcon size={12} aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal container={portalContainer}>
        <Popover.Positioner sideOffset={12} align="center" className="lh-positioner">
          <Popover.Popup className="lh-mega lh-glass">
            <div className="lh-mega-links">
              <Popover.Title className="lh-menu-label">Shop by category</Popover.Title>
              <div className="lh-category-grid">
                {categories.map((category) => (
                  <CategoryLink key={category.href} category={category} onClick={close} />
                ))}
              </div>
              <a className="lh-all-categories" href={links.categories} onClick={close}>
                Browse all categories <ArrowRightIcon size={16} aria-hidden="true" />
              </a>
            </div>
            <a className="lh-featured" href={links.store} onClick={close}>
              <div className="lh-featured-art" aria-hidden="true">
                <div className="lh-featured-pixels" />
                <span className="lh-featured-glyph">
                  <GameControllerIcon size={44} weight="fill" />
                </span>
                <span className="lh-featured-caption">Games, ready to play</span>
              </div>
              <strong>
                Your next game, delivered <ArrowRightIcon size={16} aria-hidden="true" />
              </strong>
              <span>Browse digital products and check region details before you buy.</span>
            </a>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Search({ links, categories, navLinks, products, portalContainer }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      )
        return;
      event.preventDefault();
      setQuery("");
      setOpen((value) => !value);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const term = query.trim().toLowerCase();
  const groups = [
    {
      label: "Products",
      items: products.map((p) => ({ ...p, search: `${p.label} ${p.region} ${p.keywords?.join(" ") ?? ""}` })),
    },
    {
      label: "Categories",
      items: categories.map((c) => ({ ...c, region: "", search: `${c.label} ${c.description}` })),
    },
    {
      label: "Pages",
      items: [
        { label: "Browse all products", href: links.store },
        ...navLinks,
        { label: "Sign in", href: links.signIn },
        { label: "Create account", href: links.join },
      ].map((l) => ({ ...l, region: "", search: l.label })),
    },
  ].map((group) => ({
    ...group,
    items: group.items.filter((item) => !term || item.search.toLowerCase().includes(term)),
  }));
  const count = groups.reduce((total, group) => total + group.items.length, 0);

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger
        ref={triggerRef}
        className="lh-search-trigger lh-glass"
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <MagnifyingGlassIcon size={18} aria-hidden="true" />
        <span>Search</span>
        <kbd>Ctrl K</kbd>
      </Dialog.Trigger>
      <Dialog.Portal container={portalContainer}>
        <Dialog.Backdrop className="lh-dialog-backdrop" />
        <Dialog.Popup className="lh-search-dialog" initialFocus={inputRef} finalFocus={triggerRef}>
          <Dialog.Title className="lh-sr-only">Search Luna</Dialog.Title>
          <Dialog.Description className="lh-sr-only">
            Find products, categories and pages. Tab to a result and press Enter to open it.
          </Dialog.Description>
          <div className="lh-search-field">
            <MagnifyingGlassIcon size={20} aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              aria-label="Search products, categories and pages"
              placeholder="Search products, categories and pages..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Dialog.Close className="lh-icon-button" aria-label="Close search">
              <XIcon size={18} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="lh-search-results">
            <p className="lh-sr-only" role="status">
              {count} results
            </p>
            {count === 0 ? (
              <p className="lh-search-empty">No results found. Try a product or category name.</p>
            ) : (
              groups.map((group) =>
                group.items.length > 0 ? (
                  <div key={group.label}>
                    <p className="lh-menu-label">{group.label}</p>
                    {group.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="lh-search-result"
                        onClick={() => changeOpen(false)}
                      >
                        <span>{item.label}</span>
                        {item.region && <span className="lh-region">{item.region}</span>}
                        <ArrowRightIcon size={16} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                ) : null,
              )
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MobileMenu({ links, categories, navLinks, portalContainer }: Omit<NavbarProps, "products">) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="lh-menu-trigger lh-icon-button lh-glass" aria-label="Open navigation menu">
        <ListIcon size={22} aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal container={portalContainer}>
        <Dialog.Backdrop className="lh-dialog-backdrop" />
        <Dialog.Popup className="lh-mobile-menu">
          <div className="lh-mobile-heading">
            <Dialog.Title>Luna</Dialog.Title>
            <Dialog.Close className="lh-icon-button" aria-label="Close navigation menu">
              <XIcon size={22} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="lh-sr-only">Browse Luna's categories and pages.</Dialog.Description>
          <nav aria-label="Mobile navigation" className="lh-mobile-links">
            <p className="lh-menu-label">Categories</p>
            {categories.map((category) => (
              <CategoryLink key={category.href} category={category} onClick={close} />
            ))}
            <a className="lh-all-categories" href={links.categories} onClick={close}>
              Browse all categories <ArrowRightIcon size={16} aria-hidden="true" />
            </a>
            <div className="lh-mobile-pages">
              {navLinks.map((link) => (
                <a className="lh-nav-link" key={link.href} href={link.href} onClick={close}>
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
          <div className="lh-mobile-footer">
            <a className="lh-button" href={links.signIn} onClick={close}>
              Sign In
            </a>
            <a className="lh-button lh-button--outline" href={links.join} onClick={close}>
              Create account
            </a>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Navigation belongs to the hero's container, so it also previews correctly inside an iframe. */
export default function LunaNavbar(props: NavbarProps) {
  return (
    <header className="lh-header">
      <div className="lh-navbar">
        <a className="lh-brand" href={props.links.home} aria-label="Luna home">
          <BrandMark />
          <span>Luna</span>
        </a>
        <nav className="lh-desktop-nav lh-glass" aria-label="Primary navigation">
          <CategoryMenu {...props} />
          {props.navLinks.map((link) => (
            <a key={link.href} className="lh-nav-link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="lh-nav-actions">
          <Search {...props} />
          <a className="lh-button lh-sign-in" href={props.links.signIn}>
            Sign In
          </a>
          <MobileMenu {...props} />
        </div>
      </div>
    </header>
  );
}
