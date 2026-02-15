"use client";

import {
  CreditCard,
  FolderTree,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

interface Props {
  stats: {
    categories: number;
    products: number;
    orders: number;
    users: number;
    rechargeCodes: number;
  };
}

const CARDS = [
  {
    key: "categories",
    label: "الفئات",
    icon: FolderTree,
    color: "from-blue-500 to-blue-700",
    bgLight: "bg-blue-50",
  },
  {
    key: "products",
    label: "المنتجات",
    icon: Package,
    color: "from-teal-500 to-teal-700",
    bgLight: "bg-teal-50",
  },
  {
    key: "orders",
    label: "الطلبات",
    icon: ShoppingBag,
    color: "from-blue-400 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    key: "users",
    label: "المستخدمون",
    icon: Users,
    color: "from-teal-400 to-teal-600",
    bgLight: "bg-teal-50",
  },
  {
    key: "rechargeCodes",
    label: "رموز الشحن",
    icon: CreditCard,
    color: "from-blue-600 to-blue-800",
    bgLight: "bg-blue-50",
  },
] as const;

export default function StatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {CARDS.map(({ key, label, icon: Icon, color, bgLight }) => (
        <div
          key={key}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <div
              className={`w-12 h-12 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon size={22} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats[key]}</p>
        </div>
      ))}
    </div>
  );
}
