const WHATSAPP_NUMBER = "40700000000"; // număr WhatsApp pentru comenzi (format internațional, fără +)
/* Da Gino – inițializare, timp/program, ferestre, finalizare comandă */
"use strict";

/* ---------- utilitare ---------- */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const lei = n => (Math.round(n * 100) / 100).toLocaleString("ro-RO") + " lei";
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const p2 = n => String(n).padStart(2, "0");

/* ---------- timp: ?acum=2026-11-09T23:45 simulează ora ---------- */
const DECALAJ = (() => {
  const v = new URLSearchParams(location.search).get("acum");
  if (!v || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return 0;
  const [d, t] = v.split("T"), [Y, M, D] = d.split("-").map(Number), [h, m] = t.split(":").map(Number);
  const sim = new Date(Y, M - 1, D, h, m);
  return isNaN(sim) ? 0 : sim - Date.now();
})();
const acum = () => new Date(Date.now() + DECALAJ);
const ziIdx = d => (d.getDay() + 6) % 7;
const laOra = (zi, ore) => new Date(zi.getFullYear(), zi.getMonth(), zi.getDate(), 0, Math.round(ore * 60));

function esteDeschis(d) {
  const P = PROGRAM[ziIdx(d)], h = d.getHours() + d.getMinutes() / 60;
  return h >= P[1] && h < P[2] - ULTIMA_COMANDA;
}

/* Intervale pentru comanda programată: azi (dacă suntem deschiși) sau următorul interval deschis */
function intervale(lead) {
  const now = acum(), deschis = esteDeschis(now), sloturi = [];
  const rotunjeste = t => new Date(Math.ceil(t / 9e5) * 9e5); // în sus la 15 min
  for (let k = 0; k < 8; k++) {
    const zi = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k), P = PROGRAM[ziIdx(zi)];
    const deschidere = laOra(zi, P[1]), ultima = laOra(zi, P[2] - ULTIMA_COMANDA), inchidere = laOra(zi, P[2]);
    const sfarsit = Math.min(ultima.getTime() + lead * 6e4, inchidere.getTime());
    let t = rotunjeste(Math.max(deschidere.getTime(), now.getTime()) + lead * 6e4).getTime();
    for (; t <= sfarsit; t += 9e5) sloturi.push(new Date(t));
    if (deschis || sloturi.length) return { asap: deschis, k, sloturi };
  }
  return { asap: false, k: 0, sloturi };
}

