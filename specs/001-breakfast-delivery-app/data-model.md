# 資料模型設計

**功能**: 台灣早餐外送 App
**日期**: 2025-11-04
**狀態**: Phase 1 Design

## 概述

本文件定義台灣早餐外送 App 的核心資料實體、欄位、關聯性與驗證規則。所有型別定義將存放在 `lib/types/` 目錄下。

---

## 1. Product (商品)

### 描述
代表早餐菜單中的單一品項,包含名稱、描述、價格與圖片資訊。

### 欄位定義

| 欄位 | 型別 | 必填 | 描述 | 驗證規則 |
|------|------|------|------|----------|
| `id` | `string` | ✓ | 商品唯一識別碼 | 非空字串 |
| `name` | `string` | ✓ | 商品名稱 (英文) | 長度 1-50 字元 |
| `nameZh` | `string` | - | 商品名稱 (中文) | 長度 1-20 字元 |
| `description` | `string` | ✓ | 商品描述 (英文) | 長度 1-200 字元 |
| `price` | `number` | ✓ | 商品價格 (USD) | > 0, 最多 2 位小數 |
| `image` | `string` | ✓ | 圖片 URL 或路徑 | 有效的 URL 或本地路徑 |
| `category` | `ProductCategory` | ✓ | 商品類別 | 見 ProductCategory enum |
| `isAvailable` | `boolean` | - | 是否可供應 | 預設 true |

### TypeScript 定義

```typescript
// lib/types/product.ts

export enum ProductCategory {
  DRINK = 'drink',
  MAIN = 'main',
  SIDE = 'side',
}

export interface Product {
  id: string;
  name: string;
  nameZh?: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  isAvailable?: boolean;
}

// 商品資料驗證
export function validateProduct(product: Product): boolean {
  return (
    product.id.length > 0 &&
    product.name.length >= 1 && product.name.length <= 50 &&
    product.price > 0 &&
    product.image.length > 0
  );
}
```

### 範例資料

```typescript
// lib/data/products.ts
import { Product, ProductCategory } from '@/lib/types/product';

export const products: Product[] = [
  {
    id: 'soy-milk',
    name: 'Soy Milk',
    nameZh: '豆漿',
    description: 'Freshly made traditional soy milk',
    price: 2.00,
    image: '/images/products/soy-milk.jpg',
    category: ProductCategory.DRINK,
    isAvailable: true,
  },
  {
    id: 'egg-crepe',
    name: 'Dan Bing (Egg Crepe)',
    nameZh: '蛋餅',
    description: 'Thin crepe wrapped around scrambled egg',
    price: 3.50,
    image: '/images/products/egg-crepe.jpg',
    category: ProductCategory.MAIN,
    isAvailable: true,
  },
  {
    id: 'radish-cake',
    name: 'Radish Cake',
    nameZh: '蘿蔔糕',
    description: 'Pan-fried turnip cake',
    price: 3.00,
    image: '/images/products/radish-cake.jpg',
    category: ProductCategory.MAIN,
    isAvailable: true,
  },
  {
    id: 'fried-dough',
    name: 'Fried Dough Stick',
    nameZh: '油條',
    description: 'Crispy Chinese cruller',
    price: 2.00,
    image: '/images/products/fried-dough.jpg',
    category: ProductCategory.SIDE,
    isAvailable: true,
  },
  {
    id: 'fan-tuan',
    name: 'Fan Tuan (Rice Roll)',
    nameZh: '飯糰',
    description: 'Sticky rice roll with various fillings',
    price: 4.00,
    image: '/images/products/fan-tuan.jpg',
    category: ProductCategory.MAIN,
    isAvailable: true,
  },
];
```

---

## 2. CartItem (購物車品項)

### 描述
代表購物車中的單一商品項目,包含商品參照、數量與計算後的小計。

### 欄位定義

| 欄位 | 型別 | 必填 | 描述 | 驗證規則 |
|------|------|------|------|----------|
| `productId` | `string` | ✓ | 商品 ID (關聯至 Product) | 必須存在於商品列表 |
| `quantity` | `number` | ✓ | 數量 | >= 0, 整數 |
| `price` | `number` | ✓ | 商品單價 (快照) | > 0, 最多 2 位小數 |
| `subtotal` | `number` | - | 小計 (計算值) | quantity × price |

### TypeScript 定義

