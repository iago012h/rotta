'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { MapPin, Calendar, Compass, LogOut, FileText, ArrowRight, Trash2 } from 'lucide-react';

export default function SavedItineraries() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedTrips, setSavedTrips] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchSavedTrips(currentUser.uid);
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  async function fetchSavedTrips(uid: string) {
    try {
      const q = query(collection(db, 'itineraries'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const trips = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordenar localmente por data (Firebase precisa de index composto se misturar where e orderBy)
      trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSavedTrips(trips);
    } catch (error) {
      console.error("Erro ao buscar roteiros:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
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
            <button onClick={() => router.push('/')} className="flex items-center gap-3 bg-slate-800/80 text-white px-5 py-4 rounded-xl font-medium transition border border-slate-700 hover:bg-slate-700">
              <Compass className="w-5 h-5" />
              Novo Roteiro IA
            </button>
            <button className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-4 rounded-xl font-medium transition hover:bg-emerald-700 shadow-[0_0_20px_rgba(5,150,105,0.3)]">
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
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative h-screen bg-slate-50">
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3">Seus Roteiros</h1>
            <p className="text-slate-500 text-lg">Todas as suas jornadas geradas pela IA, guardadas com segurança.</p>
          </div>

          {savedTrips.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
              <Compass className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Nenhum roteiro salvo ainda</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Volte para a tela inicial, crie uma viagem incrível e clique em "Salvar Roteiro" para vê-la aqui.</p>
              <button onClick={() => router.push('/')} className="bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-700 transition">
                Criar minha primeira viagem
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map((trip) => (
                <div 
                  key={trip.id} 
                  onClick={() => router.push(`/dashboard?id=${trip.id}`)}
                  className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition cursor-pointer group flex flex-col"
                >
                  <div className="bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg w-fit mb-4">
                    {trip.duracao}
                  </div>
                  
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 line-clamp-2">
                    {trip.itinerary?.title || "Viagem sem título"}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-6 mt-auto">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{trip.destino}</span>
                  </div>

                  <div className="border-t border-gray-50 pt-4 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">
                      Criado em {new Date(trip.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors text-slate-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
