const initialized = new WeakSet();

export function scrollToElement(target, { focus = false, immediate = false } = {}) {
  if (!target) return false;
  if (focus) {
    const needsTabindex = !target.hasAttribute("tabindex") && !target.matches("a[href],button,input,select,textarea");
    if (needsTabindex) {
      target.setAttribute("tabindex", "-1");
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
    target.focus({ preventScroll: true });
  }
  target.scrollIntoView({ block: "start", behavior: immediate || matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  return true;
}

export function scrollToSection(destination, { immediate = false } = {}) {
  if (destination.origin !== location.origin || destination.pathname !== location.pathname || destination.search !== location.search) return false;
  let id;
  try { id = decodeURIComponent(destination.hash.slice(1)); } catch { return false; }
  const target = destination.hash ? document.getElementById(id) : document.querySelector("main");
  if (!target) return false;
  if (location.hash !== destination.hash) history.pushState(history.state, "", destination.href);
  return scrollToElement(target, { focus: true, immediate });
}

export function initializeNavigation() {
  if (initialized.has(document)) return;
  initialized.add(document);
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.closest("dialog") || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    if (scrollToSection(new URL(link.href), { immediate: link.classList.contains("skip-link") })) event.preventDefault();
  });
}
