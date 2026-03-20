import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { useSiteSettings, type SocialLink } from "@/hooks/use-settings";
import {
  FaWhatsapp, FaInstagram, FaFacebook, FaTelegram,
  FaSnapchat, FaTiktok, FaYoutube, FaLinkedin, FaXTwitter
} from "react-icons/fa6";

const ICONS: Record<string, { Icon: React.ComponentType<any>; color: string }> = {
  whatsapp:  { Icon: FaWhatsapp,  color: "#25D366" },
  instagram: { Icon: FaInstagram, color: "#E1306C" },
  twitter:   { Icon: FaXTwitter,  color: "#fff" },
  facebook:  { Icon: FaFacebook,  color: "#1877F2" },
  tiktok:    { Icon: FaTiktok,    color: "#fff" },
  snapchat:  { Icon: FaSnapchat,  color: "#FFFC00" },
  telegram:  { Icon: FaTelegram,  color: "#2CA5E0" },
  youtube:   { Icon: FaYoutube,   color: "#FF0000" },
  linkedin:  { Icon: FaLinkedin,  color: "#0A66C2" },
};

export function Footer() {
  const { t, lang } = useLanguage();
  const { data: settings } = useSiteSettings();

  const footerAbout = lang === 'ar'
    ? (settings?.footer_about_ar || "نقدم لكم أفضل العروض العقارية مع ضمان الجودة والمصداقية. شريكك الموثوق في عالم العقارات.")
    : (settings?.footer_about_en || "Providing the best real estate offers with a guarantee of quality and credibility. Your trusted partner in real estate.");

  const address = lang === 'ar'
    ? (settings?.contact_address_ar || "الرياض، المملكة العربية السعودية")
    : (settings?.contact_address_en || "Riyadh, Saudi Arabia");

  const email = settings?.contact_email || "contact@al-azzam.com";
  const phone = settings?.contact_phone || "+966 50 123 4567";

  const socialLinks: SocialLink[] = (() => {
    try { return JSON.parse(settings?.social_links || "[]"); } catch { return []; }
  })();

  return (
    <footer className="bg-secondary text-secondary-foreground py-12 mt-auto border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">ع</div>
              <div className="flex flex-col">
                <span className="font-bold font-arabic">العزام للعقارات</span>
                <span className="text-xs text-secondary-foreground/70 font-display">Al-Azzam Real Estate</span>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/70 max-w-xs leading-relaxed">{footerAbout}</p>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-5">
                {socialLinks.map((link, i) => {
                  const entry = ICONS[link.platform];
                  if (!entry) return null;
                  const { Icon, color } = entry;
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      title={link.platform}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </a>
                  );
                })}
              </div>
            )}
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
              <li>{address}</li>
              <li dir="ltr">{email}</li>
              <li dir="ltr">{phone}</li>
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
