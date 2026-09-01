'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, CreditCard, Wallet, User, Users, Sparkles, X, ChevronRight, Globe, Zap, MessageCircle, LogOut, AlertCircle } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

const CIDADES_MOCK = [
  // Cidades do Brasil (Capitais e Interiores Famosos)
  "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Salvador, BA", 
  "Fortaleza, CE", "Brasília, DF", "Curitiba, PR", "Manaus, AM", "Recife, PE",
  "Porto Alegre, RS", "Goiânia, GO", "Belém, PA", "São Luís, MA", "Maceió, AL",
  "Natal, RN", "Florianópolis, SC", "João Pessoa, PB", "Aracaju, SE", "Vitória, ES",
  "Campinas, SP", "São José dos Campos, SP", "Ribeirão Preto, SP", "Sorocaba, SP",
  "Uberlândia, MG", "Joinville, SC", "Londrina, PR", "Caxias do Sul, RS",
  "Gramado, RS", "Canela, RS", "Fernando de Noronha, PE", "Porto Seguro, BA",
  "Jericoacoara, CE", "Maragogi, AL", "Búzios, RJ", "Paraty, RJ", "Ouro Preto, MG",
  
  // Américas
  "Nova York, EUA", "Miami, EUA", "Orlando, EUA", "Los Angeles, EUA", "Las Vegas, EUA",
  "San Francisco, EUA", "Chicago, EUA", "Toronto, Canadá", "Vancouver, Canadá",
  "Cancún, México", "Cidade do México, México", "Buenos Aires, Argentina", 
  "Bariloche, Argentina", "Santiago, Chile", "Bogotá, Colômbia", "Lima, Peru",
  "Cusco, Peru", "Punta Cana, Rep. Dominicana",
  
  // Europa
  "Londres, Reino Unido", "Paris, França", "Roma, Itália", "Milão, Itália", 
  "Veneza, Itália", "Florença, Itália", "Madri, Espanha", "Barcelona, Espanha",
  "Lisboa, Portugal", "Porto, Portugal", "Amsterdã, Holanda", "Berlim, Alemanha",
  "Munique, Alemanha", "Viena, Áustria", "Praga, República Tcheca", 
  "Budapeste, Hungria", "Atenas, Grécia", "Santorini, Grécia", "Dublin, Irlanda",
  
  // Ásia, África e Oceania
  "Tóquio, Japão", "Quioto, Japão", "Pequim, China", "Xangai, China", 
  "Seul, Coreia do Sul", "Bangkok, Tailândia", "Singapura", "Bali, Indonésia",
  "Dubai, Emirados Árabes", "Doha, Catar", "Istambul, Turquia", 
  "Cidade do Cabo, África do Sul", "Cairo, Egito", "Marraquexe, Marrocos",
  "Sydney, Austrália", "Melbourne, Austrália", "Auckland, Nova Zelândia"
];

