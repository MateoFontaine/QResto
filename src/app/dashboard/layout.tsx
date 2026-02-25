"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { LayoutDashboard, UtensilsCrossed, ListTree, Settings, LogOut, Store } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("Cargando...");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkRoleAndFetchShop = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // Verificamos que sea un cliente (o vos como super_admin espiando)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || (profile.role !== 'client' && profile.role !== 'super_admin')) { 
        router.push("/login"); 
        return; 
      }

      // Buscamos el nombre de SU restaurante para mostrarlo en el menú
      const { data: shop } = await supabase
        .from('restaurants')
        .select('name')
        .eq('owner_id', session.user.id)
        .single();

      if (shop) setRestaurantName(shop.name);

      setLoading(false);
    };
    checkRoleAndFetchShop();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const menuItems = [
    { name: "Resumen", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Categorías", icon: ListTree, href: "/dashboard/categories" },
    { name: "Platos & Productos", icon: UtensilsCrossed, href: "/dashboard/products" },
    { name: "Mi Local", icon: Store, href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex">
      {/* Sidebar del Cliente */}
      <aside className="w-64 border-r border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#0B0F19]/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Panel de Control</span>
            <span className="font-black text-xl tracking-tight dark:text-white text-slate-900 leading-none truncate">
              {restaurantName}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group font-bold ${
                  isActive 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:text-emerald-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5">
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
            className="flex items-center gap-4 px-4 py-3.5 w-full text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors font-bold rounded-2xl hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenedor Principal Alineado a la Izquierda (Igual que el Admin) */}
      <main className="flex-1 h-screen overflow-y-auto transition-colors duration-500">
        {/* Cambiamos el pr-32 por pr-16 para que sea simétrico y agregamos w-full */}
        <div className="p-8 md:p-12 lg:px-16 w-full"> 
          <div className="w-full"> 
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}