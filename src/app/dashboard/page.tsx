'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { Calendar, Coffee, MapPin, Navigation, Clock, LogOut, FileText, Share2, Download, AlertCircle, Compass, Camera, Utensils, Moon, Sparkles } from 'lucide-react';

// Tipagem do Roteiro Gerado
interface ItineraryEvent {
  title: string;
  time: string;
  description: string;
  location: string;
  estimatedCost: string;
  type: 'food' | 'sightseeing' | 'transit';
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  summary: string;
  events: ItineraryEvent[];
}

interface Itinerary {
  title: string;
  description: string;
  days: ItineraryDay[];
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generateError, setGenerateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const destino = searchParams.get('destino');
  const duracao = searchParams.get('duracao');
  const orcamento = searchParams.get('orcamento');
  const pessoas = searchParams.get('pessoas') || "1";

  // Proteção de Rota
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Chama a IA para gerar o roteiro
  useEffect(() => {
    if (isAuthLoading || !user) return;
    
    if (!destino || !duracao || !orcamento) {
      setGenerateError("Dados da viagem incompletos. Por favor, volte e preencha a busca novamente.");
      setIsGenerating(false);
      return;
    }

    async function fetchItinerary() {
      try {
        const res = await fetch('/api/generate-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destino, duracao, orcamento, pessoas })
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.details || 'Falha na resposta da API');
        }
        
        const data = await res.json();
        setItinerary(data);
      } catch (err: any) {
        console.error(err);
        setGenerateError(`Erro: ${err.message}`);
      } finally {
        setIsGenerating(false);
      }
    }

    fetchItinerary();
  }, [isAuthLoading, user, destino, duracao, orcamento]);

  const handleSave = async () => {
    if (!user || !itinerary) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'itineraries'), {
        userId: user.uid,
        createdAt: new Date().toISOString(),
        destino,
        duracao,
        orcamento,
        itinerary
      });
      setSavedSuccess(true);
    } catch (error) {
      console.error("Erro ao salvar roteiro:", error);
      alert("Houve um erro ao salvar seu roteiro.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dbe4df]">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0 border-r border-slate-800 shadow-2xl z-20">
        <div className="p-8">
          <div className="text-3xl font-serif font-bold tracking-tight mb-10 cursor-pointer hover:text-emerald-400 transition" onClick={() => router.push('/')}>
            Rotta.
          </div>
          
          <div className="flex items-center gap-4 mb-10 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" 
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.displayName || "Viajante"}</p>
              <p className="text-xs text-emerald-400 truncate font-medium mt-0.5">{user.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-3">
            <button onClick={() => router.push('/')} className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-4 rounded-xl font-medium transition hover:bg-emerald-700 shadow-[0_0_20px_rgba(5,150,105,0.3)]">
              <Compass className="w-5 h-5" />
              Novo Roteiro IA
            </button>
            <button className="flex items-center gap-3 bg-slate-800/80 text-white px-5 py-4 rounded-xl font-medium transition border border-slate-700">
              <FileText className="w-5 h-5" />
              Roteiros Salvos
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-800">
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-slate-900 text-white p-5 flex justify-between items-center shadow-lg z-10">
        <div className="text-2xl font-serif font-bold tracking-tight" onClick={() => router.push('/')}>Rotta.</div>
        <img 
          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
          alt="Avatar" 
          className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500" 
          referrerPolicy="no-referrer"
        />
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto relative h-screen bg-slate-50/50">
        
        {generateError ? (
          // ERRO NA GERAÇÃO
          <div className="max-w-3xl mx-auto mt-20 bg-white p-10 rounded-3xl border border-red-100 shadow-xl text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado.</h2>
            <p className="text-slate-600 mb-8">{generateError}</p>
            <button onClick={() => router.push('/')} className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition">
              Voltar e tentar novamente
            </button>
          </div>
        ) : isGenerating ? (
          // SKELETON LOADER (Mágica da IA)
          <div className="max-w-4xl mx-auto mt-20 animate-in fade-in duration-500">
            <div className="flex flex-col items-center justify-center mb-16">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100/50">
                <Compass className="w-10 h-10 text-emerald-600 animate-spin-slow" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3 text-center">A IA está desenhando sua jornada...</h2>
              <p className="text-slate-500 font-medium max-w-md text-center">Analisando o orçamento de {orcamento} para {duracao} em {destino === 'SURPREENDA-ME' ? 'um destino surpresa' : destino}. Isso leva cerca de 15 segundos.</p>
            </div>
            
            <div className="space-y-6">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-pulse">
                  <div className="h-6 bg-slate-200 rounded-md w-1/4 mb-4"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-8"></div>
                  
                  <div className="flex gap-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl shrink-0"></div>
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-100 rounded w-full"></div>
                      <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : itinerary ? (
          // ROTEIRO PRONTO PREMIUM (Dados Reais do Gemini)
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-10 fade-in duration-700 pb-20">
            
            {/* Cabeçalho do Roteiro */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] mb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-40 opacity-60"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider mb-3">
                    <Sparkles className="w-4 h-4" />
                    Gerado por Inteligência Artificial
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-5 leading-tight">
                    {itinerary.title}
                  </h1>
                  <p className="text-slate-600 text-base md:text-lg max-w-2xl leading-relaxed">
                    {itinerary.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0">
                  <button className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-700 transition" title="Compartilhar Roteiro">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-700 transition" title="Baixar PDF Offline">
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || savedSuccess}
                    className={`${savedSuccess ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800 hover:-translate-y-1 hover:shadow-2xl shadow-xl'} text-white px-8 py-4 rounded-2xl font-medium transition w-full md:w-auto flex items-center justify-center gap-2`}
                  >
                    {isSaving ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Salvando...</>
                    ) : savedSuccess ? (
                      <>Salvo com sucesso!</>
                    ) : (
                      <>Salvar Roteiro</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Seção de Passagens e Hospedagem (Onde você ganha dinheiro) */}
            <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 mb-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl -mr-20 -mt-20 opacity-20"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Passagens & Hospedagem</h3>
                  <p className="text-slate-400 max-w-lg">
                    Pesquise os voos mais baratos e os melhores hotéis para {destino === 'SURPREENDA-ME' ? 'sua viagem' : destino}. Os preços já estão alinhados para {pessoas} {Number(pessoas) === 1 ? 'pessoa' : 'pessoas'}.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                  <a 
                    href={`https://www.skyscanner.com.br/transporte/passagens-aereas/br/${encodeURIComponent(destino || '')}?associado=seu_id_de_afiliado`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition text-center shadow-lg shadow-emerald-900/20"
                  >
                    Pesquisar Voos
                  </a>
                  <a 
                    href={`https://www.booking.com/searchresults.pt-br.html?ss=${encodeURIComponent(destino || '')}&aid=seu_id_de_afiliado`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition text-center shadow-lg shadow-blue-900/20"
                  >
                    Ver Hotéis
                  </a>
                </div>
              </div>
            </div>

            {/* Aviso de Segurança */}
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-3xl p-5 flex gap-4 mb-10 text-amber-900 shadow-sm">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold">Aviso de Segurança & Transparência</p>
                <p className="text-sm opacity-90 mt-1 leading-relaxed">Os locais sugeridos foram otimizados pela IA para seu orçamento, mas os preços podem variar. Verifique tudo em plataformas oficiais.</p>
              </div>
            </div>

            {/* Timeline Dia a Dia Dinâmica */}
            <div className="space-y-10">
              {itinerary.days.map((day, dayIndex) => (
                <div key={dayIndex} className="relative pl-8 md:pl-0">
                  <div className="hidden md:block absolute left-6 top-10 bottom-0 w-1 bg-gray-100 rounded-full"></div>

                  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden md:ml-16 relative">
                    <div className="hidden md:flex absolute -left-16 top-8 w-12 h-12 bg-emerald-100 border-4 border-white rounded-full items-center justify-center text-emerald-700 font-bold text-lg shadow-sm z-10">
                      {day.dayNumber}
                    </div>

                    <div className="border-b border-gray-100 bg-gray-50/50 p-6 md:p-8">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-2xl font-serif font-bold text-slate-900">{day.title}</h3>
                        <span className="text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-full text-slate-500 uppercase tracking-wide">
                          {day.theme}
                        </span>
                      </div>
                      <p className="text-slate-500">{day.summary}</p>
                    </div>
                    
                    <div className="p-6 md:p-8 space-y-8">
                      {day.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="flex gap-4 md:gap-6 group">
                          
                          {/* Ícone Dinâmico */}
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                            event.type === 'food' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            event.type === 'transit' ? 'bg-sky-50 text-sky-600 border-sky-100' : 
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {event.type === 'food' && <Utensils className="w-6 h-6" />}
                            {event.type === 'sightseeing' && <Camera className="w-6 h-6" />}
                            {event.type === 'transit' && <Navigation className="w-6 h-6" />}
                          </div>

                          <div className="pt-1 w-full">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h4 className="font-bold text-slate-900 text-xl">{event.title}</h4>
                              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold whitespace-nowrap">
                                {event.time}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-4">
                              {event.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3 w-fit hover:bg-slate-100 transition cursor-pointer">
                                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="text-sm font-medium text-slate-700">{event.location}</span>
                              </div>
                              <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-2 w-fit">
                                <span className="text-sm font-bold text-amber-700">{event.estimatedCost}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>

    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#dbe4df]"><div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
