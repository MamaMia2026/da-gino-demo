/* Meniu, categorii, stare Deschis/Închis, tabele program și zone */
"use strict";

const TOATE = [
  ...PIZZE.map(x => ({ ...x, c: "pizza" })),
  ...ALTELE
];
const produs = id => TOATE.find(x => x.id === id);

let categorie = "pizza";

const hh = h => String(h === 24 ? 0 : Math.floor(h)).padStart(2, "0") + ":" + String(Math.round((h % 1) * 60)).padStart(2, "0");

function renderStatus() {
  const d = acum(), zi = ziIdx(d), P = PROGRAM[zi], deschis = esteDeschis(d);
  $("#st").classList.toggle("cl", !deschis);
  $("#stT").textContent = deschis
    ? `Deschis acum · comenzi până la ${hh(P[2] - ULTIMA_COMANDA)}`
    : "Închis acum · comenzile se pot programa";
  $("#pt").innerHTML = PROGRAM.map((p, i) =>
    `<tr class="${i === zi ? "today" : ""}"><td>${p[0]}${i === zi ? " · azi" : ""}</td><td>${hh(p[1])} – ${hh(p[2])}</td></tr>`).join("");
}

function renderZone() {
  $("#zt").innerHTML = ZONE.map(z =>
    `<tr><td>${z.n}</td><td>${z.taxa ? z.taxa + " lei" : "gratuit"} · ~${z.min} min<small>minim ${z.minim} lei</small></td></tr>`).join("") +
    `<tr><td colspan="2" class="nt">Peste ${LIVRARE_GRATUITA} lei livrarea e gratuită în toate zonele.</td></tr>`;
}

function cardPizza(x, i) {
  const tg = (x.tags.includes("top") ? '<span class="t-top">Cea mai comandată</span>' : "") +
    (x.tags.includes("veg") ? '<span class="t-veg">Vegetariană</span>' : "") +
    (x.tags.includes("iute") ? '<span class="t-iute">🌶 Picantă</span>' : "");
  return `<article class="pz" data-pz="${x.id}"><div class="tg">${tg}</div>` +
    `<div class="im"><img src="img/${x.img}.webp" srcset="img/${x.img}-240.webp 240w, img/${x.img}.webp ${x.w}w" sizes="(max-width:760px) 40vw, 210px" alt="Pizza ${x.n}" width="${x.w}" height="${x.h}" loading="lazy" decoding="async"></div>` +
    `<h3>${x.n}</h3><p class="ing">${x.d}</p>` +
    `<div class="ft"><span class="pr">de la ${x.p} lei <small>/ 30 cm</small></span>` +
    `<button class="plus" data-pz="${x.id}" aria-label="Alege ${x.n}">+</button></div></article>`;
}

function renderMeniu() {
  $("#cats").innerHTML = CATEGORII.map(c =>
    `<button class="${c[0] === categorie ? "on" : ""}" data-cat="${c[0]}" aria-pressed="${c[0] === categorie}">${c[1]}</button>`).join("");
  const L = TOATE.filter(x => x.c === categorie);
  $("#mainList").innerHTML = categorie === "pizza"
    ? `<div class="grid">${L.map(cardPizza).join("")}</div>`
    : `<div class="list">${L.map(x =>
      `<div class="li"><div><b>${x.n}</b>${x.d ? `<span>${x.d}</span>` : ""}</div><div class="r">${x.p} lei<button class="plus" data-add="${x.id}" aria-label="Adaugă ${x.n}">+</button></div></div>`).join("")}</div>`;
}
