import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function PrivacidadePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-600 font-medium mb-8 hover:text-emerald-700 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-6">Política de Privacidade</h1>
        <p className="text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Coleta de Dados</h2>
            <p>Quando você utiliza a Rotta, coletamos apenas as informações essenciais para criar sua conta (via login social) e salvar os seus roteiros personalizados de viagem no nosso banco de dados. Nós não solicitamos dados financeiros ou de cartões de crédito.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Uso das Informações</h2>
            <p>Usamos suas informações para personalizar e melhorar a sua experiência na nossa plataforma, além de garantir que seus roteiros gerados estejam sempre seguros e disponíveis quando você retornar ao site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Compartilhamento de Dados</h2>
            <p>Nós não vendemos, comercializamos ou transferimos suas informações de identificação pessoal para terceiros. O compartilhamento do seu roteiro por links (como WhatsApp) é feito voluntariamente por você.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Segurança</h2>
            <p>Adotamos medidas de segurança para proteger suas informações pessoais contra o acesso não autorizado ou a alteração de dados. Seu login é gerenciado de forma segura pelos provedores de autenticação (como Google).</p>
          </section>
        </div>
      </div>
    </div>
  );
}
