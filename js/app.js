(function () {
  const KEY = "sbd-whitby-v1";
  const scroller = document.getElementById("scroller");
  const store = JSON.parse(localStorage.getItem(KEY) || "{}");
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }

  function mround(n, m) {
    return Math.round(n / m) * m;
  }

  document.querySelectorAll("input.kg").forEach((el) => {
    const id = el.dataset.id;
    if (store[id]) el.value = store[id];
    el.addEventListener("input", () => {
      store[id] = el.value;
      save();
      if (el.classList.contains("top-kg")) recalc(el.dataset.day, el.dataset.g, el.value);
    });
    if (el.classList.contains("top-kg") && el.value) recalc(el.dataset.day, el.dataset.g, el.value);
  });

  document.querySelectorAll("input.done").forEach((el) => {
    const id = "chk-" + el.dataset.id;
    el.checked = !!store[id];
    el.addEventListener("change", () => {
      store[id] = el.checked;
      save();
    });
  });

  function recalc(day, g, raw) {
    const n = parseFloat(String(raw).replace(",", "."));
    document.querySelectorAll('.kg-auto[data-day="' + day + '"][data-g="' + g + '"]').forEach((span) => {
      if (!isFinite(n) || n <= 0) {
        span.textContent = "\u2014";
        span.classList.add("empty");
        return;
      }
      const pct = parseFloat(span.dataset.pct);
      const v = mround(n * pct, 2.5);
      span.textContent = (Number.isInteger(v) ? v : v.toFixed(1));
      span.classList.remove("empty");
    });
  }

  const btns = [...document.querySelectorAll(".wbtn")];
  function setWeek(id) {
    btns.forEach((b) => b.classList.toggle("on", b.dataset.week === id));
  }
  btns.forEach((b) => {
    b.addEventListener("click", () => {
      const first = document.querySelector('.day[data-week="' + b.dataset.week + '"]');
      if (first) first.scrollIntoView({ behavior: "smooth" });
    });
  });

  const io = new IntersectionObserver((entries) => {
    const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (vis && vis.target.dataset.week) setWeek(vis.target.dataset.week);
    if (vis && vis.target.id) {
      store._screen = vis.target.id;
      save();
    }
  }, { root: scroller, threshold: 0.45 });
  document.querySelectorAll(".day, .cover").forEach((s) => io.observe(s));

  if (store._screen) {
    const el = document.getElementById(store._screen);
    if (el) el.scrollIntoView({ behavior: "instant" });
  }

  document.querySelectorAll(".lift").forEach((row) => {
    const cb = row.querySelector(".done");
    const box = row.querySelector(".box");
    if (!cb || !box) return;
    box.addEventListener("click", (e) => {
      e.preventDefault();
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change"));
    });
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
