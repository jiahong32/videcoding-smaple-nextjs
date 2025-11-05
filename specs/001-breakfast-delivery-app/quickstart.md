# 快速開始指南

**功能**: 台灣早餐外送 App
**日期**: 2025-11-04
**目標讀者**: 開發人員

## 概述

本指南幫助開發人員快速設定開發環境並開始開發台灣早餐外送 App。遵循以下步驟,您將能在 15 分鐘內運行完整的開發環境。

---

## 前置需求

### 必要工具

- **Node.js**: 20.x 或更高版本
- **npm**: 10.x 或更高版本
- **Git**: 用於版本控制

### 檢查版本

```bash
node --version  # 應顯示 v20.x.x 或更高
npm --version   # 應顯示 10.x.x 或更高
git --version   # 應顯示 git version 2.x.x 或更高
```

### 推薦工具

- **VS Code**: 搭配以下擴充功能
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

---

## 快速開始

### 1. 複製專案

```bash
git clone <repository-url>
cd videcoding-sample-nextjs
```

### 2. 切換到功能分支

```bash
git checkout 001-breakfast-delivery-app
```

### 3. 安裝相依套件

```bash
npm install
```

此命令會安裝所有必要的相依套件,包括:
- Next.js 16
- React 19.2.0
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui 元件

### 4. 啟動開發伺服器

```bash
npm run dev
```

開發伺服器將在 `http://localhost:3000` 啟動。

### 5. 驗證安裝

在瀏覽器開啟 `http://localhost:3000`,您應該會看到:
- ✅ 首頁正確載入
- ✅ Tailwind CSS 樣式正常顯示
- ✅ 無 console 錯誤

---

## 專案結構導覽

### 重要目錄

```
videcoding-smaple-nextjs/
├── app/                    # Next.js App Router 路由
│   ├── (order)/           # 訂餐流程頁面群組
│   ├── history/           # 訂單歷史頁面
│   ├── layout.tsx         # 根佈局
│   └── globals.css        # 全域樣式
├── components/            # React 元件
│   ├── ui/               # shadcn/ui 基礎元件
│   ├── order/            # 訂餐功能元件
│   ├── checkout/         # 結帳功能元件
│   └── history/          # 歷史記錄元件
├── lib/                   # 工具函數與型別
│   ├── types/            # TypeScript 型別定義
│   ├── data/             # 靜態資料
│   └── utils.ts          # 工具函數
├── hooks/                 # 自定義 React Hooks
├── public/                # 靜態資源
│   └── images/           # 圖片資源
├── specs/                 # 功能規格文件
│   └── 001-breakfast-delivery-app/
│       ├── spec.md       # 功能規格
│       ├── plan.md       # 實作計畫
│       ├── research.md   # 技術研究
│       ├── data-model.md # 資料模型
│       └── contracts/    # API 契約
└── __tests__/            # 測試檔案
```

### 關鍵檔案

| 檔案 | 用途 |
|------|------|
| `package.json` | 專案相依套件與腳本 |
| `tsconfig.json` | TypeScript 配置 |
| `next.config.js` | Next.js 配置 |
| `postcss.config.mjs` | Tailwind CSS v4 配置 |
| `components.json` | shadcn/ui 配置 |
| `.eslintrc.json` | ESLint 規則 |

---

## 開發工作流程

### 建立新功能

1. **查看功能規格**
   ```bash
   cat specs/001-breakfast-delivery-app/spec.md
   ```

2. **查看技術決策**
   ```bash
   cat specs/001-breakfast-delivery-app/research.md
   ```

3. **參考資料模型**
   ```bash
   cat specs/001-breakfast-delivery-app/data-model.md
   ```

4. **開始開發**
   - 建立元件檔案
   - 實作業務邏輯
   - 撰寫測試

### 常用指令

```bash
# 開發
npm run dev          # 啟動開發伺服器

# 建置
npm run build        # 建立生產版本
npm start            # 執行生產伺服器

# 程式碼品質
npm run lint         # 執行 ESLint 檢查
npm run lint:fix     # 自動修正 ESLint 錯誤

# 測試 (待設定)
npm test             # 執行單元測試
npm run test:e2e     # 執行 E2E 測試
npm run test:watch   # 監聽模式執行測試
```

### Git 工作流程

```bash
# 確認目前分支
git branch

# 查看變更
git status

# 提交變更
git add .
git commit -m "feat: add product card component"

# 推送變更
git push origin 001-breakfast-delivery-app
```

---

## 開發指引

### TypeScript 型別定義

所有型別定義位於 `lib/types/` 目錄:

```typescript
// 使用範例
import { Product, Order, CartItem } from '@/lib/types';

const product: Product = {
  id: 'soy-milk',
  name: 'Soy Milk',
  price: 2.00,
  // ...
};
```

