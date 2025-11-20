"use client"

import React, { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart-provider"
import { type Drink } from "@/lib/drinks"
import { getProductsByIds } from "@/app/actions/get-products"
import { createOrder } from "@/app/actions/create-order"
import { ArrowLeft, CreditCard, Banknote, Smartphone, Loader2, CheckCircle2 } from "lucide-react"
import { PaymentMethodType } from "@prisma/client"

export default function CheckoutPage() {
    const { cart, clearCart, totalItems } = useCart()
    const [products, setProducts] = useState<Drink[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true)
            try {
                const ids = Object.keys(cart)
                if (ids.length > 0) {
                    const fetchedProducts = await getProductsByIds(ids)
                    setProducts(fetchedProducts)
                } else {
                    setProducts([])
                }
            } catch (error) {
                console.error("Failed to fetch products", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [cart])

    const cartItems = useMemo(() => {
        return products.filter((drink) => cart[drink.id])
            .map((drink) => ({
                ...drink,
                quantity: cart[drink.id] || 0,
            }))
    }, [cart, products])

    const totalAmount = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }, [cartItems])

    const handleConfirmPayment = async () => {
        if (!selectedPayment || isProcessing) return
        setIsProcessing(true)

        try {
            const items = cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))

            const result = await createOrder(items, selectedPayment)

            if (result.success) {
                clearCart()
                // Simulate a small delay for better UX
                setTimeout(() => {
                    alert(`訂單建立成功！訂單編號: ${result.orderId}`)
                    router.push("/orders")
                }, 1000)
            }
        } catch (error) {
            console.error("Checkout failed", error)
            alert("結帳失敗，請稍後再試")
            setIsProcessing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (totalItems === 0) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">購物車是空的</h1>
                <Link href="/" className="text-blue-600 hover:underline">回首頁</Link>
            </div>
        )
    }

    const paymentMethods = [
        { id: PaymentMethodType.CREDIT_CARD, name: "信用卡", icon: CreditCard, description: "Visa, Mastercard, JCB" },
        { id: PaymentMethodType.APPLE_PAY, name: "Apple Pay", icon: Smartphone, description: "使用 Apple Pay 快速付款" },
        { id: "CASH" as PaymentMethodType, name: "現金付款", icon: Banknote, description: "取餐時付款" },
    ]

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-6 sm:p-10 pb-32">
            <main className="mx-auto max-w-3xl">
                <header className="mb-10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Link
                        href="/cart"
                        className="group rounded-full p-3 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">選擇付款方式</h1>
                </header>

                <div className="grid gap-8">
                    {/* Order Summary */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">訂單詳情</h2>
                        <div className="space-y-3">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="h-px bg-gray-100 my-2"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-gray-900">總金額</span>
                                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">
                                    ${totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Selection */}
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-xl font-bold text-gray-900 px-1">付款方式</h2>
                        <div className="grid gap-4">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedPayment(method.id)}
                                    className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${selectedPayment === method.id
                                        ? 'border-black bg-gray-50 shadow-md'
                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                                        }`}
                                >
                                    <div className={`p-3 rounded-full ${selectedPayment === method.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                                        <method.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{method.name}</div>
                                        <div className="text-sm text-gray-500">{method.description}</div>
                                    </div>
                                    {selectedPayment === method.id && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-black">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirmPayment}
                        disabled={!selectedPayment || isProcessing}
                        className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: '200ms' }}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                處理中...
                            </>
                        ) : (
                            "確認付款"
                        )}
                    </button>
                </div>
            </main>
        </div>
    )
}
