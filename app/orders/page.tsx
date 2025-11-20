import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { ArrowLeft, Clock, CalendarDays } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        include: {
            items: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-6 sm:p-10 pb-32">
            <main className="mx-auto max-w-3xl">
                <header className="mb-10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Link
                        href="/"
                        className="group rounded-full p-3 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">歷史紀錄</h1>
                </header>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <Clock className="h-10 w-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">尚無訂單紀錄</h2>
                        <p className="text-gray-500 mt-2">您還沒有建立任何訂單。</p>
                        <Link
                            href="/"
                            className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-white font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                        >
                            前往點餐
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order: any, index: number) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-50">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-mono text-sm font-bold text-gray-500">#{order.orderNumber}</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'READY' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <CalendarDays className="h-4 w-4 mr-1.5" />
                                            {new Date(order.createdAt).toLocaleString('zh-TW')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-extrabold text-gray-900">
                                            ${Number(order.total).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            共 {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} 件商品
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                                    {item.quantity}x
                                                </div>
                                                <span className="font-medium text-gray-900">{item.productName}</span>
                                            </div>
                                            <span className="text-gray-600">${Number(item.subtotal).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
