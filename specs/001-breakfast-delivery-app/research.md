# 技術研究報告

**功能**: 台灣早餐外送 App
**日期**: 2025-11-04
**狀態**: Phase 0 Research Complete

## 1. 狀態管理方案

### 決策: React Context API + Custom Hooks

### 理由:
- **專案規模適中**: 6-8 個頁面,狀態相對簡單(購物車、訂單流程)
- **Next.js 原生支援**: Context API 與 Server Components 完美搭配,無需額外依賴
- **效能考量**: 使用多個小型 Context 避免不必要的重渲染
- **開發效率**: 減少學習曲線,團隊可快速上手
- **並發支援**: React 19 的並發特性原生支援 Context API

### 考慮的替代方案:
- **Zustand**: 優秀的輕量級方案,但對於此專案規模略顯過度設計
- **Redux Toolkit**: 功能強大但過於複雜,不適合此專案的狀態管理需求
- **Jotai/Recoil**: 原子化狀態管理,對於線性流程的訂餐系統不是最佳選擇

### 實作建議:

```typescript
// contexts/CartContext.tsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, clearCart, total }}>
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

**Context 分層策略**:
- `CartContext`: 管理購物車狀態
- `OrderContext`: 管理當前訂單流程 (review → checkout → confirmation)
- `OrderHistoryContext`: 管理歷史訂單

---

## 2. 訂單歷史持久化

### 決策: LocalStorage + 未來可擴展至後端 API

### 理由:
- **MVP 優先**: LocalStorage 可快速實現基本功能,無需後端開發
- **用戶體驗**: 即時儲存,無需網路請求延遲
- **隱私考量**: 資料存放在客戶端,減少隱私疑慮
- **漸進式架構**: 預留 API 介面,未來可平滑遷移至後端
- **成本效益**: 初期無需資料庫與後端基礎設施

### 考慮的替代方案:
- **IndexedDB**: 功能更強大但 API 較複雜,對於簡單訂單歷史過度設計
- **後端 API (即時實作)**: 需要額外的後端開發時間,增加專案複雜度
- **SessionStorage**: 關閉瀏覽器後資料消失,不符合跨 session 需求

### 實作建議:

```typescript
// lib/storage/order-history.ts
import { Order } from '@/lib/types/order';

const STORAGE_KEY = 'breakfast-app-order-history';
const MAX_ORDERS = 50; // 限制儲存數量避免超過 LocalStorage 限額

export const orderHistoryStorage = {
  // 讀取所有訂單
  getAll(): Order[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load order history:', error);
      return [];
    }
  },

  // 新增訂單
  add(order: Order): void {
    const orders = this.getAll();
    orders.unshift(order); // 最新的在前面

    // 限制儲存數量
    if (orders.length > MAX_ORDERS) {
      orders.splice(MAX_ORDERS);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to save order:', error);
      // 如果超過儲存限制,移除最舊的訂單後重試
      orders.pop();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  },

  // 根據訂單號取得訂單
  getById(orderId: string): Order | undefined {
    return this.getAll().find(order => order.id === orderId);
  },

  // 清除所有歷史 (用於測試或用戶要求)
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Custom Hook 封裝
export function useOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(orderHistoryStorage.getAll());
  }, []);

  const addOrder = useCallback((order: Order) => {
    orderHistoryStorage.add(order);
    setOrders(orderHistoryStorage.getAll());
  }, []);

  return { orders, addOrder };
}
```

**未來遷移至後端的準備**:
```typescript
// lib/api/order-history.ts (未來實作)
export const orderHistoryApi = {
  async getAll(): Promise<Order[]> {
    const response = await fetch('/api/orders');
    return response.json();
  },

  async add(order: Order): Promise<void> {
    await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }
};

// 只需修改 useOrderHistory hook 的資料來源即可完成遷移
```

---

## 3. 測試框架選擇

### 決策: Vitest + React Testing Library (單元測試) + Playwright (E2E 測試)

### 理由:

**單元測試 - Vitest**:
- **速度**: 比 Jest 快 2-10 倍,使用 ESM 原生支援
- **Next.js 相容**: 完美支援 Next.js 16 + React 19
- **開發體驗**: 熱更新、內建 TypeScript 支援
- **Jest 相容**: API 與 Jest 幾乎相同,降低學習成本
- **維護活躍**: Vite 生態系的一部分,持續更新

**E2E 測試 - Playwright**:
- **多瀏覽器支援**: Chrome, Firefox, Safari 同時測試
- **穩定性**: 自動等待機制減少 flaky tests
- **Next.js 整合**: 官方推薦,文件完善
- **除錯體驗**: UI Mode 提供視覺化除錯介面
- **並行執行**: 預設支援並行測試,加快執行速度

### 考慮的替代方案:
- **Jest**: 成熟穩定但較慢,對 ESM 支援不如 Vitest
- **Cypress**: 優秀的 E2E 工具但速度較慢,對多瀏覽器支援需額外配置

### 實作建議:

**Vitest 設定**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**Playwright 設定**:
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**測試範例**:
```typescript
// __tests__/components/order/product-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/order/product-card';

