/**
 * Reading progress — fixed top bar synced to document scroll (singles only).
 */
(function () {
  const root = document.querySelector(".scroll-progress");
  if (!root) return;

  const bar = root.querySelector(".scroll-progress__bar");
  if (!bar) return;

  let ticking = false;

  function progress() {
    const el = document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) return 0;
    return Math.min(1, Math.max(0, el.scrollTop / max));
  }

  function update() {
    ticking = false;
    bar.style.transform = "scaleX(" + progress() + ")";
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
})();
