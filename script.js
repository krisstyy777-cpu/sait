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
    emoji: ["🍒", "🧄", "🍒"],
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
    emoji: ["🍍", "🌶️", "🍍"],
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
    emoji: ["🍑", "🌶️", "🔥"],
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
    emoji: ["🌶️", "🔥", "🧄"],
  },
];
const BUNDLE = { id: "bundle", name: "Сет из 3 соусов", short: "Сет", price: 1670, color: "#1d1410", bg: "#f4c331", img: "assets/peach.jpg", emoji: ["🍒", "🍍", "🍑", "🌶️"] };

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
      ${p.emoji.map((e, i) => `<span class="femoji" style="--x:${18 + i * 30}%;--d:${i * 0.45}s">${e}</span>`).join("")}
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

  const cx = b.left + b.width / 2;
  const cy = b.top + b.height / 2;
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.className = "burst";
    s.textContent = item.emoji[i % item.emoji.length];
    s.style.left = cx + "px";
    s.style.top = cy + "px";
    document.body.append(s);
    const ang = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
    const dist = 70 + Math.random() * 90;
    const x = Math.cos(ang) * dist;
    const y = Math.sin(ang) * dist - 40;
    s.animate(
      [
        { transform: "translate(-50%,-50%) scale(.2) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.2) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${x * 1.2}px), calc(-50% + ${y + 120}px)) scale(.6) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.4,1)" }
    ).onfinish = () => s.remove();
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
