"use client"

import React, { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart-provider"
import { type Drink } from "@/lib/drinks"
import { getProductsByIds } from "@/app/actions/get-products"
import { createOrder } from "@/app/actions/create-order"
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react"

export default function CartPage() {
    const { cart, addToCart, removeFromCart, clearCart, totalItems } = useCart()
    const [products, setProducts] = useState<Drink[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCheckingOut, setIsCheckingOut] = useState(false)
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

    const handleCheckout = () => {
        router.push("/checkout")
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
                <div className="w-full max-w-md text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <ShoppingBag className="h-10 w-10 text-gray-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">您的購物車是空的</h1>
                    <p className="text-gray-500 text-lg">看起來您還沒有加入任何飲料。<br />快去挑選喜歡的飲品吧！</p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-white font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        回首頁點餐
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-6 sm:p-10 pb-32">
            <main className="mx-auto max-w-5xl">
                <header className="mb-10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Link
                        href="/"
                        className="group rounded-full p-3 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">購物車</h1>
                    <span className="ml-auto text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                        {totalItems} 件商品
                    </span>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex gap-5">
                                    {/* Image */}
                                    <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 shadow-inner">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                <ShoppingBag className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                                <div className="font-bold text-lg text-gray-900">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm font-medium text-gray-500">
                                                單價: ${item.price.toFixed(2)}
                                            </div>

                                            <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1 shadow-sm">
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    aria-label="Decrease quantity"
                                                >
                                                    {item.quantity === 1 ? (
                                                        <Trash2 className="h-4 w-4" />
                                                    ) : (
                                                        <Minus className="h-3 w-3" />
                                                    )}
                                                </button>
                                                <span className="w-10 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => addToCart(item.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Card */}
                    <div className="lg:col-span-1 lg:sticky lg:top-10 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                            <h2 className="text-xl font-bold text-gray-900 mb-6">訂單摘要</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>商品小計</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>運費</span>
                                    <span className="text-green-600 font-medium">免運費</span>
                                </div>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <div className="flex justify-between items-end">
                                    <span className="text-lg font-bold text-gray-900">總金額</span>
                                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">
                                        ${totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        處理中...
                                    </>
                                ) : (
                                    <>
                                        前往結帳
                                        <ArrowLeft className="h-5 w-5 rotate-180 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={clearCart}
                                disabled={isCheckingOut}
                                className="w-full mt-3 py-3 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:text-red-500 transition-colors text-sm disabled:opacity-50"
                            >
                                清空購物車
                            </button>
                        </div>

                        <div className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-3 items-start">
                            <div className="bg-white p-2 rounded-full shadow-sm text-blue-600 mt-0.5">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm">滿額優惠</h4>
                                <p className="text-blue-700 text-xs mt-1">再加購 $50 即可獲得精美環保提袋！</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
