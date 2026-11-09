const PRODUCTS = [
  {
    id: "cherry",
    name: "Вишня & Чеснок",
    short: "Вишня",
    desc: "Сладкая настоящая вишня и пикантная глубина чеснока. Мягкий, без остроты. Для рёбрышек и свиной шейки.",
    heat: 0,
    heatLabel: "Не остро",
    price: 690,
    color: "#a3122a",
    bg: "#f6c9cf",
    img: "assets/cherry.jpg",
    fruits: ["cherry", "habanero", "cherry"],
    tag: "Хит",
  },
  {
    id: "pineapple",
    name: "Ананас & Шрирача",
    short: "Ананас",
    desc: "Яркий ананас впереди, затем раскрывается шрирача. Лёгкий огонёк для крыльев, креветок и лосося.",
    heat: 2,
    heatLabel: "Средне",
    price: 690,
    color: "#f4b400",
    bg: "#fde7a6",
    img: "assets/pineapple.jpg",
    fruits: ["pineapple", "habanero", "pineapple"],
  },
  {
    id: "peach",
    name: "Копчёный персик & Чипотле",
    short: "Персик",
    desc: "Начинается с персика, заканчивается дымным жаром чипотле. Для брискета, бургеров и курицы.",
    heat: 3,
    heatLabel: "Средне+",
    price: 720,
    color: "#ef7d2d",
    bg: "#fbd2ae",
    img: "assets/peach.jpg",
    fruits: ["peach", "habanero", "peach"],
    tag: "Новинка",
  },
  {
    id: "habanero",
    name: "Хабанеро & Чеснок",
    short: "Хабанеро",
    desc: "Острота бьёт сразу и долго держится. Чеснок не даёт улететь. Для тех, кто знает, на что идёт.",
    heat: 4,
    heatLabel: "Огонь",
    price: 720,
    color: "#d7261e",
    bg: "#f7b3a4",
    img: "assets/habanero.jpg",
    fruits: ["habanero", "cherry", "habanero"],
  },
];
const BUNDLE = { id: "bundle", name: "Сет из 3 соусов", short: "Сет", price: 1670, color: "#1d1410", bg: "#f4c331", img: "assets/peach.jpg", fruits: ["cherry", "pineapple", "peach", "habanero"] };

const fruitSrc = (f) => `assets/fruits/${f}.webp`;
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
const $ = (s) => document.querySelector(s);

function heatDots(level) {
  return Array.from({ length: 4 }, (_, i) => `<i class="${i < level ? "on" : ""}"></i>`).join("");
}

// Hero: fanned deck of photo cards
const FAN = [
  { tx: -0.62, ty: 0.12, rot: -15, depth: 10 },
  { tx: -0.22, ty: -0.06, rot: -5, depth: 18 },
  { tx: 0.22, ty: 0.02, rot: 6, depth: 26 },
  { tx: 0.62, ty: 0.14, rot: 15, depth: 14 },
];
$("#heroStack").innerHTML = PRODUCTS.map((p, i) => {
  const f = FAN[i];
  return `<button class="hcard" data-goto="${p.id}" aria-label="${p.name}"
      style="--tx:${f.tx};--ty:${f.ty};--rot:${f.rot}deg;--depth:${f.depth};--i:${i};z-index:${i + 1}">
    <span class="hcard__float"><img src="${p.img}" alt="${p.name}" width="600" height="920" /></span>
  </button>`;
}).join("");

