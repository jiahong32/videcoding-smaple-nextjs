import React from "react"
import { type Drink } from "./drinks-client"

interface DrinkCardProps {
    drink: Drink
    onAddToCart: (id: string) => void
    quantity: number
    onRemoveFromCart: (id: string) => void
}

export default function DrinkCard({ drink, onAddToCart, quantity, onRemoveFromCart }: DrinkCardProps) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] border border-gray-100">
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
                {drink.image ? (
                    <img
                        src={drink.image}
                        alt={drink.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{drink.name}</h3>
                    {drink.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{drink.description}</p>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">${drink.price.toFixed(2)}</span>

                    {quantity > 0 ? (
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1">
                            <button
                                onClick={() => onRemoveFromCart(drink.id)}
                                className="h-8 w-8 rounded-full bg-white shadow-sm border border-gray-200 inline-flex items-center justify-center text-sm font-medium hover:bg-gray-50 transition-colors"
                                aria-label={`remove one ${drink.name}`}
                            >
                                -
                            </button>
                            <span className="w-4 text-center font-medium text-gray-900">{quantity}</span>
                            <button
                                onClick={() => onAddToCart(drink.id)}
                                className="h-8 w-8 rounded-full bg-black text-white shadow-sm inline-flex items-center justify-center text-sm font-medium hover:bg-gray-800 transition-colors"
                                aria-label={`add one ${drink.name}`}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onAddToCart(drink.id)}
                            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
