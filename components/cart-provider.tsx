"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type CartContextType = {
    cart: Record<string, number>
    addToCart: (id: string) => void
    removeFromCart: (id: string) => void
    clearCart: () => void
    totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Record<string, number>>({})
    const [isLoaded, setIsLoaded] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart))
            } catch (e) {
                console.error("Failed to parse cart from localStorage", e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("cart", JSON.stringify(cart))
        }
    }, [cart, isLoaded])

    const addToCart = (id: string) => {
        setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))
    }

    const removeFromCart = (id: string) => {
        setCart((c) => {
            const qty = (c[id] || 0) - 1
            if (qty <= 0) {
                const next = { ...c }
                delete next[id]
                return next
            }
            return { ...c, [id]: qty }
        })
    }

    const clearCart = () => {
        setCart({})
    }

    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
