
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number; // Base Price (Legacy fallback)
    priceCash?: number; // Preço a Vista (Pix)
    priceSold?: number; // Preço Parcelado
    installmentCount?: number; // Max Parcelas
    quantity: number;
    image?: string;
    category?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    total: number;
    cartCount: number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('smart_cart');
        if (saved) setItems(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('smart_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: any) => {
        // Standardize ID access: API might return .id or ._id depending on transformation
        const productId = product.id || product._id;
        
        if (!productId) {
            console.error("Cart Error: Product ID missing", product);
            return;
        }
        
        // Extract Ecommerce Pricing if available, otherwise fallback to base price
        const ecom = product.ecommerceDetails;
        const priceCash = ecom?.priceCash || product.price;
        const priceSold = ecom?.priceSold || product.price;
        const installmentCount = ecom?.installmentCount || 1;

        setItems(prev => {
            const exists = prev.find(i => i.id === productId);
            if (exists) {
                return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { 
                id: productId, 
                name: product.name, 
                price: product.price, // Keep base price for reference
                priceCash,
                priceSold,
                installmentCount,
                quantity: 1,
                image: product.image,
                category: product.category 
            }];
        });
        setIsCartOpen(true); // Open cart automatically on add
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => setItems([]);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    // Default Total (Uses Cash Price for display consistency in sidebar)
    const total = items.reduce((acc, item) => acc + ((item.priceCash || item.price) * item.quantity), 0);
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            items, addToCart, removeFromCart, updateQuantity, clearCart, 
            total, cartCount, isCartOpen, openCart, closeCart 
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) throw new Error('useCart must be used within a CartProvider');
    return context;
}
