import type { Brand } from "@/types";

const brandDisplayNames: Record<Brand, string> = {
  cosrx: "COSRX",
  anua: "Anua",
  torriden: "Torriden",
  "beauty-of-joseon": "Beauty of Joseon",
  "round-lab": "Round Lab",
  skin1004: "SKIN1004",
  klairs: "Klairs",
  "some-by-mi": "Some By Mi",
  innisfree: "Innisfree",
  laneige: "Laneige",
  isntree: "Isntree",
  purito: "Purito",
  mixsoon: "Mixsoon",
  medicube: "Medicube",
  tirtir: "TIRTIR",
  numbuzin: "Numbuzin",
  biodance: "BioDance",
  illiyoon: "Illiyoon",
  "dr-g": "Dr.G",
  benton: "Benton",
  heimish: "Heimish",
  tocobo: "Tocobo",
  haruharu: "Haruharu Wonder",
  goodal: "Goodal",
  "dr-jart": "Dr. Jart+",
  sulwhasoo: "Sulwhasoo",
  mediheal: "Mediheal",
  etude: "Etude",
  "nature-republic": "Nature Republic",
  missha: "Missha",
  "the-face-shop": "The Face Shop",
  "banila-co": "Banila Co.",
  ahc: "AHC",
  "vt-cosmetics": "VT Cosmetics",
};

export function getBrandName(brand: Brand): string {
  return brandDisplayNames[brand] ?? brand;
}
