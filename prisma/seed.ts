import { config } from "dotenv";
import { PrismaClient, ProductCategory } from "@prisma/client";

// Load environment variables from .env.local first, then .env
config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (optional - remove if you want to keep existing data)
  console.log("🧹 Cleaning existing products...");
  await prisma.product.deleteMany();

  // Seed products
  console.log("📦 Seeding products...");

  const products = await prisma.product.createMany({
    data: [
      {
        name: "Soy Milk",
        nameZh: "豆漿",
        description: "Freshly made soy milk, served hot or cold.",
        price: 2.0,
        image: "https://images.unsplash.com/photo-1556910110-a5a63dfd393c?w=400&h=400&fit=crop",
        category: ProductCategory.DRINK,
        isAvailable: true,
      },
      {
        name: "Egg Crepe",
        nameZh: "蛋餅",
        description: "Egg crepe with a variety of fillings.",
        price: 3.5,
        image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=400&fit=crop",
        category: ProductCategory.MAIN,
        isAvailable: true,
      },
      {
        name: "Radish Cake",
        nameZh: "蘿蔔糕",
        description: "Pan-fried radish cake, crispy outside.",
        price: 3.0,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop",
        category: ProductCategory.MAIN,
        isAvailable: true,
      },
      {
        name: "Fried Dough Stick",
        nameZh: "油條",
        description: "Traditional Chinese fried dough.",
        price: 2.0,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop",
        category: ProductCategory.MAIN,
        isAvailable: true,
      },
      {
        name: "Black Tea",
        nameZh: "紅茶",
        description: "Classic Taiwanese black tea.",
        price: 1.5,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop",
        category: ProductCategory.DRINK,
        isAvailable: true,
      },
      {
        name: "Rice Ball",
        nameZh: "飯糰",
        description: "Traditional rice ball with various fillings.",
        price: 3.0,
        image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400&h=400&fit=crop",
        category: ProductCategory.MAIN,
        isAvailable: true,
      },
      {
        name: "Steamed Bun",
        nameZh: "饅頭",
        description: "Fluffy steamed bun.",
        price: 1.5,
        image: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=400&fit=crop",
        category: ProductCategory.SIDE,
        isAvailable: true,
      },
      {
        name: "Sweet Soy Milk",
        nameZh: "甜豆漿",
        description: "Sweet soy milk with a touch of sugar.",
        price: 2.0,
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop",
        category: ProductCategory.DRINK,
        isAvailable: true,
      },
    ],
  });

  console.log(`✅ Created ${products.count} products`);

  // Fetch and display all products
  const allProducts = await prisma.product.findMany();
  console.log("\n📋 All products in database:");
  allProducts.forEach((product) => {
    console.log(`  - ${product.nameZh} (${product.name}): $${product.price}`);
  });

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
