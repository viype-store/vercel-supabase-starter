export const serviceTabs = [
  {
    id: "player-top-up",
    label: "شحن كلاعب طبيعي",
    eyebrow: "Player Top-Up",
    summary: "VP bundles for regular buyers who want fast handling and clear delivery steps.",
  },
  {
    id: "reseller-top-up",
    label: "شحن كـ Reseller",
    eyebrow: "Reseller Desk",
    summary: "Bulk-ready offers for repeat buyers and resellers who need larger volume lanes.",
  },
  {
    id: "bundle-gift",
    label: "قيفت للبندل",
    eyebrow: "Bundle Gifting",
    summary: "Manual bundle gifting flow with account checks, receipt review, and protected follow-up.",
  },
];

export const promoChips = [
  "VALORANT Points",
  "Night Market Ready",
  "Receipt Upload",
  "Ticket System",
  "Direct Chat",
  "Reseller Packs",
  "Bundle Gifts",
  "Manual Review",
];

export const trustCards = [
  {
    title: "Receipt-First Review",
    text: "Every payment flow is tied to a proof upload so you can review manually before fulfillment starts.",
  },
  {
    title: "In-Site Support",
    text: "Customers can open tickets, continue direct chat, and follow order updates without leaving the site.",
  },
  {
    title: "Operator Control",
    text: "Orders, receipts, ticket threads, and future staff replies all live in one Supabase-backed workflow.",
  },
];

export const highlightCards = [
  {
    title: "Marketplace Energy",
    text: "The layout borrows the dense, category-rich feel of top gaming marketplaces while staying focused on VALORANT.",
  },
  {
    title: "Localized Checkout",
    text: "BaridiMob, CCP, and Flexy are presented as first-class payment options with the +35% fee shown clearly.",
  },
  {
    title: "Trust Before Hype",
    text: "The strongest visual signals on the page are protection, clarity, support response, and payment proof handling.",
  },
];

export const paymentMethods = [
  {
    id: "baridi-mob",
    label: "BaridiMob",
    helper: "Mobile payment with manual receipt verification.",
    eta: "Fastest for same-day review",
    multiplier: 1.35,
  },
  {
    id: "ccp",
    label: "CCP",
    helper: "Classic postal payment flow with uploaded receipt required.",
    eta: "Strong fit for standard orders",
    multiplier: 1.35,
  },
  {
    id: "flexy",
    label: "Flexy",
    helper: "Counter-based payment lane for users who prefer offline top-ups.",
    eta: "Works well for bundle and reseller requests",
    multiplier: 1.35,
  },
];

export const supportModes = [
  {
    id: "ticket",
    label: "Ticket",
    text: "Best for order disputes, missing details, or multi-step support.",
  },
  {
    id: "direct-chat",
    label: "Direct Chat",
    text: "Best for fast back-and-forth after payment or during fulfillment.",
  },
];

