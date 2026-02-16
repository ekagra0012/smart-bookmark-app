import { LoginButton } from "@/components/auth/LoginButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect authenticated users directly to dashboard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-card/50 blur-3xl -z-10 rounded-b-[50%]" aria-hidden="true" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        <div className="max-w-3xl space-y-12">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium tracking-wide">
              The Intelligent Bookmark Manager
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-medium text-primary tracking-tight leading-tight">
              Curate your <br />
              <span className="italic">digital knowledge</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Capture, organize, and access your bookmarks with AI-powered precision.
              Designed for the modern web.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <LoginButton />
            <p className="text-xs text-muted-foreground tracking-widest uppercase">
              Secure Access • Real-time Sync
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>&copy; {new Date().getFullYear()} SmartMarks. All rights reserved.</p>
      </footer>
    </div>
  );
}
