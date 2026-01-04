
'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Search } from "lucide-react";
import AddToCartButton from "@/components/shop/AddToCartButton";

interface ProductGridProps {
    initialProducts: any[];
}

export default function ProductGrid({ initialProducts }: ProductGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map(p => p.category || 'Geral'));
        return ['Todos', ...Array.from(cats)];
    }, [initialProducts]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'Todos' || (p.category || 'Geral') === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [initialProducts, searchTerm, selectedCategory]);

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-30 bg-gray-50/95 backdrop-blur-sm py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-b-0 border-gray-200">
                
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar mask-gradient">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                selectedCategory === cat 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-300 mb-4 flex justify-center"><Search size={48} /></div>
                    <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
                    <button 
                        onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}
                        className="mt-4 text-indigo-600 font-medium hover:underline"
                    >
                        Limpar filtros
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product) => {
                        const ecom = product.ecommerceDetails;
                        // Use ecommerce fields if available, otherwise fallback to base price
                        const priceCash = ecom ? ecom.priceCash : product.price;
                        const priceSold = ecom ? ecom.priceSold : product.price;
                        const installments = ecom ? ecom.installmentCount : 12; // Default logic fallback

                        return (
                        <div key={product.id || product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full">
                            <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500">
                                        <ShoppingBag size={48} opacity={0.2} />
                                    </div>
                                )}
                                
                                {product.category && (
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-50 shadow-sm">
                                        {product.category}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 md:p-5 flex-1 flex flex-col">
                                <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors" title={product.name}>
                                    {product.name}
                                </h4>
                                
                                <div className="mt-auto pt-3 border-t border-gray-50">
                                    {/* Installment Price Section */}
                                    <div className="mb-2">
                                        <span className="text-xs text-gray-500 font-medium block">
                                            {formatCurrency(priceSold)} em até {installments}x sem juros
                                        </span>
                                    </div>

                                    {/* Cash Price + Button Section */}
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-lg md:text-xl font-black text-green-600 tracking-tight leading-none">
                                                {formatCurrency(priceCash)}
                                            </span>
                                            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wide mt-0.5">
                                                À vista no Pix
                                            </span>
                                        </div>
                                        <AddToCartButton product={product} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
}
