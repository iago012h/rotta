import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function TermosPage() {
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

        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-6">Termos de Uso</h1>
        <p className="text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar o site Rotta, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Uso do Serviço</h2>
            <p>A Rotta utiliza inteligência artificial para sugerir roteiros de viagem. Estas sugestões são apenas informativas e não garantem a disponibilidade ou preços reais dos serviços de terceiros (hotéis, passagens, passeios). A compra e reserva final é de inteira responsabilidade do usuário.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Isenção de Responsabilidade</h2>
            <p>Os materiais no site da Rotta são fornecidos "como estão". A Rotta não oferece garantias, expressas ou implícitas, sobre a exatidão, os resultados prováveis, ou a confiabilidade do uso dos materiais e rotas sugeridas.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Modificações</h2>
            <p>A Rotta pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
