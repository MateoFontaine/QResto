"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UtensilsCrossed, ListTree, QrCode, ExternalLink, X, Download, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

export default function DashboardHomePage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: shop } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', session.user.id)
        .single();

      if (shop) setRestaurant(shop);
    };
    fetchRestaurant();
  }, []);

  const menuUrl = restaurant ? `https://q-resto.vercel.app/${restaurant.slug}` : "";

  const downloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${restaurant?.slug || "menu"}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 w-full">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Resumen
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-medium">
            Bienvenido a tu panel de autogestión.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black hover:scale-[1.02] transition-all shadow-xl active:scale-95 uppercase tracking-widest text-sm shrink-0"
        >
          <QrCode className="w-5 h-5" />
          <span>Ver mi QR</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
        
        {/* Tarjeta para ir a Categorías */}
        <Link href="/dashboard/categories" className="group p-8 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between min-h-[260px] w-full">
          <div>
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <ListTree className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Categorías
            </h3>
            <p className="text-slate-500 mt-2 font-medium">
              Organizá tu menú creando secciones como "Entradas" o "Bebidas".
            </p>
          </div>
          <div className="flex items-center text-emerald-500 font-bold uppercase tracking-widest text-xs mt-6 group-hover:translate-x-2 transition-transform">
            Gestionar <ExternalLink className="w-4 h-4 ml-2" />
          </div>
        </Link>

        {/* Tarjeta para ir a Platos */}
        <Link href="/dashboard/products" className="group p-8 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between min-h-[260px] w-full">
          <div>
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Platos & Productos
            </h3>
            <p className="text-slate-500 mt-2 font-medium">
              Cargá tus productos con foto, precio y descripción.
            </p>
          </div>
          <div className="flex items-center text-emerald-500 font-bold uppercase tracking-widest text-xs mt-6 group-hover:translate-x-2 transition-transform">
            Gestionar <ExternalLink className="w-4 h-4 ml-2" />
          </div>
        </Link>
      </div>

      {/* MODAL DEL QR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161B26] w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 dark:text-white">Tu Menú QR</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">Descargá el código para tus mesas.</p>
              
              <div className="bg-white p-6 rounded-[32px] inline-block shadow-inner border border-slate-100 mb-8">
                <QRCodeCanvas
                  value={menuUrl}
                  size={200}
                  level={"H"}
                  includeMargin={false}
                  imageSettings={restaurant?.logo_url ? {
                    src: restaurant.logo_url,
                    x: undefined, y: undefined, height: 40, width: 40, excavate: true,
                  } : undefined}
                />
              </div>

              <button 
                onClick={downloadQR}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> Descargar PNG
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(menuUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full py-3 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-70 transition-opacity"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "¡Copiado!" : "Copiar URL del menú"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}