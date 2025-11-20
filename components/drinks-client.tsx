"use client"

import React, { useMemo } from "react"
import DrinkCard from "./drink-card"
import { useCart } from "./cart-provider"
import Link from "next/link"
import { type Drink } from "@/lib/drinks"

export default function DrinksClient({ drinks }: { drinks: Drink[] }) {
  const { cart, addToCart, removeFromCart, totalItems } = useCart()

  const total = useMemo(() => {
    return drinks.reduce((sum, d) => sum + d.price * (cart[d.id] || 0), 0)
  }, [cart, drinks])

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-32">
        {drinks.map((drink) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            quantity={cart[drink.id] || 0}
          />
        ))}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 mx-auto w-full max-w-md px-4">
          <Link href="/cart">
            <div className="flex items-center justify-between rounded-full bg-black p-4 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-bold">
                  {totalItems}
                </div>
                <span className="font-medium">View Cart</span>
              </div>
              <div className="px-4 text-lg font-bold">
                ${total.toFixed(2)}
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
