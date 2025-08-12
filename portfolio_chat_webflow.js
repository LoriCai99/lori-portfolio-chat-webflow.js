/* chat_init.js
   Loads configuration and initializes the widget once the library is present.
   Safe for CSP (no inline code) and for multiple page loads (guards against double init).
*/
(function () {
  // ----- CONFIG: edit these to your details -----
  var CHAT_CONFIG = {
    mount: "body",                 // Where to attach in DOM
    brand: "#2563eb",              // Main color (button/header)
    title: "What can I help you with?",
    contactEmail: "you@domain.com",
    suggestions: ["About me", "Projects", "Skills", "Resume", "Contact"],
    faqs: [
      {
        question: "About me",
        answer:
          "Hi! I'm Lori Cai, a full-stack engineer who loves building polished UIs and robust backends.",
      },
      {
        question: "Projects",
        answer:
          "Highlights: 1) Real-time dashboard (Next.js + websockets), 2) Visual diff tool (Rust + WASM), 3) ML-aided search (Python + Postgres).",
      },
      {
        question: "Skills",
        answer:
          "TypeScript, React/Next.js, Node, Python, Postgres, Tailwind, Playwright, Docker, AWS.",
      },
      {
        question: "Resume",
        answer:
          "Ask me here and I can share a link, or find it in the site navigation.",
      },
      {
        question: "Contact",
        answer:
          "Best way to reach me is email. I usually reply within 24 hours.",
      },
    ],
  };
  // ---------------------------------------------

  // Guard so we don't initialize twice if scripts are included multiple times.
  if (window.__PCW_INIT_ATTEMPTED__) {
    // If you really need to re-init, delete the flag and call again.
    return;
  }
  window.__PCW_INIT_ATTEMPTED__ = true;

  var START = Date.now();
  var MAX_WAIT_MS = 20000; // stop trying after 20s
  var POLL_MS = 100;

  function libraryReady() {
    return (
      typeof window !== "undefined" &&
      window.PortfolioChatWidget &&
      typeof window.PortfolioChatWidget.init === "function"
    );
  }

  function init() {
    try {
      window.PortfolioChatWidget.init(CHAT_CONFIG);
      // Optional: open on load
      // if (window.PortfolioChatWidget && window.PortfolioChatWidget.open) {
      //   window.PortfolioChatWidget.open();
      // }
      if (typeof console !== "undefined") {
        console.log("[pcw] initialized");
      }
    } catch (err) {
      console.error("[pcw] init error:", err);
    }
  }

  (function waitForLibrary() {
    if (libraryReady()) {
      init();
      return;
    }
    if (Date.now() - START > MAX_WAIT_MS) {
      console.warn(
        "[pcw] library not found after " + MAX_WAIT_MS + "ms. " +
          "Verify the library <script src> is above this init file and loads with status 200."
      );
      return;
    }
    setTimeout(waitForLibrary, POLL_MS);
  })();
})();

// expose the global
window.PortfolioChatWidget = { init: (config) => new Widget(config) };

