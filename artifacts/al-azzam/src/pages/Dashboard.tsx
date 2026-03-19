import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { usePropertiesList, useCreatePropertyMutation, useUpdatePropertyMutation, useDeletePropertyMutation } from "@/hooks/use-properties";
import { useBookingsList, useDashboardStats, useDeleteBookingMutation } from "@/hooks/use-bookings";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { Building, BookmarkCheck, Trash2, Edit, Plus, RefreshCcw } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Property } from "@workspace/api-client-react";

// Admin Dashboard Components
export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings'>('properties');
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

        {/* Stats */}
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

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b pb-4">
          <button 
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'properties' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <Building className="w-5 h-5" />
            {t("إدارة العقارات", "Properties")}
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <BookmarkCheck className="w-5 h-5" />
            {t("طلبات الحجز", "Bookings")}
            {stats && stats.recentBookings > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full ml-1">{stats.recentBookings}</span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'properties' ? <PropertiesTab /> : <BookingsTab />}

      </div>
    </div>
  );
}

// --- Properties Tab ---

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
  images: z.array(z.object({ url: z.string().url() })).min(1),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

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
    defaultValues: {
      images: [{ url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images"
  });

  const handleEdit = (p: Property) => {
    setEditingProp(p);
    form.reset({
      ...p,
      images: p.images.map(url => ({ url }))
    });
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProp(null);
    form.reset({
      title: "", titleAr: "", description: "", descriptionAr: "",
      location: "", locationAr: "", city: "", cityAr: "",
      price: 0, area: 0, type: "apartment", status: "available",
      images: [{ url: "" }]
    });
    setModalOpen(true);
  };

  const onSubmit = (values: PropertyFormValues) => {
    const apiData = {
      ...values,
      images: values.images.map(img => img.url)
    };

    if (editingProp) {
      updateProp({ id: editingProp.id, data: apiData }, {
        onSuccess: () => setModalOpen(false)
      });
    } else {
      createProp({ data: apiData }, {
        onSuccess: () => setModalOpen(false)
      });
    }
  };

  const statusColors = { available: 'success', reserved: 'warning', sold: 'destructive' } as const;

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-muted/30">
        <h2 className="font-semibold text-lg">{t("قائمة العقارات", "Properties List")}</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-1" /> {t("إضافة عقار", "Add Property")}
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="px-6 py-4">{t("العنوان", "Title")}</th>
              <th className="px-6 py-4">{t("النوع", "Type")}</th>
              <th className="px-6 py-4">{t("السعر", "Price")}</th>
              <th className="px-6 py-4">{t("الحالة", "Status")}</th>
              <th className="px-6 py-4 text-center">{t("إجراءات", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : data?.properties.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium">{lang === 'ar' ? p.titleAr : p.title}</td>
                <td className="px-6 py-4 uppercase text-xs">{p.type}</td>
                <td className="px-6 py-4 font-medium text-primary" dir="ltr">{formatPrice(p.price, lang)}</td>
                <td className="px-6 py-4">
                  <Badge variant={statusColors[p.status]}>{p.status}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if(confirm('Are you sure?')) deleteProp({ id: p.id });
                    }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
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
        <div className="max-h-[70vh] overflow-y-auto px-1 pb-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs mb-1 block">Title (EN)</label>
                <Input {...form.register("title")} dir="ltr" />
              </div>
              <div>
                <label className="text-xs mb-1 block">العنوان (AR)</label>
                <Input {...form.register("titleAr")} dir="rtl" />
              </div>

              <div>
                <label className="text-xs mb-1 block">City (EN)</label>
                <Input {...form.register("city")} dir="ltr" />
              </div>
              <div>
                <label className="text-xs mb-1 block">المدينة (AR)</label>
                <Input {...form.register("cityAr")} dir="rtl" />
              </div>

              <div>
                <label className="text-xs mb-1 block">Location (EN)</label>
                <Input {...form.register("location")} dir="ltr" />
              </div>
              <div>
                <label className="text-xs mb-1 block">الموقع (AR)</label>
                <Input {...form.register("locationAr")} dir="rtl" />
              </div>

              <div className="col-span-2">
                <label className="text-xs mb-1 block">Description (EN)</label>
                <textarea {...form.register("description")} className="w-full border rounded-xl p-2 min-h-20 text-sm" dir="ltr" />
              </div>
              <div className="col-span-2">
                <label className="text-xs mb-1 block">الوصف (AR)</label>
                <textarea {...form.register("descriptionAr")} className="w-full border rounded-xl p-2 min-h-20 text-sm" dir="rtl" />
              </div>

              <div>
                <label className="text-xs mb-1 block">Price</label>
                <Input type="number" {...form.register("price")} dir="ltr" />
              </div>
              <div>
                <label className="text-xs mb-1 block">Area m²</label>
                <Input type="number" {...form.register("area")} dir="ltr" />
              </div>

              <div>
                <label className="text-xs mb-1 block">Type</label>
                <select {...form.register("type")} className="w-full border rounded-xl p-2 h-12 text-sm bg-background">
                  <option value="land">Land</option>
                  <option value="chalet">Chalet</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block">Status</label>
                <select {...form.register("status")} className="w-full border rounded-xl p-2 h-12 text-sm bg-background">
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              
              <div className="col-span-2 space-y-2 border-t pt-4">
                <label className="text-sm font-medium">Images URLs</label>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input {...form.register(`images.${index}.url`)} placeholder="https://..." dir="ltr" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="w-4 h-4"/></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "" })}>Add Image URL</Button>
              </div>
            </div>

            <Button type="submit" className="w-full">{t("حفظ", "Save")}</Button>
          </form>
        </div>
      </Dialog>
    </div>
  );
}

// --- Bookings Tab ---

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
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No bookings found</td></tr>
            ) : data?.bookings.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap" dir="ltr">{new Date(b.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 font-medium">{b.name}</td>
                <td className="px-6 py-4" dir="ltr">{b.phone}</td>
                <td className="px-6 py-4 text-primary font-medium">
                  {b.property ? (lang === 'ar' ? b.property.titleAr : b.property.title) : `ID: ${b.propertyId}`}
                </td>
                <td className="px-6 py-4 max-w-[200px] truncate" title={b.message}>{b.message || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <Button variant="ghost" size="icon" onClick={() => {
                    if(confirm('Delete this booking?')) deleteBooking({ id: b.id });
                  }}>
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
