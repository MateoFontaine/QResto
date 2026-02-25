export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 relative overflow-hidden">
      
      {/* Luces de fondo (Glow Effect) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 dark:bg-violet-600/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/20 dark:bg-fuchsia-600/20 blur-[120px]"></div>
      </div>

      {/* Navbar Glassmorphism */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0B0F19]/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-2xl tracking-tighter">Q</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
                QResto
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Super Admin</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Control <span className="text-violet-500">Total.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl">
              Gestioná tus licencias, habilitá módulos premium y monitoreá el crecimiento de la plataforma en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { titulo: "Locales Activos", valor: "0", color: "text-emerald-500" },
              { titulo: "Revendedores", valor: "0", color: "text-blue-500" },
              { titulo: "MRR Estimado", valor: "$0", color: "text-fuchsia-500" }
            ].map((item) => (
              <div 
                key={item.titulo} 
                className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-md shadow-xl shadow-slate-200/20 dark:shadow-none"
              >
                <div className="flex flex-col gap-1">
                  <span className={`text-4xl font-black ${item.color}`}>{item.valor}</span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.titulo}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}