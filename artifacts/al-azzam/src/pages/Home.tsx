import { useLanguage } from "@/contexts/LanguageContext";
import { usePropertiesList, useDashboardStats } from "@/hooks/use-properties";
import { PropertyCard } from "@/components/PropertyCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Building2, TrendingUp, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useGetStats } from "@workspace/api-client-react";

export default function Home() {
  const { t, lang } = useLanguage();
  const { data: propertiesData, isLoading } = usePropertiesList({ limit: 6, status: "available" });
  const { data: stats } = useGetStats();

  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: t("عقارات فاخرة", "Luxury Properties"),
      desc: t("مجموعة مختارة بعناية من أفضل العقارات", "Carefully selected portfolio of premium properties")
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: t("موثوقية وأمان", "Trust & Security"),
      desc: t("معاملات شفافة ومضمونة بالكامل", "Transparent and fully guaranteed transactions")
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t("استثمار ناجح", "Smart Investment"),
      desc: t("فرص استثمارية بعوائد ممتازة", "Investment opportunities with excellent returns")
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=90"
            alt="Land Property" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/90 via-[#0a1628]/70 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display leading-tight text-white">
              {lang === 'ar' ? (
                <>اكتشف <span className="text-primary">عقارك</span><br/>المثالي اليوم</>
              ) : (
                <>Find Your <span className="text-primary">Dream</span><br/>Property Today</>
              )}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-xl leading-relaxed">
              {t(
                "العزام للعقارات توفر لك خيارات واسعة من الفيلات والشقق والأراضي في أفضل المواقع. رحلتك نحو المنزل المثالي تبدأ هنا.",
                "Al-Azzam Real Estate offers a wide range of villas, apartments, and lands in prime locations. Your journey to the perfect home begins here."
              )}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/properties" className="inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-lg font-medium text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all">
                {t("تصفح العقارات", "Browse Properties")}
              </Link>
              <Link href="/properties" className="inline-flex h-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-8 text-lg font-medium text-white shadow-lg hover:bg-white/20 hover:scale-105 transition-all">
                {t("تواصل معنا", "Contact Us")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats / Features Banner */}
      <section className="py-12 bg-card border-b relative z-20 -mt-10 mx-4 md:mx-auto md:max-w-6xl rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("عقارات مميزة", "Featured Properties")}
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                {t("تصفح أحدث العقارات المضافة لدينا والمتاحة للبيع أو الإيجار.", "Browse our latest added properties available for sale or rent.")}
              </p>
            </div>
            <Link href="/properties" className="hidden md:flex items-center text-primary font-medium hover:underline">
              {t("عرض الكل", "View All")} 
              {lang === 'ar' ? <ArrowLeft className="ml-2 w-4 h-4" /> : <ArrowRight className="mr-2 w-4 h-4" />}
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {propertiesData?.properties?.map((prop, idx) => (
                <PropertyCard key={prop.id} property={prop} index={idx} />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
             <Link href="/properties" className="inline-flex items-center text-primary font-medium hover:underline">
              {t("عرض الكل", "View All")}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Mini Stats Callout */}
      <section className="py-20 relative overflow-hidden bg-secondary text-secondary-foreground">
        <div className="absolute inset-0 opacity-10">
          <img src={`${import.meta.env.BASE_URL}images/pattern-bg.png`} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="p-4">
              <p className="text-4xl font-bold text-primary mb-2 font-display">{stats?.totalProperties || 120}+</p>
              <p className="text-sm uppercase tracking-wider">{t("إجمالي العقارات", "Total Properties")}</p>
            </div>
            <div className="p-4">
              <p className="text-4xl font-bold text-primary mb-2 font-display">{stats?.soldProperties || 45}+</p>
              <p className="text-sm uppercase tracking-wider">{t("عقار مباع", "Sold Properties")}</p>
            </div>
            <div className="p-4">
              <p className="text-4xl font-bold text-primary mb-2 font-display">10+</p>
              <p className="text-sm uppercase tracking-wider">{t("سنوات خبرة", "Years Experience")}</p>
            </div>
            <div className="p-4">
              <p className="text-4xl font-bold text-primary mb-2 font-display">100%</p>
              <p className="text-sm uppercase tracking-wider">{t("رضا العملاء", "Client Satisfaction")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
