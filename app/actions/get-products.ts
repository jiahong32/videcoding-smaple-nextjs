'use server'

import { prisma } from "@/lib/db/prisma"
import { type Drink } from "@/lib/drinks"

export async function getProductsByIds(ids: string[]): Promise<Drink[]> {
    if (ids.length === 0) return []

    const products = await prisma.product.findMany({
        where: {
            id: {
                in: ids
            }
        }
    })

    return products.map(p => ({
        id: p.id,
        name: p.nameZh || p.name,
        description: p.description,
        price: Number(p.price),
        image: p.image
    }))
}
