/* Fereastra de pizza: mărime, extra, „fără …”, mențiuni, cantitate */
"use strict";

let cur = null;

const ingrediente = x => x.d.replace(/^[^:]*:/, "").split("–")[0]
  .split(",").map(s => s.trim()).filter(s => s && s.length < 28).slice(0, 5);

function deschidePizza(id) {
  const x = produs(id);
  if (!x || x.c !== "pizza") return;
  cur = { x, s: 0, top: new Set(), rm: new Set(), q: 1, note: "" };
  renderPizza();
  deschideFereastra("pizza",`Pizza ${x.n}`);
}

const pretPizza = () => cur.x.p + MARIMI[cur.s][2] + [...cur.top].reduce((a, i) => a + EXTRA[i][1], 0);

function renderPizza() {
  const x = cur.x, ing = ingrediente(x);
  $("#md").innerHTML =
    `<button class="x" data-close="1" aria-label="Închide">×</button>` +
    `<div class="im"><img src="img/${x.img}.webp" alt="Pizza ${x.n}" width="${x.w}" height="${x.h}" style="transform:scale(${[.82, .92, 1][cur.s]})"></div>` +
    `<div class="tx"><h3 id="mdT">${x.n}</h3><p class="mu">${x.d}</p><span class="al">Alergeni: ${x.al}</span>` +
    `<div><span class="lbl">Mărime</span><div class="sz">${MARIMI.map((s, i) =>
      `<button class="${i === cur.s ? "on" : ""}" data-s="${i}" aria-pressed="${i === cur.s}">${s[0]}<span>${s[1]} · ${x.p + s[2]} lei</span></button>`).join("")}</div></div>` +
    `<div><span class="lbl">Extra</span><div class="ex">${EXTRA.map((t, i) =>
      `<label><input type="checkbox" data-top="${i}" ${cur.top.has(i) ? "checked" : ""}> ${t[0]}<em>+${t[1]} lei</em></label>`).join("")}</div></div>` +
    `<div><span class="lbl">Fără</span><div class="ex">${ing.map((t, i) =>
      `<label class="rm"><input type="checkbox" data-rm="${i}" ${cur.rm.has(i) ? "checked" : ""}> fără ${t.toLowerCase()}</label>`).join("")}</div></div>` +
    `<label class="vh" for="note">Mențiuni pentru bucătărie</label>` +
    `<textarea id="note" maxlength="140" placeholder="Mențiuni pentru bucătărie (ex. bine coaptă)">${esc(cur.note)}</textarea>` +
    `<div class="qrow"><div class="qty"><button data-q="-1" aria-label="Scade cantitatea">−</button><span aria-live="polite">${cur.q}</span><button data-q="1" aria-label="Crește cantitatea">+</button></div>` +
    `<button class="btn btn-r" data-addpz="1">Adaugă · ${lei(pretPizza() * cur.q)}</button></div></div>`;
  $("#note").oninput = e => { cur.note = e.target.value; };
}

function adaugaPizza() {
  const x = cur.x, ing = ingrediente(x);
  const opt = [
    MARIMI[cur.s][0],
    ...[...cur.top].sort((a, b) => a - b).map(i => "+ " + EXTRA[i][0].toLowerCase()),
    ...[...cur.rm].sort((a, b) => a - b).map(i => "fără " + ing[i].toLowerCase()),
    cur.note.trim() ? "„" + cur.note.trim() + "”" : ""
  ].filter(Boolean).join(" · ");
  adaugaInCos({ key: x.id + "|" + opt, id: x.id, n: x.n, o: opt, u: pretPizza(), q: cur.q, img: x.img });
  inchideFereastra();
  toast("✓ " + x.n + " a fost adăugată");
}
