"use client";

import Header from "@/components/header";
import { useSidebar } from "@/components/sidebar";
import {
  CreditCard,
  FolderTree,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Stats {
  categories: number;
  products: number;
  orders: number;
  users: number;
  rechargeCodes: number;
}

const CARDS = [
  {
    key: "categories" as const,
    label: "الفئات",
    icon: FolderTree,
    color: "from-blue-500 to-blue-700",
  },
  {
    key: "products" as const,
    label: "المنتجات",
    icon: Package,
    color: "from-teal-500 to-teal-700",
  },
  {
    key: "orders" as const,
    label: "الطلبات",
    icon: ShoppingBag,
    color: "from-blue-400 to-blue-600",
  },
  {
    key: "users" as const,
    label: "المستخدمون",
    icon: Users,
    color: "from-teal-400 to-teal-600",
  },
  {
    key: "rechargeCodes" as const,
    label: "رموز الشحن",
    icon: CreditCard,
    color: "from-blue-600 to-blue-800",
  },
];

export default function DashboardPage() {
  const { setOpen } = useSidebar();
  const [stats, setStats] = useState<Stats>({
    categories: 0,
    products: 0,
    orders: 0,
    users: 0,
    rechargeCodes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, prodRes, orderRes, codeRes, usersRes] =
          await Promise.all([
            fetch("/api/categories"),
            fetch("/api/products?limit=1"),
            fetch("/api/orders?limit=1"),
            fetch("/api/recharge-codes?limit=1"),
            fetch("/api/users/count"),
          ]);

        const cats = catRes.ok ? await catRes.json() : [];
        const prods = prodRes.ok ? await prodRes.json() : { total: 0 };
        const orders = orderRes.ok ? await orderRes.json() : { total: 0 };
        const codes = codeRes.ok ? await codeRes.json() : { total: 0 };
        const usersData = usersRes.ok ? await usersRes.json() : { count: 0 };

        setStats({
          categories: Array.isArray(cats) ? cats.length : 0,
          products: prods.total ?? 0,
          orders: orders.total ?? 0,
          users: usersData.count ?? 0,
          rechargeCodes: codes.total ?? 0,
        });
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Header title="الرئيسية" onMenuClick={() => setOpen(true)} />
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              مرحباً بك
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">نظرة عامة على متجرك</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {CARDS.map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  {label}
                </span>
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats[key]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
