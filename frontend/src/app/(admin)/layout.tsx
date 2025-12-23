"use client";

import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  HandHeart,
  Image as ImageIcon,
  LogOut,
  Menu,
  Settings,
  User
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: HandHeart, label: "Janji Pria", href: "/admin/janji-pria" },
    { icon: ImageIcon, label: "Gallery", href: "/admin/gallery" },
    { icon: User, label: "Profile", href: "/admin/profile" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];



  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="text-lg font-bold">
          Janji<span className="text-primary">Admin</span>
        </Link>
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
            <Button
              variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
        <div className="mt-auto pt-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 w-64 border-r bg-background hidden md:block">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar Trigger */}
      <div className="md:hidden fixed top-0 left-0 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 pr-0">
              {/* Pass a prop or just reuse the content component. adding specific mobile styling if needed */}
              <div className="flex flex-col h-full bg-background">
                <div className="flex h-16 items-center px-6 border-b">
                  <Link href="/" className="text-lg font-bold" onClick={() => setIsMobileOpen(false)}>
                    Janji<span className="text-primary">Admin</span>
                  </Link>
                </div>
                <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
                  {sidebarItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                      <Button
                        variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 text-base h-11"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-bold text-lg flex items-center">
            Janji<span className="text-primary">Admin</span>
          </Link>
        </div>
        {/* You could add a user avatar here if desired */}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-muted/40 transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
}