### 建立新元件

使用 shadcn/ui 風格建立元件:

```typescript
// components/order/product-card.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types/product';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export function ProductCard({ product, quantity, onQuantityChange }: ProductCardProps) {
  return (
    <Card>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>${product.price.toFixed(2)}</p>

      <div>
        <Button onClick={() => onQuantityChange(quantity - 1)}>-</Button>
        <span>{quantity}</span>
        <Button onClick={() => onQuantityChange(quantity + 1)}>+</Button>
      </div>
    </Card>
  );
}
```

### 使用 Context API

```typescript
// contexts/CartContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
```

### 新增 shadcn/ui 元件

```bash
# 手動建立元件檔案
touch components/ui/card.tsx

# 複製程式碼從 https://ui.shadcn.com/docs/components/card
# 確保匯入路徑正確 (@/lib/utils)
```

### 樣式撰寫

使用 Tailwind CSS 與 `cn()` 工具函數:

```typescript
import { cn } from '@/lib/utils';

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600',
        className
      )}
      {...props}
    />
  );
}
```

---

## 疑難排解

### 常見問題

#### 1. Port 3000 已被佔用

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 2. 模組找不到

```bash
# 清除快取並重新安裝
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript 錯誤

```bash
# 重建 TypeScript 型別
rm -rf .next
npm run build
```

#### 4. Tailwind CSS 樣式未套用

```bash
# 確認 postcss.config.mjs 存在
# 重啟開發伺服器
npm run dev
```

### 取得協助

- **查看文件**: `specs/001-breakfast-delivery-app/`
- **檢查 Issues**: GitHub Issues
- **閱讀 CLAUDE.md**: 專案級指引

---

## 下一步

### 建議的開發順序

1. **Phase 1: 基礎設定** (1-2 天)
   - [ ] 建立型別定義 (`lib/types/`)
   - [ ] 建立商品資料 (`lib/data/products.ts`)
   - [ ] 設定 Context Providers
   - [ ] 建立基礎 UI 元件

2. **Phase 2: 核心功能** (3-5 天)
   - [ ] 實作商品列表頁面
   - [ ] 實作購物車功能
   - [ ] 實作訂單確認頁面
   - [ ] 實作結帳流程

3. **Phase 3: 進階功能** (2-3 天)
   - [ ] 實作付款整合
   - [ ] 實作訂單歷史
   - [ ] 實作重複訂購功能

4. **Phase 4: 測試與優化** (2-3 天)
   - [ ] 撰寫單元測試
   - [ ] 撰寫 E2E 測試
   - [ ] 效能優化
   - [ ] 無障礙改善

### 學習資源

- **Next.js 文件**: https://nextjs.org/docs
- **React 文件**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 環境變數設定 (未來需要)

當需要整合第三方服務時,建立 `.env.local` 檔案:

```bash
# .env.local

# Stripe (付款)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# 其他環境變數...
```

**重要**: 永遠不要將 `.env.local` 提交到 Git。

---

## 效能檢查清單

部署前確認以下項目:

- [ ] `npm run build` 成功執行
- [ ] 無 TypeScript 錯誤
- [ ] 無 ESLint 錯誤
- [ ] 所有圖片使用 Next.js Image 元件
- [ ] 頁面載入時間 < 2 秒
- [ ] Lighthouse 分數 > 90

---

## 部署

### 部署到 Vercel (推薦)

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生產部署
vercel --prod
```

### 手動部署

```bash
# 建立生產版本
npm run build

# 啟動生產伺服器
npm start
```

---

## 維護與支援

### 更新相依套件

```bash
# 檢查過時的套件
npm outdated

# 更新套件
npm update

# 更新 Next.js
npm install next@latest react@latest react-dom@latest
```

### 監控與日誌

- 使用 Next.js 內建的開發工具
- 在生產環境整合監控服務 (例如: Sentry, LogRocket)

---

**文件版本**: 1.0
**最後更新**: 2025-11-04
**相關文件**:
- [功能規格](./spec.md)
- [實作計畫](./plan.md)
- [技術研究](./research.md)
- [資料模型](./data-model.md)
- [API 規格](./contracts/api-spec.md)

---

## 快速參考

### 路徑別名

- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/hooks` → `hooks/`
- `@/ui` → `components/ui/`

### 預設 Port

- 開發: `http://localhost:3000`
- 生產: 依部署環境而定

### 專案聯絡資訊

- **專案分支**: `001-breakfast-delivery-app`
- **規格目錄**: `specs/001-breakfast-delivery-app/`

---

**準備好開始了嗎?** 執行 `npm run dev` 開始開發! 🚀
