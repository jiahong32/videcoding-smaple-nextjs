export type Drink = {
    id: string
    name: string
    description?: string
    price: number
    image?: string
}

export const DRINKS: Drink[] = [
    {
        id: "soy-milk",
        name: "Soy Milk",
        description: "Freshly made soy milk, served hot or cold. 250 cal.",
        price: 2.5,
        image: "https://images.unsplash.com/photo-1584270354949-3c6b7a8c5f4e?q=80&w=800&auto=format&fit=crop&crop=faces"
    },
    {
        id: "dan-bing",
        name: "Dan Bing",
        description: "Egg crepe with a variety of fillings. 350 cal.",
        price: 4.0,
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop&crop=faces"
    },
    {
        id: "fan-tuan",
        name: "Fan Tuan",
        description: "Sticky rice roll with savory fillings. 450 cal.",
        price: 5.5,
        image: "https://images.unsplash.com/photo-1604908177522-2f3b14b4f3a0?q=80&w=800&auto=format&fit=crop&crop=faces"
    },
    {
        id: "you-tiao",
        name: "You Tiao",
        description: "Deep-fried dough stick, perfect for dipping in soy milk. 200 cal.",
        price: 2.0,
        image: "https://images.unsplash.com/photo-1626804475297-411d8c6601df?q=80&w=800&auto=format&fit=crop&crop=faces"
    },
    {
        id: "scallion-pancake",
        name: "Scallion Pancake",
        description: "Flaky, savory pancake with green onions. 300 cal.",
        price: 3.5,
        image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?q=80&w=800&auto=format&fit=crop&crop=faces"
    },
    {
        id: "bubble-tea",
        name: "Bubble Tea",
        description: "Classic milk tea with tapioca pearls. 400 cal.",
        price: 4.5,
        image: "https://images.unsplash.com/photo-1558857563-b371033873b8?q=80&w=800&auto=format&fit=crop&crop=faces"
    }
];
