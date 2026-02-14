import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const dynamic = "force-dynamic";
export const runtime = "edge";

type WebhookPayload = {
  email: string;
  source: string;
  submittedAt: string;
};

type ParsedSubmission = {
  email: string;
  hp: string;
  legacyWebsite: string;
  isFormSubmit: boolean;
};

async function postJson(url: string, payload: WebhookPayload) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    redirect: "manual",
  });
}

async function forwardToGoogleSheets(webhookUrl: string, payload: WebhookPayload) {
  const response = await postJson(webhookUrl, payload);

  // Google Apps Script commonly returns 302 for successful doPost executions.
  if (response.status >= 300 && response.status < 400) {
    return { ok: true };
  }

  if (!response.ok) {
    return { ok: false, error: `Google Sheets webhook failed with status ${response.status}.` };
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await response.json()) as { ok?: boolean; error?: string; duplicate?: boolean };
    if (data.ok === false) {
      return { ok: false, error: data.error ?? "Google Sheets script returned an error." };
    }
  }

  return { ok: true };
}

async function parseSubmission(request: Request): Promise<ParsedSubmission> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      email?: string;
      hp?: string;
      website?: string;
    };

    return {
      email: (body.email ?? "").trim().toLowerCase(),
      hp: (body.hp ?? "").trim(),
      legacyWebsite: (body.website ?? "").trim(),
      isFormSubmit: false,
    };
  }

  const form = await request.formData();

  return {
    email: String(form.get("email") ?? "").trim().toLowerCase(),
    hp: String(form.get("hp") ?? "").trim(),
    legacyWebsite: String(form.get("website") ?? form.get("contact-check") ?? "").trim(),
    isFormSubmit: true,
  };
}

function redirectWithStatus(request: Request, signup: string) {
  const url = new URL("/", request.url);
  url.searchParams.set("signup", signup);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  try {
    const { email, hp, legacyWebsite, isFormSubmit } = await parseSubmission(request);

    if (hp || legacyWebsite) {
      if (isFormSubmit) {
        return redirectWithStatus(request, "filtered");
      }
      return NextResponse.json({ ok: true, destination: "filtered" }, { status: 200 });
    }

    if (!EMAIL_REGEX.test(email)) {
      if (isFormSubmit) {
        return redirectWithStatus(request, "invalid");
      }
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const payload: WebhookPayload = {
      email,
      source: "figleaffits",
      submittedAt: new Date().toISOString(),
    };

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
      if (isFormSubmit) {
        return redirectWithStatus(request, "success-static");
      }
      return NextResponse.json({ ok: true, destination: "static" }, { status: 200 });
    }

    const result = await forwardToGoogleSheets(webhookUrl, payload);

    if (!result.ok) {
      if (isFormSubmit) {
        return redirectWithStatus(request, "error");
      }
      return NextResponse.json(
        {
          ok: false,
          error: result.error ?? "Email submission failed. Please try again.",
        },
        { status: 502 },
      );
    }

    if (isFormSubmit) {
      return redirectWithStatus(request, "success");
    }

    return NextResponse.json({ ok: true, destination: "google_sheets" }, { status: 200 });
  } catch {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return redirectWithStatus(request, "error");
    }
    return NextResponse.json(
      { ok: false, error: "Unexpected error while submitting email." },
      { status: 500 },
    );
  }
}