$("#products").innerHTML = PRODUCTS.map(
  (p) => `<article class="product" id="p-${p.id}" data-heat="${p.heat}">
    <div class="product__img" style="--c:${p.bg}">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
      <img src="${p.img}" alt="Соус ${p.name}" loading="lazy" width="600" height="920" />
      ${p.fruits.map((f, i) => `<img class="fruit" src="${fruitSrc(f)}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="160" height="180" style="--x:${6 + i * 30}%;--d:${i * 0.55}s;--r:${i % 2 ? 1 : -1}" />`).join("")}
    </div>
    <div class="product__body">
      <h3>${p.name}</h3>
      <div class="heat">${heatDots(p.heat)}<span>&nbsp;${p.heatLabel}</span></div>
      <p>${p.desc}</p>
      <div class="product__foot">
        <span class="price">${rub(p.price)}</span>
        <button class="add" data-id="${p.id}">В корзину</button>
      </div>
    </div>
  </article>`
).join("");

// Heat filter: "2" also covers medium-plus (3)
document.querySelectorAll(".chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    const f = chip.dataset.heat;
    document.querySelectorAll(".product").forEach((card) => {
      const h = +card.dataset.heat;
      const show = f === "all" || (f === "0" && h === 0) || (f === "2" && (h === 2 || h === 3)) || (f === "4" && h === 4);
      card.classList.toggle("is-hidden", !show);
    });
  })
);

// Cart (persisted in localStorage)
const findItem = (id) => (id === BUNDLE.id ? BUNDLE : PRODUCTS.find((p) => p.id === id));
let cart = JSON.parse(localStorage.getItem("dymok-cart") || "{}");

function saveCart() {
  localStorage.setItem("dymok-cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const ids = Object.keys(cart).filter((id) => findItem(id));
  const count = ids.reduce((s, id) => s + cart[id], 0);
  const total = ids.reduce((s, id) => s + cart[id] * findItem(id).price, 0);
  const badge = $("#cartCount");
  badge.textContent = count;
  badge.classList.add("bump");
  setTimeout(() => badge.classList.remove("bump"), 200);
  $("#cartTotal").textContent = rub(total);
  $("#cartItems").innerHTML = ids.length
    ? ids
        .map((id) => {
          const p = findItem(id);
          return `<div class="cart-item">
            <div class="cart-item__img" style="--c:${p.bg}"><img src="${p.img}" alt="" />${id === BUNDLE.id ? "<b>×3</b>" : ""}</div>
            <div><strong>${p.name}</strong>
              <div class="qty"><button data-dec="${id}" aria-label="Меньше">−</button><span>${cart[id]}</span><button data-inc="${id}" aria-label="Больше">+</button></div>
            </div>
            <span>${rub(p.price * cart[id])}</span>
          </div>`;
        })
        .join("")
    : `<p class="cart__empty">Корзина пуста. Соус сам себя не купит 🔥</p>`;
}

function add(id, sourceEl) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  toast(`«${findItem(id).name}» в корзине`);
  if (sourceEl) celebrate(id, sourceEl);
}

// Add-to-cart effects: photo flies into the cart, ingredients burst from the button
function celebrate(id, btn) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const item = findItem(id);
  const cartBtn = $("#cartOpen").getBoundingClientRect();
  const b = btn.getBoundingClientRect();
  const imgs = id === BUNDLE.id ? PRODUCTS.slice(0, 3).map((p) => p.img) : [item.img];
  const card = btn.closest(".product");
  const from = card ? card.querySelector(".product__img").getBoundingClientRect() : b;

  imgs.forEach((src, i) => {
    const fly = document.createElement("img");
    fly.src = src;
    fly.className = "fly";
    const w = card ? Math.min(from.width * 0.6, 160) : 90;
    Object.assign(fly.style, { width: w + "px", left: from.left + from.width / 2 - w / 2 + "px", top: from.top + 10 + "px" });
    document.body.append(fly);
    const dx = cartBtn.left + cartBtn.width / 2 - (from.left + from.width / 2);
    const dy = cartBtn.top + cartBtn.height / 2 - (from.top + 10 + w * 0.75);
    fly.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 140}px) scale(.75) rotate(${-20 + i * 15}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(${200 + i * 40}deg)`, opacity: 0.4 },
      ],
      { duration: 900 + i * 120, delay: i * 90, easing: "cubic-bezier(.5,0,.6,1)", fill: "forwards" }
    ).onfinish = () => {
      fly.remove();
      const c = $("#cartOpen");
      c.classList.remove("gulp");
      void c.offsetWidth;
      c.classList.add("gulp");
    };
  });

  // Fruit pieces pop out of the button with juice drops and a shockwave ring
  const cx = b.left + b.width / 2;
  const cy = b.top + b.height / 2;
  const small = innerWidth < 520;
  const spawn = (el, styles) => {
    Object.assign(el.style, { left: cx + "px", top: cy + "px", ...styles });
    document.body.append(el);
    return el;
  };

  const ring = spawn(document.createElement("span"), { borderColor: item.color });
  ring.className = "burst-ring";
  ring.animate(
    [
      { transform: "translate(-50%,-50%) scale(.2)", opacity: 0.9 },
      { transform: "translate(-50%,-50%) scale(3.2)", opacity: 0 },
    ],
    { duration: 650, easing: "cubic-bezier(.2,.7,.3,1)" }
  ).onfinish = () => ring.remove();

  const pieces = small ? 8 : 11;
  for (let i = 0; i < pieces; i++) {
    const s = document.createElement("img");
    s.className = "burst";
    s.alt = "";
    s.src = fruitSrc(item.fruits[i % item.fruits.length]);
    spawn(s, { width: (small ? 30 : 38) + Math.random() * 26 + "px" });
    const ang = (Math.PI * 2 * i) / pieces + Math.random() * 0.5;
    const dist = (small ? 60 : 80) + Math.random() * 90;
    const x = Math.cos(ang) * dist;
    const y = Math.sin(ang) * dist - 60;
    const spin = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 360);
    s.animate(
      [
        { transform: "translate(-50%,-50%) scale(.1) rotate(0deg)", opacity: 0 },
        { transform: `translate(calc(-50% + ${x * 0.6}px), calc(-50% + ${y * 0.6}px)) scale(1.25) rotate(${spin * 0.3}deg)`, opacity: 1, offset: 0.25 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1) rotate(${spin * 0.6}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${x * 1.25}px), calc(-50% + ${y + 160}px)) scale(.5) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 1200 + Math.random() * 500, delay: Math.random() * 80, easing: "cubic-bezier(.2,.7,.4,1)", fill: "backwards" }
    ).onfinish = () => s.remove();
  }

  for (let i = 0; i < (small ? 6 : 10); i++) {
    const size = 6 + Math.random() * 8 + "px";
    const d = spawn(document.createElement("span"), { width: size, height: size, background: item.color });
    d.className = "juice";
    const ang = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 70;
    const x = Math.cos(ang) * dist;
    const y = Math.sin(ang) * dist - 30;
    d.animate(
      [
        { transform: "translate(-50%,-50%) scale(0)", opacity: 1 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`, opacity: 1, offset: 0.4 },
        { transform: `translate(calc(-50% + ${x * 1.1}px), calc(-50% + ${y + 90}px)) scale(.3)`, opacity: 0 },
      ],
      { duration: 800 + Math.random() * 300, easing: "cubic-bezier(.3,.6,.5,1)" }
    ).onfinish = () => d.remove();
  }
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-id]");
  if (a) add(a.dataset.id, a);
  const inc = e.target.closest("[data-inc]");
  if (inc) { cart[inc.dataset.inc]++; saveCart(); }
  const dec = e.target.closest("[data-dec]");
  if (dec) {
    const id = dec.dataset.dec;
    if (--cart[id] <= 0) delete cart[id];
    saveCart();
  }
});

$("#addBundle").addEventListener("click", (e) => add(BUNDLE.id, e.currentTarget));

const setCart = (open) => {
  document.body.classList.toggle("cart-open", open);
  $("#cart").setAttribute("aria-hidden", String(!open));
};
$("#cartOpen").addEventListener("click", () => setCart(true));
$("#cartClose").addEventListener("click", () => setCart(false));
$("#overlay").addEventListener("click", () => setCart(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && setCart(false));

$("#checkout").addEventListener("click", () => {
  if (!Object.keys(cart).length) return toast("Сначала добавьте соус");
  cart = {};
  saveCart();
  setCart(false);
  toast("Спасибо! Заказ принят — мы свяжемся с вами 🔥");
});

// Mobile nav
$("#burger").addEventListener("click", () => document.body.classList.toggle("nav-open"));
document.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("nav-open")));

$("#newsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  $("#newsletterMsg").textContent = "Готово! Первый секретный рецепт уже летит к вам.";
});

$("#year").textContent = new Date().getFullYear();
renderCart();

/* ===== Motion ===== */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

// Smooth inertial scroll; falls back to native scrolling if the CDN script failed
const lenis = !reduceMotion && window.Lenis ? new Lenis({ lerp: 0.09, smoothWheel: true }) : null;

const scrollToTarget = (target) => {
  if (lenis) lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -90, duration: 1.4 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else target.scrollIntoView({ behavior: "smooth" });
};

document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id === "#" || id === "#top") {
      e.preventDefault();
      return scrollToTarget(0);
    }
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      scrollToTarget(el);
    }
  })
);
$("#toTop").addEventListener("click", () => scrollToTarget(0));

// Hero card -> jump to its product and make it wave
document.querySelectorAll(".hcard").forEach((c) =>
  c.addEventListener("click", () => {
    const target = $("#p-" + c.dataset.goto);
    document.querySelector('.chip[data-heat="all"]').click();
    scrollToTarget(target);
    target.classList.remove("flash");
    setTimeout(() => target.classList.add("flash"), 900);
    setTimeout(() => target.classList.remove("flash"), 2600);
  })
);

// Freeze page scroll while the cart drawer is open
new MutationObserver(() => {
  if (!lenis) return;
  if (document.body.classList.contains("cart-open")) lenis.stop();
  else lenis.start();
}).observe(document.body, { attributes: true, attributeFilter: ["class"] });

// Split the hero headline into words for a staggered reveal
function splitWords(root) {
  let i = 0;
  const walk = (node) =>
    [...node.childNodes].forEach((n) => {
      if (n.nodeType !== Node.TEXT_NODE) return walk(n);
      const frag = document.createDocumentFragment();
      n.textContent.split(/( +)/).forEach((part) => {
        if (!part) return;
        if (!part.trim()) return frag.append(part);
        const word = document.createElement("span");
        const inner = document.createElement("span");
        word.className = "word";
        inner.textContent = part;
        inner.style.setProperty("--i", i++);
        word.append(inner);
        frag.append(word);
      });
      n.replaceWith(frag);
    });
  walk(root);
}
document.querySelectorAll(".split").forEach(splitWords);

// Reveal on scroll with per-group stagger
const revealGroups = [
  [".section-head", ""],
  [".pillar", ""],
  [".product", ""],
  [".bundle", "pop"],
  [".real h2, .real > p", ""],
  [".ingredients li", "pop"],
  [".about__img", "left"],
  [".about__text > *", "right"],
  [".reviews blockquote", ""],
  [".faq__list details", ""],
  [".newsletter > *", ""],
  [".footer > *", ""],
];
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
    }),
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);
revealGroups.forEach(([sel, kind]) =>
  document.querySelectorAll(sel).forEach((el, i) => {
    if (reduceMotion) return el.classList.add("in");
    el.classList.add("reveal");
    if (kind) el.dataset.reveal = kind;
    el.style.setProperty("--stagger", Math.min(i, 8) * 0.08 + "s");
    io.observe(el);
  })
);

if (finePointer && !reduceMotion) {
  // Hero deck follows the cursor; each card moves by its own depth
  const hero = $(".hero");
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    heroBottles.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5) * 2);
    heroBottles.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5) * 2);
  });
  hero.addEventListener("mouseleave", () => {
    heroBottles.style.setProperty("--px", 0);
    heroBottles.style.setProperty("--py", 0);
  });
  // Magnetic buttons
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.25;
      const dy = (e.clientY - r.top - r.height / 2) * 0.35;
      btn.style.translate = dx + "px " + dy + "px";
    });
    btn.addEventListener("mouseleave", () => (btn.style.translate = ""));
  });

  // 3D tilt + glare on product cards
  document.querySelectorAll(".product").forEach((card) => {
    const img = card.querySelector(".product__img");
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", x * 10 + "deg");
      card.style.setProperty("--rx", -y * 10 + "deg");
      img.style.setProperty("--mx", (x + 0.5) * 100 + "%");
      img.style.setProperty("--my", (y + 0.5) * 100 + "%");
    });
    card.addEventListener("mouseleave", () => {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    });
  });

  // Custom cursor "ember": glowing dot, a trailing ring that stretches with speed,
  // a rotating label over targets, and a canvas trail of sparks and smoke
  const root = document.documentElement;
  const dot = document.createElement("div");
  const cRing = document.createElement("div");
  const cv = document.createElement("canvas");
  dot.className = "cursor-dot";
  cRing.className = "cursor-ring";
  cv.className = "cursor-trail";
  cRing.innerHTML = `<span class="cursor-ring__blob"><img alt="" /></span>
    <svg class="cursor-ring__label" viewBox="0 0 100 100"><defs><path id="cursorCircle" d="M50 50m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0" /></defs>
    <text><textPath href="#cursorCircle" textLength="255" lengthAdjust="spacing"></textPath></text></svg>`;
  [dot, cRing, cv].forEach((el) => el.setAttribute("aria-hidden", "true"));
  document.body.append(cv, cRing, dot);
  root.classList.add("has-cursor");
  const blob = cRing.querySelector(".cursor-ring__blob");
  const cRingImg = cRing.querySelector("img");
  const label = cRing.querySelector("textPath");
  const ctx = cv.getContext("2d");
  const fit = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * d;
    cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  fit();
  addEventListener("resize", fit);

  const parts = [];
  const spark = (x, y, speed = 1) => {
    const a = Math.random() * Math.PI * 2;
    const v = (0.4 + Math.random() * 1.6) * speed;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6 * speed, life: 0, max: 30 + Math.random() * 30, size: 1.2 + Math.random() * 2, hue: 15 + Math.random() * 35, smoke: false });
  };
  const smoke = (x, y) =>
    parts.push({ x, y, vx: (Math.random() - 0.5) * 0.6, vy: -0.4 - Math.random() * 0.5, life: 0, max: 50 + Math.random() * 30, size: 3 + Math.random() * 3, smoke: true });

  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, px = mx, py = my, travel = 0;
  addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.translate = `${mx}px ${my}px`;
    root.classList.remove("cursor-out");
  }, { passive: true });
  document.addEventListener("mouseleave", () => root.classList.add("cursor-out"));
  addEventListener("mousedown", () => {
    cRing.classList.add("is-down");
    for (let i = 0; i < 18; i++) spark(mx, my, 2.4);
  });
  addEventListener("mouseup", () => cRing.classList.remove("is-down"));

  const repeat = (word) => Array(Math.max(2, Math.round(26 / (word.length + 3)))).fill(word + " ✦ ").join("");
  document.addEventListener("mouseover", (e) => {
    const t = e.target;
    const product = t.closest(".product__img");
    const text = t.closest("input, textarea");
    const link = !product && !text && t.closest("a, button, summary, label, [role=button]");
    cRing.classList.toggle("is-text", !!text);
    cRing.classList.toggle("is-link", !!link);
    cRing.classList.toggle("is-fruit", !!product);
    if (product) {
      const item = findItem(product.closest(".product").id.slice(2));
      cRingImg.src = fruitSrc(item.fruits[0]);
      label.textContent = repeat(item.short.toUpperCase());
    } else if (link) {
      label.textContent = repeat(link.matches(".add, [data-add]") ? "В КОРЗИНУ" : "ЖМИ");
    }
  });

  (function frame() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    const dx = mx - rx, dy = my - ry;
    const stretch = Math.min(Math.hypot(dx, dy) / 90, 0.35);
    cRing.style.translate = `${rx}px ${ry}px`;
    blob.style.transform = `rotate(${Math.atan2(dy, dx)}rad) scale(${1 + stretch}, ${1 - stretch * 0.6})`;

    const moved = Math.hypot(mx - px, my - py);
    if (moved > 0.5 && !root.classList.contains("cursor-out")) {
      travel += moved;
      for (let i = 0; i < Math.min(moved / 10, 3); i++) spark(mx, my, 0.6);
      while (travel > 22) { smoke(mx, my); travel -= 22; }
    }
    px = mx;
    py = my;
    if (parts.length > 260) parts.splice(0, parts.length - 260);

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      const k = p.life / p.max;
      if (k >= 1) { parts.splice(i, 1); continue; }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      ctx.beginPath();
      if (p.smoke) {
        p.vy *= 0.99;
        ctx.fillStyle = `rgba(58, 42, 34, ${0.16 * (1 - k)})`;
        ctx.arc(p.x, p.y, p.size + k * 16, 0, Math.PI * 2);
      } else {
        p.vy = p.vy * 0.96 - 0.03;
        ctx.fillStyle = `hsla(${p.hue - k * 20}, 100%, ${60 - k * 25}%, ${1 - k})`;
        ctx.arc(p.x, p.y, p.size * (1 - k * 0.5), 0, Math.PI * 2);
      }
      ctx.fill();
    }
    requestAnimationFrame(frame);
  })();
}

// Per-frame scroll effects: progress, header, parallax, marquee
const header = $(".header");
const bar = $("#progressBar");
const ring = $("#toTopRing");
const toTop = $("#toTop");
const hint = $(".scroll-hint");
const heroBottles = $("#heroStack");
const sticker = $("#sticker");
const marquee = $("#marquee");
const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
const RING = 2 * Math.PI * 25;
let lastY = window.scrollY;
let marqueeX = 0;
let marqueeDir = -1;

function frame(time) {
  if (lenis) lenis.raf(time);
  const y = lenis ? lenis.scroll : window.scrollY;
  const vel = lenis ? lenis.velocity : y - lastY;
  lastY = y;

  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(y / max, 1) : 0;
  bar.style.transform = "scaleX(" + p + ")";
  ring.style.strokeDashoffset = RING * (1 - p);
  toTop.classList.toggle("show", y > 500);
  hint.classList.toggle("is-gone", y > 60);

  header.classList.toggle("is-scrolled", y > 20);
  if (y > 300 && vel > 1) header.classList.add("is-hidden");
  else if (vel < -1 || y < 300) header.classList.remove("is-hidden");

  if (!reduceMotion) {
    if (y < innerHeight * 1.2) {
      // Drift up slightly and fade, instead of sinking toward the next section
      heroBottles.style.transform = "translateY(" + -y * 0.12 + "px) scale(" + (1 - Math.min(y / innerHeight, 1) * 0.08) + ")";
      heroBottles.style.opacity = 1 - Math.min(y / (innerHeight * 0.9), 1) * 0.6;
      sticker.style.setProperty("--r", y * 0.4 + "deg");
    }
    parallaxEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      const offset = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = "translateY(" + offset * parseFloat(el.dataset.parallax) + "px)";
    });

    // Marquee follows scroll direction and speeds up with scroll velocity
    if (Math.abs(vel) > 0.5) marqueeDir = vel > 0 ? -1 : 1;
    marqueeX += marqueeDir * (1 + Math.min(Math.abs(vel), 40) * 0.25);
    const half = marquee.scrollWidth / 2;
    if (marqueeX <= -half) marqueeX += half;
    if (marqueeX > 0) marqueeX -= half;
    const skew = Math.max(-12, Math.min(12, -vel * 0.4));
    marquee.style.transform = "translateX(" + marqueeX + "px) skewX(" + skew + "deg)";
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
