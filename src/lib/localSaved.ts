// src/lib/localSaved.ts
const KEY = "kwip_saved_products";

function dispatchUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kwip_saved_updated"));
  }
}

export function getSavedProducts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveProduct(id: string): void {
  const saved = getSavedProducts();
  if (!saved.includes(id)) {
    localStorage.setItem(KEY, JSON.stringify([...saved, id]));
    dispatchUpdate();
  }
}

export function unsaveProduct(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getSavedProducts().filter((s) => s !== id)));
  dispatchUpdate();
}

export function isProductSaved(id: string): boolean {
  return getSavedProducts().includes(id);
}

export function getSavedCount(): number {
  return getSavedProducts().length;
}
