
'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Trash2, ArrowLeft, MessageCircle, ShoppingBag, MapPin, User, CheckCircle, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { postStoreData, fetchStoreData } from "@/lib/api";
import StoreFooter from "@/components/shop/StoreFooter";

// Helper Formatters
const formatPhone = (val: string) => {
    return val.replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
};

const formatCep = (val: string) => {
    return val.replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .substring(0, 9);
};

const capitalize = (str: string) => {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

export default function CartPage({ params }: { params: { domain: string } }) {
    const { items, removeFromCart, clearCart } = useCart();
    
    // Steps: 0 = Cart, 1 = Address/Info, 2 = Success
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    // Payment Selection (Default Cash/Pix)
    const [paymentMode, setPaymentMode] = useState<'cash' | 'installment'>('cash');

    // Form Data
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    
    // Address Data
    const [cep, setCep] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState('');

    // Legal
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    
    // Config for Policies
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        const loadConfig = async () => {
            const data = await fetchStoreData(params.domain, 'config');
            setConfig(data);
        };
        loadConfig();
    }, [params.domain]);

    // Dynamic Total Calculation
    const calculatedTotal = useMemo(() => {
        return items.reduce((acc, item) => {
            const price = paymentMode === 'cash' 
                ? (item.priceCash || item.price) 
                : (item.priceSold || item.price);
            return acc + (price * item.quantity);
        }, 0);
    }, [items, paymentMode]);

    const handleCepBlur = async () => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setCepLoading(true);
        setCepError('');
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await res.json();
            
            if (data.erro) {
                setCepError('CEP não encontrado.');
                setStreet(''); setNeighborhood(''); setCity(''); setState('');
            } else {
                setStreet(data.logradouro);
                setNeighborhood(data.bairro);
                setCity(data.localidade);
                setState(data.uf);
            }
        } catch (error) {
            setCepError('Erro ao buscar CEP.');
        } finally {
            setCepLoading(false);
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!number) { alert("Número do endereço é obrigatório."); return; }
        if (!acceptedTerms) { alert("Você precisa aceitar os Termos de Uso e Política de Privacidade para continuar."); return; }
        
        setLoading(true);
        
        // Prepare items with final price based on selection
        const finalItems = items.map(i => ({
            ...i,
            unitPrice: paymentMode === 'cash' ? (i.priceCash || i.price) : (i.priceSold || i.price)
        }));
        
        try {
            const res = await postStoreData(params.domain, 'checkout', {
                items: finalItems,
                total: calculatedTotal, // Send calculated total
                paymentMethodPreference: paymentMode === 'cash' ? 'Pix / Dinheiro' : 'Cartão Parcelado',
                customer: { 
                    name: customerName, 
                    phone: customerPhone,
                    address: {
                        cep, street, number, complement, neighborhood, city, state
                    }
                }
            });
            
            if (res.success) {
                clearCart();
                setSuccessData(res);
                setCurrentStep(2);
            } else {
                alert(res.message || 'Erro ao processar pedido.');
            }
        } catch (error) {
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && currentStep !== 2) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <ShoppingBag size={32} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h1>
                    <p className="text-gray-500 text-sm mb-6">Adicione produtos para começar suas compras.</p>
                    <Link href="/" className="block w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30">
                        Voltar às Compras
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans pb-24">
            <div className="container mx-auto max-w-2xl">
                {currentStep < 2 && (
                    <div className="mb-6 flex items-center justify-between">
                        <button onClick={() => currentStep === 1 ? setCurrentStep(0) : window.history.back()} className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> {currentStep === 1 ? 'Voltar ao Carrinho' : 'Continuar Comprando'}
                        </button>
                        <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            Passo {currentStep + 1} de 2
                        </div>
                    </div>
                )}
                
                {/* STEP 0: CART LIST */}
                {currentStep === 0 && (
                    <>
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ShoppingBag className="text-indigo-600" />
                            Seu Carrinho
                        </h1>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                            {items.map(item => {
                                const price = paymentMode === 'cash' ? (item.priceCash || item.price) : (item.priceSold || item.price);
                                return (
                                <div key={item.id} className="p-4 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.quantity}un x {formatCurrency(price)}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="font-bold text-gray-900">{formatCurrency(price * item.quantity)}</span>
                                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )})}
                            
                            {/* Payment Mode Selection */}
                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Preferência de Pagamento</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${paymentMode === 'cash' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="payment" className="hidden" checked={paymentMode === 'cash'} onChange={() => setPaymentMode('cash')} />
                                        <Banknote className={paymentMode === 'cash' ? 'text-green-600' : 'text-gray-400'} />
                                        <span className={`text-sm font-bold ${paymentMode === 'cash' ? 'text-green-700' : 'text-gray-600'}`}>Pix / Dinheiro</span>
                                    </label>

                                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${paymentMode === 'installment' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="payment" className="hidden" checked={paymentMode === 'installment'} onChange={() => setPaymentMode('installment')} />
                                        <CreditCard className={paymentMode === 'installment' ? 'text-indigo-600' : 'text-gray-400'} />
                                        <span className={`text-sm font-bold ${paymentMode === 'installment' ? 'text-indigo-700' : 'text-gray-600'}`}>Cartão Parcelado</span>
                                    </label>
                                </div>
                            </div>

                            <div className="p-6 bg-white flex justify-between items-center">
                                <span className="font-medium text-gray-600">Total Estimado</span>
                                <span className="text-3xl font-bold text-indigo-600">{formatCurrency(calculatedTotal)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setCurrentStep(1)}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transform hover:-translate-y-1"
                        >
                            Próximo: Entrega e Dados <ArrowLeft className="w-5 h-5 rotate-180" />
                        </button>
                    </>
                )}

                {/* STEP 1: FORM */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in slide-in-from-right duration-300">
                        <div className="mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <User className="text-indigo-600" size={24} />
                                Preencha seus dados para entrega
                            </h2>
                        </div>
                        
                        <form onSubmit={handleCheckout} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seu Nome</label>
                                    <input 
                                        type="text" required 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                                        placeholder="Ex: Maria Silva"
                                        value={customerName} 
                                        onChange={e => setCustomerName(e.target.value)}
                                        onBlur={() => setCustomerName(capitalize(customerName))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                                    <input 
                                        type="tel" required 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                                        placeholder="(00) 90000-0000"
                                        value={customerPhone} 
                                        onChange={e => setCustomerPhone(formatPhone(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-indigo-600" /> Endereço de Entrega
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="w-full md:w-1/3">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">CEP</label>
                                        <div className="relative">
                                            <input 
                                                type="text" required maxLength={9}
                                                className={`w-full p-3 bg-gray-50 border ${cepError ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900`}
                                                placeholder="00000-000"
                                                value={cep} 
                                                onChange={e => setCep(formatCep(e.target.value))} 
                                                onBlur={handleCepBlur}
                                            />
                                            {cepLoading && <span className="absolute right-3 top-3.5 text-xs text-indigo-500 animate-pulse font-bold">Buscando...</span>}
                                        </div>
                                        {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-3">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rua</label>
                                            <input type="text" disabled value={street} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Número</label>
                                            <input type="text" required value={number} onChange={e => setNumber(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Complemento</label>
                                            <input type="text" value={complement} onChange={e => setComplement(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" placeholder="Apto, Bloco..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bairro</label>
                                            <input type="text" disabled value={neighborhood} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cidade</label>
                                            <input type="text" disabled value={city} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado</label>
                                            <input type="text" disabled value={state} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-200 text-xs flex items-start gap-2">
                                        <span className="text-lg">🚚</span>
                                        <p><strong>Atenção:</strong> Custos de frete/entrega podem ser aplicados e serão combinados diretamente com o vendedor após a confirmação do pedido.</p>
                                    </div>
                                </div>
                            </div>

                            {/* LEGAL CHECKBOX */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                    <input 
                                        type="checkbox" 
                                        checked={acceptedTerms}
                                        onChange={e => setAcceptedTerms(e.target.checked)}
                                        className="mt-1 w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-600">
                                        Li, compreendi e concordo com os <strong className="text-indigo-600">Termos de Uso</strong> e <strong className="text-indigo-600">Política de Privacidade</strong> desta loja.
                                    </span>
                                </label>
                            </div>
                            
                            <div className="pt-2 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-gray-900">
                                    <span className="font-medium">Total ({paymentMode === 'cash' ? 'Pix' : 'Cartão'}):</span>
                                    <span className="text-xl font-bold">{formatCurrency(calculatedTotal)}</span>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading || !acceptedTerms}
                                    className="w-full px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {loading ? <span className="animate-pulse">Processando...</span> : <>Finalizar Pedido <CheckCircle size={18} /></>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* STEP 2: SUCCESS */}
                {currentStep === 2 && successData && (
                    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Pedido Realizado!</h2>
                        <p className="text-gray-600 mb-6">Seu pedido <strong>#{successData.orderId}</strong> foi recebido com sucesso.</p>
                        
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 text-left">
                            <p className="text-sm text-gray-500 mb-1">Próximo Passo:</p>
                            <p className="font-medium text-gray-800">Combine o pagamento e acompanhe a entrega diretamente pelo WhatsApp da loja.</p>
                        </div>

                        {successData.whatsappLink && (
                            <a 
                                href={successData.whatsappLink} 
                                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={20} />
                                Falar com Vendedor no WhatsApp
                            </a>
                        )}
                        
                        <Link href="/" className="block mt-4 text-indigo-600 font-medium hover:underline">
                            Voltar para a Loja
                        </Link>
                    </div>
                )}
            </div>

            {/* Injeta o footer no checkout para que o cliente possa ler os termos se quiser */}
            {config && <StoreFooter config={config} />}
        </div>
    );
}
