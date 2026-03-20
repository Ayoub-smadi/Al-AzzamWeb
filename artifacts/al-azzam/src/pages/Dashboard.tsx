import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { usePropertiesList, useCreatePropertyMutation, useUpdatePropertyMutation, useDeletePropertyMutation } from "@/hooks/use-properties";
import { useBookingsList, useDashboardStats, useDeleteBookingMutation } from "@/hooks/use-bookings";
import { useSiteSettings, useUpdateSettings, uploadPropertyImage, type SocialLink } from "@/hooks/use-settings";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { Building, BookmarkCheck, Trash2, Edit, Plus, RefreshCcw, Settings, Upload, X, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Property } from "@workspace/api-client-react";
import {
  FaWhatsapp, FaInstagram, FaFacebook, FaTelegram,
  FaSnapchat, FaTiktok, FaYoutube, FaLinkedin, FaXTwitter
} from "react-icons/fa6";

const SOCIAL_PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp, color: "#25D366" },
  { id: "instagram", label: "Instagram", Icon: FaInstagram, color: "#E1306C" },
  { id: "twitter", label: "X (Twitter)", Icon: FaXTwitter, color: "#000" },
  { id: "facebook", label: "Facebook", Icon: FaFacebook, color: "#1877F2" },
  { id: "tiktok", label: "TikTok", Icon: FaTiktok, color: "#010101" },
  { id: "snapchat", label: "Snapchat", Icon: FaSnapchat, color: "#FFFC00" },
  { id: "telegram", label: "Telegram", Icon: FaTelegram, color: "#2CA5E0" },
  { id: "youtube", label: "YouTube", Icon: FaYoutube, color: "#FF0000" },
  { id: "linkedin", label: "LinkedIn", Icon: FaLinkedin, color: "#0A66C2" },
];