function eticheta(d) {
  const now = acum(), zi0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const k = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - zi0) / 864e5);
  const zi = k === 0 ? "azi" : k === 1 ? "mâine" : PROGRAM[ziIdx(d)][0].toLowerCase();
  return `${zi}, ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

/* ---------- toast ---------- */
let tt;
function toast(m) {
  const el = $("#toast");
  el.textContent = m; el.classList.add("show");
  clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------- ferestre (pizza / coș mobil / finalizare) ---------- */
let fereastra = null, focusInapoi = null;
function deschideFereastra(tip, titlu) {
  if (!fereastra) focusInapoi = document.activeElement;
  if (fereastra === "co" && tip !== "co") returneazaFormular();
  fereastra = tip;
  $("#ov").className = "ov open " + tip;
  $("#md").setAttribute("aria-label", titlu);
  $("#md").scrollTop = 0;
  document.body.classList.add("lock");
  const x = $("#md .x"); if (x) x.focus({ preventScroll: true });
}
function inchideFereastra() {
  if (!fereastra) return;
  if (fereastra === "co") returneazaFormular();
  fereastra = null;
  $("#ov").className = "ov";
  document.body.classList.remove("lock");
  if (focusInapoi && document.contains(focusInapoi)) focusInapoi.focus({ preventScroll: true });
}
function deschideCos() {
  deschideFereastra("cos", "Coșul tău");
  renderCos();
  $("#md .x").focus({ preventScroll: true });
}

/* ---------- finalizare comandă ---------- */
const F = () => $("#coForm");
function returneazaFormular() { const f = F(); if (f) $("#coStore").appendChild(f); }

function deschideFinalizare() {
  const t = totaluri();
  if (sub_minim(t)) return;
  const f = F();
  $("#md").innerHTML = `<button class="x" data-close="1" aria-label="Închide">×</button><div class="co"><h3 id="coT">Finalizează comanda</h3><div id="coSlot"></div></div>`;
  $("#coSlot").appendChild(f);
  $("#coErr").textContent = "";
  // adresă doar pentru livrare
  const liv = mod === "livrare";
  $("#coAddr").hidden = !liv;
  $$("#coAddr input").forEach(i => { i.disabled = !liv; });
  $("#coZona").textContent = liv ? `Zona: ${ZONE[zona].n}` : "";
  // ora
  const iv = intervale(t.eta), sel = $("#coOra");
  sel.innerHTML = iv.sloturi.map(d => `<option value="${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}">${eticheta(d)}</option>`).join("");
  const asap = $("#oraAsap"), prog = $("#oraProg");
  asap.disabled = !iv.asap; prog.disabled = !iv.sloturi.length;
  if (iv.asap) asap.checked = true; else prog.checked = true;
  $("#asapTxt").textContent = liv ? `Cât mai repede (~${t.eta} min)` : `Cât mai repede (gata în ~${RIDICARE_MIN} min)`;
  $("#coInchis").hidden = iv.asap;
  if (!iv.asap && iv.sloturi.length) {
    const z = iv.sloturi[0], P = PROGRAM[ziIdx(z)];
    $("#coInchis").textContent = `Suntem închiși acum. Poți programa comanda pentru ${eticheta(z).split(",")[0]} (${PROGRAM[ziIdx(z)][0]}, program ${hh(P[1])} – ${hh(P[2])}).`;
  }
  sincronizeazaOra();
  $("#plataTxt").textContent = liv ? "Plata la livrare" : "Plata la ridicare";
  // rezumat
  $("#coSum").innerHTML = cos.map(c => `<div><span>${c.q} × ${esc(c.n)}${c.o && c.img ? `<small>${esc(c.o)}</small>` : ""}</span><span>${lei(c.u * c.q)}</span></div>`).join("") +
    (liv ? `<div><span>Livrare</span><span>${t.taxa ? lei(t.taxa) : "gratuită"}</span></div>` : `<div><span>Ridicare din local</span><span>—</span></div>`) +
    `<div class="t"><span>Total</span><b>${lei(t.tot)}</b></div>`;
  $("#coBtn").textContent = `Trimite comanda · ${lei(t.tot)}`;
  deschideFereastra("co", "Finalizează comanda");
}

function sincronizeazaOra() { $("#coOra").disabled = !$("#oraProg").checked; }

function textComanda() {
  return cos.map(c => `${c.q} × ${c.n}${c.o ? " (" + c.o + ")" : ""} = ${lei(c.u * c.q)}`).join("\n");
}

function valideaza() {
  const f = F(), tel = f.telefon;
  tel.value = tel.value.trim();
  const cifre = tel.value.replace(/[\s.\-()]/g, "");
  tel.setCustomValidity(/^(\+?40|0040|0)[2-37]\d{8}$/.test(cifre) ? "" : "Introdu un număr de telefon valid (ex. 0722 123 456).");
  if (!f.reportValidity()) return false;
  const t = totaluri();
  if (sub_minim(t)) { $("#coErr").textContent = "Coșul nu mai îndeplinește comanda minimă."; return false; }
  return true;
}

function completeazaAscunse() {
  const f = F(), t = totaluri(), d = acum();
  const nr = `DG-${p2(d.getMonth() + 1)}${p2(d.getDate())}-${Math.floor(100 + Math.random() * 900)}`;
  const asap = f.ora_tip.value === "asap";
  const ora = asap ? `Cât mai repede (~${t.eta} min)` : eticheta(new Date(f.ora_programata.value.replace(" ", "T")));
  f.nr_comanda.value = nr;
  f.mod.value = mod === "livrare" ? "Livrare" : "Ridicare din local";
  f.zona.value = mod === "livrare" ? ZONE[zona].n : "—";
  f.produse.value = textComanda();
  f.subtotal.value = lei(t.sub);
  f.taxa_livrare.value = mod === "livrare" ? (t.taxa ? lei(t.taxa) : "gratuită") : "—";
  f.total.value = lei(t.tot);
  f.ora_livrare.value = ora;
  return { nr, ora, asap, t };
}

function mesajWhatsApp(info) {
  const f = F(), liv = mod === "livrare";
  const adr = liv ? [f.strada.value, f.numar.value && "nr. " + f.numar.value, f.bloc_ap.value, f.interfon.value && "interfon " + f.interfon.value].filter(Boolean).join(", ") : "";
  return [
    `🍕 *Comandă Da Gino ${info.nr}*`, "",
    textComanda(), "",
    `Produse: ${lei(info.t.sub)}`,
    liv ? `Livrare (${ZONE[zona].n}): ${info.t.taxa ? lei(info.t.taxa) : "gratuită"}` : "Ridicare din local",
    `*Total: ${lei(info.t.tot)}*`, "",
    `Nume: ${f.nume.value}`, `Telefon: ${f.telefon.value}`,
    liv ? `Adresă: ${adr}` : "",
    `Ora: ${info.ora}`,
    `Plata: ${f.plata.value === "card" ? "card" : "cash"} la ${liv ? "livrare" : "ridicare"}`,
    f.observatii.value.trim() ? `Observații: ${f.observatii.value.trim()}` : ""
  ].filter((l, i, a) => l !== "" || (a[i - 1] !== "")).join("\n");
}

function multumire(info, nume, canal) {
  const liv = mod === "livrare";
  const timp = info.asap
    ? (liv ? `Livrare estimată în ~${info.t.eta} min` : `Gata de ridicat în ~${RIDICARE_MIN} min`)
    : `${liv ? "Livrare programată" : "Ridicare programată"}: ${info.ora}`;
  returneazaFormular();
  $("#md").innerHTML = `<button class="x" data-close="1" aria-label="Închide">×</button><div class="co ok">` +
    `<div class="okic" aria-hidden="true">✓</div><h3>Mulțumim, ${esc(nume.split(" ")[0])}!</h3>` +
    (canal === "wa"
      ? `<p>Comanda <b>${info.nr}</b> a fost pregătită în WhatsApp. Apasă <b>Trimite</b> acolo ca s-o primim.</p>`
      : `<p>Comanda <b>${info.nr}</b> a fost trimisă. Te sunăm dacă e nevoie de vreo confirmare.</p>`) +
    `<div class="eta">⏱ ${timp}</div><p class="mu">Total de plată: <b>${lei(info.t.tot)}</b></p>` +
    `<button class="btn btn-r" data-close="1">Închide</button></div>`;
  F().reset();
  golesteCos();
  $("#md .x").focus({ preventScroll: true });
}

async function trimiteComanda(e) {
  e.preventDefault();
  $("#coErr").textContent = "";
  if (!valideaza()) return;
  const f = F(), info = completeazaAscunse(), btn = $("#coBtn");
  btn.disabled = true; btn.textContent = "Se trimite…";
  try {
    const r = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(f)).toString()
    });
    if (!r.ok) throw new Error(r.status);
    multumire(info, f.nume.value, "form");
  } catch (err) {
    $("#coErr").textContent = "Comanda nu a putut fi trimisă. Încearcă din nou sau trimite-o pe WhatsApp.";
  } finally {
    btn.disabled = false; btn.textContent = `Trimite comanda · ${lei(totaluri().tot)}`;
  }
}

function trimiteWhatsApp() {
  $("#coErr").textContent = "";
  if (!valideaza()) return;
  const info = completeazaAscunse(), nume = F().nume.value;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mesajWhatsApp(info))}`, "_blank", "noopener");
  multumire(info, nume, "wa");
}

