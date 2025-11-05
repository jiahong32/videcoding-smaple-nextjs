# API 規格文件

**功能**: 台灣早餐外送 App
**日期**: 2025-11-04
**API 版本**: v1

## 概述

本文件定義前端與後端 API 之間的契約。由於此專案採用 Next.js,使用 **API Routes** 實作後端邏輯,提供 RESTful API 介面。

## 基礎資訊

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: 目前版本無需認證 (未來可加入 JWT)
- **Error Format**: 統一錯誤回應格式

---

## 通用格式

### 成功回應

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-04T12:00:00Z"
}
```

### 錯誤回應

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  },
  "timestamp": "2025-11-04T12:00:00Z"
}
```

### 狀態碼

| 狀態碼 | 說明 | 使用情境 |
|--------|------|----------|
| 200 | OK | 請求成功 |
| 201 | Created | 資源建立成功 |
| 400 | Bad Request | 請求參數錯誤 |
| 404 | Not Found | 資源不存在 |
| 500 | Internal Server Error | 伺服器錯誤 |

---

## API 端點

### 1. 商品相關

#### GET `/api/v1/products`

取得所有可用商品列表。

**請求參數**: 無

**回應範例**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "soy-milk",
        "name": "Soy Milk",
        "nameZh": "豆漿",
        "description": "Freshly made traditional soy milk",
        "price": 2.00,
        "image": "/images/products/soy-milk.jpg",
        "category": "drink",
        "isAvailable": true
      },
      {
        "id": "egg-crepe",
        "name": "Dan Bing (Egg Crepe)",
        "nameZh": "蛋餅",
        "description": "Thin crepe wrapped around scrambled egg",
        "price": 3.50,
        "image": "/images/products/egg-crepe.jpg",
        "category": "main",
        "isAvailable": true
      }
    ]
  },
  "timestamp": "2025-11-04T12:00:00Z"
}
```

**錯誤情境**:
- 500: 伺服器無法取得商品資料

**實作檔案**: `app/api/v1/products/route.ts`

---

#### GET `/api/v1/products/:id`

取得單一商品詳細資訊。

**請求參數**:
- `id` (string, required): 商品 ID

**回應範例**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "soy-milk",
      "name": "Soy Milk",
      "nameZh": "豆漿",
      "description": "Freshly made traditional soy milk",
      "price": 2.00,
      "image": "/images/products/soy-milk.jpg",
      "category": "drink",
      "isAvailable": true
    }
  },
  "timestamp": "2025-11-04T12:00:00Z"
}
```

**錯誤情境**:
- 404: 商品不存在
- 500: 伺服器錯誤

**實作檔案**: `app/api/v1/products/[id]/route.ts`

---

### 2. 訂單相關

#### POST `/api/v1/orders`

建立新訂單。

**請求 Body**:
```json
{
  "items": [
    {
      "productId": "soy-milk",
      "quantity": 2,
      "price": 2.00
    },
    {
      "productId": "egg-crepe",
      "quantity": 1,
      "price": 3.50
    }
  ],
  "paymentMethod": "credit_card"
}
```

**欄位驗證**:
- `items`: 必填,陣列至少包含 1 個項目
- `items[].productId`: 必填,必須為有效的商品 ID
- `items[].quantity`: 必填,必須 > 0
- `items[].price`: 必填,必須 > 0
- `paymentMethod`: 必填,必須為有效的付款方式

**回應範例**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "#123456",
      "items": [
        {
          "productId": "soy-milk",
          "productName": "Soy Milk",
          "quantity": 2,
          "price": 2.00,
          "subtotal": 4.00
        },
        {
          "productId": "egg-crepe",
          "productName": "Dan Bing (Egg Crepe)",
          "quantity": 1,
          "price": 3.50,
          "subtotal": 3.50
        }
      ],
      "subtotal": 7.50,
      "total": 7.50,
      "status": "pending",
      "paymentMethod": "credit_card",
      "createdAt": "2025-11-04T12:00:00Z",
      "estimatedTime": 18
    }
  },
  "timestamp": "2025-11-04T12:00:00Z"
}
```

**錯誤情境**:
- 400: 請求參數錯誤 (空訂單、無效商品 ID、數量 <= 0)
- 404: 商品不存在
- 500: 訂單建立失敗

**實作檔案**: `app/api/v1/orders/route.ts`

---

#### GET `/api/v1/orders/:id`

取得訂單詳細資訊。

**請求參數**:
- `id` (string, required): 訂單號 (格式: #123456)

**回應範例**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "#123456",
      "items": [...],
      "subtotal": 7.50,
      "total": 7.50,
      "status": "confirmed",
      "paymentMethod": "credit_card",
      "createdAt": "2025-11-04T12:00:00Z",
      "estimatedTime": 18
    }
  },
  "timestamp": "2025-11-04T12:00:00Z"
}
```

