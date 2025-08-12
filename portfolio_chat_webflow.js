/* portfolio_chat_webflow.js – MINIMAL, KNOWN-GOOD
   Defines a global window.PortfolioChatWidget with .init(cfg),
   and draws a visible button so we can prove the library loads.
*/
(function () {
  // guard: if already defined, don't redefine
  if (window.PortfolioChatWidget) return;

  function createButton(cfg) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Open chat");
    btn.textContent = "Chat";
    var color = (cfg && cfg.brand) || "#2563eb";
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "64px",
      height: "64px",
      borderRadius: "9999px",
      background: color,
      color: "#fff",
      border: "0",
      boxShadow: "0 10px 20px rgba(0,0,0,.15)",
      cursor: "pointer",
      zIndex: "999999"
    });
    btn.addEventListener("click", function () {
      alert("✅ Minimal widget loaded. Next step: swap in the full UI.");
    });
    document.body.appendChild(btn);
  }

  // expose a tiny, stable API
  window.PortfolioChatWidget = {
    init: function (config) {
      try {
        createButton(config || {});
        if (typeof console !== "undefined") {
          console.log("[pcw] library init ok");
        }
      } catch (e) {
        console.error("[pcw] library init error", e);
      }
    }
  };

  if (typeof console !== "undefined") {
    console.log("[pcw] library loaded");
  }
})();