describe('ProductCard', () => {
  it('increases quantity when plus button clicked', () => {
    const onQuantityChange = vi.fn();
    render(
      <ProductCard
        product={{ id: '1', name: 'Soy Milk', price: 2.0 }}
        quantity={0}
        onQuantityChange={onQuantityChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /plus/i }));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });
});
```

```typescript
// __tests__/e2e/order-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete order flow', async ({ page }) => {
  await page.goto('/');

  // 選擇商品
  await page.click('[data-testid="product-1-plus"]');
  await page.click('[data-testid="product-2-plus"]');

  // 驗證總價
  await expect(page.locator('[data-testid="total-price"]')).toHaveText('$5.50');

  // 前往結帳
  await page.click('[data-testid="checkout-button"]');
  await expect(page).toHaveURL('/review');

  // 完成訂單
  await page.click('[data-testid="continue-button"]');
  await page.click('[data-testid="payment-credit-card"]');
  await page.click('[data-testid="complete-order"]');

  // 驗證確認頁面
  await expect(page).toHaveURL('/confirmation');
  await expect(page.locator('h1')).toContainText('Thank You!');
});
```

---

## 4. 離線支援需求

### 決策: 階段性實作 - MVP 不支援,未來可選擇性加入 PWA

### 理由:
- **核心流程需在線**: 訂單提交、付款處理必須有網路連線
- **MVP 優先**: 專注在核心訂餐功能,離線支援可作為進階功能
- **使用情境分析**: 用戶在訂餐時通常有網路連線(手機或 WiFi)
- **成本效益**: 實作完整的 PWA 需要額外開發與測試時間
- **漸進增強**: 可在 Phase 2 或後續版本加入商品目錄的離線快取

### 考慮的替代方案:
- **完整 PWA (Service Workers)**: 功能完整但增加複雜度,對 MVP 非必要
- **Static Generation**: Next.js 可靜態生成商品頁面,但動態價格計算仍需 JavaScript
- **App Cache (已廢棄)**: 不考慮使用

### 未來 PWA 實作建議:

如果未來需要離線支援,建議使用 `next-pwa`:

```bash
npm install next-pwa
```

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // Next.js config
});
```

**離線策略**:
1. **商品圖片**: Cache-First 策略
2. **商品資料**: Network-First,失敗時使用快取
3. **訂單提交**: Network-Only,無網路時顯示錯誤訊息
4. **歷史訂單**: 已由 LocalStorage 處理,天然支援離線

---

## 5. 付款整合最佳實踐

### 決策: Next.js API Routes + 第三方支付 SDK (Stripe/TapPay)

### 理由:
- **安全性**: 敏感資料(卡號)不經過前端,符合 PCI DSS 規範
- **Next.js 整合**: API Routes 提供 serverless function,無需獨立後端
- **第三方 SDK**: 使用 Stripe 或 TapPay 等成熟方案,減少自行開發風險
- **合規性**: 第三方支付商已處理 PCI DSS 合規,降低法律風險
- **開發效率**: SDK 提供完整的支付流程與錯誤處理

### 考慮的替代方案:
- **純前端整合**: 安全性不足,不符合 PCI DSS
- **獨立後端服務**: 過度工程,增加部署複雜度
- **直接對接銀行 API**: 開發與合規成本極高

### 實作建議:

**推薦方案: Stripe (國際) 或 TapPay (台灣在地)**

```typescript
// lib/types/payment.ts
export type PaymentMethodType = 'credit_card' | 'mastercard' | 'visa' | 'apple_pay';

export interface PaymentMethod {
  type: PaymentMethodType;
  last4?: string; // 卡號後四碼
  isDefault: boolean;
}

export interface PaymentIntent {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
}
```

```typescript
// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId } = await req.json();

    // 建立 Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // 轉換為最小單位 (cents)
      currency: 'usd',
      metadata: {
        orderId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
```