**錯誤情境**:
- 400: 訂單號格式錯誤
- 404: 訂單不存在
- 500: 伺服器錯誤

**實作檔案**: `app/api/v1/orders/[id]/route.ts`

---

#### GET `/api/v1/orders`

取得所有訂單 (訂單歷史)。

**查詢參數**:
- `limit` (number, optional): 限制回傳數量,預設 50
- `offset` (number, optional): 分頁偏移量,預設 0

**回應範例**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "#123456",
        "items": [...],
        "subtotal": 7.50,
        "total": 7.50,
        "status": "delivered",
        "paymentMethod": "credit_card",
        "createdAt": "2025-11-04T12:00:00Z",
        "estimatedTime": 18
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0
    }
  },
  "timestamp": "2025-11-04T12:00:00Z"
}
```

**錯誤情境**:
- 400: 查詢參數錯誤
- 500: 伺服器錯誤

**實作檔案**: `app/api/v1/orders/route.ts`

**注意**: MVP 階段使用 LocalStorage,此端點為未來後端實作預留。

---

### 3. 付款相關

#### POST `/api/v1/payment/intent`

建立付款意圖 (Payment Intent)。

**請求 Body**:
```json
{
  "orderId": "#123456",
  "amount": 7.50,
  "currency": "usd",
  "paymentMethod": "credit_card"
}
```

**欄位驗證**:
- `orderId`: 必填,必須為有效的訂單號
- `amount`: 必填,必須 > 0
- `currency`: 必填,預設 "usd"
- `paymentMethod`: 必填,必須為有效的付款方式

**回應範例**:
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdefg",
    "paymentIntentId": "pi_1234567890",
    "status": "requires_payment_method"
  },
  "timestamp": "2025-11-04T12:00:00Z"
}
```

**錯誤情境**:
- 400: 請求參數錯誤
- 404: 訂單不存在
- 500: 付款意圖建立失敗

**實作檔案**: `app/api/v1/payment/intent/route.ts`

---

#### POST `/api/v1/payment/confirm`

確認付款結果。

**請求 Body**:
```json
{
  "paymentIntentId": "pi_1234567890",
  "orderId": "#123456"
}
```

**回應範例**:
```json
{
  "success": true,
  "data": {
    "status": "succeeded",
    "orderId": "#123456",
    "amount": 7.50,
    "confirmedAt": "2025-11-04T12:00:30Z"
  },
  "timestamp": "2025-11-04T12:00:30Z"
}
```

**錯誤情境**:
- 400: 請求參數錯誤
- 404: 付款意圖或訂單不存在
- 402: 付款失敗
- 500: 伺服器錯誤

**實作檔案**: `app/api/v1/payment/confirm/route.ts`

---

#### GET `/api/v1/payment/methods`

取得可用付款方式列表。

**請求參數**: 無

**回應範例**:
```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      {
        "type": "credit_card",
        "isDefault": true
      },
      {
        "type": "mastercard",
        "last4": "1234",
        "brand": "Mastercard"
      },
      {
        "type": "visa",
        "last4": "5678",
        "brand": "Visa"
      },
      {
        "type": "apple_pay"
      }
    ]
  },
  "timestamp": "2025-11-04T12:00:00Z"
}
```

**實作檔案**: `app/api/v1/payment/methods/route.ts`

**注意**: MVP 階段回傳固定的付款方式列表。

---

## 資料流程圖

### 訂單建立流程

