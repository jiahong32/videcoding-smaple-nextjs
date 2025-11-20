
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking products in database...')

    const totalCount = await prisma.product.count()
    console.log(`Total products: ${totalCount}`)

    const byCategory = await prisma.product.groupBy({
        by: ['category'],
        _count: {
            id: true
        }
    })
    console.log('Products by category:', byCategory)

    const drinks = await prisma.product.findMany({
        where: {
            category: 'DRINK'
        }
    })
    console.log(`Total DRINK products: ${drinks.length}`)
    console.log('Drink details:', drinks.map(d => ({
        name: d.name,
        category: d.category,
        isAvailable: d.isAvailable
    })))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
