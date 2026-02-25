import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Iniciamos Supabase con la llave maestra (NUNCA expuesta al cliente)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { name, slug, email, password } = await request.json();

    // 1. Creamos el usuario en la autenticación de Supabase (sin pedirle confirmación de mail)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, 
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // 2. Le asignamos el rol de "client" en nuestra tabla de perfiles
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([
      { id: userId, email: email, role: 'client' }
    ]);

    if (profileError) throw profileError;

    // 3. Creamos el restaurante y lo vinculamos a este nuevo dueño
    const { error: shopError } = await supabaseAdmin.from('restaurants').insert([
      { name, slug, owner_id: userId }
    ]);

    if (shopError) throw shopError;

    return NextResponse.json({ success: true, message: '¡Local y usuario creados con éxito!' });

  } catch (error: any) {
    console.error("Error en API:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}