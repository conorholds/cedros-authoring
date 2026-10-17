import { useState } from "react";

export default function __CEDROS_PAGE_COMPONENT__() {
  const [expanded, setExpanded] = useState(false);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "5rem 1.5rem" }}>
      <p style={{ color: "var(--cedros-link, #2454d6)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Cedros authored page
      </p>
      <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 1.05, margin: "1rem 0" }}>
        {__CEDROS_PAGE_LABEL_JSON__}
      </h1>
      <p style={{ maxWidth: 680, fontSize: "1.2rem", lineHeight: 1.7 }}>
        This production-ready starting point keeps web, native, and Markdown surfaces aligned while leaving room for the page's real content and interactions.
      </p>
      <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} style={{ marginTop: "1.5rem", padding: "0.8rem 1rem", borderRadius: 10, cursor: "pointer" }}>
        {expanded ? "Hide authoring note" : "Show authoring note"}
      </button>
      {expanded ? <p role="status">Replace this note with a useful, accessible interaction or remove it before publishing.</p> : null}
    </main>
  );
}
