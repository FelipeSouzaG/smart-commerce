
'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, X } from "lucide-react";

interface PolicyModalProps {
    title: string;
    content: string;
    onClose: () => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ title, content, onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 animate-in fade-in backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto whitespace-pre-wrap text-sm text-gray-600 leading-relaxed font-sans">
                {content || "Conteúdo não disponível."}
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
                <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700">Fechar</button>
            </div>
        </div>
    </div>
);

export default function StoreFooter({ config }: { config: any }) {
    const [activePolicy, setActivePolicy] = useState<{title: string, content: string} | null>(null);

    const policies = config.ecommercePolicies || {};

    const openPolicy = (title: string, content: string) => {
        if (!content) return;
        setActivePolicy({ title, content });
    };

    return (
        <footer className="bg-white border-t border-gray-200 mt-12 pt-12 pb-8">
            {activePolicy && <PolicyModal title={activePolicy.title} content={activePolicy.content} onClose={() => setActivePolicy(null)} />}
            
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    
                    {/* Brand & Address */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {config.name ? config.name.substring(0,1).toUpperCase() : 'S'}
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg">{config.name}</h4>
                        </div>
                        {config.address && (
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                {config.address.street}, {config.address.number}<br/>
                                {config.address.neighborhood} - {config.address.city}/{config.address.state}<br/>
                                CEP: {config.address.cep}
                            </p>
                        )}
                        {config.phone && <p className="text-gray-500 text-sm font-medium">{config.phone}</p>}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Políticas</h5>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><button onClick={() => openPolicy('Trocas e Devoluções', policies.refundPolicy)} className="hover:text-indigo-600 flex items-center gap-1 transition-colors"><ChevronRight size={14}/> Trocas e Devoluções</button></li>
                            <li><button onClick={() => openPolicy('Políticas de Privacidade', policies.privacyPolicy)} className="hover:text-indigo-600 flex items-center gap-1 transition-colors"><ChevronRight size={14}/> Privacidade e Dados</button></li>
                            <li><button onClick={() => openPolicy('Frete e Entrega', policies.shippingPolicy)} className="hover:text-indigo-600 flex items-center gap-1 transition-colors"><ChevronRight size={14}/> Fretes e Prazos</button></li>
                             <li><button onClick={() => openPolicy('Termos de Uso', policies.legalTerms)} className="hover:text-indigo-600 flex items-center gap-1 transition-colors"><ChevronRight size={14}/> Termos de Uso</button></li>
                        </ul>
                    </div>

                    {/* Disclaimer */}

                    <div>
                        <h5 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Técnologia</h5>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">
                            Esta loja virtual utiliza tecnologia de ponta para garantir a segurança dos seus dados.
                        </p>
                        <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                                  <ShoppingBag size={14} /> SmartStore
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold tracking-wide">by FluxoClean</span>
                          </div>
                          <a href="https://www.fluxoclean.com.br" target="_blank" rel="noreferrer" className="text-[12px] font-bold text-indigo-600 hover:text-gray-400 transition-colors no-underline">
                              www.fluxoclean.com.br
                          </a>
                    </div>


                </div>

                <div className="border-t border-gray-100 pt-8 text-center">
                     <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} {config.name}. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
