import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useMatchRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  Archive,
  Building2,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  Layers,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/super-admin/portfolios", label: "Portfolios", icon: Layers },
  { to: "/super-admin/domains", label: "Domains", icon: Globe },
  { to: "/super-admin/clients", label: "Clients", icon: Building2 },
  { to: "/super-admin/media", label: "Media Library", icon: ImageIcon },
  { to: "/super-admin/backups", label: "Backup & Restore", icon: Archive },
  { to: "/super-admin/admins", label: "Portfolio Admins", icon: Users },
  { to: "/super-admin/logs", label: "Activity Logs", icon: Activity },
  { to: "/super-admin/settings", label: "Settings", icon: Settings },
  { to: "/super-admin/profile", label: "Profile", icon: UserCircle },
] as const;

export function SuperAdminShell({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const matchRoute = useMatchRoute();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/super-admin/login", replace: true });
  };

  const navContent = (
    <ScrollArea className="h-full">
      <nav className="space-y-1 p-4">
        {NAV.map((item) => {
          const active = matchRoute({ to: item.to, fuzzy: !("exact" in item) });
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" /> Logout
        </button>
      </nav>
    </ScrollArea>
  );

  return (
    <div className="min-h-dvh bg-secondary/30">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <ShieldCheck className="h-5 w-5 shrink-0 text-gold" />
          <span className="truncate font-serif text-lg">Platform Control</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden max-w-[200px] truncate text-xs text-muted-foreground md:inline">
              {email}
            </span>
            <Button size="sm" variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 border-r border-border bg-background lg:block">
          {navContent}
        </aside>

        {open && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            className="fixed left-0 top-14 z-40 h-[calc(100dvh-3.5rem)] w-64 border-r border-border bg-background lg:hidden"
          >
            {navContent}
          </motion.aside>
        )}

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
