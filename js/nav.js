/* Shared site shell: left sidebar (desktop) / drawer (<=900px) + the "Roadmap" submenu.
   Desktop: the submenu is an inline disclosure in the sidebar, expanded by default; click/Enter/Space toggles, Esc collapses.
   Phone/tablet (<=900px): the sidebar is a focus-trapped drawer (Esc closes, focus restored, background scroll locked);
   Roadmap starts collapsed and a tap expands the two entries inline (it never navigates). */
(function(){
  const $ = (id) => document.getElementById(id);
  const sidebar = $("sidebar"), nav = $("topnav"), menuBtn = $("menu-btn"), closeBtn = $("drawer-close"), backdrop = $("backdrop");
  const btn = $("nav-roadmap-btn"), sub = $("nav-roadmap-menu"), group = $("nav-roadmap");
  const mq = window.matchMedia("(max-width:900px)");
  const mobile = () => mq.matches;
  let lastFocus = null;

  // ---- Roadmap submenu (disclosure) ----
  const isOpen = () => btn.getAttribute("aria-expanded") === "true";
  function setOpen(on){ group.classList.toggle("open", on); btn.setAttribute("aria-expanded", on ? "true" : "false"); }
  btn.addEventListener("click", (e) => { e.preventDefault(); setOpen(!isOpen()); });
  group.addEventListener("keydown", (e) => {
    const items = [...sub.querySelectorAll("a")], i = items.indexOf(document.activeElement);
    if (e.key === "Escape" && isOpen() && !(mobile() && drawerOpen())) { e.preventDefault(); e.stopPropagation(); setOpen(false); btn.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (!isOpen()) setOpen(true); (items[i + 1] || items[0]).focus(); }
    else if (e.key === "ArrowUp" && i >= 0) { e.preventDefault(); (i > 0 ? items[i - 1] : btn).focus(); }
  });

  // ---- Drawer ----
  const drawerOpen = () => document.body.classList.contains("drawer-open");
  function focusables(){ return [...sidebar.querySelectorAll("a[href], button:not([disabled])")].filter(el => el.offsetParent !== null || el === closeBtn); }
  function openDrawer(){
    if (!mobile()) return;
    lastFocus = document.activeElement;
    document.body.classList.add("drawer-open"); sidebar.inert = false; backdrop.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    (closeBtn || focusables()[0]).focus({ preventScroll: true });
  }
  function closeDrawer(restore = true){
    if (!drawerOpen()) return;
    document.body.classList.remove("drawer-open"); backdrop.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    if (mobile()) sidebar.inert = true;
    if (restore && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  menuBtn.addEventListener("click", () => drawerOpen() ? closeDrawer() : openDrawer());
  if (closeBtn) closeBtn.addEventListener("click", () => closeDrawer());
  backdrop.addEventListener("click", () => closeDrawer());
  document.addEventListener("keydown", (e) => {
    if (!drawerOpen()) return;
    if (e.key === "Escape") { e.preventDefault(); closeDrawer(); return; }
    if (e.key === "Tab") {
      const f = focusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // following any link in the drawer closes it (hash routes don't reload the page)
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) { closeDrawer(false); if (mobile()) setOpen(false); } });

  function applyMode(){
    if (mobile()) { sidebar.inert = !drawerOpen(); setOpen(false); }
    else { closeDrawer(false); sidebar.inert = false; setOpen(true); }
  }
  mq.addEventListener ? mq.addEventListener("change", applyMode) : mq.addListener(applyMode);
  applyMode();

  // ---- Active state: "home" (AI Engineer) and "fde" live under Roadmap ----
  function setActive(key){
    nav.querySelectorAll("[data-nav]").forEach(a => {
      const on = a.dataset.nav === key; a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    btn.classList.toggle("active", !!sub.querySelector(`[data-nav="${key}"]`));
  }
  function closeAll(){ closeDrawer(false); if (mobile()) setOpen(false); }
  window.SiteNav = { setActive, closeAll, setOpen, isOpen, openDrawer, closeDrawer };
  if (document.body.dataset.page) setActive(document.body.dataset.page);

  // ---- Sidebar progress on pages without the app (fde.html). Read-only: same formula as App.stats() ----
  if (!window.App) {
    try {
      const d = JSON.parse(localStorage.getItem("air-progress-v1") || "{}"), wk = d.weeks || {};
      let pts = 0; for (let i = 1; i <= 27; i++) { const s = wk[i] || {}; if (s.done) pts++; if ((s.quizBest || 0) >= 4) pts++; if (s.ex) pts++; }
      const pct = Math.round(pts / 81 * 100), f = $("top-progress-fill"), l = $("top-progress-label");
      if (f) f.style.width = pct + "%"; if (l) l.textContent = pct + "%";
    } catch (e) {}
  }
})();
