import type { Brand } from "./types";

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
};

export function getBrandName(brand: Brand): string {
  return brandDisplayNames[brand] ?? brand;
}
