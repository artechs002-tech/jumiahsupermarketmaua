/* ========== SETTINGS: change the number here only ========== */
const WHATSAPP_NUMBER = "254745148038"; // 0745148038 in international format
const SHOP = "Jumiah";

/* ========== PRODUCTS: edit names, units and prices here ==========
   Each row: [name, unit, price in KSh, emoji]
   To use real photos later, add an "img" field and show <img src="images/xxx.jpg"> in renderProducts(). */
const CATALOG = {
  "Foods & Staples": [
    ["Maize flour (Jogoo / Pembe)", "2kg", 175, "🌽"], ["Wheat flour (Exe / Pembe)", "2kg", 220, "🌾"],
    ["Pishori rice", "1kg", 220, "🍚"], ["Basmati rice", "1kg", 300, "🍚"], ["Sugar", "1kg", 190, "🍬"],
    ["Salt", "1kg", 50, "🧂"], ["Cooking oil", "1 litre", 330, "🛢️"], ["Cooking oil", "3 litres", 950, "🛢️"],
    ["Cooking fat (Kimbo)", "500g", 250, "🧈"], ["Beans (Rosecoco)", "1kg", 210, "🫘"], ["Green grams (ndengu)", "1kg", 250, "🫛"],
    ["Spaghetti", "400g", 110, "🍝"], ["Tomato paste", "70g", 40, "🥫"], ["Royco mchuzi mix", "200g", 85, "🍲"],
    ["Ketepa tea leaves", "250g", 140, "🍵"], ["Nescafe Classic", "50g", 260, "☕"], ["Blue Band margarine", "500g", 280, "🧈"],
    ["Bread", "400g loaf", 65, "🍞"]
  ],
  "Fresh & Dairy": [
    ["Fresh milk", "500ml", 65, "🥛"], ["Fresh milk", "1 litre", 120, "🥛"], ["Eggs", "tray of 30", 480, "🥚"],
    ["Tomatoes", "1kg", 100, "🍅"], ["Onions", "1kg", 120, "🧅"], ["Potatoes", "1kg", 90, "🥔"],
    ["Sukuma wiki", "bunch", 20, "🥬"], ["Bananas", "bunch", 150, "🍌"]
  ],
  "Drinks": [
    ["Coca-Cola", "500ml", 70, "🥤"], ["Fanta", "500ml", 70, "🥤"], ["Minute Maid juice", "1 litre", 180, "🧃"],
    ["Drinking water", "500ml", 40, "💧"], ["Drinking water", "1.5 litres", 80, "💧"]
  ],
  "Household & Cleaning": [
    ["Omo detergent", "1kg", 300, "🧺"], ["Jik bleach", "750ml", 190, "🧴"], ["Sunlight bar soap", "800g", 170, "🧼"],
    ["Dish-washing liquid", "500ml", 160, "🍽️"], ["Toilet paper", "4 rolls", 180, "🧻"], ["Matchbox", "box", 30, "🔥"]
  ],
  "Personal Care": [
    ["Geisha bar soap", "175g", 80, "🧼"], ["Colgate toothpaste", "100ml", 190, "🪥"], ["Toothbrush", "each", 80, "🪥"],
    ["Vaseline petroleum jelly", "250ml", 250, "🧴"], ["Sanitary pads", "pack", 120, "🩷"]
  ],
  "Gas": [
    ["Gas refill", "6kg", 1150, "🔥"], ["Gas refill", "13kg", 2700, "🔥"],
    ["New cylinder with gas", "6kg", 3800, "🛢️"], ["New cylinder with gas", "13kg", 6500, "🛢️"]
  ]
};

const PRODUCTS = [];
let n = 0;
for (const cat in CATALOG) CATALOG[cat].forEach(p => PRODUCTS.push({ id: ++n, name: p[0], category: cat, unit: p[1], price: p[2], emoji: p[3] }));

/* ========== HELPERS ========== */
const $ = id => document.getElementById(id);
const money = v => "KSh " + v.toLocaleString("en-KE");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const waLink = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const byId = id => PRODUCTS.find(p => p.id === id);

/* ========== CART (saved in localStorage) ========== */
let cart = {};
try { cart = JSON.parse(localStorage.getItem("jumiah_cart")) || {}; } catch (e) { cart = {}; }
const saveCart = () => { try { localStorage.setItem("jumiah_cart", JSON.stringify(cart)); } catch (e) {} };
const cartItems = () => Object.keys(cart).map(id => ({ p: byId(+id), q: cart[id] })).filter(i => i.p);

function renderCart() {
  const items = cartItems();
  $("cartCount").textContent = items.reduce((s, i) => s + i.q, 0);
  $("total").textContent = money(items.reduce((s, i) => s + i.p.price * i.q, 0));
  $("lines").innerHTML = items.length ? items.map(({ p, q }) => `
    <div class="line" data-id="${p.id}">
      <div><b>${esc(p.name)}</b> <span class="unit">${esc(p.unit)}</span><br><span class="unit">${money(p.price)} each</span></div>
      <b>${money(p.price * q)}</b>
      <div class="qty"><button data-act="dec" aria-label="Less">−</button><span>${q}</span><button data-act="inc" aria-label="More">+</button></div>
      <button class="rm" data-act="rm" aria-label="Remove ${esc(p.name)}">Remove</button>
    </div>`).join("") : '<p class="empty">Your cart is empty. Add items from the shop to start your order.</p>';
}

function addToCart(id, q) {
  cart[id] = (cart[id] || 0) + q;
  saveCart(); renderCart(); toast("Added to cart");
}