```
[前端] 選擇商品 → 加入購物車
   ↓
[前端] 確認訂單內容
   ↓
[API] POST /api/v1/orders
   ↓
[API] 驗證商品與數量
   ↓
[API] 生成訂單號 (#123456)
   ↓
[前端] 取得訂單資訊
   ↓
[前端] 選擇付款方式
   ↓
[API] POST /api/v1/payment/intent
   ↓
[第三方] Stripe/TapPay 處理付款
   ↓
[API] POST /api/v1/payment/confirm
   ↓
[API] 更新訂單狀態 → confirmed
   ↓
[前端] 顯示確認頁面
```

---

## 錯誤代碼

| 錯誤代碼 | HTTP 狀態 | 說明 | 解決方案 |
|---------|----------|------|----------|
| `INVALID_PRODUCT_ID` | 400 | 無效的商品 ID | 確認商品 ID 是否存在 |
| `INVALID_QUANTITY` | 400 | 數量必須 > 0 | 檢查數量參數 |
| `EMPTY_CART` | 400 | 購物車為空 | 至少加入一個商品 |
| `PRODUCT_NOT_FOUND` | 404 | 商品不存在 | 檢查商品是否已下架 |
| `ORDER_NOT_FOUND` | 404 | 訂單不存在 | 確認訂單號是否正確 |
| `PAYMENT_FAILED` | 402 | 付款失敗 | 檢查付款資訊或重試 |
| `PAYMENT_INTENT_FAILED` | 500 | 付款意圖建立失敗 | 聯繫技術支援 |
| `SERVER_ERROR` | 500 | 伺服器內部錯誤 | 聯繫技術支援 |

---

## TypeScript 型別定義

```typescript
// lib/api/types.ts

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 商品相關
export interface GetProductsResponse {
  products: Product[];
}

export interface GetProductResponse {
  product: Product;
}

// 訂單相關
export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: PaymentMethodType;
}

export interface CreateOrderResponse {
  order: Order;
}

export interface GetOrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// 付款相關
export interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  status: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}

export interface ConfirmPaymentResponse {
  status: PaymentStatus;
  orderId: string;
  amount: number;
  confirmedAt: string;
}

export interface GetPaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
}
```

---

## API Client 範例

```typescript
// lib/api/client.ts

const API_BASE_URL = '/api/v1';

export class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error);
    }

    return data;
  }

  // 商品
  async getProducts(): Promise<GetProductsResponse> {
    const response = await this.request<GetProductsResponse>('/products');
    return response.data!;
  }

  async getProduct(id: string): Promise<GetProductResponse> {
    const response = await this.request<GetProductResponse>(`/products/${id}`);
    return response.data!;
  }

  // 訂單
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await this.request<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async getOrder(id: string): Promise<Order> {
    const response = await this.request<{ order: Order }>(`/orders/${id}`);
    return response.data!.order;
  }

  async getOrders(limit = 50, offset = 0): Promise<GetOrdersResponse> {
    const response = await this.request<GetOrdersResponse>(
      `/orders?limit=${limit}&offset=${offset}`
    );
    return response.data!;
  }

  // 付款
  async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    const response = await this.request<CreatePaymentIntentResponse>(
      '/payment/intent',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async confirmPayment(
    data: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> {
    const response = await this.request<ConfirmPaymentResponse>(
      '/payment/confirm',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async getPaymentMethods(): Promise<GetPaymentMethodsResponse> {
    const response = await this.request<GetPaymentMethodsResponse>(
      '/payment/methods'
    );
    return response.data!;
  }
}

export const apiClient = new ApiClient();

class ApiError extends Error {
  constructor(public error: ApiError) {
    super(error.message);
    this.name = 'ApiError';
  }
}
```

---

## 測試建議

### 單元測試

```typescript
// __tests__/api/orders.test.ts
import { POST } from '@/app/api/v1/orders/route';

describe('POST /api/v1/orders', () => {
  it('should create order successfully', async () => {
    const request = new Request('http://localhost/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 'soy-milk', quantity: 2, price: 2.0 }],
        paymentMethod: 'credit_card',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.order.id).toMatch(/^#\d{6}$/);
  });

  it('should reject empty cart', async () => {
    const request = new Request('http://localhost/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [],
        paymentMethod: 'credit_card',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('EMPTY_CART');
  });
});
```

---

**文件版本**: 1.0
**最後更新**: 2025-11-04
**相關文件**:
- [資料模型設計](./data-model.md)
- [技術研究報告](./research.md)
