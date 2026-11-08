/* Coș: stare, salvare localStorage, totaluri, randare (lateral desktop / foaie de jos pe mobil) */
"use strict";

const CHEIE_COS = "dagino-cos-v1";
let cos = [], mod = "livrare", zona = 0;

function incarcaCos() {
  try {
    const s = JSON.parse(localStorage.getItem(CHEIE_COS) || "null");
    if (!s || !Array.isArray(s.cos)) return;
    cos = s.cos.filter(c => c && typeof c.key === "string" && produs(c.id) &&
      Number.isFinite(c.u) && c.u > 0 && Number.isInteger(c.q) && c.q > 0 && c.q < 100)
      .map(c => ({ key: c.key, id: c.id, n: String(c.n), o: String(c.o || ""), u: c.u, q: c.q, img: c.img ? String(c.img) : null }));
    if (s.mod === "livrare" || s.mod === "ridicare") mod = s.mod;
    if (Number.isInteger(s.zona) && ZONE[s.zona]) zona = s.zona;
  } catch (e) { /* stocare indisponibilă – coșul rămâne doar în memorie */ }
}

function salveazaCos() {
  try { localStorage.setItem(CHEIE_COS, JSON.stringify({ cos, mod, zona })); } catch (e) { /* ignorat */ }
}

function adaugaInCos(item) {
  const ex = cos.find(c => c.key === item.key);
  if (ex) ex.q += item.q; else cos.push(item);
  renderCos();
}

function adaugaSimplu(id) {
  const x = produs(id);
  if (!x) return;
  adaugaInCos({ key: x.id, id: x.id, n: x.n, o: x.d, u: x.p, q: 1, img: null });
  toast("✓ " + x.n + " a fost adăugat");
}

function schimbaCantitate(i, d) {
  const c = cos[i];
  if (!c) return;
  c.q += d;
  if (c.q <= 0) cos.splice(i, 1);
  renderCos();
}

function golesteCos() { cos = []; renderCos(); }

function totaluri() {
  const sub = cos.reduce((a, c) => a + c.u * c.q, 0), Z = ZONE[zona], liv = mod === "livrare";
  const taxa = liv && sub && sub < LIVRARE_GRATUITA ? Z.taxa : 0;
  return {
    sub, taxa, tot: sub + taxa,
    n: cos.reduce((a, c) => a + c.q, 0),
    minim: liv ? Z.minim : 0,
    eta: liv ? Z.min : RIDICARE_MIN
  };
}

const sub_minim = t => !cos.length || t.sub < t.minim;

function iconita(c) {
  if (c.img) return `<img src="img/${c.img}-240.webp" alt="" width="52" height="52" loading="lazy">`;
  const x = produs(c.id);
  return `<span class="ico" aria-hidden="true">${x && x.ico ? x.ico : "🍽"}</span>`;
}

function htmlCos() {
  const t = totaluri(), deschis = esteDeschis(acum());
  return `<div class="h"><b>Comanda ta</b><span>${t.n} ${t.n === 1 ? "produs" : "produse"}</span></div>` +
    `<div class="cl">${cos.length ? cos.map((c, i) =>
      `<div class="ci">${iconita(c)}<div><div class="n">${esc(c.n)}</div><div class="o">${esc(c.o)}</div></div>` +
      `<div class="r">${lei(c.u * c.q)}<span class="mini"><button data-cq="${i}" data-d="-1" aria-label="Scade ${esc(c.n)}">−</button><span>${c.q}</span><button data-cq="${i}" data-d="1" aria-label="Adaugă încă ${esc(c.n)}">+</button></span></div></div>`).join("")
      : `<p class="empty">Coșul e gol. Alege o pizza din meniu 🍕</p>`}</div>` +
    `<div class="cf"><div class="mode">${["livrare", "ridicare"].map(m =>
      `<button class="${m === mod ? "on" : ""}" data-m="${m}" aria-pressed="${m === mod}">${m === "livrare" ? "🛵 Livrare" : "🏃 Ridicare"}</button>`).join("")}</div>` +
    (mod === "livrare" ? `<label class="zone">Zona de livrare<select class="zs">${ZONE.map((z, i) =>
      `<option value="${i}" ${i === zona ? "selected" : ""}>${z.n} · ${z.taxa ? z.taxa + " lei" : "gratuit"}</option>`).join("")}</select></label>` : "") +
    (t.sub && t.sub < t.minim ? `<p class="warn">Comanda minimă pentru zona aleasă e ${t.minim} lei. Mai adaugă ${lei(t.minim - t.sub)}.</p>` : "") +
    (mod === "livrare" && t.sub && t.sub < LIVRARE_GRATUITA && t.sub >= t.minim && ZONE[zona].taxa ? `<p class="hint">Mai adaugă ${lei(LIVRARE_GRATUITA - t.sub)} pentru livrare gratuită.</p>` : "") +
    (cos.length ? `<div class="eta${deschis ? "" : " off"}">${deschis
      ? "⏱ " + (mod === "livrare" ? "Ajunge în ~" + t.eta + " min" : "Gata de ridicat în ~" + RIDICARE_MIN + " min")
      : "🌙 Suntem închiși – alegi ora la finalizare"}</div>` : "") +
    `<div class="lines"><div><span>Produse</span><span>${lei(t.sub)}</span></div>` +
    (mod === "livrare" ? `<div><span>Livrare</span><span>${t.sub ? (t.taxa ? lei(t.taxa) : "gratuită") : "—"}</span></div>` : "") +
    `<div class="t"><span>Total</span><b>${lei(t.tot)}</b></div></div>` +
    `<button class="btn btn-r go" data-go="1" ${sub_minim(t) ? "disabled" : ""}>${deschis ? "Finalizează comanda" : "Programează comanda"}</button></div>`;
}

function renderCos() {
  salveazaCos();
  $("#side").innerHTML = htmlCos();
  const t = totaluri();
  $$(".tot").forEach(x => { x.textContent = lei(t.tot); });
  $$(".cnt").forEach(x => { x.textContent = t.n + (t.n === 1 ? " produs" : " produse"); });
  $(".mbar").classList.toggle("on", t.n > 0);
  if (fereastra === "cos") $("#md").innerHTML = `<button class="x" data-close="1" aria-label="Închide">×</button><div class="side">${htmlCos()}</div>`;
  $$("#mode button").forEach(b => { b.classList.toggle("on", b.dataset.m === mod); b.setAttribute("aria-pressed", b.dataset.m === mod); });
}
