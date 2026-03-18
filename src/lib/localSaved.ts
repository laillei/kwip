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
    const result = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

export function saveProduct(id: string): void {
  if (typeof window === "undefined") return;
  const saved = getSavedProducts();
  if (!saved.includes(id)) {
    localStorage.setItem(KEY, JSON.stringify([...saved, id]));
    dispatchUpdate();
  }
}

export function unsaveProduct(id: string): void {
  if (typeof window === "undefined") return;
  const saved = getSavedProducts();
  const next = saved.filter((s) => s !== id);
  if (next.length !== saved.length) {
    localStorage.setItem(KEY, JSON.stringify(next));
    dispatchUpdate();
  }
}

export function isProductSaved(id: string): boolean {
  return getSavedProducts().includes(id);
}

export function getSavedCount(): number {
  return getSavedProducts().length;
}
