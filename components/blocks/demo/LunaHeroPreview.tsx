"use client";

import LunaHero from "./LunaHero";
import { LUNA_CATEGORIES, LUNA_NAV, LUNA_PRODUCTS } from "./luna-catalog";

/* The catalog below is demo-only. Every preview link has a real in-page destination. */
const categories = LUNA_CATEGORIES.map((category) => ({ ...category, href: `#luna-${category.icon}` }));
const products = LUNA_PRODUCTS.map((product, index) => ({ ...product, href: `#luna-product-${index}` }));
const navLinks = LUNA_NAV.map((link) => ({ ...link, href: `#luna-${link.label.toLowerCase()}` }));
const destinations = [
  {
    id: "luna-products",
    title: "Browse products",
    description: "Sample catalog. Connect the block to your own storefront routes.",
  },
  {
    id: "luna-categories",
    title: "Explore Categories",
    description: "Games, software, subscriptions, gift cards, digital assets and top ups.",
  },
  ...categories.map((category) => ({
    id: category.href.slice(1),
    title: category.label,
    description: category.description,
  })),
  ...products.map((product) => ({
    id: product.href.slice(1),
    title: product.label,
    description: `Sample product. Region: ${product.region}.`,
  })),
  { id: "luna-deals", title: "Deals", description: "A destination for your store's current offers." },
  {
    id: "luna-support",
    title: "Support",
    description: "Contact Luna if a key does not work or you need help with an order.",
  },
  { id: "luna-faq", title: "FAQ", description: "Check the region and platform on the product page before buying." },
  {
    id: "luna-sign-in",
    title: "Sign In",
    description: "Demo destination. Connect this link to your own authentication page.",
  },
  {
    id: "luna-join",
    title: "Create account",
    description: "Demo destination. Connect this link to your own registration page.",
  },
];

export default function LunaHeroPreview() {
  return (
    <div id="luna-top">
      <LunaHero
        links={{
          home: "#luna-top",
          store: "#luna-products",
          categories: "#luna-categories",
          signIn: "#luna-sign-in",
          join: "#luna-join",
        }}
        categories={categories}
        products={products}
        navLinks={navLinks}
      />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px", fontFamily: "Inter, sans-serif" }}>
        <h2>Preview destinations</h2>
        <p>
          These samples keep the navigation usable in this preview. The copied block uses configurable storefront URLs.
        </p>
        {destinations.map((destination) => (
          <section key={destination.id} id={destination.id} style={{ padding: "24px 0", scrollMarginTop: 24 }}>
            <h3>{destination.title}</h3>
            <p>{destination.description}</p>
            <a href="#luna-top">Back to Luna</a>
          </section>
        ))}
      </div>
    </div>
  );
}
