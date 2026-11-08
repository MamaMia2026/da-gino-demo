/* Da Gino – date de exemplu (machetă demo). Prețuri în lei. */
"use strict";

// Pizza: id, nume, ingrediente, preț 30 cm, imagine, etichete, alergeni
const PIZZE = [
  { id: "p0", n: "Margherita", d: "Sos de roșii, mozzarella fior di latte, busuioc", p: 32, img: "margherita", w: 312, h: 336, tags: ["veg"], al: "gluten, lactoză" },
  { id: "p1", n: "Capricciosa", d: "Sos de roșii, mozzarella, șuncă, ciuperci, anghinare, măsline", p: 42, img: "capricciosa", w: 314, h: 334, tags: ["top"], al: "gluten, lactoză" },
  { id: "p2", n: "Diavola", d: "Sos de roșii, mozzarella, salam picant, busuioc", p: 40, img: "diavola", w: 316, h: 332, tags: ["iute"], al: "gluten, lactoză" },
  { id: "p3", n: "Quattro Stagioni", d: "Șuncă, ciuperci, anghinare, măsline – câte un sfert", p: 44, img: "quattro-stagioni", w: 315, h: 336, tags: [], al: "gluten, lactoză" },
  { id: "p4", n: "Quattro Formaggi", d: "Mozzarella, gorgonzola, parmigiano, provola", p: 45, img: "quattro-formaggi", w: 315, h: 336, tags: ["veg"], al: "gluten, lactoză" },
  { id: "p5", n: "Prosciutto e Funghi", d: "Sos de roșii, mozzarella, șuncă, ciuperci", p: 40, img: "prosciutto-funghi", w: 315, h: 336, tags: [], al: "gluten, lactoză" },
  { id: "p6", n: "Vegetariana", d: "Ardei copți, dovlecel, vinete, roșii cherry, rucola", p: 39, img: "vegetariana", w: 315, h: 336, tags: ["veg"], al: "gluten, lactoză" },
  { id: "p7", n: "Tonno e Cipolla", d: "Sos de roșii, mozzarella, ton, ceapă roșie, măsline", p: 43, img: "tonno-cipolla", w: 314, h: 336, tags: [], al: "gluten, lactoză, pește" },
  { id: "p8", n: "Calzone", d: "Închisă: mozzarella, șuncă, ciuperci, ricotta", p: 44, img: "calzone", w: 320, h: 303, tags: [], al: "gluten, lactoză" }
];

// Alte produse: id, nume, descriere, categorie, preț, iconiță
const ALTELE = [
  { id: "e0", n: "Lasagna al forno", d: "Cu ragù de vită, la cuptor", c: "paste", p: 38, ico: "🍝" },
  { id: "e1", n: "Spaghetti Carbonara", d: "Guanciale, ou, pecorino", c: "paste", p: 36, ico: "🍝" },
  { id: "e2", n: "Tiramisù", d: "Rețeta casei", c: "desert", p: 22, ico: "🍰" },
  { id: "e3", n: "Panna cotta", d: "Cu sos de fructe de pădure", c: "desert", p: 19, ico: "🍮" },
  { id: "e4", n: "Coca-Cola 0,5 l", d: "", c: "bauturi", p: 9, ico: "🥤" },
  { id: "e5", n: "Apă plată 0,5 l", d: "", c: "bauturi", p: 7, ico: "💧" },
  { id: "e6", n: "Bere Peroni 0,33 l", d: "18+", c: "bauturi", p: 12, ico: "🍺" }
];

const CATEGORII = [
  ["pizza", "🍕 Pizza"],
  ["paste", "🍝 Paste"],
  ["desert", "🍰 Deserturi"],
  ["bauturi", "🥤 Băuturi"]
];

// Mărimi: nume, descriere, supliment față de 30 cm
const MARIMI = [
  ["30 cm", "normală", 0],
  ["40 cm", "familie", 14],
  ["50 cm", "party", 30]
];

// Extra-ingrediente: nume, preț
const EXTRA = [
  ["Mozzarella extra", 6], ["Șuncă", 7], ["Salam picant", 7], ["Ciuperci", 4],
  ["Ou", 3], ["Ardei iute", 3], ["Rucola", 4], ["Porumb", 3]
];

// Zone de livrare: nume, taxă (lei), timp (minute), comandă minimă (lei)
const ZONE = [
  { n: "Timișoara – centru", taxa: 0, min: 40, minim: 50 },
  { n: "Timișoara – cartiere", taxa: 0, min: 45, minim: 60 },
  { n: "Dumbrăvița", taxa: 7, min: 50, minim: 70 },
  { n: "Giroc / Chișoda", taxa: 7, min: 50, minim: 70 },
  { n: "Moșnița Nouă", taxa: 10, min: 60, minim: 80 },
  { n: "Ghiroda", taxa: 8, min: 55, minim: 70 }
];

// Program: zi, deschidere, închidere (ore; 24 = miezul nopții). Luni = index 0.
const PROGRAM = [
  ["Luni", 11, 23], ["Marți", 11, 23], ["Miercuri", 11, 23], ["Joi", 11, 23],
  ["Vineri", 11, 24], ["Sâmbătă", 12, 24], ["Duminică", 12, 23]
];

const ULTIMA_COMANDA = 0.5;   // ultimele comenzi cu 30 min înainte de închidere
const RIDICARE_MIN = 20;      // minute până e gata de ridicat
const LIVRARE_GRATUITA = 80;  // prag livrare gratuită (lei)
