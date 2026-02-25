import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
      <h1 className="text-4xl font-bold mb-4">QResto</h1>
      <p className="text-lg text-slate-600 mb-8">La landing page comercial irá acá.</p>
      
      {/* Botón temporal para ir al panel mientras desarrollamos */}
      <Link 
        href="/admin" 
        className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition"
      >
        Ir al Panel de Administración
      </Link>
    </div>
  );
}