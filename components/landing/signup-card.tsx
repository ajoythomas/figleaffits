"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

interface ApiResponse {
  ok: boolean;
  destination?: "google_sheets" | "static" | "filtered";
  error?: string;
}

interface SignupCardProps {
  title?: string;
  description?: string;
  initialStatus?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_STORAGE_KEY = "figleaffits.waitlist";

function saveEmailLocally(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  const parsed = existing ? (JSON.parse(existing) as string[]) : [];

  if (!parsed.includes(email)) {
    parsed.push(email);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
  }
}

export function SignupCard({
  title = "Sign up for our waitlist",
  description = "All Ham, No spam. ",
  initialStatus,
}: SignupCardProps) {
  const initialState: SubmitState =
    initialStatus === "success" || initialStatus === "success-static" ? "success" : "idle";

  const initialMessage =
    initialStatus === "success" || initialStatus === "success-static"
      ? "Thank you. Your email was recorded successfully."
      : "";

  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<SubmitState>(initialState);
  const [message, setMessage] = useState(initialMessage);

  const isSubmitting = state === "submitting";

  const statusClass = useMemo(() => {
    if (state === "success") {
      return "signup-status success";
    }

    if (state === "error") {
      return "signup-status error";
    }

    return "signup-status";
  }, [state]);

  useEffect(() => {
    if (!initialStatus) {
      return;
    }

    if (initialStatus === "filtered") {
      setState("error");
      setMessage("Submission was flagged as spam. Please refresh and try again.");
      return;
    }

    if (initialStatus === "invalid") {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (initialStatus === "fallback") {
      setState("error");
      setMessage("Your browser submitted without JavaScript. Please submit one more time.");
      return;
    }

    setState("error");
    setMessage("Could not save your email. Please try again.");
  }, [initialStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, hp }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok) {
        setState("error");
        setMessage(data.error ?? "Could not save your email. Please try again.");
        return;
      }

      if (data.destination === "filtered") {
        setState("error");
        setMessage("Submission was flagged as spam. Please refresh and try again.");
        return;
      }

      if (data.destination === "static") {
        saveEmailLocally(normalizedEmail);
        setState("success");
        setMessage("Thank you. Your email was recorded on this device.");
      } else {
        setState("success");
        setMessage("Thank you. Your email was recorded successfully.");
      }

      setEmail("");
      setHp("");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section className="signup-card reveal delay-1" aria-labelledby="signup-title">
      <div className="signup-header">
        <h2 id="signup-title">{title}</h2>
        <p>
          {state === "success"
            ? "Thank you for your interest, we will let you know as soon as we launch!"
            : description}
        </p>
      </div>

      <form
        className="signup-form"
        onSubmit={handleSubmit}
        method="post"
        action="/api/subscribe"
        noValidate
      >
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          className="email-input"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
        />

        <label htmlFor="contact-check" className="sr-only">
          Leave this field blank
        </label>
        <input
          id="contact-check"
          name="hp"
          type="text"
          tabIndex={-1}
          autoComplete="new-password"
          className="honeypot"
          value={hp}
          onChange={(event) => setHp(event.target.value)}
          aria-hidden="true"
        />

        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Join waitlist"}
        </button>
      </form>


      {state === "success" ? (
        <div className="thank-you-note" role="status" aria-live="polite">
          Thank you for signing up. You are officially on the Fig Leaves Fits waitlist.
        </div>
      ) : null}

   
    </section>
  );
}
