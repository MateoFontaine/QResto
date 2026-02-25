"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ListTree, Plus, Trash2, Tag } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos al entrar
  useEffect(() => {
    const fetchData = async () => {
      // 1. Buscamos quién es el usuario y cuál es su restaurante
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: shop } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();

      if (shop) {
        setRestaurantId(shop.id);
        
        // 2. Traemos las categorías de ESTE restaurante
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', shop.id)
          .order('created_at', { ascending: true });
          
        if (cats) setCategories(cats);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Función para agregar una categoría
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !restaurantId) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: newCategoryName, restaurant_id: restaurantId }])
      .select()
      .single();

    if (!error && data) {
      setCategories([...categories, data]);
      setNewCategoryName("");
    } else {
      alert("Error al crear la categoría");
    }
    setIsSubmitting(false);
  };

  // Función para borrar una categoría
  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés borrar esta categoría?")) return;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 w-full">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Categorías
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-medium">
            Organizá las secciones de tu menú digital.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        
        {/* COLUMNA IZQUIERDA: Formulario para crear */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-8 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">
              Nueva Categoría
            </h3>
            
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                <input 
                  required 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)} 
                  placeholder="Ej: Hamburguesas" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 outline-none transition-all font-medium dark:text-white" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting || loading}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-[#0B0F19] font-black rounded-2xl hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-xl uppercase tracking-widest disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Crear'}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: Lista de Categorías */}
        <div className="lg:col-span-2">
          <div className="p-8 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm min-h-[400px]">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <ListTree className="w-6 h-6 text-emerald-500" />
              Tus Secciones
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
                <Tag className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest opacity-60">No hay categorías todavía.</p>
                <p className="text-slate-400 text-sm mt-2">Creá la primera desde el formulario de la izquierda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="group p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between">
                    <span className="font-bold text-lg dark:text-white">{cat.name}</span>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-3 bg-white dark:bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}