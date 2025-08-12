/* portfolio_chat_webflow.js — KNOWN-GOOD v12 */
(function () {
  console.log("[pcw] lib start v12");

  // If already defined, do nothing (prevents double loads from erroring)
  if (window.PortfolioChatWidget && typeof window.PortfolioChatWidget.init === "function") {
    console.log("[pcw] lib already defined");
    return;
  }

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

  // *** DEFINE THE GLOBAL ***
  window.PortfolioChatWidget = {
    init: function (config) {
      try {
        createButton(config || {});
        console.log("[pcw] lib init ok");
      } catch (e) {
        console.error("[pcw] lib init error", e);
      }
    }
  };

  console.log("[pcw] lib defined:", typeof window.PortfolioChatWidget.init);
})();
