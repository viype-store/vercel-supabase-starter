"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import {
  catalogByService,
  highlightCards,
  paymentMethods,
  promoChips,
  serviceTabs,
  supportModes,
  trustCards,
} from "../lib/marketplace-data";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

const moneyFormatter = new Intl.NumberFormat("fr-DZ", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const emptyAuthState = {
  displayName: "",
  email: "",
  password: "",
};

const emptyCheckoutState = {
  fullName: "",
  riotId: "",
  contactChannel: "WhatsApp",
  contactValue: "",
  paymentMethod: paymentMethods[0].id,
  notes: "",
  receiptFile: null,
};

const emptySupportDraft = {
  type: supportModes[0].id,
  subject: "",
  orderId: "",
  body: "",
};

function formatDzd(value) {
  return `${moneyFormatter.format(value)} DZD`;
}

function formatOrderId(id) {
  return `#${String(id).padStart(5, "0")}`;
}

function sanitizeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

function buildPreviewWorkspace() {
  const previewOrderId = 9007;
  const previewThreadId = 501;
  const ticketThreadId = 502;
  const now = new Date().toISOString();

  return {
    profile: {
      display_name: "Preview Buyer",
      riot_id: "VypeDemo#7777",
      preferred_contact_channel: "Discord",
      preferred_contact_value: "@vype.demo",
    },
    orders: [
      {
        id: previewOrderId,
        user_id: "preview-user",
        full_name: "Preview Buyer",
        email: "preview@vypestore.local",
        riot_id: "VypeDemo#7777",
        service_id: "player-top-up",
        payment_method: "baridi-mob",
        subtotal_dzd: 4200,
        fee_amount_dzd: 1470,
        total_dzd: 5670,
        order_items: [
          {
            sku: "vp-2050",
            title: "2050 VP",
            quantity: 1,
            basePriceDzd: 4200,
            serviceId: "player-top-up",
          },
        ],
        contact_channel: "Discord",
        contact_value: "@vype.demo",
        notes: "Preview mode order to show how status cards and support threads appear.",
        receipt_path: "preview/payment-receipts/demo-receipt.png",
        status: "awaiting_review",
        created_at: now,
      },
    ],
    threads: [
      {
        id: previewThreadId,
        user_id: "preview-user",
        order_id: previewOrderId,
        thread_type: "direct-chat",
        subject: "Order #09007 - 2050 VP",
        status: "open",
        created_at: now,
        updated_at: now,
      },
      {
        id: ticketThreadId,
        user_id: "preview-user",
        order_id: null,
        thread_type: "ticket",
        subject: "Question about reseller timing",
        status: "open",
        created_at: now,
        updated_at: now,
      },
    ],
    messagesByThread: {
      [previewThreadId]: [
        {
          id: 1,
          thread_id: previewThreadId,
          sender_role: "customer",
          body: "I uploaded the BaridiMob receipt. Please confirm when the VP is ready.",
          created_at: now,
        },
        {
          id: 2,
          thread_id: previewThreadId,
          sender_role: "support",
          body: "Receipt received. We are reviewing it now and will update the order thread shortly.",
          created_at: now,
        },
      ],
      [ticketThreadId]: [
        {
          id: 3,
          thread_id: ticketThreadId,
          sender_role: "customer",
          body: "How fast can reseller packs move during event nights?",
          created_at: now,
        },
      ],
    },
  };
}

function getActivePaymentMethod(paymentId) {
  return paymentMethods.find((method) => method.id === paymentId) ?? paymentMethods[0];
}

function getServiceMeta(serviceId) {
  return serviceTabs.find((item) => item.id === serviceId) ?? serviceTabs[0];
}

function groupMessages(rows) {
  return rows.reduce((accumulator, message) => {
    const threadMessages = accumulator[message.thread_id] ?? [];
    threadMessages.push(message);
    accumulator[message.thread_id] = threadMessages;
    return accumulator;
  }, {});
}

export function StorefrontApp() {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthState);
  const [authStatus, setAuthStatus] = useState({ type: "", message: "" });
  const [authBusy, setAuthBusy] = useState(false);
  const [previewMode, setPreviewMode] = useState(!supabase);
  const [activeServiceId, setActiveServiceId] = useState(serviceTabs[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [checkoutForm, setCheckoutForm] = useState(emptyCheckoutState);
  const [checkoutStatus, setCheckoutStatus] = useState({ type: "", message: "" });
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [orders, setOrders] = useState([]);
  const [threads, setThreads] = useState([]);
  const [messagesByThread, setMessagesByThread] = useState({});
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [supportDraft, setSupportDraft] = useState(emptySupportDraft);
  const [supportMessageDraft, setSupportMessageDraft] = useState("");
  const [supportStatus, setSupportStatus] = useState({ type: "", message: "" });
  const [supportBusy, setSupportBusy] = useState(false);
  const [workspaceBusy, setWorkspaceBusy] = useState(false);

  const deferredSearch = useDeferredValue(searchQuery);
  const activeService = getServiceMeta(activeServiceId);
  const visibleProducts = catalogByService[activeServiceId].filter((product) => {
    const haystack = [
      product.title,
      product.badge,
      product.lane,
      product.note,
      ...product.bullets,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(deferredSearch.trim().toLowerCase());
  });

  const subtotalDzd = cart.reduce(
    (sum, item) => sum + item.basePriceDzd * item.quantity,
    0,
  );
  const activePaymentMethod = getActivePaymentMethod(checkoutForm.paymentMethod);
  const feeAmountDzd = Math.round(subtotalDzd * (activePaymentMethod.multiplier - 1));
  const totalDzd = subtotalDzd + feeAmountDzd;
  const canUseLiveBackend = Boolean(session && supabase);
  const isInteractive = canUseLiveBackend || previewMode;
  const selectedThread =
    threads.find((thread) => thread.id === selectedThreadId) ?? threads[0] ?? null;
  const selectedMessages = selectedThread
    ? messagesByThread[selectedThread.id] ?? []
    : [];

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let isMounted = true;

    async function bootstrap() {
      const {
        data: { session: liveSession },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSession(liveSession ?? null);
      setAuthLoading(false);

      if (liveSession) {
        await loadWorkspace(liveSession.user.id);
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, liveSession) => {
      if (!isMounted) {
        return;
      }

      setSession(liveSession ?? null);
      setAuthLoading(false);

      if (liveSession) {
        await loadWorkspace(liveSession.user.id);
      } else if (!previewMode) {
        clearWorkspace();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, previewMode]);

  useEffect(() => {
    if (!session && previewMode && orders.length === 0 && threads.length === 0) {
      const preview = buildPreviewWorkspace();
      setProfile(preview.profile);
      setOrders(preview.orders);
      setThreads(preview.threads);
      setMessagesByThread(preview.messagesByThread);
      setSelectedThreadId(preview.threads[0]?.id ?? null);
    }
  }, [session, previewMode, orders.length, threads.length]);

  async function loadWorkspace(userId) {
    if (!supabase) {
      return;
    }

    setWorkspaceBusy(true);

    const [
      { data: profileRow, error: profileError },
      { data: orderRows, error: ordersError },
      { data: threadRows, error: threadsError },
    ] = await Promise.all([
      supabase
        .from("customer_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("support_threads")
        .select("*")
        .order("updated_at", { ascending: false }),
    ]);

    if (profileError || ordersError || threadsError) {
      setWorkspaceBusy(false);
      return;
    }

    let groupedMessages = {};

    if (threadRows?.length) {
      const { data: messageRows } = await supabase
        .from("support_messages")
        .select("*")
        .in(
          "thread_id",
          threadRows.map((thread) => thread.id),
        )
        .order("created_at", { ascending: true });

      groupedMessages = groupMessages(messageRows ?? []);
    }

    setProfile(profileRow ?? null);
    setOrders(orderRows ?? []);
    setThreads(threadRows ?? []);
    setMessagesByThread(groupedMessages);
    setSelectedThreadId((current) => current ?? threadRows?.[0]?.id ?? null);
    setWorkspaceBusy(false);
  }

  function clearWorkspace() {
    setProfile(null);
    setOrders([]);
    setThreads([]);
    setMessagesByThread({});
    setSelectedThreadId(null);
  }

  async function upsertProfile(overrides = {}) {
    if (!supabase || !session) {
      return;
    }

    const displayName =
      overrides.displayName ||
      profile?.display_name ||
      session.user.user_metadata?.display_name ||
      session.user.email?.split("@")[0] ||
      "Customer";

    await supabase.from("customer_profiles").upsert(
      {
        user_id: session.user.id,
        display_name: displayName,
        riot_id: overrides.riotId ?? profile?.riot_id ?? null,
        preferred_contact_channel:
          overrides.contactChannel ?? profile?.preferred_contact_channel ?? null,
        preferred_contact_value:
          overrides.contactValue ?? profile?.preferred_contact_value ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }

  function setFormState(setter, event) {
    const { name, value, files } = event.target;
    setter((current) => ({
      ...current,
      [name]: files ? files[0] ?? null : value,
    }));
  }

  function promptAuth(message) {
    setAuthStatus({
      type: "info",
      message,
    });
    document.getElementById("auth-station")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleAddToCart(product) {
    if (!isInteractive) {
      promptAuth("Create an account first so the cart can be tied to your orders and support threads.");
      return;
    }

    const serviceMeta = getServiceMeta(activeServiceId);

    setCart((current) => {
      const existingItem = current.find((item) => item.sku === product.sku);

      if (existingItem) {
        return current.map((item) =>
          item.sku === product.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          sku: product.sku,
          title: product.title,
          badge: product.badge,
          basePriceDzd: product.basePriceDzd,
          serviceId: activeServiceId,
          serviceLabel: serviceMeta.label,
          quantity: 1,
        },
      ];
    });

    setCheckoutStatus({
      type: "success",
      message: `${product.title} added to cart. Continue below to choose ${activePaymentMethod.label}.`,
    });
  }

  function changeCartQuantity(sku, delta) {
    setCart((current) =>
      current
        .map((item) =>
          item.sku === sku
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeCartItem(sku) {
    setCart((current) => current.filter((item) => item.sku !== sku));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    if (!supabase) {
      setPreviewMode(true);
      setAuthStatus({
        type: "info",
        message: "Supabase is not connected yet, so the storefront stayed in preview mode.",
      });
      return;
    }

    setAuthBusy(true);
    setAuthStatus({ type: "", message: "" });

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: {
          data: {
            display_name: authForm.displayName,
          },
        },
      });

      if (error) {
        setAuthBusy(false);
        setAuthStatus({
          type: "error",
          message: error.message,
        });
        return;
      }

      if (data.session) {
        await upsertProfile({ displayName: authForm.displayName });
        await loadWorkspace(data.session.user.id);
        setAuthStatus({
          type: "success",
          message: "Account created and signed in. The ordering tabs are now fully live.",
        });
      } else {
        setAuthStatus({
          type: "info",
          message: "Account created. If email confirmation is enabled in Supabase, confirm it before signing in.",
        });
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password,
      });

      if (error) {
        setAuthBusy(false);
        setAuthStatus({
          type: "error",
          message: error.message,
        });
        return;
      }

      await loadWorkspace(data.session.user.id);
      setAuthStatus({
        type: "success",
        message: "Signed in successfully. You can now add items, upload receipts, and open tickets.",
      });
    }

    setAuthBusy(false);
    setAuthForm(emptyAuthState);
  }

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setAuthStatus({
      type: "info",
      message: "Signed out. Switch preview mode back on if you still want to demo the storefront locally.",
    });
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
      setCheckoutStatus({
        type: "error",
        message: "Add at least one offer to the cart before trying to check out.",
      });
      return;
    }

    if (!isInteractive) {
      promptAuth("Sign in first so the site can save your order and tie it to your support threads.");
      return;
    }

    if (canUseLiveBackend && !checkoutForm.receiptFile) {
      setCheckoutStatus({
        type: "error",
        message: "Upload the payment receipt before placing the live order.",
      });
      return;
    }

    setCheckoutBusy(true);
    setCheckoutStatus({ type: "", message: "" });

    const orderPayload = {
      full_name: checkoutForm.fullName || profile?.display_name || "Customer",
      email: session?.user?.email ?? "preview@vypestore.local",
      riot_id: checkoutForm.riotId || profile?.riot_id || "Preview#0001",
      service_id: activeServiceId,
      payment_method: checkoutForm.paymentMethod,
      subtotal_dzd: subtotalDzd,
      fee_amount_dzd: feeAmountDzd,
      total_dzd: totalDzd,
      contact_channel: checkoutForm.contactChannel,
      contact_value: checkoutForm.contactValue,
      notes: checkoutForm.notes || null,
      order_items: cart.map((item) => ({
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        basePriceDzd: item.basePriceDzd,
        serviceId: item.serviceId,
      })),
      status: "awaiting_review",
    };

    if (!canUseLiveBackend) {
      const previewId = Date.now();
      const threadId = previewId + 1;
      const createdAt = new Date().toISOString();
      const previewOrder = {
        id: previewId,
        user_id: "preview-user",
        ...orderPayload,
        receipt_path: checkoutForm.receiptFile?.name ?? "preview/no-file",
        created_at: createdAt,
      };
      const previewThread = {
        id: threadId,
        user_id: "preview-user",
        order_id: previewId,
        thread_type: "direct-chat",
        subject: `Order ${formatOrderId(previewId)} - ${cart[0].title}`,
        status: "open",
        created_at: createdAt,
        updated_at: createdAt,
      };

      setOrders((current) => [previewOrder, ...current]);
      setThreads((current) => [previewThread, ...current]);
      setMessagesByThread((current) => ({
        ...current,
        [threadId]: [
          {
            id: threadId,
            thread_id: threadId,
            sender_role: "customer",
            body:
              checkoutForm.notes ||
              "Preview order created locally. Connect Supabase to save real receipts and replies.",
            created_at: createdAt,
          },
        ],
      }));
      setSelectedThreadId(threadId);
      setCheckoutBusy(false);
      setCart([]);
      setCheckoutForm(emptyCheckoutState);
      setCheckoutStatus({
        type: "success",
        message: "Preview order created locally. The cart, status card, and chat thread all updated in the UI.",
      });
      return;
    }

    let receiptPath = null;

    if (checkoutForm.receiptFile) {
      const fileName = `${session.user.id}/${Date.now()}-${sanitizeFileName(
        checkoutForm.receiptFile.name,
      )}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(fileName, checkoutForm.receiptFile, {
          upsert: false,
        });

      if (uploadError) {
        setCheckoutBusy(false);
        setCheckoutStatus({
          type: "error",
          message: uploadError.message,
        });
        return;
      }

      receiptPath = fileName;
    }

    const { data: insertedOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: session.user.id,
        ...orderPayload,
        receipt_path: receiptPath,
      })
      .select("*")
      .single();

    if (orderError) {
      setCheckoutBusy(false);
      setCheckoutStatus({
        type: "error",
        message: orderError.message,
      });
      return;
    }

    const { data: insertedThread, error: threadError } = await supabase
      .from("support_threads")
      .insert({
        user_id: session.user.id,
        order_id: insertedOrder.id,
        thread_type: "direct-chat",
        subject: `Order ${formatOrderId(insertedOrder.id)} - ${cart[0].title}`,
        status: "open",
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (!threadError && insertedThread) {
      await supabase.from("support_messages").insert({
        thread_id: insertedThread.id,
        sender_user_id: session.user.id,
        sender_role: "customer",
        body:
          checkoutForm.notes ||
          `Payment sent through ${activePaymentMethod.label}. Receipt uploaded and waiting for review.`,
      });
      setSelectedThreadId(insertedThread.id);
    }

    await upsertProfile({
      displayName: orderPayload.full_name,
      riotId: orderPayload.riot_id,
      contactChannel: orderPayload.contact_channel,
      contactValue: orderPayload.contact_value,
    });
    await loadWorkspace(session.user.id);

    setCheckoutBusy(false);
    setCart([]);
    setCheckoutForm(emptyCheckoutState);
    setCheckoutStatus({
      type: "success",
      message: `Order ${formatOrderId(insertedOrder.id)} created. The receipt and chat thread are now inside your support workspace.`,
    });
  }

  async function handleCreateSupportThread(event) {
    event.preventDefault();

    if (!isInteractive) {
      promptAuth("Sign in first so the site can save the support thread to your account.");
      return;
    }

    if (!supportDraft.subject || !supportDraft.body) {
      setSupportStatus({
        type: "error",
        message: "Add both a subject and a first message before creating the ticket or direct chat.",
      });
      return;
    }

    setSupportBusy(true);
    setSupportStatus({ type: "", message: "" });
    const createdAt = new Date().toISOString();

    if (!canUseLiveBackend) {
      const threadId = Date.now();
      const previewThread = {
        id: threadId,
        user_id: "preview-user",
        order_id: supportDraft.orderId ? Number(supportDraft.orderId) : null,
        thread_type: supportDraft.type,
        subject: supportDraft.subject,
        status: "open",
        created_at: createdAt,
        updated_at: createdAt,
      };

      setThreads((current) => [previewThread, ...current]);
      setMessagesByThread((current) => ({
        ...current,
        [threadId]: [
          {
            id: threadId,
            thread_id: threadId,
            sender_role: "customer",
            body: supportDraft.body,
            created_at: createdAt,
          },
        ],
      }));
      setSelectedThreadId(threadId);
      setSupportDraft(emptySupportDraft);
      setSupportBusy(false);
      setSupportStatus({
        type: "success",
        message: "Preview support thread created locally.",
      });
      return;
    }

    const { data: insertedThread, error: threadError } = await supabase
      .from("support_threads")
      .insert({
        user_id: session.user.id,
        order_id: supportDraft.orderId ? Number(supportDraft.orderId) : null,
        thread_type: supportDraft.type,
        subject: supportDraft.subject,
        status: "open",
        updated_at: createdAt,
      })
      .select("*")
      .single();

    if (threadError) {
      setSupportBusy(false);
      setSupportStatus({
        type: "error",
        message: threadError.message,
      });
      return;
    }

    const { error: messageError } = await supabase.from("support_messages").insert({
      thread_id: insertedThread.id,
      sender_user_id: session.user.id,
      sender_role: "customer",
      body: supportDraft.body,
    });

    if (messageError) {
      setSupportBusy(false);
      setSupportStatus({
        type: "error",
        message: messageError.message,
      });
      return;
    }

    await loadWorkspace(session.user.id);
    setSelectedThreadId(insertedThread.id);
    setSupportDraft(emptySupportDraft);
    setSupportBusy(false);
    setSupportStatus({
      type: "success",
      message: "Support thread created. It is now visible in your inbox.",
    });
  }

  async function handleSendSupportMessage(event) {
    event.preventDefault();

    if (!selectedThread) {
      setSupportStatus({
        type: "error",
        message: "Pick or create a thread before sending a message.",
      });
      return;
    }

    if (!supportMessageDraft.trim()) {
      return;
    }

    setSupportBusy(true);
    setSupportStatus({ type: "", message: "" });
    const createdAt = new Date().toISOString();

    if (!canUseLiveBackend) {
      const nextId = Date.now();
      setMessagesByThread((current) => ({
        ...current,
        [selectedThread.id]: [
          ...(current[selectedThread.id] ?? []),
          {
            id: nextId,
            thread_id: selectedThread.id,
            sender_role: "customer",
            body: supportMessageDraft.trim(),
            created_at: createdAt,
          },
        ],
      }));
      setThreads((current) =>
        current.map((thread) =>
          thread.id === selectedThread.id
            ? { ...thread, updated_at: createdAt }
            : thread,
        ),
      );
      setSupportMessageDraft("");
      setSupportBusy(false);
      return;
    }

    const { error } = await supabase.from("support_messages").insert({
      thread_id: selectedThread.id,
      sender_user_id: session.user.id,
      sender_role: "customer",
      body: supportMessageDraft.trim(),
    });

    if (error) {
      setSupportBusy(false);
      setSupportStatus({
        type: "error",
        message: error.message,
      });
      return;
    }

    await supabase
      .from("support_threads")
      .update({
        updated_at: createdAt,
      })
      .eq("id", selectedThread.id);

    await loadWorkspace(session.user.id);
    setSupportMessageDraft("");
    setSupportBusy(false);
  }

  const accountName =
    profile?.display_name ||
    session?.user?.user_metadata?.display_name ||
    session?.user?.email?.split("@")[0] ||
    "Marketplace Buyer";

  return (
    <main className="market-shell">
      <div className="ambient ambient-azure" />
      <div className="ambient ambient-mango" />
      <div className="ambient ambient-emerald" />
      <div className="mesh-overlay" />

      <div className="site-frame">
        <header className="market-topbar panel">
          <div className="brand-cluster">
            <div className="brand-mark">V.</div>
            <div>
              <strong>VYPE Market</strong>
              <p>VALORANT top-up, reseller, and gifting marketplace</p>
            </div>
          </div>

          <div className="topbar-search">
            <span>Search offers</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="2050 VP, reseller pack, gifting..."
            />
          </div>

          <div className="topbar-actions">
            <div className="status-chip">
              {canUseLiveBackend
                ? "Live account connected"
                : previewMode
                  ? "Preview mode"
                  : "Login required"}
            </div>
            <button
              className="button button-muted"
              type="button"
              onClick={() => {
                document.getElementById("checkout-station")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Cart {cart.length > 0 ? `(${cart.length})` : ""}
            </button>
          </div>
        </header>

        <section className="hero-grid">
          <div className="hero-panel hero-primary panel">
            <div className="eyebrow-row">
              <span className="eyebrow-pill">Marketplace Theme</span>
              <span className="eyebrow-pill">Receipt Upload</span>
              <span className="eyebrow-pill">Support Inbox</span>
            </div>

            <h1>
              VALORANT checkout that feels dense, bright, and trustworthy like a
              real marketplace.
            </h1>

            <p className="hero-copy">
              This version is built around the flow you described: account entry,
              service tabs, cart, local payment methods with a +35% fee layer,
              receipt upload, then ticket or direct chat follow-up from inside
              the site.
            </p>

            <div className="hero-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={() => {
                  document.getElementById("catalog-station")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                Explore catalog
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  document.getElementById("support-station")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                Open support hub
              </button>
            </div>

            <div className="promo-chip-row">
              {promoChips.map((chip) => (
                <span className="promo-chip" key={chip}>
                  {chip}
                </span>
              ))}
            </div>

            <div className="hero-metrics">
              <article className="metric-card">
                <strong>3 service lanes</strong>
                <span>Natural player, reseller, and bundle gifting tabs</span>
              </article>
              <article className="metric-card">
                <strong>+35% checkout fee</strong>
                <span>Applied on top of the base listed price at payment time</span>
              </article>
              <article className="metric-card">
                <strong>Orders + tickets</strong>
                <span>Each buyer flow can continue directly into in-site support</span>
              </article>
            </div>
          </div>

          <aside className="hero-panel hero-side panel" id="auth-station">
            {canUseLiveBackend ? (
              <>
                <div className="side-head">
                  <span className="panel-tag">Account live</span>
                  <button
                    className="text-button"
                    type="button"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </div>
                <h2>{accountName}</h2>
                <p className="muted-copy">
                  Orders, receipts, tickets, and direct chat threads are now tied
                  to this account.
                </p>

                <div className="account-stack">
                  <div className="account-card">
                    <span>Riot ID</span>
                    <strong>{profile?.riot_id || "Set during checkout"}</strong>
                  </div>
                  <div className="account-card">
                    <span>Contact</span>
                    <strong>
                      {profile?.preferred_contact_channel || "Channel not saved"}
                    </strong>
                  </div>
                  <div className="account-card">
                    <span>Orders</span>
                    <strong>{orders.length}</strong>
                  </div>
                </div>
              </>
            ) : supabase ? (
              <>
                <div className="side-head">
                  <span className="panel-tag">Buyer access</span>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setPreviewMode((current) => !current)}
                  >
                    {previewMode ? "Disable preview" : "Enable preview"}
                  </button>
                </div>

                <h2>Sign in before ordering</h2>
                <p className="muted-copy">
                  Buyers should create an account first so orders, receipts, and
                  support threads all stay connected.
                </p>

                <div className="mode-switch">
                  <button
                    className={`mode-pill ${authMode === "login" ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setAuthMode("login")}
                  >
                    Login
                  </button>
                  <button
                    className={`mode-pill ${authMode === "signup" ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setAuthMode("signup")}
                  >
                    Register
                  </button>
                </div>

                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === "signup" ? (
                    <label className="field">
                      <span>Display name</span>
                      <input
                        name="displayName"
                        type="text"
                        value={authForm.displayName}
                        onChange={(event) => setFormState(setAuthForm, event)}
                        placeholder="Vype Buyer"
                        required
                      />
                    </label>
                  ) : null}

                  <label className="field">
                    <span>Email</span>
                    <input
                      name="email"
                      type="email"
                      value={authForm.email}
                      onChange={(event) => setFormState(setAuthForm, event)}
                      placeholder="buyer@example.com"
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Password</span>
                    <input
                      name="password"
                      type="password"
                      value={authForm.password}
                      onChange={(event) => setFormState(setAuthForm, event)}
                      placeholder="At least 6 characters"
                      required
                    />
                  </label>

                  <button
                    className="button button-primary full-width"
                    type="submit"
                    disabled={authBusy || authLoading}
                  >
                    {authBusy
                      ? "Working..."
                      : authMode === "signup"
                        ? "Create buyer account"
                        : "Sign in"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="side-head">
                  <span className="panel-tag">Preview only</span>
                </div>
                <h2>Backend not connected yet</h2>
                <p className="muted-copy">
                  The design is still fully explorable. Connect Supabase later to
                  enable live login, storage uploads, order history, and support
                  threads.
                </p>
                <button
                  className="button button-secondary full-width"
                  type="button"
                  onClick={() => setPreviewMode(true)}
                >
                  Continue in preview mode
                </button>
              </>
            )}

            <FieldMessage status={authStatus} />
          </aside>
        </section>

        <section className="trust-grid">
          {trustCards.map((card) => (
            <article className="trust-card panel" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="catalog-zone panel" id="catalog-station">
          <div className="catalog-head">
            <div>
              <span className="section-label">Store tabs</span>
              <h2>Choose the lane the buyer wants to use</h2>
              <p>
                The top tabs mirror the structure you asked for: regular player
                top-ups, reseller orders, and bundle gifting.
              </p>
            </div>
            <div className="catalog-summary">
              <strong>{visibleProducts.length}</strong>
              <span>offers visible in this lane</span>
            </div>
          </div>

          <div className="service-tab-row">
            {serviceTabs.map((tab) => (
              <button
                key={tab.id}
                className={`service-tab ${activeServiceId === tab.id ? "is-active" : ""}`}
                type="button"
                onClick={() => {
                  startTransition(() => {
                    setActiveServiceId(tab.id);
                  });
                }}
              >
                <span>{tab.label}</span>
                <small>{tab.eyebrow}</small>
              </button>
            ))}
          </div>

          <div className="active-service-panel">
            <div>
              <span className="section-label">{activeService.eyebrow}</span>
              <h3>{activeService.label}</h3>
            </div>
            <p>{activeService.summary}</p>
          </div>

          <div className="catalog-layout">
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <article className="product-card panel" key={product.sku}>
                  <div className="product-meta">
                    <span className="product-badge">{product.badge}</span>
                    <span className="product-lane">{product.lane}</span>
                  </div>
                  <h3>{product.title}</h3>
                  <p className="product-note">{product.note}</p>
                  <div className="product-price-row">
                    <strong>{formatDzd(product.basePriceDzd)}</strong>
                    <span>base price</span>
                  </div>
                  <div className="product-delivery">{product.delivery}</div>
                  <ul className="product-bullets">
                    {product.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <button
                    className="button button-primary full-width"
                    type="button"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to cart
                  </button>
                </article>
              ))}
            </div>

            <aside className="cart-rail panel" id="checkout-station">
              <div className="cart-head">
                <div>
                  <span className="section-label">Checkout</span>
                  <h3>Cart and payment proof</h3>
                </div>
                <span className="cart-count">{cart.length} items</span>
              </div>

              {cart.length === 0 ? (
                <div className="empty-card">
                  <h4>The cart is empty</h4>
                  <p>
                    Add one or more offers from the current tab to unlock the
                    payment method selector and receipt upload flow.
                  </p>
                </div>
              ) : (
                <div className="cart-list">
                  {cart.map((item) => (
                    <article className="cart-item" key={item.sku}>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.serviceLabel}</p>
                      </div>
                      <div className="cart-item-side">
                        <span>{formatDzd(item.basePriceDzd * item.quantity)}</span>
                        <div className="quantity-row">
                          <button
                            type="button"
                            onClick={() => changeCartQuantity(item.sku, -1)}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeCartQuantity(item.sku, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="text-button danger"
                          type="button"
                          onClick={() => removeCartItem(item.sku)}
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="payment-stack">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>{formatDzd(subtotalDzd)}</strong>
                </div>
                <div className="summary-row">
                  <span>Fee (+35%)</span>
                  <strong>{formatDzd(feeAmountDzd)}</strong>
                </div>
                <div className="summary-row total">
                  <span>Total to pay</span>
                  <strong>{formatDzd(totalDzd)}</strong>
                </div>
              </div>

              <div className="payment-method-grid">
                {paymentMethods.map((method) => (
                  <label
                    className={`payment-method ${checkoutForm.paymentMethod === method.id ? "is-active" : ""}`}
                    key={method.id}
                  >
                    <input
                      name="paymentMethod"
                      type="radio"
                      value={method.id}
                      checked={checkoutForm.paymentMethod === method.id}
                      onChange={(event) => setFormState(setCheckoutForm, event)}
                    />
                    <div>
                      <strong>{method.label}</strong>
                      <span>{method.helper}</span>
                      <small>{method.eta}</small>
                    </div>
                  </label>
                ))}
              </div>

              <form className="checkout-form" onSubmit={handlePlaceOrder}>
                <div className="inline-grid">
                  <label className="field">
                    <span>Customer name</span>
                    <input
                      name="fullName"
                      type="text"
                      value={checkoutForm.fullName}
                      onChange={(event) => setFormState(setCheckoutForm, event)}
                      placeholder="Full name"
                      required={cart.length > 0}
                    />
                  </label>

                  <label className="field">
                    <span>Riot ID</span>
                    <input
                      name="riotId"
                      type="text"
                      value={checkoutForm.riotId}
                      onChange={(event) => setFormState(setCheckoutForm, event)}
                      placeholder="PlayerName#1234"
                      required={cart.length > 0}
                    />
                  </label>
                </div>

                <div className="inline-grid">
                  <label className="field">
                    <span>Contact channel</span>
                    <select
                      name="contactChannel"
                      value={checkoutForm.contactChannel}
                      onChange={(event) => setFormState(setCheckoutForm, event)}
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Discord">Discord</option>
                      <option value="Telegram">Telegram</option>
                      <option value="Email">Email</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Contact value</span>
                    <input
                      name="contactValue"
                      type="text"
                      value={checkoutForm.contactValue}
                      onChange={(event) => setFormState(setCheckoutForm, event)}
                      placeholder="@username or phone"
                      required={cart.length > 0}
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Order notes</span>
                  <textarea
                    name="notes"
                    value={checkoutForm.notes}
                    onChange={(event) => setFormState(setCheckoutForm, event)}
                    placeholder="Tell the operator if this is a reseller reorder, a bundle gift, or a time-sensitive purchase."
                  />
                </label>

                <label className="upload-box">
                  <span>Upload receipt</span>
                  <input
                    name="receiptFile"
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.pdf"
                    onChange={(event) => setFormState(setCheckoutForm, event)}
                  />
                  <small>
                    {checkoutForm.receiptFile
                      ? checkoutForm.receiptFile.name
                      : "PNG, JPG, WEBP, or PDF"}
                  </small>
                </label>

                <div className="payment-note panel">
                  <strong>Current payment lane: {activePaymentMethod.label}</strong>
                  <p>
                    The storefront shows the base price first, then adds the
                    +35% fee at checkout. After payment, the buyer uploads the
                    receipt and the order moves to review.
                  </p>
                </div>

                <button
                  className="button button-primary full-width"
                  type="submit"
                  disabled={checkoutBusy || cart.length === 0}
                >
                  {checkoutBusy
                    ? "Processing order..."
                    : canUseLiveBackend
                      ? "Place live order"
                      : "Create preview order"}
                </button>
              </form>

              {!isInteractive ? (
                <div className="locked-note">
                  Sign in first to tie cart activity to the buyer account, receipts,
                  and future ticket messages.
                </div>
              ) : null}

              <FieldMessage status={checkoutStatus} />
            </aside>
          </div>
        </section>

        <section className="highlight-grid">
          {highlightCards.map((card) => (
            <article className="highlight-card panel" key={card.title}>
              <span className="section-label">{card.title}</span>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="workspace-grid">
          <div className="orders-panel panel">
            <div className="section-head-row">
              <div>
                <span className="section-label">Order status</span>
                <h2>Track what the buyer already sent</h2>
              </div>
              <span className="section-pill">
                {workspaceBusy ? "Refreshing..." : `${orders.length} orders`}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="empty-card">
                <h4>No orders yet</h4>
                <p>
                  As soon as a buyer completes checkout, the order appears here
                  with payment method, receipt reference, total price, and a
                  linked chat thread.
                </p>
              </div>
            ) : (
              <div className="order-card-list">
                {orders.map((order) => {
                  const linkedThread = threads.find((thread) => thread.order_id === order.id);
                  return (
                    <article className="order-card panel" key={order.id}>
                      <div className="order-topline">
                        <div>
                          <strong>{formatOrderId(order.id)}</strong>
                          <p>{getServiceMeta(order.service_id).label}</p>
                        </div>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="order-price-line">
                        <span>{formatDzd(order.total_dzd)}</span>
                        <small>
                          {order.payment_method} · {dateFormatter.format(new Date(order.created_at))}
                        </small>
                      </div>
                      <div className="order-items-mini">
                        {(order.order_items ?? []).map((item) => (
                          <span key={`${order.id}-${item.sku}`}>
                            {item.title} x{item.quantity}
                          </span>
                        ))}
                      </div>
                      <button
                        className="button button-secondary full-width"
                        type="button"
                        onClick={() => {
                          if (!linkedThread) {
                            return;
                          }

                          document.getElementById("support-station")?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                          startTransition(() => {
                            setSelectedThreadId(linkedThread.id);
                          });
                        }}
                      >
                        {linkedThread ? "Open linked chat" : "Thread will appear after order creation"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="support-panel panel" id="support-station">
            <div className="section-head-row">
              <div>
                <span className="section-label">Support center</span>
                <h2>Ticket plus direct chat inside the site</h2>
              </div>
              <span className="section-pill">{threads.length} conversations</span>
            </div>

            <form className="support-create" onSubmit={handleCreateSupportThread}>
              <div className="inline-grid">
                <label className="field">
                  <span>Mode</span>
                  <select
                    name="type"
                    value={supportDraft.type}
                    onChange={(event) => setFormState(setSupportDraft, event)}
                  >
                    {supportModes.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Linked order</span>
                  <select
                    name="orderId"
                    value={supportDraft.orderId}
                    onChange={(event) => setFormState(setSupportDraft, event)}
                  >
                    <option value="">General support</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {formatOrderId(order.id)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Subject</span>
                <input
                  name="subject"
                  type="text"
                  value={supportDraft.subject}
                  onChange={(event) => setFormState(setSupportDraft, event)}
                  placeholder="Example: Need confirmation for bundle gifting"
                />
              </label>

              <label className="field">
                <span>First message</span>
                <textarea
                  name="body"
                  value={supportDraft.body}
                  onChange={(event) => setFormState(setSupportDraft, event)}
                  placeholder="Open a ticket or direct chat that support can continue later."
                />
              </label>

              <button
                className="button button-primary"
                type="submit"
                disabled={supportBusy}
              >
                {supportBusy ? "Creating..." : "Create support thread"}
              </button>
            </form>

            <div className="support-layout">
              <aside className="thread-list">
                {threads.length === 0 ? (
                  <div className="empty-card compact">
                    <h4>No threads yet</h4>
                    <p>
                      Once a buyer opens a ticket or creates an order, the
                      thread list fills up here.
                    </p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <button
                      className={`thread-card ${selectedThread?.id === thread.id ? "is-active" : ""}`}
                      key={thread.id}
                      type="button"
                      onClick={() => {
                        startTransition(() => {
                          setSelectedThreadId(thread.id);
                        });
                      }}
                    >
                      <strong>{thread.subject}</strong>
                      <span>{thread.thread_type.replace(/-/g, " ")}</span>
                      <small>{dateFormatter.format(new Date(thread.updated_at))}</small>
                    </button>
                  ))
                )}
              </aside>

              <div className="thread-room">
                {selectedThread ? (
                  <>
                    <div className="thread-room-head">
                      <div>
                        <strong>{selectedThread.subject}</strong>
                        <span>
                          {selectedThread.thread_type.replace(/-/g, " ")} ·{" "}
                          {selectedThread.order_id
                            ? formatOrderId(selectedThread.order_id)
                            : "General support"}
                        </span>
                      </div>
                      <div className={`status-badge status-${selectedThread.status}`}>
                        {selectedThread.status}
                      </div>
                    </div>

                    <div className="message-list">
                      {selectedMessages.map((message) => (
                        <article
                          className={`message-bubble ${message.sender_role === "support" ? "is-support" : ""}`}
                          key={message.id}
                        >
                          <span>{message.sender_role === "support" ? "Support" : "Customer"}</span>
                          <p>{message.body}</p>
                          <small>{dateFormatter.format(new Date(message.created_at))}</small>
                        </article>
                      ))}
                    </div>

                    <form className="thread-composer" onSubmit={handleSendSupportMessage}>
                      <textarea
                        value={supportMessageDraft}
                        onChange={(event) => setSupportMessageDraft(event.target.value)}
                        placeholder="Reply in the ticket or direct chat..."
                      />
                      <button
                        className="button button-secondary"
                        type="submit"
                        disabled={supportBusy}
                      >
                        Send message
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="empty-card">
                    <h4>Select a thread</h4>
                    <p>
                      Use the support composer above to create the first ticket
                      or direct chat, then keep all buyer communication inside
                      the site.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <FieldMessage status={supportStatus} />
          </div>
        </section>

        <footer className="site-footer panel">
          <div>
            <strong>VYPE Market prototype</strong>
            <p>
              Marketplace-style VALORANT flow with login, cart, payment proof,
              receipts, tickets, and direct chat foundations.
            </p>
          </div>

          <div className="footer-grid">
            <span>Payments: BaridiMob / CCP / Flexy</span>
            <span>Fee model: +35% above base list price</span>
            <span>Ops: Supabase auth, storage, orders, tickets, messages</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function FieldMessage({ status }) {
  if (!status?.message) {
    return null;
  }

  return <p className={`field-message ${status.type || "info"}`}>{status.message}</p>;
}
