import { Hero } from "@/components/landing/hero";
import { SignupCard } from "@/components/landing/signup-card";

export const runtime = "edge";

interface HomeProps {
  searchParams?: {
    signup?: string | string[];
    email?: string | string[];
  };
}

export default function Home({ searchParams }: HomeProps) {
  const signupParam = searchParams?.signup;
  const signupStatus = typeof signupParam === "string" ? signupParam : undefined;
  const hadLegacyGetSubmit = typeof searchParams?.email === "string";
  const initialStatus = signupStatus ?? (hadLegacyGetSubmit ? "fallback" : undefined);

  return (
    <main>
      <div className="ambient-shape ambient-one" aria-hidden="true" />
      <div className="ambient-shape ambient-two" aria-hidden="true" />

      <div className="container page-shell">
        <header className="brand-strip reveal" aria-label="Brand">
          <p className="brand-mark">FigLeaf Fits</p>
        </header>

        <Hero />

        <SignupCard initialStatus={initialStatus} />

        <footer className="legal-note reveal delay-2">
          Designed with reverence, stitched with personality.
        </footer>
      </div>
    </main>
  );
}
