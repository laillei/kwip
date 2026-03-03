# Phase 1: Project Setup — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up the Kwip Next.js project with TypeScript types, 3 sample products with real ingredient data, and a data validation script.

**Architecture:** Next.js 15 App Router with TypeScript, Tailwind CSS v4, static JSON data files. All data is local — no database, no external APIs in this phase.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, ESLint 9, tsx (validation runner)

---

### Task 1: Create package.json and install dependencies

**Files:**
- Create: `package.json`

**Step 1: Write package.json**

```json
{
  "name": "kwip",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "validate-data": "tsx scripts/validate-data.ts"
  },
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^15",
    "tailwindcss": "^4",
    "tsx": "^4",
    "typescript": "^5"
  }
}
```

**Step 2: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` generated, no errors.

---

### Task 2: Write config files

**Files:**
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.gitignore`

**Step 1: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 2: Write next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

**Step 3: Write postcss.config.mjs**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**Step 4: Write eslint.config.mjs**

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

**Step 5: Write .gitignore**

```
/node_modules
/.next/
/out/
/build
.DS_Store
*.pem
npm-debug.log*
.env*.local
.vercel
*.tsbuildinfo
next-env.d.ts
```

---

### Task 3: Write app shell (layout, page, globals.css)

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

**Step 1: Write src/app/globals.css**

```css
@import "tailwindcss";
```

**Step 2: Write src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kwip - Kiểm tra thành phần K-beauty",
  description: "Kiểm tra thành phần mỹ phẩm Hàn Quốc bằng tiếng Việt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={notoSans.className}>{children}</body>
    </html>
  );
}
```

**Step 3: Write src/app/page.tsx**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold">Kwip</h1>
      <p className="mt-4 text-lg text-gray-600">
        Kiểm tra thành phần K-beauty bằng tiếng Việt
      </p>
    </main>
  );
}
```

**Step 4: Verify the app runs**

