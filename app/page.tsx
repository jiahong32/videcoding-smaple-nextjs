import Link from "next/link"
import DrinksClient from "@/components/drinks-client"
import { prisma } from "@/lib/db/prisma"
import { type Drink } from "@/lib/drinks"

export default async function Home() {
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      // category: 'DRINK' // Removed to show all products (including food)
    }
  });

  // Map Prisma products to Drink type
  const drinks: Drink[] = products.map(p => ({
    id: p.id,
    name: p.nameZh || p.name, // Use Chinese name if available, fallback to English
    description: p.description,
    price: Number(p.price), // Convert Decimal to number
    image: p.image
  }));
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <main className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">飲料點單系統</h1>
            <p className="text-gray-500 mt-2 text-lg">請選擇您想要的飲料，點選「加入購物車」以加入訂單。</p>
          </div>
          <Link
            href="/orders"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4"
          >
            查看歷史紀錄
          </Link>
        </header>

        <DrinksClient drinks={drinks} />
      </main>
    </div>
  );
}