export function getSocialIcon(platform: string) {
  return SOCIAL_PLATFORMS.find(p => p.id === platform);
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'settings'>('properties');
  const { data: stats, refetch: refetchStats } = useDashboardStats();

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!user || user.role !== 'admin') return <Redirect to="/login" />;

  return (
    <div className="min-h-screen bg-muted/20 pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display">{t("لوحة التحكم", "Admin Dashboard")}</h1>
            <p className="text-muted-foreground">{t(`مرحباً بك، ${user.name}`, `Welcome back, ${user.name}`)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchStats()}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            {t("تحديث", "Refresh")}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("إجمالي العقارات", "Total Properties")}</h3>
            <p className="text-3xl font-bold text-foreground">{stats?.totalProperties || 0}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("عقارات متاحة", "Available")}</h3>
            <p className="text-3xl font-bold text-emerald-600">{stats?.availableProperties || 0}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("عقارات مباعة", "Sold")}</h3>
            <p className="text-3xl font-bold text-destructive">{stats?.soldProperties || 0}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("الحجوزات", "Total Bookings")}</h3>
            <p className="text-3xl font-bold text-primary">{stats?.totalBookings || 0}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b pb-4 flex-wrap">
          <TabBtn active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} icon={<Building className="w-4 h-4" />} label={t("إدارة العقارات", "Properties")} />
          <TabBtn active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<BookmarkCheck className="w-4 h-4" />} label={t("طلبات الحجز", "Bookings")} badge={stats && stats.recentBookings > 0 ? String(stats.recentBookings) : undefined} />
          <TabBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-4 h-4" />} label={t("إعدادات الموقع", "Site Settings")} />
        </div>

        {activeTab === 'properties' && <PropertiesTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>
      {icon}{label}
      {badge && <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}

// ─── Properties Tab ───────────────────────────────────────────────────────────

const propertySchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  description: z.string().min(1),
  descriptionAr: z.string().min(1),
  price: z.coerce.number().min(0),
  location: z.string().min(1),
  locationAr: z.string().min(1),
  city: z.string().min(1),
  cityAr: z.string().min(1),
  type: z.enum(["land", "chalet", "apartment", "villa"]),
  status: z.enum(["available", "sold", "reserved"]),
  area: z.coerce.number().min(1),
  images: z.array(z.object({ url: z.string() })).min(1),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

function ImageUploadSlot({ url, onUrlChange, onRemove }: { url: string; onUrlChange: (url: string) => void; onRemove: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const uploadedUrl = await uploadPropertyImage(file);
      onUrlChange(uploadedUrl);
    } catch {
      alert("فشل رفع الصورة. حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group border-2 border-dashed border-border rounded-xl overflow-hidden bg-muted/30 aspect-video flex items-center justify-center">
      {url ? (
        <>
          <img src={url.startsWith("/api/") ? url : url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
              <Upload className="w-3 h-3" /> تغيير
            </button>
            <button type="button" onClick={onRemove} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
              <X className="w-3 h-3" /> حذف
            </button>
          </div>
        </>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-4">
          {uploading ? (
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <>
              <ImageIcon className="w-10 h-10" />
              <span className="text-sm">{t("انقر لرفع صورة", "Click to upload")}</span>
            </>
          )}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

function t(ar: string, _en: string) { return ar; }

function PropertiesTab() {
  const { t, lang } = useLanguage();
  const { data, isLoading } = usePropertiesList({ limit: 100 });
  const { mutate: deleteProp } = useDeletePropertyMutation();
  const { mutate: createProp } = useCreatePropertyMutation();
  const { mutate: updateProp } = useUpdatePropertyMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: { images: [{ url: "" }] }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "images" });

  const handleEdit = (p: Property) => {
    setEditingProp(p);
    form.reset({ ...p, images: p.images.map(url => ({ url })) });
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProp(null);
    form.reset({ title: "", titleAr: "", description: "", descriptionAr: "", location: "", locationAr: "", city: "", cityAr: "", price: 0, area: 0, type: "apartment", status: "available", images: [{ url: "" }] });
    setModalOpen(true);
  };

  const onSubmit = (values: PropertyFormValues) => {
    const apiData = { ...values, images: values.images.filter(img => img.url).map(img => img.url) };
    if (editingProp) {
      updateProp({ id: editingProp.id, data: apiData }, { onSuccess: () => setModalOpen(false) });
    } else {
      createProp({ data: apiData }, { onSuccess: () => setModalOpen(false) });
    }
  };

  const statusColors = { available: 'success', reserved: 'warning', sold: 'destructive' } as const;

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-muted/30">
        <h2 className="font-semibold text-lg">{t("قائمة العقارات", "Properties List")}</h2>
        <Button onClick={handleAdd} size="sm"><Plus className="w-4 h-4 mr-1" /> {t("إضافة عقار", "Add Property")}</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="px-6 py-4">{t("الصورة", "Image")}</th>
              <th className="px-6 py-4">{t("العنوان", "Title")}</th>
              <th className="px-6 py-4">{t("النوع", "Type")}</th>
              <th className="px-6 py-4">{t("السعر", "Price")}</th>
              <th className="px-6 py-4">{t("الحالة", "Status")}</th>
              <th className="px-6 py-4 text-center">{t("إجراءات", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : data?.properties.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  {p.images[0] && <img src={p.images[0]} alt="" className="w-14 h-10 object-cover rounded-lg" />}
                </td>
                <td className="px-6 py-4 font-medium">{lang === 'ar' ? p.titleAr : p.title}</td>
                <td className="px-6 py-4 uppercase text-xs">{p.type}</td>
                <td className="px-6 py-4 font-medium text-primary" dir="ltr">{formatPrice(p.price, lang)}</td>
                <td className="px-6 py-4"><Badge variant={statusColors[p.status]}>{p.status}</Badge></td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="w-4 h-4 text-blue-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm('هل أنت متأكد؟')) deleteProp({ id: p.id }); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>{editingProp ? t("تعديل عقار", "Edit Property") : t("إضافة عقار جديد", "Add New Property")}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto px-1 pb-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs mb-1 block">العنوان (AR)</label><Input {...form.register("titleAr")} dir="rtl" /></div>
              <div><label className="text-xs mb-1 block">Title (EN)</label><Input {...form.register("title")} dir="ltr" /></div>
              <div><label className="text-xs mb-1 block">المدينة (AR)</label><Input {...form.register("cityAr")} dir="rtl" /></div>
              <div><label className="text-xs mb-1 block">City (EN)</label><Input {...form.register("city")} dir="ltr" /></div>
              <div><label className="text-xs mb-1 block">الموقع (AR)</label><Input {...form.register("locationAr")} dir="rtl" /></div>
              <div><label className="text-xs mb-1 block">Location (EN)</label><Input {...form.register("location")} dir="ltr" /></div>
              <div className="col-span-2"><label className="text-xs mb-1 block">الوصف (AR)</label><textarea {...form.register("descriptionAr")} className="w-full border rounded-xl p-2 min-h-20 text-sm bg-background" dir="rtl" /></div>
              <div className="col-span-2"><label className="text-xs mb-1 block">Description (EN)</label><textarea {...form.register("description")} className="w-full border rounded-xl p-2 min-h-20 text-sm bg-background" dir="ltr" /></div>
              <div><label className="text-xs mb-1 block">السعر (ر.س)</label><Input type="number" {...form.register("price")} dir="ltr" /></div>
              <div><label className="text-xs mb-1 block">المساحة (م²)</label><Input type="number" {...form.register("area")} dir="ltr" /></div>
              <div>
                <label className="text-xs mb-1 block">النوع</label>
                <select {...form.register("type")} className="w-full border rounded-xl p-2 h-12 text-sm bg-background">
                  <option value="land">أرض (Land)</option>
                  <option value="chalet">شاليه (Chalet)</option>
                  <option value="apartment">شقة (Apartment)</option>
                  <option value="villa">فيلا (Villa)</option>
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block">الحالة</label>
                <select {...form.register("status")} className="w-full border rounded-xl p-2 h-12 text-sm bg-background">
                  <option value="available">متاح (Available)</option>
                  <option value="reserved">محجوز (Reserved)</option>
                  <option value="sold">مباع (Sold)</option>
                </select>
              </div>

              <div className="col-span-2 border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold">صور العقار</label>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "" })}>
                    <Plus className="w-3 h-3 mr-1" /> إضافة صورة
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {fields.map((field, index) => (
                    <ImageUploadSlot
                      key={field.id}
                      url={form.watch(`images.${index}.url`) || ""}
                      onUrlChange={(url) => form.setValue(`images.${index}.url`, url)}
                      onRemove={() => remove(index)}
                    />
                  ))}
                </div>
                {form.formState.errors.images && <p className="text-red-500 text-xs mt-1">يجب إضافة صورة واحدة على الأقل</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base">{t("حفظ العقار", "Save Property")}</Button>
          </form>
        </div>
      </Dialog>
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────

function BookingsTab() {
  const { t, lang } = useLanguage();
  const { data, isLoading } = useBookingsList({ limit: 50 });
  const { mutate: deleteBooking } = useDeleteBookingMutation();

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h2 className="font-semibold text-lg">{t("طلبات الحجز", "Booking Requests")}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="px-6 py-4">{t("التاريخ", "Date")}</th>
              <th className="px-6 py-4">{t("الاسم", "Name")}</th>
              <th className="px-6 py-4">{t("الهاتف", "Phone")}</th>
              <th className="px-6 py-4">{t("العقار", "Property")}</th>
              <th className="px-6 py-4">{t("رسالة", "Message")}</th>
              <th className="px-6 py-4 text-center">{t("إجراءات", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : data?.bookings?.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No bookings</td></tr>
            ) : data?.bookings.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap" dir="ltr">{new Date(b.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 font-medium">{b.name}</td>
                <td className="px-6 py-4" dir="ltr">{b.phone}</td>
                <td className="px-6 py-4 text-primary font-medium">{b.property ? (lang === 'ar' ? b.property.titleAr : b.property.title) : `ID: ${b.propertyId}`}</td>
                <td className="px-6 py-4 max-w-[200px] truncate">{b.message || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm('حذف؟')) deleteBooking({ id: b.id }); }}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { data: settings, isLoading } = useSiteSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const [saved, setSaved] = useState(false);
  const [newLink, setNewLink] = useState({ platform: "whatsapp", url: "" });

  const [form, setForm] = useState<Record<string, string>>({});

  const getValue = (key: string) => form[key] ?? (settings?.[key] || "");
  const setValue = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const socialLinks: SocialLink[] = (() => {
    try { return JSON.parse(getValue("social_links") || "[]"); } catch { return []; }
  })();

  const addLink = () => {
    if (!newLink.url) return;
    const updated = [...socialLinks, { platform: newLink.platform, url: newLink.url }];
    setValue("social_links", JSON.stringify(updated));
    setNewLink({ platform: "whatsapp", url: "" });
  };

  const removeLink = (index: number) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    setValue("social_links", JSON.stringify(updated));
  };

  const handleSave = () => {
    updateSettings(form, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setForm({});
      }
    });
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">✅ تم حفظ الإعدادات بنجاح</div>}

      {/* Hero Section */}
      <SettingsCard title="قسم الهيرو (الصفحة الرئيسية)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingField label="عنوان الهيرو (عربي)" value={getValue("hero_title_ar")} onChange={v => setValue("hero_title_ar", v)} dir="rtl" />
          <SettingField label="Hero Title (English)" value={getValue("hero_title_en")} onChange={v => setValue("hero_title_en", v)} dir="ltr" />
          <SettingField label="وصف الهيرو (عربي)" value={getValue("hero_subtitle_ar")} onChange={v => setValue("hero_subtitle_ar", v)} dir="rtl" multiline />
          <SettingField label="Hero Subtitle (English)" value={getValue("hero_subtitle_en")} onChange={v => setValue("hero_subtitle_en", v)} dir="ltr" multiline />
        </div>
      </SettingsCard>

      {/* Contact Info */}
      <SettingsCard title="معلومات التواصل">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingField label="العنوان (عربي)" value={getValue("contact_address_ar")} onChange={v => setValue("contact_address_ar", v)} dir="rtl" />
          <SettingField label="Address (English)" value={getValue("contact_address_en")} onChange={v => setValue("contact_address_en", v)} dir="ltr" />
          <SettingField label="البريد الإلكتروني" value={getValue("contact_email")} onChange={v => setValue("contact_email", v)} dir="ltr" />
          <SettingField label="رقم الهاتف" value={getValue("contact_phone")} onChange={v => setValue("contact_phone", v)} dir="ltr" />
        </div>
      </SettingsCard>

      {/* Footer About */}
      <SettingsCard title="نص الفوتر (عن الشركة)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingField label="نص التعريف (عربي)" value={getValue("footer_about_ar")} onChange={v => setValue("footer_about_ar", v)} dir="rtl" multiline />
          <SettingField label="About Text (English)" value={getValue("footer_about_en")} onChange={v => setValue("footer_about_en", v)} dir="ltr" multiline />
        </div>
      </SettingsCard>

      {/* Social Links */}
      <SettingsCard title="روابط التواصل الاجتماعي">
        <div className="space-y-3 mb-4">
          {socialLinks.map((link, i) => {
            const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
            return (
              <div key={i} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                {platform && <platform.Icon className="w-5 h-5 shrink-0" style={{ color: platform.color }} />}
                <span className="text-sm font-medium w-24 shrink-0">{platform?.label}</span>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-primary flex items-center gap-1 truncate flex-1">
                  {link.url} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}>
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            );
          })}
          {socialLinks.length === 0 && <p className="text-sm text-muted-foreground py-2">لا توجد روابط مضافة بعد</p>}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-3">إضافة رابط جديد</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">المنصة</label>
              <select value={newLink.platform} onChange={e => setNewLink(p => ({ ...p, platform: e.target.value }))} className="border rounded-xl p-2 h-10 text-sm bg-background min-w-36">
                {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="text-xs text-muted-foreground block mb-1">الرابط</label>
              <Input value={newLink.url} onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))} placeholder="https://..." dir="ltr" />
            </div>
            <Button type="button" onClick={addLink} disabled={!newLink.url}>
              <Plus className="w-4 h-4 mr-1" /> إضافة
            </Button>
          </div>
        </div>
      </SettingsCard>

      <Button onClick={handleSave} disabled={isPending} className="w-full h-12 text-base">
        {isPending ? "جاري الحفظ..." : "💾 حفظ جميع الإعدادات"}
      </Button>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-2xl shadow-sm p-6">
      <h3 className="font-semibold text-base mb-4 pb-3 border-b">{title}</h3>
      {children}
    </div>
  );
}

function SettingField({ label, value, onChange, dir, multiline }: { label: string; value: string; onChange: (v: string) => void; dir?: string; multiline?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} className="w-full border rounded-xl p-3 min-h-24 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary" dir={dir} />
      ) : (
        <Input value={value} onChange={e => onChange(e.target.value)} dir={dir} className="h-10" />
      )}
    </div>
  );
}
