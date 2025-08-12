/* chat_init.js – MINIMAL, KNOWN-GOOD
   No inline JS needed; this file waits for the library then calls init.
*/
(function () {
  var START = Date.now();
  var MAX_WAIT_MS = 20000;  // 20s
  var POLL_MS = 100;

  function ready() {
    return (
      typeof window !== "undefined" &&
      window.PortfolioChatWidget &&
      typeof window.PortfolioChatWidget.init === "function"
    );
  }

  function init() {
    console.log("[pcw] init file running");
    window.PortfolioChatWidget.init({
      brand: "#2563eb",
      title: "What can I help you with?",
      contactEmail: "you@domain.com",
      suggestions: ["About me", "Projects", "Skills", "Resume", "Contact"],
      faqs: []
    });
  }

  (function waitLoop() {
    if (ready()) return init();
    if (Date.now() - START > MAX_WAIT_MS) {
      console.warn("[pcw] library not found after 20s. Check script order/URLs.");
      return;
    }
    setTimeout(waitLoop, POLL_MS);
  })();
})();
