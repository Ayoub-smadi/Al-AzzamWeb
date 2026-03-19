import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground text-center p-4">
      <h1 className="text-8xl font-bold text-primary font-display mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-6">الصفحة غير موجودة | Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/">
        <Button size="lg">العودة للرئيسية | Back to Home</Button>
      </Link>
    </div>
  );
}