```typescript
// lib/types/cart.ts

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number; // 計算屬性
}

// 計算購物車總價
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// 驗證購物車項目
export function validateCartItem(item: CartItem): boolean {
  return (
    item.productId.length > 0 &&
    item.quantity >= 0 &&
    Number.isInteger(item.quantity) &&
    item.price > 0
  );
}
```

### 狀態轉換

```
空購物車 → 加入商品 (quantity > 0) → 有商品購物車
有商品購物車 → 調整數量 (quantity = 0) → 移除商品
有商品購物車 → 結帳 → 清空購物車
```

---

## 3. Order (訂單)

### 描述
代表完整的訂單資訊,包含訂單項目、總價、時間戳記、付款方式與訂單狀態。

### 欄位定義

| 欄位 | 型別 | 必填 | 描述 | 驗證規則 |
|------|------|------|------|----------|
| `id` | `string` | ✓ | 訂單號 (格式: #12345) | 6 位數字,前綴 # |
| `items` | `OrderItem[]` | ✓ | 訂單項目列表 | 至少 1 個項目 |
| `subtotal` | `number` | ✓ | 訂單小計 | >= 0, 最多 2 位小數 |
| `total` | `number` | ✓ | 訂單總價 | >= subtotal |
| `status` | `OrderStatus` | ✓ | 訂單狀態 | 見 OrderStatus enum |
| `paymentMethod` | `PaymentMethodType` | ✓ | 付款方式 | 見 PaymentMethodType |
| `createdAt` | `Date` | ✓ | 訂單建立時間 | ISO 8601 格式 |
| `estimatedTime` | `number` | - | 預估準備時間 (分鐘) | 15-20 分鐘 |

### TypeScript 定義

```typescript
// lib/types/order.ts

export enum OrderStatus {
  PENDING = 'pending',       // 待付款
  CONFIRMED = 'confirmed',   // 已確認
  PREPARING = 'preparing',   // 準備中
  READY = 'ready',           // 已完成
  DELIVERED = 'delivered',   // 已送達
  CANCELLED = 'cancelled',   // 已取消
}

export interface OrderItem {
  productId: string;
  productName: string;       // 商品名稱快照
  quantity: number;
  price: number;             // 下單時的價格快照
  subtotal: number;          // quantity × price
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethodType;
  createdAt: Date;
  estimatedTime?: number;    // 預設 15-20 分鐘
}

// 生成訂單號
export function generateOrderId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `#${randomNum}`;
}

// 計算訂單總價
export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

// 驗證訂單
export function validateOrder(order: Order): boolean {
  return (
    order.id.startsWith('#') &&
    order.items.length > 0 &&
    order.subtotal >= 0 &&
    order.total >= order.subtotal &&
    order.createdAt instanceof Date
  );
}
```

### 狀態轉換圖

```
PENDING → CONFIRMED → PREPARING → READY → DELIVERED
   ↓
CANCELLED
```

**轉換規則**:
- 只有 `PENDING` 狀態可轉換為 `CANCELLED`
- 正常流程: `PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `DELIVERED`
- 付款成功後自動轉換為 `CONFIRMED`

---

## 4. PaymentMethod (付款方式)

### 描述
代表可用的付款方式選項,包含已儲存的卡片資訊。

### 欄位定義

| 欄位 | 型別 | 必填 | 描述 | 驗證規則 |
|------|------|------|------|----------|
| `type` | `PaymentMethodType` | ✓ | 付款方式類型 | 見 enum |
| `last4` | `string` | - | 卡號後四碼 | 4 位數字 |
| `isDefault` | `boolean` | - | 是否為預設付款方式 | 預設 false |
| `brand` | `string` | - | 卡片品牌 | Visa, Mastercard, etc. |

### TypeScript 定義

```typescript
// lib/types/payment.ts

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  MASTERCARD = 'mastercard',
  VISA = 'visa',
  APPLE_PAY = 'apple_pay',
}

export interface PaymentMethod {
  type: PaymentMethodType;
  last4?: string;
  isDefault?: boolean;
  brand?: string;
}

export interface PaymentIntent {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  status: PaymentStatus;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// 預設付款方式列表
export const defaultPaymentMethods: PaymentMethod[] = [
  {
    type: PaymentMethodType.CREDIT_CARD,
    isDefault: true,
  },
  {
    type: PaymentMethodType.MASTERCARD,
    last4: '1234',
    brand: 'Mastercard',
  },
  {
    type: PaymentMethodType.VISA,
    last4: '5678',
    brand: 'Visa',
  },
  {
    type: PaymentMethodType.APPLE_PAY,
  },
];

// 格式化卡號顯示
export function formatCardNumber(last4?: string): string {
  return last4 ? `xxxx xxxx xxxx ${last4}` : '';
}
```

