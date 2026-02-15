"use client";

import { signOutAdmin } from "@/lib/auth";
import { Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOutAdmin();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 sm:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="فتح القائمة"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-gray-800">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search - hidden on small screens */}
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="بحث..."
            dir="rtl"
            className="pr-10 pl-4 py-2 bg-gray-100 rounded-xl text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        <button
          onClick={handleLogout}
          disabled={loading}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "جارٍ الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </header>
  );
}
