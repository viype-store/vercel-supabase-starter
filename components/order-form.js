"use client";

import { useState } from "react";
import {
  categoryOptions,
  contactOptions,
  giftingOrderOptions,
  regionOptions,
  vpOrderOptions,
} from "../lib/catalog";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

const initialState = {
  fullName: "",
  email: "",
  riotId: "",
  region: "EU",
  productCategory: "VALORANT Points",
  offerName: "1000 VP",
  quantity: "1",
  preferredContact: "Email",
  notes: "",
};

export function OrderForm() {
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  function updateField(event) {
    const { name, value } = event.target;

    if (name === "productCategory") {
      setForm((current) => ({
        ...current,
        productCategory: value,
        offerName: value === "Gifting" ? giftingOrderOptions[0] : vpOrderOptions[1],
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  const availableOffers =
    form.productCategory === "Gifting" ? giftingOrderOptions : vpOrderOptions;

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({
      type: "",
      message: "",
    });

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setStatus({
        type: "error",
        message:
          "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY first.",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      full_name: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      riot_id: form.riotId.trim(),
      region: form.region,
      product_category: form.productCategory,
      offer_name: form.offerName,
      quantity: Number(form.quantity) || 1,
      preferred_contact: form.preferredContact,
      notes: form.notes.trim() || null,
    };

    const { error } = await supabase.from("order_requests").insert(payload);

    setIsSubmitting(false);

    if (error) {
      setStatus({
        type: "error",
        message: "Supabase returned an error. Check the SQL file and env vars.",
      });
      return;
    }

    setForm(initialState);
    setStatus({
      type: "success",
      message: "Order request saved. You can now review it in Supabase.",
    });
  }

  return (
    <div className="order-card panel">
      <div className="order-intro">
        <h3>Order request form</h3>
        <p>
          Capture the details you need before moving the customer into payment
          or fulfillment.
        </p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="inline-fields">
          <label className="field">
            <span>Full name</span>
            <input
              name="fullName"
              type="text"
              placeholder="Amina Hassan"
              required
              value={form.fullName}
              onChange={updateField}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              placeholder="amina@example.com"
              required
              value={form.email}
              onChange={updateField}
            />
          </label>
        </div>

        <div className="inline-fields">
          <label className="field">
            <span>Riot ID</span>
            <input
              name="riotId"
              type="text"
              placeholder="PlayerName#1234"
              required
              value={form.riotId}
              onChange={updateField}
            />
          </label>

          <label className="field">
            <span>Region</span>
            <select name="region" value={form.region} onChange={updateField}>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="inline-fields">
          <label className="field">
            <span>Category</span>
            <select
              name="productCategory"
              value={form.productCategory}
              onChange={updateField}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Offer</span>
            <select name="offerName" value={form.offerName} onChange={updateField}>
              {availableOffers.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="inline-fields">
          <label className="field">
            <span>Quantity</span>
            <input
              name="quantity"
              type="number"
              min="1"
              max="50"
              value={form.quantity}
              onChange={updateField}
            />
          </label>

          <label className="field">
            <span>Preferred contact</span>
            <select
              name="preferredContact"
              value={form.preferredContact}
              onChange={updateField}
            >
              {contactOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Order notes</span>
          <textarea
            name="notes"
            placeholder="Bundle name, timing, account notes, or anything else you need for fulfillment."
            value={form.notes}
            onChange={updateField}
          />
        </label>

        <div className="submit-row">
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving request..." : "Save order request"}
          </button>
          {status.message ? (
            <p className={`form-message ${status.type}`}>{status.message}</p>
          ) : null}
        </div>
      </form>

      <p className="helper-note">
        Tip: once Supabase is connected, every submission appears in the
        `order_requests` table.
      </p>
    </div>
  );
}
