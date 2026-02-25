"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { LayoutDashboard, Users, Store, Settings, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (!profile || profile.role !== 'super_admin') { router.push("/login"); return; }
      setLoading(false);
    };
    checkRole();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const menuItems = [
    { name: "Inicio", icon: LayoutDashboard, href: "/admin" },
    { name: "Resellers", icon: Users, href: "/admin/resellers" },
    { name: "Locales", icon: Store, href: "/admin/shops" },
    { name: "Ajustes", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex">
      {/* Sidebar Fija */}
      <aside className="w-64 border-r border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#0B0F19]/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="font-bold text-xl tracking-tight dark:text-white text-slate-900">QResto</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:text-violet-500"}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5">
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal con Margen y Aire */}
      {/* Contenido Principal */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500">
        {/* Usamos un padding fijo a la izquierda y un ancho máximo */}
        <div className="p-8 md:p-12 lg:pl-16 lg:pr-32"> 
          <div className="max-w-6xl"> 
            {/* El contenido ahora arranca cerca de la sidebar y se extiende hacia la derecha */}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}