/**
 * Brand registry for the product discovery pipeline.
 * Supports Shopify stores (/products.json) and WordPress/WooCommerce listing page scraping.
 */

export type DiscoverySource = "shopify" | "listing";

export interface BrandConfig {
  /** Brand ID matching the Brand type in the app */
  id: string;
  /** Display name for PR descriptions */
  displayName: string;
  /** Store domain (without protocol) */
  shopifyDomain: string;
  /** How to discover products */
  discoverySource: DiscoverySource;
  /** Whether /products.json endpoint is accessible (Shopify only) */
  productsJsonAvailable: boolean;
  /** How to extract ingredients: "body_html" parses Shopify body, "page" fetches full product page */
  ingredientSource: "body_html" | "page";
  /** CSS selector for ingredient section on product pages (used when ingredientSource is "page") */
  ingredientSelector: string;
  /** Handle patterns to exclude (bundles, sets, gift cards, accessories) */
  excludeHandlePatterns: RegExp[];
  /** Product listing page path for listing-based discovery (e.g. "/product/") */
  listingPath?: string;
  /** CSS selector to find product links on the listing page */
  listingLinkSelector?: string;
  /** URL path pattern to filter product links from listing page */
  productUrlPattern?: RegExp;
}

export const BRANDS: BrandConfig[] = [
  {
    id: "cosrx",
    displayName: "COSRX",
    shopifyDomain: "www.cosrx.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "anua",
    displayName: "Anua",
    shopifyDomain: "anua.us",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /mini/],
  },
  {
    id: "beauty-of-joseon",
    displayName: "Beauty of Joseon",
    shopifyDomain: "beautyofjoseon.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "torriden",
    displayName: "Torriden",
    shopifyDomain: "torriden.us",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "round-lab",
    displayName: "Round Lab",
    shopifyDomain: "roundlab.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /body/],
  },
  {
    id: "skin1004",
    displayName: "SKIN1004",
    shopifyDomain: "skin1004.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "klairs",
    displayName: "Klairs",
    shopifyDomain: "www.klairscosmetics.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "some-by-mi",
    displayName: "Some By Mi",
    shopifyDomain: "somebymi.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /body/],
  },
  {
    id: "innisfree",
    displayName: "Innisfree",
    shopifyDomain: "www.innisfree.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /body/, /hair/, /lip/],
  },
  {
    id: "laneige",
    displayName: "Laneige",
    shopifyDomain: "www.laneige.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /body/, /hair/, /lip/],
  },
  {
    id: "isntree",
    displayName: "Isntree",
    shopifyDomain: "theisntree.com",
    discoverySource: "listing",
    productsJsonAvailable: false,
    ingredientSource: "page",
    ingredientSelector: '[class*="ingredient"], [class*="Ingredient"]',
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
    listingPath: "/category/products/",
    listingLinkSelector: 'a[href*="/isntree-"]',
    productUrlPattern: /\/isntree-[\w-]+\/?$/,
  },
  {
    id: "purito",
    displayName: "Purito",
    shopifyDomain: "purito.com",
    discoverySource: "listing",
    productsJsonAvailable: false,
    ingredientSource: "page",
    ingredientSelector: '[class*="ingredient"], [class*="Ingredient"], .woocommerce-product-details__short-description',
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
    listingPath: "/product/",
    listingLinkSelector: 'a[href*="/product/"]',
    productUrlPattern: /\/product\/[\w-]+\/?/,
  },
  {
    id: "mixsoon",
    displayName: "Mixsoon",
    shopifyDomain: "mixsoon.us",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "medicube",
    displayName: "Medicube",
    shopifyDomain: "medicube.us",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /device/],
  },
  {
    id: "tirtir",
    displayName: "TIRTIR",
    shopifyDomain: "tirtir.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /cushion/, /makeup/],
  },
  {
    id: "numbuzin",
    displayName: "Numbuzin",
    shopifyDomain: "numbuzin.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "biodance",
    displayName: "BioDance",
    shopifyDomain: "biodance.us",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "illiyoon",
    displayName: "Illiyoon",
    shopifyDomain: "global.amoremall.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /body/, /hair/],
  },
  {
    id: "dr-g",
    displayName: "Dr.G",
    shopifyDomain: "drg-global.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "benton",
    displayName: "Benton",
    shopifyDomain: "bentoncosmetic.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "heimish",
    displayName: "Heimish",
    shopifyDomain: "heimish.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "tocobo",
    displayName: "Tocobo",
    shopifyDomain: "tocobo.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "haruharu",
    displayName: "Haruharu Wonder",
    shopifyDomain: "haruharuwonder.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  },
  {
    id: "aestura",
    displayName: "Aestura",
    shopifyDomain: "global.amoremall.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /body/, /hair/],
  },
  {
    id: "mamonde",
    displayName: "Mamonde",
    shopifyDomain: "int.mamonde.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /body/, /hair/, /lip/, /makeup/],
  },
  {
    id: "mediheal",
    displayName: "Mediheal",
    shopifyDomain: "mediheal.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /device/],
  },
  {
    id: "missha",
    displayName: "Missha",
    shopifyDomain: "misshaus.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /makeup/, /cushion/, /foundation/],
  },
  {
    id: "etude",
    displayName: "Etude",
    shopifyDomain: "global.amoremall.com",
    discoverySource: "shopify",
    productsJsonAvailable: true,
    ingredientSource: "body_html",
    ingredientSelector: "",
    excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/, /makeup/, /cushion/, /foundation/, /lip/, /eye/],
  },
];

/** Lookup a brand config by ID. */
export function getBrand(id: string): BrandConfig | undefined {
  return BRANDS.find((b) => b.id === id);
}