/* ---------- evenimente ---------- */
document.addEventListener("click", e => {
  const t = e.target;
  if (t.id === "ov") { inchideFereastra(); return; }
  const b = t.closest("[data-cat],[data-pz],[data-add],[data-close],[data-open],[data-s],[data-q],[data-addpz],[data-cq],[data-m],[data-go],[data-wa]");
  if (!b) return;
  const D = b.dataset;
  if (D.cat) {
    const dinBara = !!b.closest("#cats"); // verificat înainte ca butoanele să fie re-randate
    categorie = D.cat; renderMeniu();
    // dacă lista a ajuns sub bara lipicioasă de categorii, o aliniem imediat sub ea
    if (dinBara) {
      const jos = $("#cats").getBoundingClientRect().bottom, sus = $("#mainList").getBoundingClientRect().top;
      if (sus < jos) scrollBy({ top: sus - jos - 4, behavior: "instant" });
    }
    return;
  }
  if (D.pz) { deschidePizza(D.pz); return; }
  if (D.add) { adaugaSimplu(D.add); return; }
  if (D.close) { inchideFereastra(); return; }
  if (D.open) {
    if (matchMedia("(max-width:760px)").matches) deschideCos();
    else $("#side").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (D.s !== undefined) { cur.s = +D.s; renderPizza(); return; }
  if (D.q) { cur.q = Math.min(20, Math.max(1, cur.q + (+D.q))); renderPizza(); return; }
  if (D.addpz) { adaugaPizza(); return; }
  if (D.cq !== undefined) { schimbaCantitate(+D.cq, +D.d); return; }
  if (D.m) { mod = D.m; renderCos(); return; }
  if (D.go) { deschideFinalizare(); return; }
  if (D.wa) { trimiteWhatsApp(); }
});

document.addEventListener("change", e => {
  const el = e.target, D = el.dataset;
  if (D.top !== undefined) { el.checked ? cur.top.add(+D.top) : cur.top.delete(+D.top); renderPizza(); return; }
  if (D.rm !== undefined) { el.checked ? cur.rm.add(+D.rm) : cur.rm.delete(+D.rm); return; }
  if (el.classList.contains("zs")) { zona = +el.value; renderCos(); return; }
  if (el.name === "ora_tip") sincronizeazaOra();
});

addEventListener("keydown", e => { if (e.key === "Escape") inchideFereastra(); });

/* ---------- pornire ---------- */
incarcaCos();
renderStatus();
renderZone();
renderMeniu();
renderCos();
$("#coForm").addEventListener("submit", trimiteComanda);
if (DECALAJ) {
  const d = acum();
  $("#sim").textContent = ` · oră simulată: ${p2(d.getDate())}.${p2(d.getMonth() + 1)} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}
setInterval(() => { renderStatus(); if (fereastra !== "co") renderCos(); }, 60000);
