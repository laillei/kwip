# Concern Hero Redesign

## Goal

Replace the flat pill-based concern selector with a hero prompt card that invites engagement without blocking the browsing experience.

## Core Principle

Products are always visible. Concern selection *tunes* them — it doesn't unlock them. No onboarding gate, no paywall.

## Layout (top to bottom)

```
Header (Kwip + search + language switcher)
─────────────────────────────────────────
Hero Prompt
  "Bạn đang gặp vấn đề gì với da?" (EN: "What's your skin concern?")
  2-column concern card grid
─────────────────────────────────────────
[Ingredient highlight — appears when concern selected]
─────────────────────────────────────────
Products (always visible, default = popular ranked)
  No selection → flat popularity-ranked grid
  Concern selected → routine-grouped + ingredient reason per card
```

## Concern Cards

- 2-column grid, full-width cards
- Each card: emoji icon + symptom label + short descriptor
- White background, soft shadow (same as ProductCard)
- Selected: neutral-900 bg, white text
- Min height 56px (touch-friendly)

## Symptom Language

| ID | Vietnamese | English |
|----|-----------|---------|
| acne | Mụn & lỗ chân lông | Acne & clogged pores |
| pores | Da bóng, lỗ chân lông to | Oily skin, large pores |
| hydration | Da khô, thiếu ẩm | Dry & dehydrated skin |
| brightening | Da xỉn, thâm nám | Dull skin & dark spots |
| soothing | Da kích ứng, đỏ | Irritated & sensitive skin |
| anti-aging | Da lão hóa, nếp nhăn | Fine lines & aging |
| sun-protection | Cần chống nắng | Sun protection |

## Behavior

- Prompt scrolls away naturally (not sticky) — no obstruction when browsing
- Selecting a concern: products reorganize instantly below
- IngredientHighlight appears between prompt and products when active
- Multi-select preserved (tap more than one concern)

## Option A (kept for later)

Sticky concern chips in a horizontal scroll bar just below the header — always visible while scrolling products. Same filtering behavior. Try if Option B feels too heavy after testing.

## What Changes

- `ConcernSelector.tsx` → replace pills with 2-col card grid
- `concerns.json` → add `symptom.vi` and `symptom.en` fields
- Dictionaries → add `home.concernPrompt` key
- `ConcernHub.tsx` → update prompt heading above selector

## What Stays the Same

- Multi-select OR logic
- IngredientHighlight component
- Routine-grouped product display
- ProductCard with reason text
