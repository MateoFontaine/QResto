"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Store, Wifi, Copy, CheckCircle2, X, Utensils } from "lucide-react";


export default function PublicMenuPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Datos
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Estados
  const [showWifi, setShowWifi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data: shop, error: shopError } = await supabase.from('restaurants').select('*').eq('slug', slug).single();
      if (shopError || !shop) {
        setError("Menú no disponible.");
        setLoading(false); return;
      }
      setRestaurant(shop);

      const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', shop.id).order('created_at', { ascending: true });
      if (cats) {
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      }

      const { data: prods } = await supabase.from('products').select('*').eq('restaurant_id', shop.id).eq('is_visible', true).order('created_at', { ascending: false });
      if (prods) setProducts(prods);
      
      setLoading(false);
    };
    if (slug) fetchMenu();
  }, [slug]);

  // Scroll Spy (Detecta en qué sección estamos)
  useEffect(() => {
    if (loading || categories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id.replace('category-', ''));
        });
      },
      { rootMargin: '-20% 0px -70% 0px' } 
    );

    categories.forEach((cat) => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories, loading]);

  const copyToClipboard = () => {
    if (!restaurant?.wifi_password) return;
    navigator.clipboard.writeText(restaurant.wifi_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToCategory = (categoryId: string) => {
    isClickScrolling.current = true;
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 100; 
      const offsetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setTimeout(() => { isClickScrolling.current = false; }, 800);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] dark:bg-[#121212]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 dark:border-white/10 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] dark:bg-[#121212] p-6 text-center">
        <p className="text-slate-500 text-lg font-medium">{error}</p>
      </div>
    );
  }

  const brandColor = restaurant.brand_color || "#10b981";

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-[#121212] pb-32 font-sans text-slate-900 dark:text-slate-100 selection:bg-slate-200 selection:text-slate-900">
      
      {/* HEADER */}
      <header className="pt-10 pb-6 px-6 text-center max-w-4xl mx-auto">
        {restaurant.logo_url ? (
          <img 
            src={restaurant.logo_url} 
            alt={restaurant.name} 
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-sm border-4 border-white dark:border-[#1e1e1e]"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1e1e1e] flex items-center justify-center mx-auto mb-4 shadow-sm border-4 border-white dark:border-[#1e1e1e]">
            <Store className="w-10 h-10 text-slate-300" />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
      </header>

      {/* NAVBAR PÍLDORAS */}
      <div className="sticky top-0 z-30 bg-[#f9fafb]/90 dark:bg-[#121212]/90 backdrop-blur-md py-3 shadow-sm border-b border-slate-200/50 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto gap-3 snap-x [&::-webkit-scrollbar]:hidden">
            {categories.map(category => {
              const hasProducts = products.some(p => p.category_id === category.id);
              if (!hasProducts) return null;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={`nav-${category.id}`}
                  onClick={() => scrollToCategory(category.id)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all duration-300 snap-start border ${
                    isActive 
                      ? "text-white shadow-md border-transparent" 
                      : "bg-white dark:bg-[#1e1e1e] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                  style={isActive ? { backgroundColor: brandColor } : {}}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-12">
        {categories.length === 0 || products.length === 0 ? (
          <div className="text-center py-20 text-slate-500">Aún no hay platos en el menú.</div>
        ) : (
          categories.map(category => {
            const categoryProducts = products.filter(p => p.category_id === category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <section key={category.id} id={`category-${category.id}`} className="scroll-mt-28">
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-slate-800 dark:text-slate-200">
                  {category.name}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryProducts.map(product => (
                    <div 
                      key={product.id} 
                      onClick={() => setSelectedProduct(product)}
                      className="bg-white dark:bg-[#1e1e1e] p-4 rounded-[24px] flex gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-white/5 group"
                    >
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-[17px] font-bold leading-tight mb-1.5 text-slate-900 dark:text-white">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-[14px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-lg font-bold" style={{ color: brandColor }}>
                            ${new Intl.NumberFormat("es-AR").format(product.price)}
                          </span>
                        </div>
                      </div>

                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[18px] flex-shrink-0 overflow-hidden bg-slate-50 dark:bg-[#2a2a2a] flex items-center justify-center border border-slate-100 dark:border-white/5">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <Utensils className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* MODAL DEL PRODUCTO CENTRADO (FLOTANTE) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Fondo oscuro blur */}
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedProduct(null)}
          />
          
          <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Botón Cerrar */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mitad Superior: Imagen */}
            <div className="relative w-full h-64 sm:h-72 bg-slate-100 dark:bg-[#222] flex-shrink-0 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
              
              {selectedProduct.image_url ? (
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Utensils className="w-16 h-16 text-slate-300 dark:text-slate-600" />
              )}
            </div>

            {/* Mitad Inferior: Textos y Precio */}
            <div className="p-6 sm:p-8 flex flex-col flex-1 overflow-y-auto">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight mb-3">
                {selectedProduct.name}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-300 text-[15px] sm:text-[16px] leading-relaxed mb-8 flex-1">
                {selectedProduct.description || "Este plato no tiene descripción adicional."}
              </p>

              <div className="border-t border-slate-100 dark:border-white/10 pt-6 mt-auto">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Precio Final</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold" style={{ color: brandColor }}>
                    ${new Intl.NumberFormat("es-AR").format(selectedProduct.price)}
                  </span>
                  {selectedProduct.price_without_tax && (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                      S/Imp: ${new Intl.NumberFormat("es-AR").format(selectedProduct.price_without_tax)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BURBUJA DE WIFI */}
      {restaurant.wifi_active && restaurant.wifi_ssid && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
          {showWifi && (
            <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 w-64 animate-in zoom-in-95 origin-bottom-right">
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Red WiFi</p>
                <p className="font-bold text-slate-900 dark:text-white text-lg truncate">{restaurant.wifi_ssid}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contraseña</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 dark:bg-black/20 px-4 py-2.5 rounded-xl text-sm font-bold truncate select-all">
                    {restaurant.wifi_password || "Sin clave"}
                  </div>
                  {restaurant.wifi_password && (
                    <button 
                      onClick={copyToClipboard}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-xl transition-colors text-slate-700 dark:text-white"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={() => setShowWifi(!showWifi)}
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: brandColor }}
          >
            <Wifi className="w-6 h-6" />
          </button>
        </div>
      )}

    </div>
  );
}