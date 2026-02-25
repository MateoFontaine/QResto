"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Store, Plus, X, MapPin, ExternalLink, Settings2 } from "lucide-react";

export default function ShopsPage() {
  // Estados para la lista de locales
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal y el Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Traer los locales de la base de datos
  const fetchShops = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        profiles!restaurants_owner_id_fkey (email)
      `);
      
    if (!error) setShops(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Función para crear Local + Usuario al mismo tiempo
  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          slug: slug.toLowerCase().replace(/\s+/g, '-'), 
          email: ownerEmail, 
          password 
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error desconocido");

      // Si todo sale bien, cerramos modal, limpiamos y recargamos
      setIsModalOpen(false);
      setName(""); 
      setSlug(""); 
      setOwnerEmail(""); 
      setPassword("");
      fetchShops();
      
    } catch (error: any) {
      alert("Error al crear el local: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER: Alineado con el mismo estilo de Revendedores */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-5xl">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Locales
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-medium">
            Gestión de comercios y activación de módulos.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 hover:scale-[1.02] transition-all shadow-xl shadow-violet-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Local</span>
        </button>
      </div>

      {/* MODAL DE ALTA (Glassmorphism centrado) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-[#0B0F19]/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#161B26] w-full max-w-lg rounded-[40px] p-10 shadow-2xl border border-slate-200 dark:border-white/10 relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tight dark:text-white text-slate-900">
              Alta de Cliente
            </h3>
            
            <form onSubmit={handleCreateShop} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Comercio</label>
                <input 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ej: Balneario El Faro" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-transparent focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-all text-slate-900 dark:text-white font-medium" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Slug (URL del QR)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">/</span>
                  <input 
                    required 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="el-faro" 
                    className="w-full pl-10 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-transparent focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-all text-slate-900 dark:text-white font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Email del Dueño</label>
                <input 
                  required 
                  type="email" 
                  value={ownerEmail} 
                  onChange={(e) => setOwnerEmail(e.target.value)} 
                  placeholder="dueño@elfaro.com" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-transparent focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-all text-slate-900 dark:text-white font-medium" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña Provisoria</label>
                <input 
                  required 
                  type="text" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Ej: Faro2026!" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-transparent focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-all text-slate-900 dark:text-white font-medium" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-slate-900 dark:bg-white text-white dark:text-[#0B0F19] font-black rounded-2xl hover:bg-violet-600 dark:hover:bg-violet-500 hover:text-white transition-all shadow-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Generando credenciales...' : 'Crear Local y Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GRID DE LOCALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {loading ? (
          <div className="col-span-full py-24 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-500 font-bold uppercase tracking-tighter">Cargando locales...</span>
            </div>
          </div>
        ) : shops.length === 0 ? (
          <div className="col-span-full p-24 text-center border-2 border-dashed border-slate-300 dark:border-white/10 rounded-[40px] bg-white/50 dark:bg-white/[0.02]">
            <p className="text-slate-500 font-bold uppercase tracking-widest opacity-80">No hay locales registrados todavía.</p>
          </div>
        ) : (
          shops.map((shop) => (
            <div key={shop.id} className="group p-8 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-violet-500/50 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between min-h-[280px]">
              
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Store className="w-8 h-8" />
                  </div>
                  <button className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all">
                    <Settings2 className="w-6 h-6 text-slate-400 group-hover:text-violet-500" />
                  </button>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter line-clamp-1">
                  {shop.name}
                </h3>
                
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold mt-2 mb-6">
                  <MapPin className="w-4 h-4 text-violet-500" />
                  <span>/{shop.slug}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dueño Asociado</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[160px]">
                    {shop.profiles?.email || 'Sin asignar'}
                  </p>
                </div>
                <a 
                  href={`/${shop.slug}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-500 transition-all shadow-sm"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}