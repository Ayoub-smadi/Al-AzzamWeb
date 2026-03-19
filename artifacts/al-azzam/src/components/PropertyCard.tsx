import { Link } from "wouter";
import { type Property } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { MapPin, Maximize } from "lucide-react";
import { motion } from "framer-motion";

export function PropertyCard({ property, index = 0 }: { property: Property, index?: number }) {
  const { lang, t } = useLanguage();
  
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

  const title = lang === 'ar' ? property.titleAr : property.title;
  const location = lang === 'ar' ? property.locationAr : property.location;
  const city = lang === 'ar' ? property.cityAr : property.city;
  const mainImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60"; // fallback

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/properties/${property.id}`} className="group block h-full">
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
          
          <div className="relative h-64 overflow-hidden bg-muted">
            <img 
              src={mainImage} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 flex gap-2 flex-col items-start">
              <Badge variant={statusMap[property.status].variant} className="shadow-md backdrop-blur-md bg-background/90 border-none">
                {statusMap[property.status][lang]}
              </Badge>
              <Badge variant="default" className="shadow-md bg-primary/90 text-primary-foreground">
                {typeMap[property.type][lang]}
              </Badge>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2 gap-4">
              <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-lg font-bold text-primary whitespace-nowrap" dir="ltr">
                {formatPrice(property.price, lang)}
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
              {lang === 'ar' ? property.descriptionAr : property.description}
            </p>

            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate max-w-[120px]">{city}, {location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-primary" />
                <span dir="ltr">{property.area} m²</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
