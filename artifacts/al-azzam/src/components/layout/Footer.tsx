import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 mt-auto border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                ع
              </div>
              <div className="flex flex-col">
                <span className="font-bold font-arabic">العزام للعقارات</span>
                <span className="text-xs text-secondary-foreground/70 font-display">Al-Azzam Real Estate</span>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/70 max-w-xs leading-relaxed">
              {t(
                "نقدم لكم أفضل العروض العقارية مع ضمان الجودة والمصداقية. شريكك الموثوق في عالم العقارات.",
                "Providing the best real estate offers with a guarantee of quality and credibility. Your trusted partner in real estate."
              )}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary">{t("روابط سريعة", "Quick Links")}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><Link href="/" className="hover:text-primary transition-colors">{t("الرئيسية", "Home")}</Link></li>
              <li><Link href="/properties" className="hover:text-primary transition-colors">{t("العقارات", "Properties")}</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">{t("تسجيل الدخول", "Login")}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary">{t("تواصل معنا", "Contact Us")}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>{t("الرياض، المملكة العربية السعودية", "Riyadh, Saudi Arabia")}</li>
              <li>contact@al-azzam.com</li>
              <li dir="ltr">+966 50 123 4567</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-secondary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Al-Azzam Real Estate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
