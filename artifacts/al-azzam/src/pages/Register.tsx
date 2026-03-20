import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { t } = useLanguage();
  const { login: setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMsg("");
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.message || t("حدث خطأ أثناء إنشاء الحساب", "Registration failed"));
        return;
      }
      setAuth(json.token, json.user);
      setLocation("/");
    } catch {
      setErrorMsg(t("حدث خطأ في الاتصال بالخادم", "Server connection error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card border shadow-xl rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-accent"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ع
          </div>
          <h1 className="text-2xl font-bold font-display">{t("إنشاء حساب جديد", "Create New Account")}</h1>
          <p className="text-muted-foreground mt-2">{t("أدخل بياناتك لإنشاء حسابك", "Enter your details to create your account")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("الاسم الكامل", "Full Name")}</label>
            <Input {...register("name")} type="text" placeholder={t("اسمك الكامل", "Your full name")} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("البريد الإلكتروني", "Email Address")}</label>
            <Input {...register("email")} type="email" placeholder="example@email.com" dir="ltr" className="text-left" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("كلمة المرور", "Password")}</label>
            <Input {...register("password")} type="password" placeholder="••••••••" dir="ltr" className="text-left" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("تأكيد كلمة المرور", "Confirm Password")}</label>
            <Input {...register("confirmPassword")} type="password" placeholder="••••••••" dir="ltr" className="text-left" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full h-12 text-lg mt-2" disabled={isPending}>
            {isPending ? t("جاري الإنشاء...", "Creating account...") : t("إنشاء الحساب", "Create Account")}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">{t("لديك حساب بالفعل؟", "Already have an account?")}</span>
          {" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {t("تسجيل الدخول", "Sign in")}
          </Link>
        </div>
      </div>
    </div>
  );
}
