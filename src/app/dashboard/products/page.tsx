"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UtensilsCrossed, Plus, Trash2, AlertTriangle, Image as ImageIcon, Eye, EyeOff, Search, Filter, ChevronDown } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  
  // Estados del Formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceWithoutTax, setPriceWithoutTax] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Búsqueda y Filtro Custom
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false); // <--- Controla el menú desplegable nuevo

  // Estados del Modal
  const [productToDelete, setProductToDelete] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: shop } = await supabase.from('restaurants').select('id').eq('owner_id', session.user.id).single();

      if (shop) {
        setRestaurantId(shop.id);
        const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', shop.id);
        if (cats) {
          setCategories(cats);
          if (cats.length > 0) setCategoryId(cats[0].id);
        }
        const { data: prods } = await supabase.from('products').select('*').eq('restaurant_id', shop.id).order('created_at', { ascending: false });
        if (prods) setProducts(prods);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Formatear el precio con puntos (Estilo Argentina: 12.300)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setter("");
      return;
    }
    const formatted = new Intl.NumberFormat("es-AR").format(parseInt(rawValue));
    setter(formatted);
  };

  // Agregar Producto
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId || !restaurantId) return;
    setIsSubmitting(true);

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('menu-images').upload(filePath, imageFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('menu-images').getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const cleanPrice = parseInt(price.replace(/\./g, ""));
    const cleanPriceWithoutTax = priceWithoutTax ? parseInt(priceWithoutTax.replace(/\./g, "")) : null;

    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, description, price: cleanPrice, price_without_tax: cleanPriceWithoutTax,
        image_url: imageUrl, category_id: categoryId, restaurant_id: restaurantId, is_visible: true 
      }])
      .select()
      .single();

    if (!error && data) {
      setProducts([data, ...products]);
      setName(""); setDescription(""); setPrice(""); setPriceWithoutTax(""); setImageFile(null);
    }
    setIsSubmitting(false);
  };

  // Borrar Producto
  const confirmDelete = async () => {
    if (!productToDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
    if (!error) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  // Toggle de Visibilidad
  const toggleVisibility = async (prod: any) => {
    const newStatus = !prod.is_visible;
    setProducts(products.map(p => p.id === prod.id ? { ...p, is_visible: newStatus } : p));
    await supabase.from('products').update({ is_visible: newStatus }).eq('id', prod.id);
  };

  // Lógica de Filtrado Activo
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "" || prod.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 w-full relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Platos y Productos
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-medium">
            Armá tu carta con detalle, fotos y precios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
        
        {/* FORMULARIO DE ALTA */}
        <div className="xl:col-span-1">
          <div className="sticky top-24 p-8 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
              <Plus className="w-6 h-6 text-emerald-500" /> Nuevo Producto
            </h3>
            
            <form onSubmit={handleAddProduct} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Foto del Plato</label>
                <div className="relative group cursor-pointer">
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`w-full px-5 py-4 rounded-[20px] border-2 border-dashed flex items-center justify-center gap-2 transition-all ${imageFile ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-slate-300 dark:border-white/20 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                    <ImageIcon className="w-5 h-5" />
                    <span className="font-bold text-sm truncate max-w-[200px]">
                      {imageFile ? imageFile.name : 'Subir imagen (Opcional)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Hamburguesa Completa" className="w-full px-5 py-3 rounded-[20px] bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 outline-none transition-all font-medium dark:text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Medallón de 180g, cheddar..." rows={2} className="w-full px-5 py-3 rounded-[20px] bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 outline-none transition-all font-medium dark:text-white resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Precio Final ($)</label>
                  <input required type="text" value={price} onChange={(e) => handlePriceChange(e, setPrice)} placeholder="12.500" className="w-full px-5 py-3 rounded-[20px] bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 outline-none transition-all font-black dark:text-white text-emerald-600 text-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio S/Imp (Opc)</label>
                  <input type="text" value={priceWithoutTax} onChange={(e) => handlePriceChange(e, setPriceWithoutTax)} placeholder="10.000" className="w-full px-5 py-3 rounded-[20px] bg-slate-50 dark:bg-white/5 border border-transparent focus:border-slate-400 outline-none transition-all font-medium dark:text-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-5 py-3 rounded-[20px] bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 outline-none transition-all font-medium dark:text-white appearance-none cursor-pointer">
                  <option value="" disabled>Seleccionar...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <button type="submit" disabled={isSubmitting || categories.length === 0} className="w-full py-4 mt-2 bg-slate-900 dark:bg-white text-white dark:text-[#0B0F19] font-black rounded-2xl hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-xl uppercase tracking-widest disabled:opacity-50 flex justify-center items-center">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Agregar a la Carta'}
              </button>
            </form>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS CON BUSCADOR Y FILTRO CUSTOM */}
        <div className="xl:col-span-2">
          <div className="p-8 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm min-h-[400px]">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6 w-full relative z-20">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3 shrink-0">
                <UtensilsCrossed className="w-6 h-6 text-emerald-500" /> Tus Platos
              </h3>

              {/* BARRA DE BÚSQUEDA Y FILTROS MODERNOS */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative">
                
                {/* Buscador minimalista sin borde */}
                <div className="relative group w-full sm:w-64">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Buscar plato..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 rounded-[20px] bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#161B26] focus:shadow-xl focus:shadow-emerald-500/10 outline-none transition-all font-medium dark:text-white text-sm"
                  />
                </div>

                {/* Dropdown Custom Minimalista */}
                <div className="relative w-full sm:w-56">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center justify-between w-full px-5 py-3.5 rounded-[20px] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Filter className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                        {filterCategory === "" 
                          ? "Todas las secciones" 
                          : categories.find(c => c.id === filterCategory)?.name || "Filtrar"}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isFilterOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Cierre click-afuera */}
                  {isFilterOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                  )}

                  {/* Lista flotante de categorías */}
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-3 w-full bg-white dark:bg-[#161B26] border border-slate-100 dark:border-white/10 rounded-[24px] shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                      <button
                        onClick={() => { setFilterCategory(""); setIsFilterOpen(false); }}
                        className={`w-full text-left px-6 py-3 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${filterCategory === "" ? "text-emerald-500 font-black" : "text-slate-600 dark:text-slate-300 font-medium"}`}
                      >
                        Todas las secciones
                      </button>
                      
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { setFilterCategory(c.id); setIsFilterOpen(false); }}
                          className={`w-full text-left px-6 py-3 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${filterCategory === c.id ? "text-emerald-500 font-black" : "text-slate-600 dark:text-slate-300 font-medium"}`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20 relative z-10">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl relative z-10">
                <p className="text-slate-500 font-bold uppercase tracking-widest opacity-60">
                  {products.length === 0 ? "Tu carta está vacía." : "No se encontraron platos."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {filteredProducts.map((prod) => (
                  <div key={prod.id} className={`group p-4 rounded-[32px] border transition-all flex flex-col justify-between ${prod.is_visible ? 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 hover:border-emerald-500/30' : 'bg-slate-100/50 dark:bg-white/[0.01] border-slate-200/50 dark:border-white/5 opacity-60 grayscale-[0.5]'}`}>
                    
                    <div className="flex gap-4">
                      {/* Imagen del Plato */}
                      <div className="w-24 h-24 rounded-[20px] bg-slate-200 dark:bg-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-400 opacity-50" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-black text-lg dark:text-white leading-tight pr-2">{prod.name}</span>
                          <button onClick={() => setProductToDelete(prod)} className="p-2 bg-white dark:bg-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{prod.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          ${new Intl.NumberFormat("es-AR").format(prod.price)}
                        </span>
                        {prod.price_without_tax && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            S/Imp: ${new Intl.NumberFormat("es-AR").format(prod.price_without_tax)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          {prod.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {prod.is_visible ? 'Visible' : 'Oculto'}
                        </span>
                        <button 
                          onClick={() => toggleVisibility(prod)}
                          className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${prod.is_visible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-md ${prod.is_visible ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-[#0B0F19]/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#161B26] w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-slate-200 dark:border-white/10 relative animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight dark:text-white text-slate-900">¿Eliminar plato?</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              Estás a punto de borrar <strong className="text-slate-800 dark:text-slate-200">{productToDelete.name}</strong>.
            </p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setProductToDelete(null)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all uppercase tracking-widest text-sm">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 uppercase tracking-widest text-sm">
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}