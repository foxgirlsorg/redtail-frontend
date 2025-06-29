import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
    title: "RedTail",
    description: "Команда переводчиков RedTail",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
        <head />
        <body>
        {/* Umami inline script */}
        <Script
            id="umami-inline"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
(function(){
  "use strict";
  const WEBSITE_ID = "${process.env.PUBLIC_UMAMI_ID}";
  const HOST_URL = "${process.env.PUBLIC_UMAMI_DOMAIN}";
  const AUTO_TRACK = true;
  const EXCLUDE_SEARCH = false;

  const screen = window.screen;
  const navigator = window.navigator;
  const location = window.location;
  const document = window.document;
  const history = window.history;

  const hostname = location.hostname;
  const href = location.href;
  const origin = location.origin;
  const referrer = document.referrer;
  const titleElement = document.querySelector("head > title");

  const API_URL = HOST_URL.replace(/\\/$/, "") + "/api/send";
  const SCREEN = screen.width + "x" + screen.height;
  const EVENT_ATTR_RE = /data-umami-event-([\\w-_]+)/;
  const EVENT_ATTR = "data-umami-event";
  const CACHE_TIMEOUT = 300;

  let isInitialized = false;
  let cacheKey;
  let currentURL = cleanURL(href);
  let previousReferrer = referrer.startsWith(origin) ? "" : referrer;
  let pageTitle = document.title;

  function cleanURL(url) {
    try {
      const { pathname, search, hash } = new URL(url, location.href);
      return EXCLUDE_SEARCH ? pathname : pathname + search + hash;
    } catch {
      return EXCLUDE_SEARCH ? url.split("?")[0] : url;
    }
  }

  function encodeSafe(value) {
    if (!value) return value;
    try {
      const decoded = decodeURI(value);
      return decoded !== value ? decoded : encodeURI(value);
    } catch {
      return encodeURI(value);
    }
  }

  function buildPayload() {
    return {
      website: WEBSITE_ID,
      hostname,
      screen: SCREEN,
      language: navigator.language,
      title: encodeSafe(pageTitle),
      url: encodeSafe(currentURL),
      referrer: encodeSafe(previousReferrer)
    };
  }

  function isDisabled() {
    return !WEBSITE_ID;
  }

  async function sendEvent(payload, type = "event") {
    if (isDisabled()) return;
    const headers = { "Content-Type": "application/json" };
    if (cacheKey !== undefined) headers["x-umami-cache"] = cacheKey;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ type, payload }),
        headers
      });
      const text = await res.text();
      cacheKey = text;
    } catch (err) {}
  }

  function trackEvent(name, data) {
    const payload =
      typeof name === "string"
        ? { ...buildPayload(), name, data: typeof data === "object" ? data : undefined }
        : typeof name === "function"
          ? name(buildPayload())
          : typeof name === "object"
            ? name
            : buildPayload();

    return sendEvent(payload, "event");
  }

  function onLocationChange(_, __, newUrl) {
    if (!newUrl) return;
    const newCleanedURL = cleanURL(newUrl.toString());
    if (newCleanedURL !== currentURL) {
      previousReferrer = currentURL;
      currentURL = newCleanedURL;
      setTimeout(trackEvent, CACHE_TIMEOUT);
    }
  }

  function setupTracking() {
    if (isInitialized) return;

    const hook = (obj, fn, handler) => {
      const original = obj[fn];
      obj[fn] = function (...args) {
        handler(...args);
        return original.apply(this, args);
      };
    };

    hook(history, "pushState", onLocationChange);
    hook(history, "replaceState", onLocationChange);

    if (titleElement) {
      const observer = new MutationObserver(([mutation]) => {
        if (mutation && mutation.target) {
          pageTitle = mutation.target.text;
        }
      });
      observer.observe(titleElement, {
        subtree: true,
        characterData: true,
        childList: true
      });
    }

    document.addEventListener("click", async e => {
      const isTrackable = tag => ["BUTTON", "A"].includes(tag);

      const extractEvent = el => {
        const name = el.getAttribute(EVENT_ATTR);
        if (!name) return;
        const data = {};
        el.getAttributeNames().forEach(attr => {
          const match = attr.match(EVENT_ATTR_RE);
          if (match) data[match[1]] = el.getAttribute(attr);
        });
        return trackEvent(name, data);
      };

      let el = e.target;
      for (let i = 0; i < 10 && el; i++) {
        if (isTrackable(el.tagName)) break;
        el = el.parentElement;
      }

      if (!el) return;
      const name = el.getAttribute(EVENT_ATTR);

      if (name && el.tagName === "A") {
        const href = el.href;
        const isExternal =
          el.target === "_blank" || e.ctrlKey || e.shiftKey || e.metaKey || (e.button && e.button === 1);
        if (!isExternal) e.preventDefault();
        await extractEvent(el);
        if (!isExternal) location.href = href;
      } else if (name && el.tagName === "BUTTON") {
        extractEvent(el);
      }
    });

    isInitialized = true;
    trackEvent(); // Initial page view
  }

  if (AUTO_TRACK && !isDisabled()) {
    if (document.readyState === "complete") {
      setupTracking();
    } else {
      document.addEventListener("readystatechange", () => {
        if (document.readyState === "complete") setupTracking();
      }, true);
    }
  }

  window.umami = {
    track: trackEvent,
    identify: data => sendEvent({ ...buildPayload(), data }, "identify")
  };
})();
            `,
            }}
        />
        {children}
        </body>
        </html>
    );
}
