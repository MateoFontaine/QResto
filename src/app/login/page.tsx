"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Si tenés un estado de carga
    setError(""); // Si tenés un estado de error

    try {
      // 1. Iniciamos sesión en Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Si entró bien, buscamos qué rol tiene este usuario
      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        // 3. El Agente de Tránsito: mandamos a cada uno a su búnker
        if (profile.role === 'super_admin') {
          router.push('/admin');
        } else if (profile.role === 'client') {
          router.push('/dashboard');
        } else if (profile.role === 'reseller') {
          // A futuro, cuando armemos el panel de revendedores
          router.push('/reseller'); 
        } else {
          // Por si las dudas
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] p-4">
      
      {/* Luces de fondo (Glow Effect) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px]"></div>
      </div>

      {/* Tarjeta de Login */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-md shadow-xl shadow-slate-200/20 dark:shadow-none">
        
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white font-bold text-2xl">Q</span>
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Ingresar</h1>
          <p className="text-slate-500 text-sm">Panel de administración QResto</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium dark:text-slate-300">Correo electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white dark:bg-[#0B0F19]/50 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium dark:text-slate-300">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white dark:bg-[#0B0F19]/50 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>

      </div>
    </div>
  );
}