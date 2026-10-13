import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="shell legal-page empty-state">
      <span className="eyebrow">404</span>
      <h1>Dieser Fund fehlt noch.</h1>
      <p>Die gesuchte Seite ist nicht vorhanden.</p>
      <Link className="button primary" href="/">
        Zur Startseite
      </Link>
    </main>
  );
}
