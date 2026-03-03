import type { Concern } from "./concern";

export interface KwipStorage {
  selectedConcern: Concern | null;
  recentProducts: string[];
  lastVisit: string;
}

export const STORAGE_KEY = "kwip_v1";
