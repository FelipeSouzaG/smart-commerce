'use client';

import { useCart } from "@/context/cart-context";
import { Plus, Check } from "lucide-react";
import { useState } from "react";

export default function AddToCartButton({ product }: { product: any }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleClick = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button 
            onClick={handleClick}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                added 
                ? "bg-green-500 text-white rotate-0" 
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-indigo-200"
            }`}
            title="Adicionar ao Carrinho"
        >
            {added ? <Check size={20} /> : <Plus size={20} />}
        </button>
    );
}
