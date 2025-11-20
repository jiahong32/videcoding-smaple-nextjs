'use server'

import { prisma } from "@/lib/db/prisma"
import { PaymentMethodType } from "@prisma/client"
import { redirect } from "next/navigation"

type CartItemInput = {
    productId: string
    quantity: number
}

export async function createOrder(items: CartItemInput[], paymentMethod: PaymentMethodType) {
    if (!items.length) {
        throw new Error("Cart is empty")
    }

    // 1. Fetch products to get current prices and validate existence
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    // 2. Calculate totals and prepare order items
    let subtotal = 0
    const orderItemsData = []

    for (const item of items) {
        const product = productMap.get(item.productId)
        if (!product) {
            throw new Error(`Product not found: ${item.productId}`)
        }

        const price = Number(product.price)
        const itemSubtotal = price * item.quantity
        subtotal += itemSubtotal

        orderItemsData.push({
            productId: product.id,
            productName: product.nameZh || product.name,
            quantity: item.quantity,
            price: product.price, // Keep as Decimal for Prisma
            subtotal: itemSubtotal // Prisma will handle number -> Decimal conversion
        })
    }

    // 3. Create Order
    // Generate a simple order number (e.g., YYYYMMDD-XXXX)
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`

    const order = await prisma.order.create({
        data: {
            orderNumber,
            subtotal,
            total: subtotal, // Assuming no tax/shipping for now
            status: "PENDING",
            paymentMethod: paymentMethod,
            items: {
                create: orderItemsData
            }
        }
    })

    return { success: true, orderId: order.id }
}
