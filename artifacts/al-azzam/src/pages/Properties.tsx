import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePropertiesList } from "@/hooks/use-properties";
import { PropertyCard } from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FilterX } from "lucide-react";
import type { GetPropertiesParams } from "@workspace/api-client-react";

export default function Properties() {
  const { t, lang } = useLanguage();
  
  const [filters, setFilters] = useState<GetPropertiesParams>({
    page: 1,
    limit: 12,
    status: "available",
  });
  
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = usePropertiesList(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters(prev => ({ ...prev, type: val ? (val as any) : undefined, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ page: 1, limit: 12, status: "available" });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      {/* Header Banner */}
      <div className="bg-secondary text-secondary-foreground py-16 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
           <img src={`${import.meta.env.BASE_URL}images/pattern-bg.png`} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-white">
            {t("اكتشف عقاراتنا", "Explore Our Properties")}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t("ابحث في مجموعتنا الواسعة من العقارات واعثر على المكان المثالي لك", "Search through our wide collection of properties and find the perfect place for you")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filters */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm mb-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-muted-foreground">{t("بحث", "Search")}</label>
              <div className="relative">
                <Input 
                  placeholder={t("ابحث بالاسم، المدينة أو الموقع...", "Search by name, city or location...")}
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="pl-10"
                />
                <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5`} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">{t("نوع العقار", "Property Type")}</label>
              <select 
                className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.type || ""}
                onChange={handleTypeChange}
              >
                <option value="">{t("الكل", "All")}</option>
                <option value="land">{t("أرض", "Land")}</option>
                <option value="chalet">{t("شاليه", "Chalet")}</option>
                <option value="apartment">{t("شقة", "Apartment")}</option>
                <option value="villa">{t("فيلا", "Villa")}</option>
              </select>
            </div>
          </form>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {data ? t(`وجدنا ${data.total} عقار`, `Found ${data.total} properties`) : ""}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                <FilterX className="w-4 h-4 mr-2" />
                {t("مسح الفلاتر", "Clear Filters")}
              </Button>
              <Button onClick={handleSearch}>{t("بحث", "Search")}</Button>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : data?.properties && data.properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.properties.map((prop, idx) => (
                <PropertyCard key={prop.id} property={prop} index={idx} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button 
                  variant="outline" 
                  disabled={data.page === 1}
                  onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) - 1 }))}
                >
                  {t("السابق", "Previous")}
                </Button>
                <span className="text-sm font-medium">
                  {data.page} / {data.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={data.page === data.totalPages}
                  onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))}
                >
                  {t("التالي", "Next")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-card border rounded-2xl">
            <h3 className="text-2xl font-bold mb-2">{t("لا توجد نتائج", "No results found")}</h3>
            <p className="text-muted-foreground">{t("جرب تغيير معايير البحث", "Try adjusting your search criteria")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
