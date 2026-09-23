(function () {
  const KEY = "sbd-whitby-v1";
  const scroller = document.getElementById("scroller");
  const store = JSON.parse(localStorage.getItem(KEY) || "{}");
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }
  function mround(n, m) { return Math.round(n / m) * m; }

  const P = window.PROGRAM;
  const names = P.n;

  function liftHTML(dayId, l) {
    const [id, ni, meta, flags, g, pct] = l;
    const bi = flags.includes("B") ? " bi" : "";
    let right = "";
    if (flags.includes("T")) {
      right = `<input class="kg top-kg" data-day="${dayId}" data-g="${g}" data-id="${id}" inputmode="decimal" placeholder="kg" aria-label="carga">`;
    } else if (flags.includes("K")) {
      right = `<input class="kg" data-id="${id}" inputmode="decimal" placeholder="kg" aria-label="carga">`;
    } else if (flags.includes("A")) {
      right = `<span class="kg-auto empty" data-day="${dayId}" data-g="${g}" data-pct="${pct}">—</span>`;
    }
    return `<label class="lift${bi}">
      <input type="checkbox" class="done" data-id="${id}">
      <span class="box"></span>
      <span class="body">
        <span class="name">${names[ni]}</span>
        <span class="meta">${meta}</span>
      </span>
      ${right}
    </label>`;
  }

  function dayHTML(d) {
    const note = d.n ? `<p class="note">${d.n}</p>` : "";
    const flag = d.g ? `<p class="flag">${d.g}</p>` : "";
    return `<section class="screen day" id="${d.id}" data-week="${d.w}">
      <header class="day-h">
        <p class="eyebrow">${d.e}</p>
        <h2>${d.t}</h2>
        <p class="foco">${d.f}</p>
      </header>
      ${note}${flag}
      <div class="lifts">${d.l.map(l => liftHTML(d.id, l)).join("")}</div>
    </section>`;
  }

  const cover = `<section class="screen cover" id="capa">
    <div class="cover-inner">
      <p class="eyebrow">Astartes Training · Angus Whitby · SBD</p>
      <h1>5 semanas</h1>
      <p class="sub">Seg · Ter · Qua · Sex · Sáb</p>
      <p class="hint">Rola pra baixo — cada dia é uma tela. Top set preenche o backdown sozinho (arredonda 2,5 kg). Safari → Compartilhar → Adicionar à Tela de Início para gravar as cargas.</p>
      <a class="go" href="#s1-seg">Começar semana 1</a>
    </div>
  </section>`;

  scroller.innerHTML = cover + P.d.map(dayHTML).join("");

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
        span.textContent = "—";
        span.classList.add("empty");
        return;
      }
      const pct = parseFloat(span.dataset.pct);
      const v = mround(n * pct, 2.5);
      span.textContent = (Number.isInteger(v) ? String(v) : v.toFixed(1));
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

  document.querySelector(".go").addEventListener("click", (e) => {
    e.preventDefault();
    const first = document.getElementById("s1-seg");
    if (first) first.scrollIntoView({ behavior: "smooth" });
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
