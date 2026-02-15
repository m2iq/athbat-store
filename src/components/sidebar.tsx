"use client";

import {
  CreditCard,
  FolderTree,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";

const LINKS = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/categories", label: "الفئات", icon: FolderTree },
  { href: "/dashboard/products", label: "المنتجات", icon: Package },
  {
    href: "/dashboard/recharge-codes",
    label: "رموز الشحن",
    icon: CreditCard,
  },
  { href: "/dashboard/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/dashboard/users", label: "المستخدمون", icon: Users },
];

// Sidebar context to allow Header to toggle the mobile sidebar
interface SidebarContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  open: false,
  setOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  const nav = (
    <>
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className=" flex items-center justify-center">
            <img
              src={"../assets/logo.png"}
              alt="Logo"
              className="w-10 h-10 rounded-md bg-transparent object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              أثبات ستور
            </h1>
            <p className="text-teal-300/80 text-xs">لوحة التحكم</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-gray-300 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-gray-500">الإصدار 2.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed right-0 top-0 h-full w-72 bg-navy-800 text-white flex flex-col z-50 transition-sidebar lg:hidden ${
          open
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
        >
          <X size={20} />
        </button>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed right-0 top-0 h-full w-72 bg-navy-800 text-white flex-col z-40">
        {nav}
      </aside>
    </>
  );
}
