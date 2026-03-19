import { useParams } from "wouter";
import { usePropertyDetail } from "@/hooks/use-properties";
import { useCreateBookingMutation } from "@/hooks/use-bookings";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Maximize, Calendar, Phone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const bookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Phone number is required"),
  message: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function PropertyDetails() {
  const { id } = useParams();
  const { data: property, isLoading, isError } = usePropertyDetail(Number(id));
  const { t, lang } = useLanguage();
  const [activeImage, setActiveImage] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { mutate: createBooking, isPending } = useCreateBookingMutation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema)
  });

  if (isLoading) {
    return <div className="min-h-screen pt-32 pb-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (isError || !property) {
    return <div className="min-h-screen pt-32 pb-20 text-center"><h1 className="text-3xl font-bold">Property not found</h1></div>;
  }

  const title = lang === 'ar' ? property.titleAr : property.title;
  const description = lang === 'ar' ? property.descriptionAr : property.description;
  const location = lang === 'ar' ? property.locationAr : property.location;
  const city = lang === 'ar' ? property.cityAr : property.city;

  const typeMap = {
    land: { ar: 'أرض', en: 'Land' },
    chalet: { ar: 'شاليه', en: 'Chalet' },
    apartment: { ar: 'شقة', en: 'Apartment' },
    villa: { ar: 'فيلا', en: 'Villa' },
  };

  const statusMap = {
    available: { ar: 'متاح', en: 'Available', variant: 'success' as const },
    reserved: { ar: 'محجوز', en: 'Reserved', variant: 'warning' as const },
    sold: { ar: 'مباع', en: 'Sold', variant: 'destructive' as const },
  };

  const onSubmit = (data: BookingFormValues) => {
    createBooking({
      data: {
        ...data,
        message: data.message || "",
        propertyId: property.id
      }
    }, {
      onSuccess: () => {
        setBookingSuccess(true);
        reset();
        setTimeout(() => {
          setBookingOpen(false);
          setBookingSuccess(false);
        }, 3000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="bg-card rounded-3xl overflow-hidden border shadow-sm">
              <div className="relative h-[400px] md:h-[500px] bg-muted">
                {property.images && property.images.length > 0 ? (
                  <img src={property.images[activeImage]} className="w-full h-full object-cover" alt={title} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-muted-foreground">No Images</div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={statusMap[property.status].variant} className="shadow-lg backdrop-blur-md bg-background/90 text-sm py-1 px-3">
                    {statusMap[property.status][lang]}
                  </Badge>
                  <Badge variant="default" className="shadow-lg text-sm py-1 px-3">
                    {typeMap[property.type][lang]}
                  </Badge>
                </div>
              </div>
              
              {property.images && property.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-muted/30">
                  {property.images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImage(i)}
                      className={`relative w-24 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === i ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-card rounded-3xl p-8 border shadow-sm">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">{title}</h1>
                  <div className="flex items-center text-muted-foreground gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-lg">{city}, {location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">{t("السعر", "Price")}</p>
                  <p className="text-3xl font-bold text-primary" dir="ltr">{formatPrice(property.price, lang)}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">{t("نظرة عامة", "Overview")}</h3>
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex items-center gap-3 bg-muted/50 px-5 py-3 rounded-2xl">
                    <Maximize className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("المساحة", "Area")}</p>
                      <p className="font-semibold" dir="ltr">{property.area} m²</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/50 px-5 py-3 rounded-2xl">
                    <Calendar className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("تاريخ الإضافة", "Added On")}</p>
                      <p className="font-semibold" dir="ltr">{new Date(property.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">{t("الوصف", "Description")}</h3>
                <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
                  {description.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-6 border shadow-sm sticky top-24">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 mx-auto">
                <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-10 h-10 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2 font-display">العزام للعقارات</h3>
              <p className="text-center text-sm text-muted-foreground mb-8">Al-Azzam Real Estate</p>

              <div className="space-y-4">
                <Button 
                  className="w-full h-14 text-lg font-bold rounded-xl" 
                  disabled={property.status !== 'available'}
                  onClick={() => setBookingOpen(true)}
                >
                  {property.status === 'available' ? t("احجز الآن", "Book Now") : t("غير متاح للحجز", "Not Available")}
                </Button>
                <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-xl border-2">
                  <Phone className="w-5 h-5 mr-2" />
                  {t("تواصل معنا", "Contact Us")}
                </Button>
              </div>
              
              <div className="mt-8 pt-6 border-t text-sm text-muted-foreground text-center">
                <p className="mb-2">{t("تواصل معنا مباشرة عبر", "Contact us directly via")}</p>
                <p className="font-bold text-foreground" dir="ltr">+966 50 123 4567</p>
                <p className="font-bold text-foreground">contact@al-azzam.com</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogHeader>
          <DialogTitle>{t("طلب حجز عقار", "Property Booking Request")}</DialogTitle>
        </DialogHeader>
        
        {bookingSuccess ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-600 mb-2">{t("تم إرسال طلبك بنجاح!", "Request sent successfully!")}</h3>
            <p className="text-muted-foreground">{t("سنتواصل معك قريباً.", "We will contact you shortly.")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("الاسم", "Name")}</label>
              <Input {...register("name")} placeholder={t("أدخل اسمك", "Enter your name")} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t("رقم الهاتف", "Phone")}</label>
              <Input {...register("phone")} placeholder={t("أدخل رقم هاتفك", "Enter your phone")} dir="ltr" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("رسالة (اختياري)", "Message (Optional)")}</label>
              <textarea 
                {...register("message")}
                className="flex min-h-[100px] w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder={t("أخبرنا المزيد...", "Tell us more...")}
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={isPending}>
              {isPending ? t("جاري الإرسال...", "Sending...") : t("إرسال الطلب", "Send Request")}
            </Button>
          </form>
        )}
      </Dialog>
    </div>
  );
}
