/* chat_init.js — KNOWN-GOOD v12 */
(function () {
  console.log("[pcw] init file loaded v12");
  var START = Date.now(), MAX_WAIT_MS = 20000, POLL_MS = 100;

  function ready() {
    return window.PortfolioChatWidget && typeof window.PortfolioChatWidget.init === "function";
  }
  function go() {
    console.log("[pcw] calling .init()");
    window.PortfolioChatWidget.init({ brand: "#2563eb" });
  }
  (function wait() {
    if (ready()) return go();
    if (Date.now() - START > MAX_WAIT_MS) {
      console.warn("[pcw] library not found after 20s. Check script order/URLs.");
      return;
    }
    setTimeout(wait, POLL_MS);
  })();
})();
