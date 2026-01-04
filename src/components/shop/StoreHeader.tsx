

'use client';

import React from 'react';
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";

export default function StoreHeader({ config }: { config: any }) {
    const { openCart, cartCount } = useCart();

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                        {config.name ? config.name.substring(0,1).toUpperCase() : 'S'}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight truncate max-w-[200px] md:max-w-xs">{config.name}</h1>
                        <p className="text-[10px] text-gray-500 font-medium">Loja Oficial</p>
                    </div>
                </Link>
                
                <button 
                    onClick={openCart}
                    className="group relative p-2.5 rounded-full hover:bg-gray-100 transition-all"
                >
                    <ShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                    {cartCount > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm transform scale-100 transition-transform group-hover:scale-110">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
