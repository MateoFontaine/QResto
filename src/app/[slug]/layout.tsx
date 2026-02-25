// src/app/[slug]/layout.tsx
import { Metadata } from 'next';
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;

  // Traemos los datos del restaurante para el SEO e Iconos
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, logo_url')
    .eq('slug', slug)
    .single();

  // Si no existe el restaurante, ponemos valores genéricos
  const name = restaurant?.name || 'Restaurante';
  const logo = restaurant?.logo_url || '/favicon.ico'; // Tu icono por defecto de Next.js

  return {
    // Esto es lo que aparece en el texto de la pestaña
    title: {
      default: name,
      template: `%s | ${name}`, // Por si navegás a subpáginas
    },
    description: `Explorá la carta online de ${name}. ¡Mirá nuestros platos y precios acá!`,
    
    // ESTO CAMBIA EL LOGO EN LA PESTAÑA (Favicon dinámico)
    icons: {
      icon: logo,
      apple: logo, // Para cuando guardan el link en el iPhone
    },

    // Esto es lo que ven en WhatsApp/Instagram
    openGraph: {
      title: `Menú Digital - ${name}`,
      description: `Mirá nuestra carta actualizada en tiempo real.`,
      images: [{ url: logo }],
      type: 'website',
    },
  };
}

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      {/* Aquí podrías poner un Navbar global si quisieras, 
          pero por ahora solo dejamos pasar el contenido de la page.tsx */}
      {children}
    </section>
  );
}