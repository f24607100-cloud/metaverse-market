"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Megaphone,
  BarChart3,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/products", icon: Package, label: "Products" },
  { href: "/dashboard/ad-copy", icon: Megaphone, label: "Ad Copy AI" },
];

export function SidebarNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", isMobile && "grid gap-2 text-lg")}>
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary",
              isMobile && "py-3"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