Run: `npm run dev` (start, check http://localhost:3000 loads without errors, then stop)
Expected: Page shows "Kwip" heading with Vietnamese subtitle. No console errors.

---

### Task 4: Create directory structure

**Files:**
- Create directories + `.gitkeep` in each empty directory

**Step 1: Create all directories and .gitkeep files**

```bash
mkdir -p src/components/{layout,home,products,detail,shared}
mkdir -p src/data
mkdir -p src/lib
mkdir -p public/images/products
mkdir -p scripts

touch src/components/layout/.gitkeep
touch src/components/home/.gitkeep
touch src/components/products/.gitkeep
touch src/components/detail/.gitkeep
touch src/components/shared/.gitkeep
touch public/images/products/.gitkeep
```

**Step 2: Verify structure**

Run: `find src/components src/data src/lib public/images scripts -type d | sort`
Expected:
```
public/images
public/images/products
scripts
src/components
src/components/detail
src/components/home
src/components/layout
src/components/products
src/components/shared
src/data
src/lib
```

---

### Task 5: Git init + first commit

**Step 1: Initialize git**

Run: `git init`

**Step 2: Stage all files**

Run: `git add -A`

**Step 3: Commit**

Run: `git commit -m "chore: scaffold Next.js 15 project with TypeScript and Tailwind"`

---

### Task 6: Write TypeScript types

**Files:**
- Create: `src/lib/types.ts`

**Step 1: Write src/lib/types.ts**

```ts
// --- Shared union types ---

export type Brand =
  | "cosrx"
  | "anua"
  | "torriden"
  | "beauty-of-joseon"
  | "round-lab"
  | "skin1004";

export type Category = "toner" | "serum" | "sunscreen" | "cream" | "pad";

export type Concern = "acne" | "moisturizing" | "brightening" | "anti-aging";

export type IngredientCategory =
  | "active"
  | "moisturizer"
  | "emollient"
  | "surfactant"
  | "preservative"
  | "fragrance"
  | "other";

// --- Product ---

export interface ProductIngredient {
  ingredientId: string;
  order: number;
  isKey: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: {
    ko: string;
    vi: string;
    en: string;
  };
  brand: Brand;
  category: Category;
  image: string;
  concerns: Concern[];
  ingredients: ProductIngredient[];
  popularity: {
    rank: number;
    updatedAt: string;
  };
  purchase: {
    shopee?: string;
    tiktokShop?: string;
    hasaki?: string;
  };
  tags: string[];
}

// --- Ingredient ---

export interface Ingredient {
  id: string;
  name: {
    inci: string;
    vi: string;
    ko: string;
  };
  description: {
    vi: string;
  };
  effects: {
    concern: Concern;
    type: "good" | "caution";
    reason: {
      vi: string;
    };
  }[];
  ewgGrade?: string;
  category: IngredientCategory;
}

// --- Concern Map ---

export interface ConcernMap {
  id: Concern;
  label: {
    vi: string;
    ko: string;
  };
  icon: string;
  keyIngredients: string[];
  weatherTrigger: {
    condition: string;
    message: {
      vi: string;
    };
  };
}

// --- localStorage ---

export interface KwipStorage {
  selectedConcern: Concern | null;
  recentProducts: string[];
  lastVisit: string;
}

export const STORAGE_KEY = "kwip_v1";

// --- Event tracking ---

export type TrackingEvent =
  | { event: "concern_select"; concern: Concern }
  | { event: "product_view"; productId: string; rank: number }
  | { event: "ingredient_expand"; productId: string }
  | { event: "purchase_click"; productId: string; platform: "shopee" | "tiktok" | "hasaki" }
  | { event: "zalo_share"; productId: string }
  | { event: "daily_context_view"; weatherCondition: string }
  | { event: "category_filter"; category: Category };
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit src/lib/types.ts`
Expected: No errors.

---

### Task 7: Write concerns.json

**Files:**
- Create: `src/data/concerns.json`

**Step 1: Write src/data/concerns.json**

```json
[
  {
    "id": "acne",
    "label": {
      "vi": "Mụn",
      "ko": "여드름"
    },
    "icon": "🧴",
    "keyIngredients": [
      "houttuynia-cordata-extract",
      "niacinamide",
      "panthenol",
      "allantoin"
    ],
    "weatherTrigger": {
      "condition": "high_humidity",
      "message": {
        "vi": "Độ ẩm cao hôm nay — da dễ bị bít tắc lỗ chân lông"
      }
    }
  },
  {
    "id": "moisturizing",
    "label": {
      "vi": "Cấp ẩm",
      "ko": "보습"
    },
    "icon": "💧",
    "keyIngredients": [
      "snail-secretion-filtrate",
      "sodium-hyaluronate",
      "panthenol",
      "betaine"
    ],
    "weatherTrigger": {
      "condition": "dry",
      "message": {
        "vi": "Không khí khô hôm nay — da cần được cấp ẩm thêm"
      }
    }
  },
  {
    "id": "brightening",
    "label": {
      "vi": "Sáng da",
      "ko": "미백"
    },
    "icon": "✨",
    "keyIngredients": [
      "niacinamide",
      "oryza-sativa-bran-extract",
      "lactobacillus-rice-ferment-filtrate"
    ],
    "weatherTrigger": {
      "condition": "high_uv",
      "message": {
        "vi": "Tia UV mạnh hôm nay — cần bảo vệ da khỏi nắng"
      }
    }
  },
  {
    "id": "anti-aging",
    "label": {
      "vi": "Chống lão hóa",
      "ko": "안티에이징"
    },
    "icon": "🌿",
    "keyIngredients": [
      "snail-secretion-filtrate",
      "sodium-hyaluronate",
      "arginine"
    ],
    "weatherTrigger": {
      "condition": "high_uv",
      "message": {
        "vi": "Tia UV mạnh hôm nay — cần chống lão hóa do ánh nắng"
      }
    }
  }
]
```

---

### Task 8: Write ingredients.json

**Files:**
- Create: `src/data/ingredients.json`

**Step 1: Write src/data/ingredients.json**

This file contains all 18 unique ingredients referenced by the 3 sample products.

```json
[
  {
    "id": "snail-secretion-filtrate",
    "name": {
      "inci": "Snail Secretion Filtrate",
      "vi": "Dịch tiết ốc sên",
      "ko": "달팽이 분비 여과물"
    },
    "description": {
      "vi": "Cung cấp độ ẩm sâu, giúp phục hồi và tái tạo da"
    },
    "effects": [
      {
        "concern": "moisturizing",
        "type": "good",
        "reason": { "vi": "Giữ ẩm sâu, giúp da căng mọng" }
      },
      {
        "concern": "anti-aging",
        "type": "good",
        "reason": { "vi": "Thúc đẩy tái tạo tế bào, giảm nếp nhăn" }
      }
    ],
    "ewgGrade": "1",
    "category": "active"
  },
  {
    "id": "betaine",
    "name": {
      "inci": "Betaine",
      "vi": "Betaine",
      "ko": "베타인"
    },
    "description": {
      "vi": "Amino acid tự nhiên giữ ẩm, giúp da mềm mại"
    },
    "effects": [
      {
        "concern": "moisturizing",
        "type": "good",
        "reason": { "vi": "Giữ ẩm tự nhiên, không gây kích ứng" }
      }
    ],
    "ewgGrade": "1",
    "category": "moisturizer"
  },
  {
    "id": "sodium-hyaluronate",
    "name": {
      "inci": "Sodium Hyaluronate",
      "vi": "Sodium Hyaluronate",
      "ko": "히알루론산나트륨"
    },
    "description": {
      "vi": "Dạng muối của hyaluronic acid, giữ ẩm gấp 1000 lần trọng lượng"
    },
    "effects": [
      {
        "concern": "moisturizing",
        "type": "good",
        "reason": { "vi": "Giữ nước cực mạnh, da căng mọng tức thì" }
      },
      {
        "concern": "anti-aging",
        "type": "good",
        "reason": { "vi": "Giảm nếp nhăn nhờ cấp ẩm sâu" }
      }
    ],
    "ewgGrade": "1",
    "category": "moisturizer"
  },
  {
    "id": "panthenol",
    "name": {
      "inci": "Panthenol",
      "vi": "Panthenol (Vitamin B5)",
      "ko": "판테놀"
    },
    "description": {
      "vi": "Làm dịu da, phục hồi hàng rào bảo vệ da"
    },
    "effects": [
      {
        "concern": "moisturizing",
        "type": "good",
        "reason": { "vi": "Phục hồi hàng rào ẩm tự nhiên của da" }
      },
      {
        "concern": "acne",
        "type": "good",
        "reason": { "vi": "Làm dịu da kích ứng do mụn" }
      }
    ],
    "ewgGrade": "1",
    "category": "active"
  },
  {
    "id": "arginine",
    "name": {
      "inci": "Arginine",
      "vi": "Arginine",
      "ko": "아르기닌"
    },
    "description": {
      "vi": "Amino acid giúp phục hồi và bảo vệ da"
    },
    "effects": [
      {
        "concern": "anti-aging",
        "type": "good",
        "reason": { "vi": "Hỗ trợ sản xuất collagen, giữ da săn chắc" }
      }
    ],
    "ewgGrade": "1",
    "category": "active"
  },
  {
    "id": "allantoin",
    "name": {
      "inci": "Allantoin",
      "vi": "Allantoin",
      "ko": "알란토인"
    },
    "description": {
      "vi": "Làm dịu da kích ứng, thúc đẩy tái tạo tế bào"
    },
    "effects": [
      {
        "concern": "acne",
        "type": "good",
        "reason": { "vi": "Làm dịu viêm, giúp da mụn hồi phục nhanh" }
      },
      {
        "concern": "moisturizing",
        "type": "good",
        "reason": { "vi": "Giữ ẩm nhẹ, phù hợp da nhạy cảm" }
      }
    ],
    "ewgGrade": "1",
    "category": "active"
  },
  {
    "id": "carbomer",
    "name": {
      "inci": "Carbomer",
      "vi": "Carbomer",
      "ko": "카보머"
    },
    "description": {
      "vi": "Chất tạo đặc, giúp sản phẩm có kết cấu phù hợp"
    },
    "effects": [],
    "ewgGrade": "1",
    "category": "other"
  },
  {
    "id": "phenoxyethanol",
    "name": {
      "inci": "Phenoxyethanol",
      "vi": "Phenoxyethanol",
      "ko": "페녹시에탄올"
    },
    "description": {
      "vi": "Chất bảo quản phổ biến trong mỹ phẩm"
    },
    "effects": [
      {
        "concern": "acne",
        "type": "caution",
        "reason": { "vi": "Chất bảo quản — một số da nhạy cảm có thể kích ứng nhẹ" }
      }
    ],
    "ewgGrade": "2",
    "category": "preservative"
  },
  {
    "id": "houttuynia-cordata-extract",
    "name": {
      "inci": "Houttuynia Cordata Extract",
      "vi": "Chiết xuất rau diếp cá",
      "ko": "어성초 추출물"
    },
    "description": {
      "vi": "Kháng viêm mạnh, làm dịu da mụn, kiểm soát dầu thừa"
    },
    "effects": [
      {
        "concern": "acne",
        "type": "good",
        "reason": { "vi": "Kháng khuẩn tự nhiên, giảm viêm mụn hiệu quả" }
      }
    ],
    "ewgGrade": "1",
    "category": "active"
  },
  {
    "id": "water",
    "name": {
      "inci": "Water",
      "vi": "Nước",
      "ko": "정제수"
    },
    "description": {
      "vi": "Dung môi cơ bản trong mỹ phẩm"
    },
    "effects": [],
    "category": "other"
  },
  {
    "id": "propanediol",
    "name": {
      "inci": "Propanediol",
      "vi": "Propanediol",
      "ko": "프로판디올"
    },
    "description": {
      "vi": "Chất giữ ẩm có nguồn gốc tự nhiên từ ngô"
    },
    "effects": [
      {
        "concern": "moisturizing",
        "type": "good",
        "reason": { "vi": "Giữ ẩm nhẹ, giúp các thành phần khác thẩm thấu" }
      }
    ],
    "ewgGrade": "1",
    "category": "moisturizer"
  },
  {
    "id": "butylene-glycol",
    "name": {
      "inci": "Butylene Glycol",
      "vi": "Butylene Glycol",
      "ko": "부틸렌글라이콜"
    },
    "description": {
      "vi": "Chất giữ ẩm, giúp các thành phần khác thẩm thấu tốt hơn"
    },
    "effects": [
      {
        "concern": "moisturizing",
        "type": "good",
        "reason": { "vi": "Dưỡng ẩm nhẹ, tăng hiệu quả của sản phẩm" }
      }
    ],
    "ewgGrade": "1",
    "category": "moisturizer"
  },
  {
    "id": "oryza-sativa-bran-extract",
    "name": {
      "inci": "Oryza Sativa (Rice) Bran Extract",
      "vi": "Chiết xuất cám gạo",
      "ko": "쌀겨 추출물"
    },
    "description": {
      "vi": "Giàu vitamin E và khoáng chất, dưỡng sáng da tự nhiên"
    },
    "effects": [
      {
        "concern": "brightening",
        "type": "good",
        "reason": { "vi": "Dưỡng sáng da tự nhiên nhờ vitamin E và khoáng chất" }
      }
    ],
    "ewgGrade": "1",
    "category": "active"
  },
  {
    "id": "niacinamide",
    "name": {
      "inci": "Niacinamide",
      "vi": "Niacinamide (Vitamin B3)",
      "ko": "나이아신아마이드"
    },
    "description": {
      "vi": "Làm sáng da, thu nhỏ lỗ chân lông, kiểm soát dầu"
    },
    "effects": [
      {
        "concern": "brightening",
        "type": "good",
        "reason": { "vi": "Ức chế melanin, giúp da sáng đều màu" }
      },
      {
        "concern": "acne",
        "type": "good",
        "reason": { "vi": "Kiểm soát dầu, thu nhỏ lỗ chân lông" }
      }
    ],
    "ewgGrade": "1",
    "category": "active"
  },
  {
    "id": "ethylhexyl-triazone",
    "name": {
      "inci": "Ethylhexyl Triazone",
      "vi": "Ethylhexyl Triazone",
      "ko": "에틸헥실트리아존"
    },
    "description": {
      "vi": "Chất chống nắng hóa học, bảo vệ da khỏi tia UVB"
    },
    "effects": [
      {
        "concern": "brightening",
        "type": "good",
        "reason": { "vi": "Chặn tia UVB, ngăn sạm nám do nắng" }
      }
    ],
    "ewgGrade": "1",
    "category": "active"
  },
  {
    "id": "lactobacillus-rice-ferment-filtrate",
    "name": {
      "inci": "Lactobacillus/Rice Ferment Filtrate",
      "vi": "Dịch lên men gạo Lactobacillus",
      "ko": "유산균/쌀 발효 여과물"
    },
    "description": {
      "vi": "Probiotic giúp sáng da và tăng cường hàng rào bảo vệ da"
    },
    "effects": [
      {
        "concern": "brightening",
        "type": "good",
        "reason": { "vi": "Sáng da nhờ quá trình lên men tự nhiên" }
      },
      {
        "concern": "moisturizing",
        "type": "good",
        "reason": { "vi": "Tăng cường hàng rào bảo vệ, giữ ẩm tốt hơn" }
      }
    ],
    "ewgGrade": "1",
    "category": "active"
  },
  {
    "id": "coco-caprylate-caprate",
    "name": {
      "inci": "Coco-Caprylate/Caprate",
      "vi": "Coco-Caprylate/Caprate",
      "ko": "코코-카프릴레이트/카프레이트"
    },
    "description": {
      "vi": "Chất làm mềm có nguồn gốc từ dừa, giúp da mịn màng"
    },
    "effects": [
      {
        "concern": "moisturizing",
        "type": "good",
        "reason": { "vi": "Làm mềm da tự nhiên, không gây bít tắc" }
      }
    ],
    "ewgGrade": "1",
    "category": "emollient"
  },
  {
    "id": "caprylyl-methicone",
    "name": {
      "inci": "Caprylyl Methicone",
      "vi": "Caprylyl Methicone",
      "ko": "카프릴릴메치콘"
    },
    "description": {
      "vi": "Silicone nhẹ, giúp sản phẩm dễ tán và mịn trên da"
    },
    "effects": [],
    "ewgGrade": "1",
    "category": "emollient"
  }
]
```

---

### Task 9: Write products.json

**Files:**
- Create: `src/data/products.json`

**Step 1: Write src/data/products.json**

```json
[
  {
    "id": "cosrx-snail-mucin-essence",
    "slug": "cosrx-snail-mucin-essence",
    "name": {
      "ko": "코스알엑스 어드밴스드 스네일 96 뮤신 파워 에센스",
      "vi": "Tinh chất ốc sên COSRX Advanced Snail 96 Mucin Power Essence",
      "en": "COSRX Advanced Snail 96 Mucin Power Essence"
    },
    "brand": "cosrx",
    "category": "serum",
    "image": "/images/products/cosrx-snail-mucin-essence.webp",
    "concerns": ["moisturizing", "anti-aging"],
    "ingredients": [
      { "ingredientId": "snail-secretion-filtrate", "order": 1, "isKey": true },
      { "ingredientId": "betaine", "order": 2, "isKey": false },
      { "ingredientId": "sodium-hyaluronate", "order": 3, "isKey": true },
      { "ingredientId": "panthenol", "order": 4, "isKey": true },
      { "ingredientId": "arginine", "order": 5, "isKey": false },
      { "ingredientId": "allantoin", "order": 6, "isKey": false },
      { "ingredientId": "carbomer", "order": 7, "isKey": false },
      { "ingredientId": "phenoxyethanol", "order": 8, "isKey": false }
    ],
    "popularity": {
      "rank": 1,
      "updatedAt": "2026-03-01"
    },
    "purchase": {
      "shopee": "https://shopee.vn/cosrx-snail-mucin",
      "tiktokShop": "https://www.tiktok.com/shop/cosrx-snail-mucin",
      "hasaki": "https://hasaki.vn/cosrx-snail-mucin"
    },
    "tags": ["best-seller", "sensitive-safe"]
  },
  {
    "id": "anua-heartleaf-toner",
    "slug": "anua-heartleaf-toner",
    "name": {
      "ko": "아누아 어성초 77 수딩 토너",
      "vi": "Nước hoa hồng Anua Heartleaf 77% Soothing Toner",
      "en": "Anua Heartleaf 77% Soothing Toner"
    },
    "brand": "anua",
    "category": "toner",
    "image": "/images/products/anua-heartleaf-toner.webp",
    "concerns": ["acne", "moisturizing"],
    "ingredients": [
      { "ingredientId": "houttuynia-cordata-extract", "order": 1, "isKey": true },
      { "ingredientId": "water", "order": 2, "isKey": false },
      { "ingredientId": "propanediol", "order": 3, "isKey": false },
      { "ingredientId": "betaine", "order": 4, "isKey": false },
      { "ingredientId": "panthenol", "order": 5, "isKey": true },
      { "ingredientId": "sodium-hyaluronate", "order": 6, "isKey": true },
      { "ingredientId": "allantoin", "order": 7, "isKey": false },
      { "ingredientId": "butylene-glycol", "order": 8, "isKey": false }
    ],
    "popularity": {
      "rank": 3,
      "updatedAt": "2026-03-01"
    },
    "purchase": {
      "shopee": "https://shopee.vn/anua-heartleaf-toner",
      "hasaki": "https://hasaki.vn/anua-heartleaf-toner"
    },
    "tags": ["best-seller"]
  },
  {
    "id": "beauty-of-joseon-relief-sun",
    "slug": "beauty-of-joseon-relief-sun",
    "name": {
      "ko": "조선미녀 라이스 프로바이오틱스 선크림",
      "vi": "Kem chống nắng Beauty of Joseon Relief Sun: Rice + Probiotics",
      "en": "Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+ PA++++"
    },
    "brand": "beauty-of-joseon",
    "category": "sunscreen",
    "image": "/images/products/beauty-of-joseon-relief-sun.webp",
    "concerns": ["brightening"],
    "ingredients": [
      { "ingredientId": "oryza-sativa-bran-extract", "order": 1, "isKey": true },
      { "ingredientId": "propanediol", "order": 2, "isKey": false },
      { "ingredientId": "niacinamide", "order": 3, "isKey": true },
      { "ingredientId": "ethylhexyl-triazone", "order": 4, "isKey": false },
      { "ingredientId": "lactobacillus-rice-ferment-filtrate", "order": 5, "isKey": true },
      { "ingredientId": "butylene-glycol", "order": 6, "isKey": false },
      { "ingredientId": "coco-caprylate-caprate", "order": 7, "isKey": false },
      { "ingredientId": "caprylyl-methicone", "order": 8, "isKey": false }
    ],
    "popularity": {
      "rank": 2,
      "updatedAt": "2026-03-01"
    },
    "purchase": {
      "shopee": "https://shopee.vn/beauty-of-joseon-sun",
      "tiktokShop": "https://www.tiktok.com/shop/beauty-of-joseon-sun"
    },
    "tags": ["best-seller"]
  }
]
```

---

### Task 10: Write data validation script

**Files:**
- Create: `scripts/validate-data.ts`

**Step 1: Write scripts/validate-data.ts**

```ts
import { readFileSync } from "fs";
import { join } from "path";

const dataDir = join(import.meta.dirname, "../src/data");

const concerns = JSON.parse(readFileSync(join(dataDir, "concerns.json"), "utf-8"));
const ingredients = JSON.parse(readFileSync(join(dataDir, "ingredients.json"), "utf-8"));
const products = JSON.parse(readFileSync(join(dataDir, "products.json"), "utf-8"));

const errors: string[] = [];

// --- Valid values ---
const validConcerns = ["acne", "moisturizing", "brightening", "anti-aging"];
const validBrands = ["cosrx", "anua", "torriden", "beauty-of-joseon", "round-lab", "skin1004"];
const validCategories = ["toner", "serum", "sunscreen", "cream", "pad"];
const validIngredientCategories = ["active", "moisturizer", "emollient", "surfactant", "preservative", "fragrance", "other"];

// --- Validate concerns ---
const concernIds = new Set<string>();
for (const c of concerns) {
  if (!c.id || !validConcerns.includes(c.id)) errors.push(`Invalid concern id: ${c.id}`);
  concernIds.add(c.id);
  if (!c.label?.vi) errors.push(`Concern ${c.id}: missing vi label`);
  if (!c.label?.ko) errors.push(`Concern ${c.id}: missing ko label`);
  if (!c.icon) errors.push(`Concern ${c.id}: missing icon`);
  if (!Array.isArray(c.keyIngredients)) errors.push(`Concern ${c.id}: keyIngredients must be array`);
  if (!c.weatherTrigger?.condition) errors.push(`Concern ${c.id}: missing weatherTrigger.condition`);
  if (!c.weatherTrigger?.message?.vi) errors.push(`Concern ${c.id}: missing weatherTrigger.message.vi`);
}

// --- Validate ingredients ---
const ingredientIds = new Set<string>();
for (const ing of ingredients) {
  if (!ing.id) { errors.push("Ingredient missing id"); continue; }
  ingredientIds.add(ing.id);
  if (!ing.name?.inci) errors.push(`Ingredient ${ing.id}: missing inci name`);
  if (!ing.name?.vi) errors.push(`Ingredient ${ing.id}: missing vi name`);
  if (!ing.name?.ko) errors.push(`Ingredient ${ing.id}: missing ko name`);
  if (!ing.description?.vi) errors.push(`Ingredient ${ing.id}: missing vi description`);
  if (!validIngredientCategories.includes(ing.category)) {
    errors.push(`Ingredient ${ing.id}: invalid category "${ing.category}"`);
  }
  for (const effect of ing.effects || []) {
    if (!validConcerns.includes(effect.concern)) {
      errors.push(`Ingredient ${ing.id}: invalid effect concern "${effect.concern}"`);
    }
    if (!["good", "caution"].includes(effect.type)) {
      errors.push(`Ingredient ${ing.id}: invalid effect type "${effect.type}"`);
    }
    if (!effect.reason?.vi) {
      errors.push(`Ingredient ${ing.id}: missing effect reason.vi for ${effect.concern}`);
    }
  }
}

// --- Check concern keyIngredients reference valid ingredients ---
for (const c of concerns) {
  for (const keyIng of c.keyIngredients || []) {
    if (!ingredientIds.has(keyIng)) {
      errors.push(`Concern ${c.id}: keyIngredient "${keyIng}" not in ingredients.json`);
    }
  }
}

// --- Validate products ---
for (const p of products) {
  if (!p.id) { errors.push("Product missing id"); continue; }
  if (!p.slug) errors.push(`Product ${p.id}: missing slug`);
  if (!p.name?.vi) errors.push(`Product ${p.id}: missing vi name`);
  if (!p.name?.ko) errors.push(`Product ${p.id}: missing ko name`);
  if (!p.name?.en) errors.push(`Product ${p.id}: missing en name`);
  if (!validBrands.includes(p.brand)) errors.push(`Product ${p.id}: invalid brand "${p.brand}"`);
  if (!validCategories.includes(p.category)) errors.push(`Product ${p.id}: invalid category "${p.category}"`);

  for (const concern of p.concerns || []) {
    if (!concernIds.has(concern)) {
      errors.push(`Product ${p.id}: concern "${concern}" not in concerns.json`);
    }
  }

  for (const pi of p.ingredients || []) {
    if (!ingredientIds.has(pi.ingredientId)) {
      errors.push(`Product ${p.id}: ingredient "${pi.ingredientId}" not in ingredients.json`);
    }
    if (typeof pi.order !== "number") errors.push(`Product ${p.id}: ingredient "${pi.ingredientId}" missing order`);
    if (typeof pi.isKey !== "boolean") errors.push(`Product ${p.id}: ingredient "${pi.ingredientId}" missing isKey`);
  }

  if (typeof p.popularity?.rank !== "number") errors.push(`Product ${p.id}: missing popularity.rank`);
  if (!p.popularity?.updatedAt) errors.push(`Product ${p.id}: missing popularity.updatedAt`);
}

// --- Report ---
if (errors.length > 0) {
  console.error(`\n❌ Validation failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log(`\n✅ All data valid!`);
  console.log(`   ${concerns.length} concerns`);
  console.log(`   ${ingredients.length} ingredients`);
  console.log(`   ${products.length} products`);
  process.exit(0);
}
```

---

### Task 11: Run validation and commit

**Step 1: Run the validation script**

Run: `npm run validate-data`
Expected:
```
✅ All data valid!
   4 concerns
   18 ingredients
   3 products
```

**Step 2: Run the build to verify everything compiles**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 3: Stage and commit**

```bash
git add src/lib/types.ts src/data/ scripts/ docs/plans/
git commit -m "feat: add TypeScript types, sample data (3 products), and validation script"
```
