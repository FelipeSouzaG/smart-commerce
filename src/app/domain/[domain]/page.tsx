
import React from 'react';
import { fetchStoreData } from "@/lib/api";
import CartSidebar from "@/components/shop/CartSidebar";
import StoreHeader from "@/components/shop/StoreHeader";
import ProductGrid from "@/components/shop/ProductGrid";
import StoreFooter from "@/components/shop/StoreFooter"; // NEW
import { ShoppingBag } from "lucide-react";

// Force dynamic rendering to ensure fresh data
export const revalidate = 60;

export default async function StorePage({ params }: { params: { domain: string } }) {
    const { domain } = params;
    
    let config = null;
    let items = [];

    try {
        const [configData, productsData] = await Promise.all([
            fetchStoreData(domain, 'config'),
            fetchStoreData(domain, 'products')
        ]);
        config = configData;
        items = productsData || [];
    } catch (error) {
        console.error("Error fetching store data:", error);
    }

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
                    <div className="mb-4 text-red-500 flex justify-center">
                        <ShoppingBag size={48} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Loja não encontrada</h1>
                    <p className="text-gray-600 mb-6">Não conseguimos localizar a loja <strong>{domain}</strong>.</p>
                </div>
            </div>
        );
    }

    // Split items into Products and Services
    const productsList = items.filter((i: any) => i.type !== 'service');
    const servicesList = items.filter((i: any) => i.type === 'service');

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0 flex flex-col">
            {/* Sidebar Cart Component */}
            <CartSidebar />

            {/* Smart Header (Client Component) */}
            <StoreHeader config={config} />

            {/* Hero / Banner */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white py-8 px-4 text-center relative overflow-hidden shadow-md">
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 transform -skew-y-6 scale-150 origin-top-left"></div>
                <div className="relative z-10 container mx-auto">
                    <p className="text-indigo-100 text-sm md:text-base font-medium tracking-wide uppercase">
                        Qualidade e confiança que você conhece, agora online.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 md:py-12 relative z-20 space-y-16 flex-1">
                
                {/* Section 1: Products */}
                {productsList.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                            <h3 className="text-2xl font-bold text-gray-800">Produtos em Destaque</h3>
                        </div>
                        <ProductGrid initialProducts={productsList} />
                    </section>
                )}

                {/* Section 2: Services */}
                {servicesList.length > 0 && (
                    <section className="border-t border-gray-200 pt-12">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-cyan-500 rounded-full"></div>
                            <h3 className="text-2xl font-bold text-gray-800">Nossos Serviços</h3>
                        </div>
                        <p className="text-gray-500 mb-6 -mt-4 text-sm">
                            Contrate online e agende o atendimento na loja com prioridade.
                        </p>
                        <ProductGrid initialProducts={servicesList} />
                    </section>
                )}

                {items.length === 0 && (
                     <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-300 mb-4 flex justify-center"><ShoppingBag size={48} /></div>
                        <p className="text-gray-500 text-lg">Nenhum item disponível no momento.</p>
                    </div>
                )}
            </main>

            {/* Footer with Policies */}
            <StoreFooter config={config} />
        </div>
    );
}
