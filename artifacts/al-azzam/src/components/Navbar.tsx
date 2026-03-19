import { Link } from "wouter";
import { Moon, Sun, Globe, Menu, X, User as UserIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { lang, toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: t("الرئيسية", "Home") },
    { href: "/properties", label: t("العقارات", "Properties") },
  ];

  if (user?.role === "admin") {
    links.push({ href: "/dashboard", label: t("لوحة التحكم", "Dashboard") });
  }

  return (
    <header className={cn(
      "fixed top-0 w-full z-40 transition-all duration-300",
      isScrolled ? "bg-background/90 backdrop-blur-md border-b shadow-sm py-3" : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
              ع
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none font-arabic">العزام للعقارات</span>
              <span className="text-xs text-muted-foreground font-display font-medium">Al-Azzam Real Estate</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleLang} className="rounded-full" title="Toggle Language">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Toggle Language</span>
            </Button>
            
            {user ? (
              <Button variant="outline" onClick={logout} className="rounded-full border-primary/20 hover:bg-primary/10">
                <UserIcon className="h-4 w-4 mr-2" />
                {t("تسجيل خروج", "Logout")}
              </Button>
            ) : (
              <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md">
                {t("تسجيل الدخول", "Login")}
              </Link>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b shadow-lg py-4 px-4 flex flex-col gap-4">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-base font-medium p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={toggleTheme}><Sun className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={toggleLang}><Globe className="h-4 w-4" /></Button>
            </div>
            {user ? (
              <Button variant="destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>{t("خروج", "Logout")}</Button>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                {t("دخول", "Login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
