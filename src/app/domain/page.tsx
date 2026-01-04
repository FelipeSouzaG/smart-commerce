
import { fetchStoreData } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import AddToCartButton from "@/components/shop/AddToCartButton";
export const runtime = 'edge';
export default async function StorePage({ params }: { params: { domain: string } }) {
    const domain = params.domain;
    
    // Server-side Fetching (SEO Friendly)
    const [config, products] = await Promise.all([
        fetchStoreData(domain, 'config'),
        fetchStoreData(domain, 'products')
    ]);

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Loja não encontrada</h1>
                    <p className="text-gray-600">Verifique o endereço digitado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {config.name.substring(0,1)}
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{config.name}</h1>
                    </div>
                    <Link href={`/cart`} className="p-2 hover:bg-gray-100 rounded-full relative">
                        <ShoppingBag className="w-6 h-6 text-gray-700" />
                        {/* Cart Badge would require client component wrapper here */}
                    </Link>
                </div>
            </header>

            {/* Hero / Banner */}
            <div className="bg-indigo-900 text-white py-12 px-4 text-center">
                <h2 className="text-3xl font-bold mb-2">Bem-vindo à {config.name}</h2>
                <p className="text-indigo-200">Confira nossos produtos em destaque</p>
            </div>

            {/* Product Grid */}
            <main className="container mx-auto px-4 py-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Produtos Recentes</h3>
                
                {!products || products.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">Nenhum produto disponível no momento.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product: any) => (
                            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="aspect-square bg-gray-100 relative">
                                    {/* Placeholder Image */}
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                        <ShoppingBag size={48} />
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <p className="text-xs text-indigo-600 font-bold uppercase mb-1">{product.category}</p>
                                    <h4 className="font-medium text-gray-900 line-clamp-2 mb-2">{product.name}</h4>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                                        <AddToCartButton product={product} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>{config.name}</p>
                    <p>{config.address?.city} - {config.address?.state}</p>
                    <p className="mt-4 text-xs opacity-50">Powered by FluxoClean Smart Commerce</p>
                </div>
            </footer>
        </div>
    );
}
