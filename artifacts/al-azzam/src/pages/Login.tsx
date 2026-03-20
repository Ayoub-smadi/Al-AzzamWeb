import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { t, lang } = useLanguage();
  const { login: setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: doLogin, isPending } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMsg("");
    doLogin({ data }, {
      onSuccess: (res) => {
        setAuth(res.token, res.user);
        setLocation(res.user.role === 'admin' ? '/dashboard' : '/');
      },
      onError: (err: any) => {
        setErrorMsg(err?.message || t("حدث خطأ أثناء تسجيل الدخول", "Login failed"));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card border shadow-xl rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-accent"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ع
          </div>
          <h1 className="text-2xl font-bold font-display">{t("تسجيل الدخول", "Welcome Back")}</h1>
          <p className="text-muted-foreground mt-2">{t("أدخل بياناتك للمتابعة", "Enter your credentials to continue")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
              {errorMsg}
            </div>
          )}
          
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

          <Button type="submit" className="w-full h-12 text-lg mt-2" disabled={isPending}>
            {isPending ? t("جاري التحقق...", "Logging in...") : t("دخول", "Login")}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">{t("ليس لديك حساب؟", "Don't have an account?")}</span>
          {" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            {t("إنشاء حساب جديد", "Create new account")}
          </Link>
        </div>
      </div>
    </div>
  );
}
