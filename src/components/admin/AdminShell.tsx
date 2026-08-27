import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useMatchRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Loader2, LogOut, Menu, Shield, ExternalLink, LayoutDashboard, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sections, groups } from "@/lib/admin-config";
import { useRealtimeContent } from "@/hooks/use-realtime-content";
import { cn } from "@/lib/utils";

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as any)[name] ?? Icons.Circle;
  return <C className={className} />;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const matchRoute = useMatchRoute();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useRealtimeContent();

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      setEmail(userRes.user?.email ?? null);
      if (!userRes.user) return setIsAdmin(false);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userRes.user.id);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    })();
  }, []);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };

  if (isAdmin === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <Card className="max-w-md border-border p-8 text-center">
          <Shield className="mx-auto mb-4 h-10 w-10 text-gold" />
          <h1 className="font-serif text-2xl">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You're signed in as <b>{email}</b> but don't have the <code className="text-gold">admin</code> role.
          </p>
          <Button variant="outline" className="mt-6" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </Card>
      </div>
    );
  }

  const navContent = (
    <ScrollArea className="h-full">
      <nav className="space-y-6 p-4">
        <Link
          to="/admin"
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            matchRoute({ to: "/admin", fuzzy: false })
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Link>

        {groups.map((g) => (
          <div key={g}>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              {g}
            </div>
            <div className="space-y-1">
              {sections
                .filter((s) => s.group === g)
                .map((s) => {
                  const active = matchRoute({ to: "/admin/$section", params: { section: s.key } });
                  return (
                    <Link
                      key={s.key}
                      to="/admin/$section"
                      params={{ section: s.key }}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <Icon name={s.icon} className="h-4 w-4 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>
    </ScrollArea>
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Shield className="h-5 w-5 shrink-0 text-gold" />
          <span className="truncate font-serif text-lg">Super Admin</span>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:flex">
              <ExternalLink className="h-3.5 w-3.5" /> View site
            </Link>
            <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground md:inline">{email}</span>
            <Button size="sm" variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-border bg-background lg:block">
          {navContent}
        </aside>

        {open && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            className="fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-background lg:hidden"
          >
            {navContent}
          </motion.aside>
        )}

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