```typescript
// components/checkout/payment-form.tsx
'use client';

import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ onSuccess }: { onSuccess: (orderId: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.metadata.orderId);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : 'Complete Order'}
      </button>
    </form>
  );
}

export function PaymentForm({ clientSecret, onSuccess }: Props) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} />
    </Elements>
  );
}
```

**安全檢查清單**:
- ✅ 永不在前端儲存完整卡號
- ✅ 使用 HTTPS (Next.js production 預設)
- ✅ API Keys 存放在環境變數
- ✅ 使用 Payment Element 確保 PCI DSS 合規
- ✅ 實作 CSRF 保護 (Next.js API Routes 內建)
- ✅ 驗證請求來源與金額

**Apple Pay 特殊處理**:
```typescript
// Apple Pay 需要額外的 domain 驗證
// 將 .well-known/apple-developer-merchantid-domain-association
// 放置在 public/ 目錄下
```

**TapPay (台灣本地方案) 替代實作**:
```typescript
// 如果選擇 TapPay,可使用類似架構:
import TPDirect from 'tpdirect';

TPDirect.setupSDK(
  APP_ID,
  APP_KEY,
  'sandbox' // or 'production'
);

// 設定信用卡欄位
TPDirect.card.setup({
  fields: {
    number: { element: '#card-number' },
    expirationDate: { element: '#card-expiry' },
    ccv: { element: '#card-ccv' }
  }
});
```

---

## 6. Next.js 16 + React 19 最佳實踐

### 重點技術決策:

**Server Components 策略**:
- **預設使用 Server Components**: 商品列表、訂單歷史等靜態內容
- **Client Components**: 購物車互動、數量控制、表單提交

```typescript
// app/(order)/page.tsx (Server Component)
import { ProductList } from '@/components/order/product-list';
import { products } from '@/lib/data/products';

export default async function OrderPage() {
  // Server Component 可直接執行非同步操作
  return (
    <main>
      <h1>台灣早餐外送</h1>
      <ProductList products={products} />
    </main>
  );
}
```

```typescript
// components/order/product-card.tsx (Client Component)
'use client';

import { useState } from 'react';

export function ProductCard({ product }: Props) {
  const [quantity, setQuantity] = useState(0);

  return (
    <div>
      <button onClick={() => setQuantity(q => q + 1)}>+</button>
      <span>{quantity}</span>
      <button onClick={() => setQuantity(q => Math.max(0, q - 1))}>-</button>
    </div>
  );
}
```

**Data Fetching**:
- 使用 Server Components 預取資料
- 避免過度使用 useEffect 進行資料載入
- 利用 React 19 的 `use()` hook 處理 Promise

**效能優化**:
- 使用 Next.js Image 元件優化圖片載入
- 實作 Suspense boundaries 改善載入體驗
- 利用 Route Groups 組織路由結構

---

## 總結與建議

### 技術堆疊確認:

| 類別 | 決策 | 理由 |
|------|------|------|
| 狀態管理 | React Context API | 專案規模適中,原生支援 |
| 持久化 | LocalStorage | MVP 優先,未來可擴展 |
| 單元測試 | Vitest + RTL | 速度快,Next.js 相容 |
| E2E 測試 | Playwright | 穩定性高,多瀏覽器支援 |
| 離線支援 | 暫不實作 | 核心流程需網路,非 MVP 必要 |
| 付款整合 | Stripe/TapPay | 安全合規,開發效率高 |

### 實作優先順序:

**Phase 1 (必要)**:
1. 建立型別定義與資料模型
2. 實作 Context Providers (Cart, Order)
3. 建立基礎 UI 元件
4. 實作核心訂餐流程

**Phase 2 (重要)**:
5. 整合付款 SDK
6. 實作訂單歷史 (LocalStorage)
7. 撰寫單元測試

**Phase 3 (可選)**:
8. 加入 E2E 測試
9. 效能優化
10. PWA 離線支援

### 風險與緩解:

| 風險 | 影響 | 緩解措施 |
|------|------|----------|
| LocalStorage 容量限制 | 訂單歷史可能達上限 | 限制儲存 50 筆訂單 |
| 第三方支付整合複雜度 | 開發時程延遲 | 使用 Stripe test mode 並行開發 |
| React 19 新特性相容性 | 部分套件可能不相容 | 優先使用官方支援的套件 |

---

**研究完成日期**: 2025-11-04
**審查者**: Claude (AI Assistant)
**下一步**: 進入 Phase 1 - 設計與合約定義
