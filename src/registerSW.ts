// Guarded service worker registration.
// Skips Lovable preview/iframe/dev so we never cache the editor shell.
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD) return;

  const host = window.location.hostname;
  const inIframe = window.self !== window.top;
  const isLovablePreview =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  const killSwitch = new URLSearchParams(window.location.search).get("sw") === "off";

  if (inIframe || isLovablePreview || killSwitch) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => {
        if (r.active?.scriptURL.endsWith("/sw.js")) r.unregister();
      });
    });
    return;
  }

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((_err) => {
      });
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register);

  if (import.meta.env.PROD) {
    navigator.serviceWorker.ready.then(() => {
    });
  }
}