/* ========== PRODUCTS GRID ========== */
let activeCat = "All", query = "";
function renderCats() {
  $("cats").innerHTML = ["All", ...Object.keys(CATALOG)].map(c => `<button class="${c === activeCat ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
}
function renderProducts() {
  const list = PRODUCTS.filter(p => (activeCat === "All" || p.category === activeCat) && (p.name + " " + p.unit).toLowerCase().includes(query));
  $("noResults").hidden = list.length > 0;
  $("grid").innerHTML = list.map(p => `
    <article class="card" data-id="${p.id}" data-cat="${esc(p.category)}">
      <div class="pic" aria-hidden="true">${p.emoji}</div>
      <h3>${esc(p.name)}</h3>
      <div class="unit">${esc(p.unit)}${p.category === "Gas" ? " · Delivery available. Confirm on WhatsApp." : ""}</div>
      <div class="price">${money(p.price)}</div>
      <div class="qty"><button data-act="minus" aria-label="Decrease quantity">−</button><span class="n">1</span><button data-act="plus" aria-label="Increase quantity">+</button></div>
      <button class="add" data-act="add">Add to cart</button>
    </article>`).join("");
}
function setCat(c) { activeCat = c; renderCats(); renderProducts(); }

$("cats").addEventListener("click", e => { const b = e.target.closest("button"); if (b) setCat(b.dataset.cat); });
$("search").addEventListener("input", e => { query = e.target.value.trim().toLowerCase(); renderProducts(); });
$("grid").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const card = b.closest(".card"), num = card.querySelector(".n");
  let q = +num.textContent;
  if (b.dataset.act === "plus") num.textContent = Math.min(q + 1, 99);
  if (b.dataset.act === "minus") num.textContent = Math.max(q - 1, 1);
  if (b.dataset.act === "add") { addToCart(+card.dataset.id, q); num.textContent = 1; }
});
$("seeGas").addEventListener("click", () => { setCat("Gas"); $("shop").scrollIntoView(); });

/* ========== CART DRAWER ========== */
function openCart(open) {
  $("drawer").classList.toggle("open", open);
  $("drawer").setAttribute("aria-hidden", !open);
  $("overlay").hidden = !open;
  if (open) $("closeCart").focus();
}
$("openCart").onclick = () => openCart(true);
$("closeCart").onclick = $("overlay").onclick = () => openCart(false);
document.addEventListener("keydown", e => { if (e.key === "Escape") openCart(false); });
$("lines").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const id = b.closest(".line").dataset.id;
  if (b.dataset.act === "inc") cart[id]++;
  if (b.dataset.act === "dec") cart[id] = Math.max(1, cart[id] - 1);
  if (b.dataset.act === "rm") delete cart[id];
  saveCart(); renderCart();
});
$("clearCart").onclick = () => { cart = {}; saveCart(); renderCart(); };

/* ========== SEND ORDER TO WHATSAPP ========== */
$("orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const items = cartItems(), name = $("oName").value.trim(), phone = $("oPhone").value.trim(), loc = $("oLoc").value.trim();
  const err = $("orderErr");
  if (!items.length) return err.textContent = "Your cart is empty. Add at least one item.";
  if (!name || !phone || !loc) return err.textContent = "Please fill in your name, phone number and delivery location.";
  if (!/^[+\d][\d\s-]{8,}$/.test(phone)) return err.textContent = "Enter a valid phone number, for example 0712345678.";
  err.textContent = "";
  const total = items.reduce((s, i) => s + i.p.price * i.q, 0);
  const lines = items.map((i, k) => `${k + 1}. ${i.p.name} ${i.p.unit} x ${i.q} = ${money(i.p.price * i.q)}`).join("\n");
  const note = $("oNote").value.trim();
  const msg = `Hello ${SHOP}, I would like to order:\n${lines}\nTotal: ${money(total)} (delivery fee to be confirmed)\n\nName: ${name}\nPhone: ${phone}\nDelivery location: ${loc}${note ? "\nNote: " + note : ""}`;
  window.open(waLink(msg), "_blank", "noopener");
});

/* ========== CONTACT FORM -> WHATSAPP ========== */
$("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("cName").value.trim(), phone = $("cPhone").value.trim(), msg = $("cMsg").value.trim();
  $("eName").textContent = name ? "" : "Please enter your name.";
  $("ePhone").textContent = /^[+\d][\d\s-]{8,}$/.test(phone) ? "" : "Enter a valid phone number, for example 0712345678.";
  $("eMsg").textContent = msg ? "" : "Please write your message.";
  if (!name || !msg || $("ePhone").textContent) return;
  window.open(waLink(`Hello ${SHOP}, my name is ${name}. Phone: ${phone}. Message: ${msg}`), "_blank", "noopener");
  e.target.reset();
});

/* ========== SMALL EXTRAS ========== */
let t;
function toast(text) { const el = $("toast"); el.textContent = text; el.classList.add("show"); clearTimeout(t); t = setTimeout(() => el.classList.remove("show"), 1600); }
$("burger").onclick = () => { const o = $("nav").classList.toggle("open"); $("burger").setAttribute("aria-expanded", o); };
$("nav").addEventListener("click", () => $("nav").classList.remove("open"));
const hello = waLink("Hello Jumiah, I need help with an order.");
["heroWa", "waFloat", "infoWa"].forEach(id => $(id).href = hello);
$("gasWa").href = waLink("Hello Jumiah, I would like to order gas (refill / new cylinder).");
$("year").textContent = new Date().getFullYear();

renderCats(); renderProducts(); renderCart();
