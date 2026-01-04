
'use client';

import React from 'react';
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import Link from 'next/link';

export default function CartSidebar() {
    const { items, removeFromCart, updateQuantity, total, isCartOpen, closeCart } = useCart();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
                onClick={closeCart}
            />

            {/* Sidebar */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-indigo-600" />
                        Seu Carrinho ({items.length})
                    </h2>
                    <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                            </div>
                            <p>Seu carrinho está vazio.</p>
                            <button onClick={closeCart} className="text-indigo-600 font-medium hover:underline">
                                Continuar Comprando
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 p-3 border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors bg-white">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-6 h-6 text-gray-300" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-indigo-600 disabled:opacity-50">
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-indigo-600">
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-5 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600 font-medium">Total</span>
                            <span className="text-2xl font-bold text-indigo-600">{formatCurrency(total)}</span>
                        </div>
                        <Link 
                            href="/cart" 
                            onClick={closeCart}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
                        >
                            Finalizar Pedido <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
