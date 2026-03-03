# Phase 1 Design: Project Setup

**Date:** 2026-03-03
**Scope:** Phase 1 only — foundation, types, sample data, validation

## Decisions

- **Next.js 15** (latest stable, App Router)
- **Scaffold via `create-next-app@15`**, then clean boilerplate
- **Git initialized** from the start
- **3 sample products** chosen for variety across concerns/categories

## Steps

### 1. Scaffold

Run `create-next-app@15` with:
- TypeScript
- Tailwind CSS
- ESLint
- App Router
- `src/` directory
- No import alias customization (use default `@/`)

Then clean out: default page content, sample SVGs, boilerplate CSS.
Add Noto Sans via `next/font/google` for Vietnamese diacritics.

### 2. Directory structure

Create empty directories per spec:

```
src/components/{layout,home,products,detail,shared}/
src/data/
src/lib/
public/images/products/
scripts/
```

Add `.gitkeep` in empty directories so git tracks them.

### 3. Types (`src/lib/types.ts`)

All interfaces from CLAUDE.md:
- `Product`, `ProductIngredient`
- `Ingredient`
- `ConcernMap`
- Shared union types: `Brand`, `Category`, `Concern`, `IngredientCategory`
- `KwipStorage`
- `TrackingEvent`

### 4. Sample data

**3 products:**

| Product | Brand | Category | Concerns |
|---|---|---|---|
| COSRX Advanced Snail 96 Mucin Power Essence | cosrx | serum | moisturizing, anti-aging |
| Anua Heartleaf 77% Soothing Toner | anua | toner | acne, moisturizing |
| Beauty of Joseon Relief Sun: Rice + Probiotics | beauty-of-joseon | sunscreen | brightening |

Files:
- `src/data/products.json` — 3 products with real INCI ingredients, Vietnamese names, purchase links
- `src/data/ingredients.json` — all ingredients referenced by the 3 products, with Vietnamese descriptions and effect mappings
- `src/data/concerns.json` — 4 concerns (acne, moisturizing, brightening, anti-aging) with Vietnamese labels, icons, key ingredients, weather triggers

### 5. Data validation (`scripts/validate-data.ts`)

Runtime script that:
- Loads all 3 JSON files
- Validates structure matches TypeScript interfaces
- Checks referential integrity (product ingredientIds exist in ingredients.json)
- Reports errors clearly
- Run via `npx tsx scripts/validate-data.ts`

### 6. Git

- `git init` + `.gitignore`
- Commit 1: scaffold (after create-next-app + cleanup)
- Commit 2: types + data + validation script
