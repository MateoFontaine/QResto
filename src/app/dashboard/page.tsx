"use client";
import { UtensilsCrossed, ListTree, QrCode, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DashboardHomePage() {
  return (
    // Cambiamos max-w-5xl por w-full
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
        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black hover:scale-[1.02] transition-all shadow-xl active:scale-95 uppercase tracking-widest text-sm shrink-0">
          <QrCode className="w-5 h-5" />
          <span>Ver mi QR</span>
        </button>
      </div>

      {/* Acá está la magia Responsive:
        - grid-cols-1: en celulares (1 columna)
        - md:grid-cols-2: en tablets/notebooks (2 columnas)
        - xl:grid-cols-3: en monitores grandes (3 columnas)
        - 2xl:grid-cols-4: en monitores gigantes (4 columnas)
      */}
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
    </div>
  );
}