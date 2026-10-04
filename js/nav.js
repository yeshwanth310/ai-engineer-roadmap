/* Shared top navigation: hamburger menu + the "Roadmap" submenu (disclosure pattern).
   Desktop: opens on hover, keyboard focus or click; Esc closes. Phone (<=720px): tap toggles it inline. */
(function(){
  const nav = document.getElementById("topnav"), menuBtn = document.getElementById("menu-btn");
  const group = document.getElementById("nav-roadmap"), btn = document.getElementById("nav-roadmap-btn"), sub = document.getElementById("nav-roadmap-menu");
  const mobile = () => window.matchMedia("(max-width:720px)").matches;
  let openedBy = null, pointerDown = false;
  function setOpen(on, by){
    openedBy = on ? (by || openedBy || "click") : null;
    group.classList.toggle("open", on); btn.setAttribute("aria-expanded", on ? "true" : "false");
  }
  const isOpen = () => btn.getAttribute("aria-expanded") === "true";
  btn.addEventListener("pointerdown", () => { pointerDown = true; });
  btn.addEventListener("click", (e) => {
    e.preventDefault(); pointerDown = false;
    if (isOpen() && (openedBy === "click" || mobile())) setOpen(false); else setOpen(true, "click");
  });
  btn.addEventListener("focus", () => { if (!mobile() && !pointerDown && !isOpen()) setOpen(true, "focus"); pointerDown = false; });
  group.addEventListener("mouseenter", (e) => { if (!mobile() && e.pointerType !== "touch" && !isOpen()) setOpen(true, "hover"); });
  group.addEventListener("mouseleave", () => { if (!mobile() && openedBy === "hover") setOpen(false); });
  group.addEventListener("focusout", (e) => { if (!mobile() && !group.contains(e.relatedTarget)) setOpen(false); });
  group.addEventListener("keydown", (e) => {
    const items = [...sub.querySelectorAll("a")], i = items.indexOf(document.activeElement);
    if (e.key === "Escape" && isOpen()) { e.preventDefault(); setOpen(false); btn.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (!isOpen()) setOpen(true, "click"); (items[i + 1] || items[0]).focus(); }
    else if (e.key === "ArrowUp" && i >= 0) { e.preventDefault(); (i > 0 ? items[i - 1] : btn).focus(); }
  });
  document.addEventListener("click", (e) => { if (!group.contains(e.target) && !mobile()) setOpen(false); });
  sub.addEventListener("click", () => { setOpen(false); nav.classList.remove("open"); });
  if (menuBtn) menuBtn.addEventListener("click", () => {
    const on = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", on ? "true" : "false");
    if (!on) setOpen(false);
  });
  // highlight the current page; "home" and "fde" live under Roadmap
  function setActive(key){
    nav.querySelectorAll("[data-nav]").forEach(a => {
      const on = a.dataset.nav === key; a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    btn.classList.toggle("active", !!sub.querySelector(`[data-nav="${key}"]`));
  }
  function closeAll(){ setOpen(false); nav.classList.remove("open"); if (menuBtn) menuBtn.setAttribute("aria-expanded", "false"); }
  window.SiteNav = { setActive, closeAll, setOpen, isOpen };
  if (document.body.dataset.page) setActive(document.body.dataset.page);
})();
