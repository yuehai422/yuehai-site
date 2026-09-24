/**
 * Photography lightbox — keyboard + click; only on album pages with #photo-lightbox.
 */
(function () {
  const dialog = document.getElementById("photo-lightbox");
  if (!dialog) return;

  const wall = document.querySelector(".photo-wall--lightbox");
  if (!wall) return;

  const tiles = Array.from(wall.querySelectorAll("[data-photo-index]"));
  if (!tiles.length) return;

  const imgEl = dialog.querySelector(".photo-lightbox__img");
  const captionEl = dialog.querySelector(".photo-lightbox__caption");
  const counterEl = dialog.querySelector("[data-lightbox-counter]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;

  function show(i) {
    index = (i + tiles.length) % tiles.length;
    const tile = tiles[index];
    const src = tile.getAttribute("data-photo-src");
    const alt = tile.getAttribute("data-photo-alt") || "";
    imgEl.src = src;
    imgEl.alt = alt;
    captionEl.textContent = alt;
    captionEl.hidden = !alt;
    if (counterEl) {
      counterEl.hidden = tiles.length < 2;
      counterEl.textContent = index + 1 + " / " + tiles.length;
    }
  }

  function open(i) {
    show(i);
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.documentElement.classList.add("photo-lightbox-open");
  }

  function close() {
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    document.documentElement.classList.remove("photo-lightbox-open");
  }

  function step(delta) {
    show(index + delta);
    if (!reducedMotion) {
      imgEl.classList.remove("photo-lightbox__img--flash");
      void imgEl.offsetWidth;
      imgEl.classList.add("photo-lightbox__img--flash");
    }
  }

  wall.addEventListener("click", (e) => {
    const tile = e.target.closest("[data-photo-index]");
    if (!tile || !wall.contains(tile)) return;
    e.preventDefault();
    open(parseInt(tile.getAttribute("data-photo-index"), 10) || 0);
  });

  dialog.querySelectorAll("[data-lightbox-close]").forEach((btn) => {
    btn.addEventListener("click", close);
  });
  dialog.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => step(-1));
  dialog.querySelector("[data-lightbox-next]")?.addEventListener("click", () => step(1));

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });

  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (!dialog.open) return;
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  });
})();
