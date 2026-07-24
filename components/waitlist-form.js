"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

const initialState = {
  name: "",
  email: "",
  idea: "",
};

export function WaitlistForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

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
      name: form.name.trim() || null,
      email: form.email.trim().toLowerCase(),
      idea: form.idea.trim() || null,
    };

    const { error } = await supabase.from("waitlist").insert(payload);

    setIsSubmitting(false);

    if (error?.code === "23505") {
      setStatus({
        type: "success",
        message: "This email is already on the list.",
      });
      return;
    }

    if (error) {
      setStatus({
        type: "error",
        message: "Supabase returned an error. Check the SQL setup and env vars.",
      });
      return;
    }

    setForm(initialState);
    setStatus({
      type: "success",
      message: "Saved successfully. Your lead is now in Supabase.",
    });
  }

  return (
    <div className="waitlist-card">
      <div className="waitlist-intro">
        <h3>Waitlist capture form</h3>
        <p>Use this to collect early users, pre-orders, or launch interest.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            name="name"
            type="text"
            placeholder="Amina"
            value={form.name}
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

        <label className="field">
          <span>What are you building?</span>
          <textarea
            name="idea"
            placeholder="A short description of the idea, audience, or launch goal."
            value={form.idea}
            onChange={updateField}
          />
        </label>

        <div className="submit-row">
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save to Supabase"}
          </button>
          {status.message ? (
            <p className={`form-message ${status.type}`}>{status.message}</p>
          ) : null}
        </div>
      </form>

      <p className="helper-note">
        Tip: after you confirm it works, change the copy and colors to match your brand.
      </p>
    </div>
  );
}
