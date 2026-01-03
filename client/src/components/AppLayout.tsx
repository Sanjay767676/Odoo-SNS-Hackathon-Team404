import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Compass, Plus, Map, LayoutDashboard, LogIn, UserPlus } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/trips", label: "My Trips", icon: Map },
    { href: "/create-trip", label: "New Trip", icon: Plus },
    { href: "/builder", label: "Builder", icon: Compass },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Compass className="w-6 h-6 text-primary" />
            <span>GlobeTrotter</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === item.href ? 'text-primary' : 'text-muted-foreground'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-6 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GlobeTrotter Travel Planner. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
