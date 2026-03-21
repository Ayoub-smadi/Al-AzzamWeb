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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/utils";
import {
  Building2, BookmarkCheck, Settings, Trash2, Edit, Plus,
  RefreshCcw, Upload, X, ExternalLink, Image as ImageIcon,
  LayoutDashboard, ChevronLeft, MapPin, DollarSign, FileText, Camera,
  Home, BarChart3, Bell
} from "lucide-react";
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

function getSocialIcon(platform: string) {
  return SOCIAL_PLATFORMS.find(p => p.id === platform);
}

type ActiveTab = 'properties' | 'bookings' | 'settings';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('properties');
  const { data: stats, refetch: refetchStats } = useDashboardStats();

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (!user || user.role !== 'admin') return <Redirect to="/login" />;

  const navItems = [
    { id: 'properties' as ActiveTab, icon: Building2, label: t("إدارة العقارات", "Properties") },
    { id: 'bookings' as ActiveTab, icon: BookmarkCheck, label: t("طلبات الحجز", "Bookings"), badge: stats && stats.recentBookings > 0 ? String(stats.recentBookings) : undefined },
    { id: 'settings' as ActiveTab, icon: Settings, label: t("إعدادات الموقع", "Settings") },
  ];

  return (
    <div className="min-h-screen bg-muted/20 pt-16 flex" dir="rtl">
      {/* ── Sidebar ── */}
      <aside className="w-64 min-h-[calc(100vh-4rem)] bg-card border-l shadow-sm flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
        {/* Sidebar Header */}
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">ع</div>
            <div>
              <p className="font-bold text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{t("مدير النظام", "Admin")}</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-right">{label}</span>
              {badge && (
                <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Stats at bottom */}
        <div className="p-3 border-t space-y-2">
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{stats?.totalProperties || 0}</p>
            <p className="text-xs text-muted-foreground">{t("إجمالي العقارات", "Properties")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 rounded-xl p-2 text-center">
              <p className="text-lg font-bold text-emerald-600">{stats?.availableProperties || 0}</p>
              <p className="text-xs text-emerald-600">{t("متاح", "Available")}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-2 text-center">
              <p className="text-lg font-bold text-red-500">{stats?.totalBookings || 0}</p>
              <p className="text-xs text-red-500">{t("حجوزات", "Bookings")}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display">
              {activeTab === 'properties' && t("إدارة العقارات", "Properties")}
              {activeTab === 'bookings' && t("طلبات الحجز", "Booking Requests")}
              {activeTab === 'settings' && t("إعدادات الموقع", "Site Settings")}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {t(`مرحباً، ${user.name}`, `Welcome, ${user.name}`)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchStats()} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            {t("تحديث", "Refresh")}
          </Button>
        </div>

        {activeTab === 'properties' && <PropertiesTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

// ─── Property Form Schema ───────────────────────────────────────────────────

const propertySchema = z.object({
  title: z.string().min(1, "مطلوب"),
  titleAr: z.string().min(1, "مطلوب"),
  description: z.string().min(1, "مطلوب"),
  descriptionAr: z.string().min(1, "مطلوب"),
  price: z.coerce.number().min(0),
  location: z.string().min(1, "مطلوب"),
  locationAr: z.string().min(1, "مطلوب"),
  city: z.string().min(1, "مطلوب"),
  cityAr: z.string().min(1, "مطلوب"),
  type: z.enum(["land", "chalet", "apartment", "villa"]),
  status: z.enum(["available", "sold", "reserved"]),
  area: z.coerce.number().min(1),
  images: z.array(z.object({ url: z.string() })),
});
type PropertyFormValues = z.infer<typeof propertySchema>;

// ─── Image Upload Slot ──────────────────────────────────────────────────────

function ImageUploadSlot({ url, onUrlChange, onRemove }: { url: string; onUrlChange: (url: string) => void; onRemove: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const uploadedUrl = await uploadPropertyImage(file);
      onUrlChange(uploadedUrl);
    } catch {
      alert("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group border-2 border-dashed border-border rounded-xl overflow-hidden bg-muted/20 aspect-video flex items-center justify-center">
      {url ? (
        <>
          <img src={url} alt="" className="w-full h-full object-cover" />
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
          {uploading
            ? <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            : <><ImageIcon className="w-10 h-10" /><span className="text-sm">رفع صورة</span></>
          }
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

function t(ar: string, _en: string) { return ar; }

// ─── Properties Tab ─────────────────────────────────────────────────────────

function PropertiesTab() {
  const { t, lang } = useLanguage();
  const { data, isLoading } = usePropertiesList({ limit: 100 });
  const { mutate: deleteProp } = useDeletePropertyMutation();
  const { mutate: createProp, isPending: creating } = useCreatePropertyMutation();
  const { mutate: updateProp, isPending: updating } = useUpdatePropertyMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: { type: "villa", status: "available", images: [] }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "images" });

  const openEdit = (p: Property) => {
    setEditingProp(p);
    form.reset({ ...p, images: p.images.map(url => ({ url })) });
    setActiveSection(0);
    setSheetOpen(true);
  };

  const openAdd = () => {
    setEditingProp(null);
    form.reset({ title: "", titleAr: "", description: "", descriptionAr: "", location: "", locationAr: "", city: "", cityAr: "", price: 0, area: 0, type: "villa", status: "available", images: [] });
    setActiveSection(0);
    setSheetOpen(true);
  };

  const onSubmit = (values: PropertyFormValues) => {
    const apiData = { ...values, images: values.images.filter(img => img.url).map(img => img.url) };
    if (editingProp) {
      updateProp({ id: editingProp.id, data: apiData }, { onSuccess: () => setSheetOpen(false) });
    } else {
      createProp({ data: apiData }, { onSuccess: () => setSheetOpen(false) });
    }
  };

  const statusConfig = {
    available: { label: "متاح", variant: "success" as const, bg: "bg-emerald-50 text-emerald-700" },
    reserved: { label: "محجوز", variant: "warning" as const, bg: "bg-amber-50 text-amber-700" },
    sold: { label: "مباع", variant: "destructive" as const, bg: "bg-red-50 text-red-700" },
  };

  const typeLabels: Record<string, string> = { villa: "فيلا", apartment: "شقة", chalet: "شاليه", land: "أرض" };

  const formSections = [
    { label: "المعلومات الأساسية", icon: FileText },
    { label: "الموقع والتفاصيل", icon: MapPin },
    { label: "الوصف", icon: FileText },
    { label: "الصور", icon: Camera },
  ];

  const isPending = creating || updating;

  return (
    <>
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-l from-primary/5 to-transparent">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="font-bold">{t("قائمة العقارات", "Properties List")}</h2>
            {data && <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{data.properties.length}</span>}
          </div>
          <Button onClick={openAdd} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> {t("إضافة عقار", "Add Property")}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs bg-muted/40 text-muted-foreground border-b">
              <tr>
                <th className="px-5 py-3 text-right">الصورة</th>
                <th className="px-5 py-3 text-right">العنوان</th>
                <th className="px-5 py-3 text-right">النوع</th>
                <th className="px-5 py-3 text-right">السعر</th>
                <th className="px-5 py-3 text-right">المدينة</th>
                <th className="px-5 py-3 text-right">الحالة</th>
                <th className="px-5 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <div className="flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
                </td></tr>
              ) : data?.properties.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-muted-foreground">لا توجد عقارات</td></tr>
              ) : data?.properties.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    {p.images[0]
                      ? <img src={p.images[0]} alt="" className="w-16 h-11 object-cover rounded-lg border" />
                      : <div className="w-16 h-11 bg-muted rounded-lg flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>
                    }
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-foreground">{lang === 'ar' ? p.titleAr : p.title}</p>
                    <p className="text-xs text-muted-foreground">{lang === 'ar' ? p.title : p.titleAr}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-lg">
                      {typeLabels[p.type] || p.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-bold text-primary" dir="ltr">{formatPrice(p.price, lang)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lang === 'ar' ? p.cityAr : p.city}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[p.status]?.bg}`}>
                      {statusConfig[p.status]?.label || p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50" onClick={() => openEdit(p)}>
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => { if (confirm('هل أنت متأكد من حذف هذا العقار؟')) deleteProp({ id: p.id }); }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Property Edit/Add Sheet ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-2xl p-0 flex flex-col" dir="rtl">
          <SheetHeader className="px-6 py-4 border-b bg-gradient-to-l from-primary/5 to-transparent shrink-0">
            <SheetTitle className="flex items-center gap-2 text-right">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              {editingProp ? t("تعديل العقار", "Edit Property") : t("إضافة عقار جديد", "Add Property")}
            </SheetTitle>
          </SheetHeader>

          {/* Section Tabs */}
          <div className="flex border-b bg-muted/30 shrink-0 overflow-x-auto">
            {formSections.map((section, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSection(i)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  activeSection === i
                    ? 'border-primary text-primary bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <section.icon className="w-3.5 h-3.5" />
                {section.label}
              </button>
            ))}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* Section 0: Basic Info */}
              {activeSection === 0 && (
                <div className="space-y-5">
                  <SectionHeading icon={FileText} title="العنوان" />
                  <FormRow>
                    <Field label="العنوان بالعربي *" error={form.formState.errors.titleAr?.message}>
                      <Input {...form.register("titleAr")} dir="rtl" placeholder="فيلا فاخرة في حي النرجس" />
                    </Field>
                    <Field label="Title in English *" error={form.formState.errors.title?.message}>
                      <Input {...form.register("title")} dir="ltr" placeholder="Luxury Villa in Al-Narjis" />
                    </Field>
                  </FormRow>

                  <SectionHeading icon={DollarSign} title="التسعير والمواصفات" />
                  <FormRow>
                    <Field label="السعر (ر.س) *" error={form.formState.errors.price?.message}>
                      <Input type="number" {...form.register("price")} dir="ltr" placeholder="0" />
                    </Field>
                    <Field label="المساحة (م²) *" error={form.formState.errors.area?.message}>
                      <Input type="number" {...form.register("area")} dir="ltr" placeholder="0" />
                    </Field>
                  </FormRow>

                  <FormRow>
                    <Field label="نوع العقار *">
                      <select {...form.register("type")} className="w-full border rounded-xl px-3 h-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="villa">🏠 فيلا</option>
                        <option value="apartment">🏢 شقة</option>
                        <option value="chalet">🏡 شاليه</option>
                        <option value="land">🏗️ أرض</option>
                      </select>
                    </Field>
                    <Field label="حالة العقار *">
                      <select {...form.register("status")} className="w-full border rounded-xl px-3 h-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="available">✅ متاح</option>
                        <option value="reserved">🔒 محجوز</option>
                        <option value="sold">🏷️ مباع</option>
                      </select>
                    </Field>
                  </FormRow>
                </div>
              )}

              {/* Section 1: Location */}
              {activeSection === 1 && (
                <div className="space-y-5">
                  <SectionHeading icon={MapPin} title="المدينة" />
                  <FormRow>
                    <Field label="المدينة بالعربي *" error={form.formState.errors.cityAr?.message}>
                      <Input {...form.register("cityAr")} dir="rtl" placeholder="الرياض" />
                    </Field>
                    <Field label="City in English *" error={form.formState.errors.city?.message}>
                      <Input {...form.register("city")} dir="ltr" placeholder="Riyadh" />
                    </Field>
                  </FormRow>

                  <SectionHeading icon={MapPin} title="الموقع التفصيلي" />
                  <FormRow>
                    <Field label="الحي / الموقع بالعربي *" error={form.formState.errors.locationAr?.message}>
                      <Input {...form.register("locationAr")} dir="rtl" placeholder="حي النرجس" />
                    </Field>
                    <Field label="Location in English *" error={form.formState.errors.location?.message}>
                      <Input {...form.register("location")} dir="ltr" placeholder="Al-Narjis District" />
                    </Field>
                  </FormRow>
                </div>
              )}

              {/* Section 2: Description */}
              {activeSection === 2 && (
                <div className="space-y-5">
                  <Field label="الوصف بالعربي *" error={form.formState.errors.descriptionAr?.message}>
                    <textarea
                      {...form.register("descriptionAr")}
                      dir="rtl"
                      rows={6}
                      placeholder="اكتب وصفاً تفصيلياً للعقار بالعربي..."
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </Field>
                  <Field label="Description in English *" error={form.formState.errors.description?.message}>
                    <textarea
                      {...form.register("description")}
                      dir="ltr"
                      rows={6}
                      placeholder="Write a detailed description of the property in English..."
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </Field>
                </div>
              )}

              {/* Section 3: Images */}
              {activeSection === 3 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">صور العقار</p>
                      <p className="text-xs text-muted-foreground">{fields.length} صورة مضافة</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "" })} className="gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> إضافة صورة
                    </Button>
                  </div>
                  {fields.length === 0 && (
                    <div className="border-2 border-dashed rounded-xl p-10 text-center">
                      <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">لا توجد صور. اضغط "إضافة صورة" للبدء</p>
                    </div>
                  )}
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
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t bg-muted/20 flex gap-3 shrink-0">
              <Button type="submit" className="flex-1 h-11" disabled={isPending}>
                {isPending
                  ? <><div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" /> جاري الحفظ...</>
                  : editingProp ? "💾 حفظ التعديلات" : "➕ إضافة العقار"
                }
              </Button>
              {activeSection > 0 && (
                <Button type="button" variant="outline" className="h-11 px-6" onClick={() => setActiveSection(s => s - 1)}>
                  التالي ›
                </Button>
              )}
              {activeSection < formSections.length - 1 && (
                <Button type="button" variant="outline" className="h-11 px-6" onClick={() => setActiveSection(s => s + 1)}>
                  ‹ السابق
                </Button>
              )}
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── Helper Form Components ─────────────────────────────────────────────────

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-primary/20 pb-2">
      <Icon className="w-4 h-4" />
      {title}
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
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
      <div className="p-4 border-b flex items-center gap-2 bg-gradient-to-l from-primary/5 to-transparent">
        <BookmarkCheck className="w-5 h-5 text-primary" />
        <h2 className="font-bold">{t("طلبات الحجز", "Booking Requests")}</h2>
        {data?.bookings && <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{data.bookings.length}</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs bg-muted/40 text-muted-foreground border-b">
            <tr>
              <th className="px-5 py-3 text-right">{t("التاريخ", "Date")}</th>
              <th className="px-5 py-3 text-right">{t("الاسم", "Name")}</th>
              <th className="px-5 py-3 text-right">{t("الهاتف", "Phone")}</th>
              <th className="px-5 py-3 text-right">{t("العقار", "Property")}</th>
              <th className="px-5 py-3 text-right">{t("رسالة", "Message")}</th>
              <th className="px-5 py-3 text-center">{t("حذف", "Delete")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center">
                <div className="flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
              </td></tr>
            ) : data?.bookings?.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-muted-foreground">
                <BookmarkCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                لا توجد طلبات حجز
              </td></tr>
            ) : data?.bookings.map((b) => (
              <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap" dir="ltr">
                  {new Date(b.createdAt).toLocaleDateString('ar-SA')}
                </td>
                <td className="px-5 py-3 font-semibold">{b.name}</td>
                <td className="px-5 py-3 text-muted-foreground" dir="ltr">{b.phone}</td>
                <td className="px-5 py-3 text-primary font-medium">
                  {b.property ? (lang === 'ar' ? b.property.titleAr : b.property.title) : `#${b.propertyId}`}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {b.property?.images?.[0] ? (
                      <img src={b.property.images[0]} alt="" className="w-14 h-10 object-cover rounded-lg border shrink-0" />
                    ) : (
                      <div className="w-14 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <p className="truncate text-muted-foreground max-w-[160px] text-sm">{b.message || '—'}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => { if (confirm('حذف هذا الطلب؟')) deleteBooking({ id: b.id }); }}>
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
    <div className="space-y-5">
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          ✅ تم حفظ الإعدادات بنجاح
        </div>
      )}

      <SettingsCard title="قسم الصفحة الرئيسية (الهيرو)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingField label="عنوان الهيرو (عربي)" value={getValue("hero_title_ar")} onChange={v => setValue("hero_title_ar", v)} dir="rtl" />
          <SettingField label="Hero Title (English)" value={getValue("hero_title_en")} onChange={v => setValue("hero_title_en", v)} dir="ltr" />
          <SettingField label="وصف الهيرو (عربي)" value={getValue("hero_subtitle_ar")} onChange={v => setValue("hero_subtitle_ar", v)} dir="rtl" multiline />
          <SettingField label="Hero Subtitle (English)" value={getValue("hero_subtitle_en")} onChange={v => setValue("hero_subtitle_en", v)} dir="ltr" multiline />
        </div>
      </SettingsCard>

      <SettingsCard title="معلومات التواصل">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingField label="العنوان (عربي)" value={getValue("contact_address_ar")} onChange={v => setValue("contact_address_ar", v)} dir="rtl" />
          <SettingField label="Address (English)" value={getValue("contact_address_en")} onChange={v => setValue("contact_address_en", v)} dir="ltr" />
          <SettingField label="البريد الإلكتروني" value={getValue("contact_email")} onChange={v => setValue("contact_email", v)} dir="ltr" />
          <SettingField label="رقم الهاتف" value={getValue("contact_phone")} onChange={v => setValue("contact_phone", v)} dir="ltr" />
        </div>
      </SettingsCard>

      <SettingsCard title="نص التعريف (الفوتر)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingField label="التعريف (عربي)" value={getValue("footer_about_ar")} onChange={v => setValue("footer_about_ar", v)} dir="rtl" multiline />
          <SettingField label="About Text (English)" value={getValue("footer_about_en")} onChange={v => setValue("footer_about_en", v)} dir="ltr" multiline />
        </div>
      </SettingsCard>

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
          {socialLinks.length === 0 && <p className="text-sm text-muted-foreground py-2">لا توجد روابط مضافة</p>}
        </div>
        <div className="border-t pt-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">المنصة</label>
            <select value={newLink.platform} onChange={e => setNewLink(p => ({ ...p, platform: e.target.value }))} className="border rounded-xl px-3 h-10 text-sm bg-background min-w-36">
              {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="text-xs text-muted-foreground block mb-1">الرابط</label>
            <Input value={newLink.url} onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))} placeholder="https://..." dir="ltr" />
          </div>
          <Button type="button" onClick={addLink} variant="outline" className="gap-1.5 h-10">
            <Plus className="w-4 h-4" /> إضافة
          </Button>
        </div>
      </SettingsCard>

      <Button onClick={handleSave} className="w-full h-12 text-base" disabled={isPending}>
        {isPending ? "جاري الحفظ..." : "💾 حفظ جميع الإعدادات"}
      </Button>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/30 font-semibold text-sm">{title}</div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SettingField({ label, value, onChange, dir, multiline }: { label: string; value: string; onChange: (v: string) => void; dir?: string; multiline?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} dir={dir} rows={3} className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        : <Input value={value} onChange={e => onChange(e.target.value)} dir={dir} />
      }
    </div>
  );
}
