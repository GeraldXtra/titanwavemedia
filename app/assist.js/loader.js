// The script a business adds to its website for Wave Assist:
// <script src="{SITE_URL}/assist.js" data-id="{public_id}" async></script>
//
// It asks our server for nothing itself. After the page has loaded it adds one element at the
// end of the body, holding a hidden frame with our chat page. The chat page reads its settings
// and tells this script whether to show the button, with its words, colours and corner. If the
// chat page never says so (for example when the browser refuses to show it on this website),
// everything is taken away again after 15 seconds and nothing shows. It uses inline styles only
// and never touches the page's own styles. Running it twice on one page still makes one chat.
// Every message between the two is checked: it must come from our address and from the frame.

export const LOADER = String.raw`/* Wave Assist, Titan Wave Media */
(function () {
  "use strict";
  var w = window, d = document, SRC = "twm-assist", TAG = "twm-assist";
  if (w.__twmAssist || !w.postMessage) return;
  var me = d.currentScript || d.querySelector('script[src$="/assist.js"][data-id]');
  var id = me && me.getAttribute("data-id");
  if (!id || !/^[a-z0-9]{8,32}$/.test(id)) return;
  var ours;
  try { ours = new URL(me.src, location.href).origin; } catch (e) { return; }
  w.__twmAssist = 1;

  var host, frame, button, timer, open = false, corner = "right", ring = "#0b0b0b";

  function css(el, styles) {
    for (var k in styles) el.style.setProperty(k, styles[k], "important");
  }
  // A value with a safe area, where the browser knows them.
  function safe(el, prop, px, side) {
    css(el, (function (o) { o[prop] = px + "px"; return o; })({}));
    el.style.setProperty(prop, "calc(" + px + "px + env(safe-area-inset-" + side + ", 0px))", "important");
  }

  function post(kind) {
    if (frame && frame.contentWindow) frame.contentWindow.postMessage({ source: SRC, kind: kind }, ours);
  }

  function remove() {
    clearTimeout(timer);
    w.removeEventListener("message", onMessage);
    w.removeEventListener("resize", place);
    if (host && host.parentNode) host.parentNode.removeChild(host);
    host = frame = button = null;
  }

  // The open chat: a panel above the button, or the whole screen on a phone.
  function place() {
    if (!frame) return;
    if (!open) return css(frame, { display: "none" });
    var other = corner === "left" ? "right" : "left";
    if (w.innerWidth < 600) {
      css(frame, { display: "block", top: "0", left: "0", right: "auto", bottom: "auto", width: "100%", height: "100%", "max-width": "none", "max-height": "none", border: "0", "border-radius": "0", "box-shadow": "none", "box-sizing": "border-box" });
      frame.style.setProperty("height", "100dvh", "important");
      frame.style.setProperty("padding", "env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)", "important");
    } else {
      var o = { display: "block", top: "auto", width: "380px", height: "620px", "max-width": "calc(100vw - 32px)", "max-height": "calc(100vh - 104px)", border: "1px solid #c9c7c0", "border-radius": "12px", "box-shadow": "0 24px 48px -16px rgba(0,0,0,.35)", padding: "0", "box-sizing": "border-box" };
      o[other] = "auto";
      css(frame, o);
      safe(frame, "bottom", 80, "bottom");
      safe(frame, corner, 16, corner);
    }
  }

  function show(on) {
    open = on;
    place();
    if (!button) return;
    button.setAttribute("aria-expanded", on ? "true" : "false");
    if (on) {
      frame.focus();
      post("open");
    } else {
      button.focus();
    }
  }

  function focusRing(on) {
    var visible = on;
    try { visible = on && button.matches(":focus-visible"); } catch (e) {}
    css(button, visible ? { outline: "3px solid " + ring, "outline-offset": "2px", "box-shadow": "0 0 0 2px #fff, 0 8px 24px -8px rgba(0,0,0,.35)" } : { outline: "none", "box-shadow": "0 8px 24px -8px rgba(0,0,0,.35)" });
  }

  // The button, once the chat page says it is ready.
  function build(m) {
    var label = String(m.label || "").slice(0, 120);
    var color = /^#[0-9a-f]{6}$/.test(m.color) ? m.color : "#0b0b0b";
    var text = m.textColor === "#000000" ? "#000000" : "#ffffff";
    if (!label) return remove();
    corner = m.corner === "left" ? "left" : "right";
    frame.title = label;
    button = d.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "twm-assist-chat");
    css(button, {
      position: "fixed", "z-index": "1", margin: "0", "min-height": "48px", "max-width": "calc(100vw - 32px)",
      padding: "12px 20px", border: "2px solid " + (text === "#000000" ? "#0b0b0b" : color), "border-radius": "24px", background: color, color: text,
      font: "700 16px/1.25 system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", "letter-spacing": "normal",
      "text-transform": "none", "white-space": "nowrap", overflow: "hidden", "text-overflow": "ellipsis", cursor: "pointer",
      "box-shadow": "0 8px 24px -8px rgba(0,0,0,.35)", outline: "none"
    });
    css(button, corner === "left" ? { right: "auto" } : { left: "auto" });
    safe(button, "bottom", 16, "bottom");
    safe(button, corner, 16, corner);
    button.addEventListener("click", function () { show(!open); });
    button.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) show(false); });
    button.addEventListener("focus", function () { focusRing(true); });
    button.addEventListener("blur", function () { focusRing(false); });
    frame.parentNode.appendChild(button);
    w.addEventListener("resize", place);
  }

  function onMessage(e) {
    if (!frame || e.origin !== ours || e.source !== frame.contentWindow) return;
    var m = e.data;
    if (!m || typeof m !== "object" || m.source !== SRC) return;
    if (m.kind === "ready" && !button) {
      clearTimeout(timer);
      if (m.show) build(m);
      else remove();
    } else if (m.kind === "hide") {
      remove();
    } else if (m.kind === "close" && open) {
      show(false);
    }
  }

  function start() {
    if (!d.body || d.querySelector(TAG)) return;
    host = d.createElement(TAG);
    css(host, { all: "initial", display: "block", position: "fixed", top: "0", left: "0", width: "0", height: "0", overflow: "visible", "z-index": "2147483000" });
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
    frame = d.createElement("iframe");
    frame.id = "twm-assist-chat";
    frame.src = ours + "/assist/chat?id=" + encodeURIComponent(id) + "#o=" + encodeURIComponent(location.origin);
    css(frame, { display: "none", position: "fixed", "z-index": "2", background: "#fff", "color-scheme": "light" });
    root.appendChild(frame);
    w.addEventListener("message", onMessage);
    d.body.appendChild(host);
    timer = setTimeout(function () { if (!button) remove(); }, 15000);
  }

  if (d.readyState === "complete") start();
  else w.addEventListener("load", start);
})();
`;
