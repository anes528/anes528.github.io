(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ظهور العناصر عند التمرير */
  const items = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  /* الشريط العلوي */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 12);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  /* قائمة الجوال */
  const burger = $("#burger"), links = $("#links");
  const setMenu = (open) => {
    links.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.innerHTML = `<svg class="ic"><use href="#i-${open ? "x" : "menu"}"/></svg>`;
  };
  burger.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", (e) => {
    if (links.classList.contains("open") && !e.target.closest("#links, #burger")) setMenu(false);
  });

  /* تبويبات المعاينة */
  const tabs = $$(".tab");
  const show = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", String(on));
      const p = document.getElementById(t.getAttribute("aria-controls"));
      p.hidden = !on;
      p.classList.toggle("on", on);
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => show(t));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0; // اتجاه RTL
      if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); show(n);
    });
  });

  /* تقدم التحميل المتحرك في نافذة الواجهة */
  if (!reduce) {
    const rows = $$(".hero-visual .dl").map((el) => ({
      el,
      bar: $(".bar i", el),
      pct: $(".pct", el),
      spd: $(".spd", el),
      base: parseFloat(el.dataset.speed),
      p: parseFloat(el.dataset.start),
    }));
    setInterval(() => {
      if (document.hidden) return;
      rows.forEach((r) => {
        r.p += r.base * 0.12 + Math.random() * 0.25;
        if (r.p >= 100) r.p = 4;
        r.bar.style.setProperty("--p", r.p.toFixed(1) + "%");
        r.pct.textContent = Math.floor(r.p) + "%";
        r.spd.textContent = (r.base * (0.85 + Math.random() * 0.3)).toFixed(1) + " MB/s";
      });
    }, 1000);
  }

  /* ميلان ثلاثي الأبعاد خفيف (للماوس فقط) */
  const tilt = $("#tilt"), win = tilt && $(".win", tilt);
  if (win && !reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    tilt.addEventListener("mousemove", (e) => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      win.style.transform = `rotateY(${(-x * 9).toFixed(2)}deg) rotateX(${(y * 7).toFixed(2)}deg)`;
    });
    tilt.addEventListener("mouseleave", () => { win.style.transform = ""; });
  }

  /* موجة عند الضغط على الأزرار */
  $$(".btn").forEach((b) => b.addEventListener("pointerdown", (e) => {
    if (reduce) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const w = document.createElement("span");
    w.className = "ripple";
    w.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(w);
    setTimeout(() => w.remove(), 650);
  }));

  /* نسخ بصمة SHA-256 */
  const copy = $("#copyHash"), hash = $("#hashVal");
  if (copy && hash) {
    copy.addEventListener("click", async () => {
      const txt = hash.textContent.trim();
      try {
        await navigator.clipboard.writeText(txt);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = txt; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch {}
        ta.remove();
      }
      copy.classList.add("done");
      copy.innerHTML = '<svg class="ic"><use href="#i-check"/></svg>';
      setTimeout(() => {
        copy.classList.remove("done");
        copy.innerHTML = '<svg class="ic"><use href="#i-copy"/></svg>';
      }, 1800);
    });
  }
})();
