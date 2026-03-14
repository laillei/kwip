import type { Routine, RoutineProduct } from "@/lib/types";

const KEY = "kwip_routines";

function load(): Routine[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(routines: Routine[]): void {
  localStorage.setItem(KEY, JSON.stringify(routines));
}

export function getRoutines(): Routine[] {
  return load();
}

export function getRoutineById(id: string): Routine | undefined {
  return load().find((r) => r.id === id);
}

export function saveRoutine(input: {
  name: string;
  concern: string;
  products: RoutineProduct[];
}): Routine {
  const routines = load();
  const routine: Routine = {
    id: crypto.randomUUID(),
    name: input.name,
    concern: input.concern as Routine["concern"],
    products: input.products,
    createdAt: new Date().toISOString(),
  };
  save([routine, ...routines]);
  return routine;
}

export function deleteRoutine(id: string): void {
  save(load().filter((r) => r.id !== id));
}
