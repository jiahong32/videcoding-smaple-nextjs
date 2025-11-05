# Implementation Plan: 台灣早餐外送 App

**Branch**: `001-breakfast-delivery-app` | **Date**: 2025-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-breakfast-delivery-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

建立一個台灣早餐外送應用程式,提供完整的訂餐流程,包含:瀏覽早餐品項、加入購物車、結帳、多種付款方式選擇、訂單確認以及歷史訂單查詢與重複訂購功能。系統需實現即時價格計算、訂單狀態追蹤,並提供友善的使用者介面。

## Technical Context

**Language/Version**: TypeScript 5 with Next.js 16, React 19.2.0
**Primary Dependencies**: Next.js (App Router), Tailwind CSS v4, shadcn/ui, Radix UI
**Storage**: NEEDS CLARIFICATION (客戶端狀態管理方案: Context API, Zustand, 或 Redux; 訂單歷史持久化: LocalStorage, IndexedDB, 或後端 API)
**Testing**: NEEDS CLARIFICATION (推薦 Jest + React Testing Library for 單元測試, Playwright 或 Cypress for E2E 測試)
**Target Platform**: Web 應用程式 (響應式設計,支援桌面與行動裝置瀏覽器)
**Project Type**: Web (單一 Next.js 專案,前端為主)
**Performance Goals**: 頁面載入時間 < 2 秒, 價格計算更新 < 100ms, 互動回應時間 < 200ms
**Constraints**: 首次訂單完成時間 < 3 分鐘, 訂單確認顯示 < 1 秒, 支援離線瀏覽 (NEEDS CLARIFICATION)
**Scale/Scope**: 預估支援 10,000+ 並發用戶, 約 6-8 個主要頁面/路由, 15-20 個 UI 元件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**狀態**: ✅ PASS (憲法文件為範本格式,尚未定義具體原則)

**分析**:
- 專案憲法文件 (`.specify/memory/constitution.md`) 目前為範本格式,未包含具體的架構原則或限制
- 無需在此階段評估合規性
- 建議在專案成熟後填寫憲法文件,定義核心開發原則

**待完成**: 專案團隊應考慮定義以下原則:
- 元件設計原則 (例如: 可重用性、單一職責)
- 測試策略 (例如: TDD、測試覆蓋率要求)
- 效能標準 (例如: Core Web Vitals 閾值)
- 程式碼品質標準 (例如: TypeScript strict mode、ESLint 規則)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                          # Next.js App Router 路由
├── (order)/                  # 訂餐流程路由群組
│   ├── page.tsx             # 主要訂餐頁面 (/)
│   ├── review/
│   │   └── page.tsx         # 訂單確認頁面 (/review)
│   ├── checkout/
│   │   └── page.tsx         # 結帳付款頁面 (/checkout)
│   └── confirmation/
│       └── page.tsx         # 訂單完成頁面 (/confirmation)
├── history/
│   └── page.tsx             # 訂單歷史頁面 (/history)
├── layout.tsx               # 根佈局
└── globals.css              # 全域樣式 (Tailwind CSS v4)

components/
├── ui/                      # shadcn/ui 基礎元件
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   └── radio-group.tsx
├── order/                   # 訂餐功能元件
│   ├── product-card.tsx     # 商品卡片 (含數量控制)
│   ├── product-list.tsx     # 商品列表
│   ├── order-summary.tsx    # 訂單摘要
│   └── price-total.tsx      # 總價顯示
├── checkout/                # 結帳功能元件
│   ├── payment-selector.tsx # 付款方式選擇器
│   └── billing-address.tsx  # 帳單地址選項
└── history/                 # 歷史記錄元件
    ├── order-history-item.tsx  # 歷史訂單項目
    └── order-details.tsx       # 訂單詳細資訊

lib/
├── utils.ts                 # 工具函數 (cn, 價格計算等)
├── data/
│   └── products.ts          # 商品資料定義
└── types/
    ├── product.ts           # Product 型別定義
    ├── order.ts             # Order 型別定義
    └── payment.ts           # Payment 型別定義

hooks/                       # 自定義 React Hooks
├── use-cart.ts             # 購物車邏輯
├── use-order.ts            # 訂單管理
└── use-order-history.ts    # 訂單歷史

public/
└── images/                  # 商品圖片與插圖
    └── products/

__tests__/                   # 測試檔案 (待Phase 0 研究決定測試框架)
├── components/
├── hooks/
└── e2e/
```

**Structure Decision**:

此專案採用 **Next.js App Router 架構**,為前端單體應用程式:

1. **路由組織**: 使用 App Router 的檔案系統路由,將訂餐流程相關頁面組織在 `(order)` 路由群組中
2. **元件分層**:
   - `components/ui/`: shadcn/ui 基礎元件庫
   - `components/[feature]/`: 功能導向的業務元件
3. **狀態管理**: 使用 React Hooks 封裝業務邏輯,具體方案在 Phase 0 研究中決定
4. **型別安全**: 集中管理 TypeScript 型別定義於 `lib/types/`
5. **測試策略**: 測試結構在 Phase 0 研究後確定

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

無違反事項 - 憲法文件尚未定義具體原則。

---

## Phase 0 完成狀態 ✅

**研究文件**: [`research.md`](./research.md)

所有 NEEDS CLARIFICATION 項目已解決:
- ✅ 狀態管理方案: React Context API
- ✅ 訂單歷史持久化: LocalStorage
- ✅ 測試框架: Vitest + Playwright
- ✅ 離線支援: 暫不實作 (非 MVP 必要)
- ✅ 付款整合: Stripe/TapPay with Next.js API Routes

---

## Phase 1 完成狀態 ✅

**設計文件**:
- [`data-model.md`](./data-model.md) - 資料模型定義
- [`contracts/api-spec.md`](./contracts/api-spec.md) - API 契約規格
- [`quickstart.md`](./quickstart.md) - 快速開始指南

**代理程式背景更新**: ✅ CLAUDE.md 已更新

---

## 憲法檢查 - 設計後重新評估

**狀態**: ✅ PASS

**設計後評估**:
- 專案架構符合 Next.js App Router 最佳實踐
- 元件設計遵循單一職責原則
- 狀態管理方案簡潔且可擴展
- 測試策略完整 (單元測試 + E2E 測試)
- 無過度設計或不必要的複雜度

**建議事項** (待專案成熟後納入憲法):
1. **測試覆蓋率**: 建議最低 80% 的測試覆蓋率
2. **效能標準**: 遵守 Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
3. **可及性**: 遵循 WCAG 2.1 Level AA 標準
4. **程式碼審查**: 所有 PR 需經過代碼審查
5. **型別安全**: 維持 TypeScript strict mode 啟用

---

## 下一步: Phase 2 - 任務分解

執行 `/speckit.tasks` 指令以產生詳細的實作任務清單 (`tasks.md`)。

**預期輸出**:
- 依照優先順序排列的實作任務
- 每個任務的預估時程
- 任務之間的相依關係
- 驗收標準與測試要求
