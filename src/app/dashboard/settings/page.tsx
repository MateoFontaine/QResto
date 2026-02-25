"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Store, Palette, Wifi, Image as ImageIcon, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Estados de Configuración
  const [brandColor, setBrandColor] = useState("#10b981");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Estados de WiFi
  const [wifiActive, setWifiActive] = useState(false);
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: shop } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', session.user.id)
        .single();

      if (shop) {
        setRestaurantId(shop.id);
        if (shop.brand_color) setBrandColor(shop.brand_color);
        if (shop.logo_url) setLogoUrl(shop.logo_url);
        if (shop.wifi_active) setWifiActive(shop.wifi_active);
        if (shop.wifi_ssid) setWifiSsid(shop.wifi_ssid);
        if (shop.wifi_password) setWifiPassword(shop.wifi_password);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!restaurantId) return;
    setSaving(true);
    setSaved(false);

    let finalLogoUrl = logoUrl;

    // Si subió un logo nuevo, lo guardamos en Storage
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${Math.random()}.${fileExt}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('menu-images').upload(filePath, logoFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('menu-images').getPublicUrl(filePath);
        finalLogoUrl = publicUrlData.publicUrl;
        setLogoUrl(finalLogoUrl);
      }
    }

    // Actualizamos la base de datos
    const { error } = await supabase
      .from('restaurants')
      .update({
        brand_color: brandColor,
        logo_url: finalLogoUrl,
        wifi_active: wifiActive,
        wifi_ssid: wifiSsid,
        wifi_password: wifiPassword,
      })
      .eq('id', restaurantId);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Ocultar el mensaje de éxito a los 3 seg
    } else {
      alert("Error al guardar la configuración.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 w-full relative pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Mi Local
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-medium">
            Personalizá la experiencia de tus clientes.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-[#0B0F19] rounded-[20px] font-black hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-xl uppercase tracking-widest disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : saved ? (
            <><CheckCircle2 className="w-5 h-5" /> Guardado</>
          ) : (
            <><Save className="w-5 h-5" /> Guardar Cambios</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        
        {/* TARJETA DE MARCA Y DISEÑO */}
        <div className="p-8 md:p-10 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Diseño y Marca
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Logo y colores de tu menú digital.</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Logo */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Logo del Comercio</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[24px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div className="relative group cursor-pointer flex-1">
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full px-5 py-4 rounded-[20px] border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <ImageIcon className="w-5 h-5" />
                    <span className="font-bold text-sm">Cambiar Imagen</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Color Principal</label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-[20px] overflow-hidden border-4 border-white dark:border-[#161B26] shadow-lg shadow-slate-200/50 dark:shadow-none flex-shrink-0">
                  <input 
                    type="color" 
                    value={brandColor} 
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="absolute -top-4 -left-4 w-32 h-32 cursor-pointer"
                  />
                </div>
                <div className="flex-1 px-5 py-4 rounded-[20px] bg-slate-50 dark:bg-white/5 border border-transparent flex justify-between items-center font-bold dark:text-white uppercase tracking-wider text-sm">
                  <span>Código HEX</span>
                  <span className="text-slate-500">{brandColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA DE WIFI (El invento de tu amigo) */}
        <div className="p-8 md:p-10 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  Burbuja de WiFi
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Evitá que los mozos pierdan tiempo.</p>
              </div>
            </div>
            
            {/* Switch Gigante */}
            <button 
              onClick={() => setWifiActive(!wifiActive)}
              className={`w-16 h-8 rounded-full transition-colors relative shadow-inner flex-shrink-0 ${wifiActive ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-md ${wifiActive ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className={`space-y-6 transition-all duration-500 flex-1 ${wifiActive ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Red (SSID)</label>
              <input 
                value={wifiSsid} 
                onChange={(e) => setWifiSsid(e.target.value)} 
                placeholder="Ej: Fibertel WiFi 5GHz" 
                className="w-full px-5 py-4 rounded-[20px] bg-slate-50 dark:bg-white/5 border border-transparent focus:border-sky-500 outline-none transition-all font-medium dark:text-white" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <input 
                type="text"
                value={wifiPassword} 
                onChange={(e) => setWifiPassword(e.target.value)} 
                placeholder="Ej: clave1234" 
                className="w-full px-5 py-4 rounded-[20px] bg-slate-50 dark:bg-white/5 border border-transparent focus:border-sky-500 outline-none transition-all font-medium dark:text-white" 
              />
            </div>
            
            <div className="mt-auto pt-6">
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-sm font-medium flex gap-3">
                <Wifi className="w-5 h-5 flex-shrink-0" />
                <p>Al activarlo, tus clientes verán un botón flotante en su pantalla para copiar la contraseña con un solo clic.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}