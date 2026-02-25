"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Search, MoreVertical, Users, TrendingUp, Layers } from "lucide-react";

export default function ResellersPage() {
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResellers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'reseller');

      if (!error) setResellers(data);
      setLoading(false);
    };

    fetchResellers();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER: Título y Acción Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Revendedores
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">
            Gestión y métricas de tu red comercial de Devoys.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 hover:scale-[1.02] transition-all shadow-xl shadow-violet-600/20 active:scale-95">
          <UserPlus className="w-5 h-5" />
          <span>Nuevo Reseller</span>
        </button>
      </div>

      {/* MÉTRICAS: Para llenar el espacio con info visualmente atractiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-[28px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Red</p>
          </div>
          <p className="text-4xl font-black dark:text-white">{resellers.length}</p>
        </div>

        <div className="p-6 rounded-[28px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ventas Mes</p>
          </div>
          <p className="text-4xl font-black text-emerald-500">0</p>
        </div>

        <div className="p-6 rounded-[28px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Comisiones</p>
          </div>
          <p className="text-4xl font-black dark:text-white">$0</p>
        </div>
      </div>

      {/* TABLA: Con diseño "Glass" y bordes muy redondeados */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider text-slate-500">Usuario</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider text-slate-500 text-center">Estado</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-500 font-medium">Cargando revendedores...</span>
                    </div>
                  </td>
                </tr>
              ) : resellers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-500 font-medium">
                    No hay revendedores registrados todavía.
                  </td>
                </tr>
              ) : (
                resellers.map((reseller) => (
                  <tr key={reseller.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-lg border border-violet-500/10 shadow-sm uppercase">
                          {reseller.email?.[0] || 'R'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{reseller.email}</p>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">ID: {reseller.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-tighter border border-emerald-500/20">
                        Verificado
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}