export const catalogByService = {
  "player-top-up": [
    {
      sku: "vp-475",
      title: "475 VP",
      badge: "Quick Top-Up",
      basePriceDzd: 1100,
      delivery: "5-15 min after receipt review",
      lane: "Solo players",
      note: "For small cosmetics, battle pass gaps, or urgent top-up requests.",
      bullets: ["Manual proof review", "Fits first-time buyers", "Good for low-risk orders"],
    },
    {
      sku: "vp-1000",
      title: "1000 VP",
      badge: "Most Ordered",
      basePriceDzd: 2200,
      delivery: "5-20 min after confirmation",
      lane: "Standard buyers",
      note: "A clean middle option for players who buy often but want a modest total.",
      bullets: ["Balanced price point", "Easy to restock", "Common checkout choice"],
    },
    {
      sku: "vp-2050",
      title: "2050 VP",
      badge: "Sweet Spot",
      basePriceDzd: 4200,
      delivery: "5-20 min after confirmation",
      lane: "Bundle hunters",
      note: "The strongest all-rounder for single-order bundles and premium cosmetics.",
      bullets: ["Popular with main accounts", "Works for featured picks", "Good value perception"],
    },
    {
      sku: "vp-3650",
      title: "3650 VP",
      badge: "High Pull",
      basePriceDzd: 7100,
      delivery: "10-30 min after confirmation",
      lane: "Heavy spenders",
      note: "Designed for users who buy bigger bundles and want fewer separate payments.",
      bullets: ["Premium order size", "Higher operator margin", "Useful for event windows"],
    },
    {
      sku: "vp-5350",
      title: "5350 VP",
      badge: "Elite Cart",
      basePriceDzd: 9900,
      delivery: "10-35 min after confirmation",
      lane: "Launch day buyers",
      note: "A large pack for major drops, exclusive skins, and stacked cart checkouts.",
      bullets: ["Big-ticket revenue", "High urgency users", "Strong resale follow-up"],
    },
    {
      sku: "vp-custom",
      title: "Custom VP Match",
      badge: "Manual Quote",
      basePriceDzd: 15000,
      delivery: "Reviewed manually",
      lane: "Special requests",
      note: "Use this when the buyer wants multiple packs combined into one handled request.",
      bullets: ["Custom cart support", "Built for edge cases", "Good for operator upsell"],
    },
  ],
  "reseller-top-up": [
    {
      sku: "reseller-starter",
      title: "Starter Reseller Pack",
      badge: "Bulk Lane",
      basePriceDzd: 18500,
      delivery: "Handled in batch windows",
      lane: "Low-volume resellers",
      note: "A starter lane for resellers testing the workflow before moving into larger volume.",
      bullets: ["Structured for repeat buyers", "Lower friction reorders", "Good onboarding pack"],
    },
    {
      sku: "reseller-pro",
      title: "Pro Reseller Pack",
      badge: "High Repeat",
      basePriceDzd: 31500,
      delivery: "Priority review",
      lane: "Mid-volume stores",
      note: "For clients who already understand the flow and need stronger volume capacity.",
      bullets: ["Higher lifetime value", "Priority handling fit", "Clear margin visibility"],
    },
    {
      sku: "reseller-rush",
      title: "Rush Reseller Lane",
      badge: "Priority",
      basePriceDzd: 46000,
      delivery: "Fast tracked",
      lane: "Urgent demand",
      note: "A premium lane for time-sensitive stock windows and event-day reseller demand.",
      bullets: ["Rush positioning", "Good for scarcity plays", "Support thread recommended"],
    },
    {
      sku: "reseller-custom",
      title: "Custom Reseller Deal",
      badge: "Negotiated",
      basePriceDzd: 60000,
      delivery: "Operator review required",
      lane: "Long-term partners",
      note: "Custom quantity, custom timeline, and custom account routing for trusted partners.",
      bullets: ["Bespoke handling", "Negotiated tiers", "Best fit for future partner dashboard"],
    },
  ],
  "bundle-gift": [
    {
      sku: "gift-featured-single",
      title: "Featured Bundle Gift",
      badge: "Manual Gift",
      basePriceDzd: 8600,
      delivery: "After eligibility check",
      lane: "Single bundle gift",
      note: "Request a current featured bundle and complete it through a verified manual flow.",
      bullets: ["Friend-check reminder", "Manual shard review", "Best for standard gifting"],
    },
    {
      sku: "gift-duo",
      title: "Dual Gift Assist",
      badge: "Two Accounts",
      basePriceDzd: 14500,
      delivery: "Reviewed manually",
      lane: "Two-player delivery",
      note: "For buyers arranging gifting for two accounts during the same event or release window.",
      bullets: ["Multi-recipient fit", "Ticket follow-up recommended", "Bundle timing matters"],
    },
    {
      sku: "gift-premium",
      title: "Premium Bundle Concierge",
      badge: "Operator Pick",
      basePriceDzd: 22000,
      delivery: "Priority gifting lane",
      lane: "High-touch buyers",
      note: "A premium service wrapper for larger gifting requests that need direct communication.",
      bullets: ["Ideal for direct chat", "Priority receipt review", "More protected workflow"],
    },
    {
      sku: "gift-custom",
      title: "Custom Gift Arrangement",
      badge: "Quoted",
      basePriceDzd: 27000,
      delivery: "Scheduled manually",
      lane: "Special cases",
      note: "Use this for custom bundles, unusual timing, or requests that do not fit the standard menu.",
      bullets: ["Flexible quote flow", "Needs operator chat", "Best for unusual gifting logic"],
    },
  ],
};
