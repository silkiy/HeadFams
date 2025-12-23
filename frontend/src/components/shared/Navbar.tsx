"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/profile", label: "Profile" },
    { href: "/secret-login", label: "Secret Login" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          Janji<span className="text-primary">Pria</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Admin Login</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 pr-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full bg-background">
                <div className="flex h-16 items-center px-6 border-b">
                  <Link href="/" className="text-lg font-bold" onClick={() => setIsOpen(false)}>
                    Janji<span className="text-primary">Pria</span>
                  </Link>
                </div>
                <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
                  {routes.map((route) => (
                    <Link key={route.href} href={route.href} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={pathname === route.href ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 text-base h-11"
                      >
                        {/* We don't have icons in the route config yet, can add if needed or just use text */}
                        {route.label}
                      </Button>
                    </Link>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <Button asChild variant="outline" className="w-full justify-start gap-2" onClick={() => setIsOpen(false)}>
                    <Link href="/login">Admin Login</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