---

## 5. OrderHistory (訂單歷史)

### 描述
代表用戶的歷史訂單記錄,用於訂單歷史頁面顯示與重複訂購功能。

### 欄位定義

| 欄位 | 型別 | 必填 | 描述 | 驗證規則 |
|------|------|------|------|----------|
| `orders` | `Order[]` | ✓ | 訂單列表 | 按時間倒序排列 |
| `isExpanded` | `Map<string, boolean>` | - | 展開狀態 (UI 用) | orderId → boolean |

### TypeScript 定義

```typescript
// lib/types/order-history.ts
import { Order } from './order';

export interface OrderHistoryItem {
  order: Order;
  isExpanded: boolean;
}

export interface OrderHistory {
  orders: Order[];
}

// 格式化訂單日期
export function formatOrderDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 從訂單建立重複訂購的購物車項目
export function createReorderItems(order: Order): CartItem[] {
  return order.items.map(item => ({
    productId: item.productId,
    quantity: 0, // 重複訂購時數量歸零
    price: item.price,
  }));
}
```

---

## 6. 資料關聯圖

```
┌─────────────┐
│   Product   │
│             │
│ - id        │
│ - name      │
│ - price     │
│ - image     │
└──────┬──────┘
       │
       │ 參照
       ↓
┌─────────────┐
│  CartItem   │
│             │
│ - productId │◄──────┐
│ - quantity  │       │
│ - price     │       │ 轉換為
└──────┬──────┘       │
       │              │
       │ 結帳         │
       ↓              │
┌─────────────┐       │
│    Order    │       │
│             │       │
│ - id        │       │
│ - items     ├───────┘
│ - total     │
│ - status    │
│ - payment   │◄──────┐
└──────┬──────┘       │
       │              │
       │              │
       ↓              │
┌─────────────┐  ┌────┴──────────┐
│OrderHistory │  │PaymentMethod  │
│             │  │               │
│ - orders[]  │  │ - type        │
└─────────────┘  │ - last4       │
                 └───────────────┘
```

---

## 7. 驗證規則總結

### 商品驗證
- ✓ 價格必須 > 0
- ✓ 名稱長度 1-50 字元
- ✓ 圖片路徑不可為空

### 購物車驗證
- ✓ 數量必須 >= 0 且為整數
- ✓ 商品 ID 必須有效
- ✓ 結帳時至少 1 個商品 (total > 0)

### 訂單驗證
- ✓ 訂單號格式: #[6位數字]
- ✓ 至少包含 1 個訂單項目
- ✓ 總價 >= 小計
- ✓ 建立時間不可為未來時間

### 付款驗證
- ✓ 必須選擇一種付款方式
- ✓ 金額必須與訂單總價一致
- ✓ 卡號後四碼 (如有) 必須為 4 位數字

---

## 8. 效能考量

### 資料量估算
- **商品數量**: 5-20 個 (靜態資料)
- **購物車項目**: 通常 1-10 個
- **訂單歷史**: 最多儲存 50 筆 (LocalStorage 限制)
- **單筆訂單大小**: 約 1-2 KB

### 最佳化策略
1. **商品資料**: 靜態匯入,無需動態載入
2. **購物車**: 使用 Context API + useMemo 避免重複計算
3. **訂單歷史**: 分頁顯示,一次顯示 10 筆
4. **圖片**: 使用 Next.js Image 元件自動優化

---

## 9. 型別檔案組織

```
lib/types/
├── product.ts           # Product, ProductCategory
├── cart.ts              # CartItem, Cart
├── order.ts             # Order, OrderItem, OrderStatus
├── payment.ts           # PaymentMethod, PaymentIntent, PaymentStatus
├── order-history.ts     # OrderHistory, OrderHistoryItem
└── index.ts             # 統一匯出

lib/data/
└── products.ts          # 商品靜態資料

lib/utils/
├── validation.ts        # 驗證函數
├── formatting.ts        # 格式化函數
└── calculations.ts      # 計算函數
```

### 統一匯出範例

```typescript
// lib/types/index.ts
export * from './product';
export * from './cart';
export * from './order';
export * from './payment';
export * from './order-history';
```

---

**文件版本**: 1.0
**最後更新**: 2025-11-04
**下一步**: 定義 API Contracts (如需後端整合)