export default function Home() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [surpriseMe, setSurpriseMe] = useState(false);
  
  // Estados do Formulário
  const [destino, setDestino] = useState("");
  const [duracao, setDuracao] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [pessoas, setPessoas] = useState("1");
  const [formError, setFormError] = useState("");

  // Estados do Autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const filteredCidades = CIDADES_MOCK.filter(c => c.toLowerCase().includes(destino.toLowerCase()));

  // Estados do Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: 'bot' | 'user', text: string}[]>([
    { sender: 'bot', text: 'Olá! Como posso tirar suas dúvidas sobre a Rotta hoje?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estado de Autenticação
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Fecha o Autocomplete se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Erro ao fazer login com o Google:", error);
      alert("Houve um erro ao tentar fazer login. Tente novamente.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const handleSearch = () => {
    setFormError("");

    // Validação
    if (!surpriseMe && !destino.trim()) {
      setFormError("Por favor, preencha o destino desejado.");
      return;
    }
    if (!duracao.trim()) {
      setFormError("Por favor, informe a duração da viagem.");
      return;
    }
    if (!orcamento.trim()) {
      setFormError("Por favor, informe o seu orçamento.");
      return;
    }

    // Se não estiver logado, abre o modal. Se estiver, vai pro dashboard com os parâmetros
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      const finalDestino = surpriseMe ? "SURPREENDA-ME" : destino;
      router.push(`/dashboard?destino=${encodeURIComponent(finalDestino)}&duracao=${encodeURIComponent(duracao)}&orcamento=${encodeURIComponent(orcamento)}&pessoas=${encodeURIComponent(pessoas)}`);
    }
  };

  const destinos = [
    { nome: "Fernando de Noronha", local: "Brasil", preco: "R$ 4.500", imagem: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop" },
    { nome: "Tóquio", local: "Japão", preco: "R$ 7.500", imagem: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop" },
    { nome: "Rio de Janeiro", local: "Brasil", preco: "R$ 2.100", imagem: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop" },
    { nome: "Roma", local: "Itália", preco: "R$ 5.200", imagem: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop" },
    { nome: "Gramado", local: "Brasil", preco: "R$ 3.400", imagem: "https://images.unsplash.com/photo-1542259009477-d625272157b7?q=80&w=800&auto=format&fit=crop" }
  ];

  const handleQuestionClick = (question: string, answer: string) => {
    setChatMessages(prev => [...prev, { sender: 'user', text: question }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'bot', text: answer }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans flex flex-col relative">
      
      {/* MODAL DE LOGIN */}
      {isLoginModalOpen && !user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 bg-gray-50 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-serif font-bold mb-2">Bem-vindo à Rotta</h2>
            <p className="text-gray-500 mb-8">Faça login para salvar seus roteiros gerados de forma segura.</p>
            
            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 font-medium">
                {formError}
              </div>
            )}

            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 p-4 rounded-2xl font-medium transition mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
          <div className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight drop-shadow-md cursor-pointer">
            Rotta.
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button onClick={() => router.push('/dashboard')} className="hidden sm:block text-white font-medium hover:text-emerald-300 transition-colors mr-2">
                  Meus Roteiros
                </button>
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden cursor-pointer bg-slate-200" title={user.displayName || "Perfil"}>
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.email}&background=random`;
                    }}
                  />
                </div>
                <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md text-white transition-colors" title="Sair">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-slate-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-medium hover:bg-white transition-colors shadow-sm"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar / Criar Conta</span>
                <span className="sm:hidden">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative w-full pb-12 pt-32 sm:pt-0 sm:h-[80vh] sm:min-h-[600px] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop")' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent" /> 
          </div>

          <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6 flex flex-col items-center mt-10 sm:mt-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white text-center mb-4 drop-shadow-lg leading-tight">
              A sua próxima jornada.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 text-center mb-8 sm:mb-10 drop-shadow-md font-light max-w-2xl px-4">
              Planejamos o roteiro perfeito e encontramos as melhores reservas que cabem no seu bolso.
            </p>

            {/* SURPRISE ME TOGGLE */}
            <div 
              className="flex items-center gap-3 mb-6 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white cursor-pointer hover:bg-black/40 transition w-full sm:w-auto justify-center"
              onClick={() => {
                setSurpriseMe(!surpriseMe);
                setFormError(""); // Limpa o erro ao trocar de modo
              }}
            >
              <div className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${surpriseMe ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-500/50'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${surpriseMe ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#34d399] drop-shadow-[0_0_12px_rgba(52,211,153,1)]" />
                Não tenho destino (Me surpreenda)
              </span>
            </div>

            {/* MENSAGEM DE ERRO DO FORMULÁRIO */}
            {formError && (
              <div className="mb-4 bg-red-500/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}

            {/* CAIXA DE PESQUISA */}
            <div ref={searchBarRef} className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-2 shadow-xl flex flex-col md:flex-row gap-2 relative z-20">
              
              {/* CAMPO DESTINO COM AUTOCOMPLETE */}
              {!surpriseMe && (
                <>
                  <div className="flex-1 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 rounded-2xl transition border-b md:border-b-0 border-gray-100 relative">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="flex flex-col w-full relative">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Destino</span>
                      <input 
                        type="text" 
                        value={destino}
                        onChange={(e) => {
                          setDestino(e.target.value);
                          setShowAutocomplete(true);
                          setFormError("");
                        }}
                        onFocus={() => setShowAutocomplete(true)}
                        placeholder="Para onde?" 
                        className="bg-transparent outline-none text-slate-900 font-medium placeholder-gray-400 w-full text-sm sm:text-base" 
                      />
                      
                      {/* DROPDOWN DE BUSCA INTELIGENTE */}
                      {showAutocomplete && destino.length > 0 && (
                        <div className="absolute top-full left-0 mt-4 w-64 sm:w-full bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                          {filteredCidades.length > 0 ? (
                            filteredCidades.slice(0, 6).map((cidade, i) => (
                              <div 
                                key={i}
                                className="px-4 py-3 hover:bg-emerald-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Evita que o input perca o foco antes do clique registrar
                                  setDestino(cidade);
                                  setShowAutocomplete(false);
                                }}
                              >
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-medium text-slate-700">{cidade}</span>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-4 text-sm text-gray-500 text-center">
                              Aperte Buscar para procurar por "{destino}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:block w-px bg-gray-200 my-4" />
                </>
              )}

              {/* CAMPO DURAÇÃO */}
              <div className="flex-1 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 rounded-2xl transition border-b md:border-b-0 border-gray-100">
                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Duração</span>
                  <input 
                    type="number" 
                    value={duracao}
                    onChange={(e) => { setDuracao(e.target.value); setFormError(""); }}
                    placeholder="Ex: 5 dias" 
                    className="bg-transparent outline-none text-slate-900 font-medium placeholder-gray-400 w-full text-sm sm:text-base" 
                  />
                </div>
              </div>

              <div className="hidden md:block w-px bg-gray-200 my-4" />

              {/* CAMPO ORÇAMENTO */}
              <div className="flex-1 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 rounded-2xl transition relative group">
                <Wallet className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Orçamento Total</span>
                  <div className="flex items-center">
                    <span className="text-sm sm:text-base text-slate-900 font-medium mr-1">R$</span>
                    <input 
                      type="number" 
                      value={orcamento}
                      onChange={(e) => {
                        setOrcamento(e.target.value);
                        setFormError("");
                      }}
                      placeholder="Ex: 5000" 
                      className="bg-transparent outline-none text-slate-900 font-medium placeholder-gray-400 w-full text-sm sm:text-base appearance-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="hidden md:block w-px bg-gray-200 my-4" />

              {/* CAMPO PESSOAS */}
              <div className="flex-1 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 rounded-2xl transition border-b md:border-b-0 border-gray-100 relative group">
                <Users className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Viajantes</span>
                  <select 
                    value={pessoas}
                    onChange={(e) => setPessoas(e.target.value)}
                    className="bg-transparent outline-none text-slate-900 font-medium w-full text-sm sm:text-base appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Pessoa' : 'Pessoas'}</option>
                    ))}
                    <option value="9+">9+ Pessoas</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSearch} 
                className="bg-emerald-700 hover:bg-emerald-800 text-white p-4 md:px-8 rounded-2xl flex items-center justify-center gap-2 transition font-medium w-full md:w-auto shadow-md"
              >
                <Search className="w-5 h-5 shrink-0" />
                <span className="md:hidden">Buscar Roteiros</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION: DESTINOS EM ALTA */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto overflow-hidden relative">
          <div className="px-4 sm:px-6 mb-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-2">Destinos em Alta</h2>
                <p className="text-slate-600 text-sm sm:text-base">Inspirações para sua próxima aventura.</p>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="animate-marquee gap-6 px-4 sm:px-6 pb-12 pt-4">
              {[...destinos, ...destinos].map((destino, index) => (
                <div 
                  key={index} 
                  className="group rounded-3xl overflow-hidden cursor-pointer relative h-80 min-w-[280px] sm:min-w-[320px] shrink-0 border border-white/40 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] transition-all hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)]"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                    style={{ backgroundImage: `url("${destino.imagem}")` }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-2xl font-bold text-white mb-1">{destino.nome}</h3>
                    <p className="text-white/90 font-medium text-sm">{destino.local} • {destino.preco}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: COMO FUNCIONA */}
        <section className="py-20 sm:py-32 border-t border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-16 text-center">
              Como organizamos sua viagem
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
              <div className="flex flex-col border-t-2 border-slate-900 pt-6">
                <span className="text-emerald-700 font-bold text-xl mb-4">01.</span>
                <h3 className="text-xl font-serif font-bold mb-3 text-slate-900">Defina os detalhes</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Informe o destino, datas e orçamento total. Nossa plataforma mapeia opções 100% personalizadas para você montar desde um mochilão econômico até uma lua de mel de luxo.
                </p>
              </div>

              <div className="flex flex-col border-t-2 border-slate-900 pt-6">
                <span className="text-emerald-700 font-bold text-xl mb-4">02.</span>
                <h3 className="text-xl font-serif font-bold mb-3 text-slate-900">Roteiro Otimizado</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Analisamos milhares de rotas para agrupar as atrações por bairro e região, poupando seu tempo de trânsito para que você aproveite cada segundo do dia.
                </p>
              </div>

              <div className="flex flex-col border-t-2 border-slate-900 pt-6">
                <span className="text-emerald-700 font-bold text-xl mb-4">03.</span>
                <h3 className="text-xl font-serif font-bold mb-3 text-slate-900">Tudo pronto</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Receba seu planejamento diário detalhado gratuitamente. E se quiser maior praticidade, acesse os links para reservar seus hotéis e passeios com segurança.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: DÚVIDAS E FAQ */}
        <section className="pb-24 pt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4">
                Ficou com alguma dúvida?
              </h2>
              <p className="text-slate-300 mb-8 max-w-lg">
                Seja sobre valores, destinos ou como nossos roteiros funcionam, estamos aqui para responder. Veja nossas perguntas frequentes agora mesmo.
              </p>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-3 rounded-full font-medium transition flex items-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Abrir Perguntas Frequentes
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-serif font-bold text-white tracking-tight">
            Rotta.
          </div>
          <p className="text-sm text-gray-400">© 2026 Rotta. Construído para transformar viagens.</p>
          <div className="flex gap-4">
            <span className="text-sm text-gray-400 hover:text-white cursor-pointer">Termos</span>
            <span className="text-sm text-gray-400 hover:text-white cursor-pointer">Privacidade</span>
          </div>
        </div>
      </footer>

      {/* FAKE CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="bg-white w-80 sm:w-[400px] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Perguntas Frequentes</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-72 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-slate-800 rounded-bl-none shadow-sm leading-relaxed'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Escolha uma dúvida:</span>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-1">
                <button 
                  onClick={() => handleQuestionClick("Qual o custo de usar o site?", "Nenhum! É 100% gratuito. Você pode criar quantos roteiros quiser sem pagar nada. Nosso objetivo é democratizar viagens incríveis.")}
                  className="text-left text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2.5 rounded-lg text-slate-700 transition"
                >
                  Qual o custo de usar o site?
                </button>
                <button 
                  onClick={() => handleQuestionClick("Funciona para viagens no Brasil?", "Sim! A Rotta encontra e otimiza destinos tanto no Brasil quanto em qualquer país do exterior.")}
                  className="text-left text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2.5 rounded-lg text-slate-700 transition"
                >
                  Funciona para viagens no Brasil?
                </button>
                <button 
                  onClick={() => handleQuestionClick("Como os roteiros são montados?", "Nós organizamos as atrações usando a distância geográfica entre elas. Assim, você visita os pontos turísticos de um bairro pela manhã, e do outro à tarde, economizando Uber e tempo!")}
                  className="text-left text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2.5 rounded-lg text-slate-700 transition"
                >
                  Como os roteiros são montados?
                </button>
                <button 
                  onClick={() => handleQuestionClick("Eu sou obrigado a reservar hotéis aqui?", "Não. Você é livre para apenas baixar o roteiro e usar como guia. Mas se preferir comodidade, nós indicamos links seguros para reservas.")}
                  className="text-left text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2.5 rounded-lg text-slate-700 transition"
                >
                  Eu sou obrigado a reservar hotéis por aqui?
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
