"use client";

import { useConfirm } from "@/components/confirm-modal";
import { useToast } from "@/components/toast";
import {
    Apple,
    Award,
    Book,
    Box,
    Briefcase,
    Building,
    Camera,
    Chrome,
    Cloud,
    CreditCard,
    Flame,
    FolderTree,
    Gamepad2,
    Gift,
    Globe,
    Headphones,
    Heart,
    Home,
    Laptop,
    Loader2,
    MessageCircle,
    MessageSquare,
    Monitor,
    Moon,
    Music,
    Package,
    Pencil,
    Phone,
    Play,
    Plus,
    Settings,
    Shield,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Star,
    Store,
    Sun,
    Tablet,
    Tag,
    Trash2,
    Tv,
    User,
    Users,
    Video,
    Wifi,
    Zap,
    type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import CategoryForm from "./category-form";

const ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  Wifi,
  Apple,
  Chrome,
  Globe,
  Play,
  Gamepad2,
  CreditCard,
  ShoppingCart,
  ShoppingBag,
  Gift,
  Tag,
  MessageCircle,
  MessageSquare,
  Phone,
  Music,
  Headphones,
  Camera,
  Video,
  Heart,
  Star,
  Zap,
  Flame,
  Award,
  Book,
  Briefcase,
  Home,
  Building,
  Store,
  User,
  Users,
  Settings,
  Shield,
  Cloud,
  Sun,
  Moon,
  Package,
  Box,
};

interface Category {
  id: string;
  name_ar: string;
  description_ar: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  initialData: Category[];
  loading: boolean;
  onUpdate: (cats: Category[]) => void;
}

export default function CategoriesTable({
  initialData,
  loading,
  onUpdate,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "حذف الفئة",
      message: "هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء.",
      confirmText: "حذف",
      cancelText: "إلغاء",
      variant: "danger",
    });

    if (!confirmed) return;

    setDeleting(id);
    try {
      const res = await fetch("/api/categories/" + id, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        onUpdate(initialData.filter((c) => c.id !== id));
        toast.success("تم حذف الفئة بنجاح");
      } else {
        toast.error(data.error || "فشل حذف الفئة");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (cat: Category) => {
    const idx = initialData.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      const next = [...initialData];
      next[idx] = cat;
      onUpdate(next);
      toast.success("تم تحديث الفئة بنجاح");
    } else {
      onUpdate([...initialData, cat]);
      toast.success("تم إضافة الفئة بنجاح");
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            إدارة الفئات
          </h1>
          <p className="text-sm text-gray-500 mt-1">{initialData.length} فئة</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-linear-to-l from-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200 min-h-[44px]"
        >
          <Plus size={18} />
          إضافة فئة
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <CategoryForm
          category={editing}
          onSave={handleSaved}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-20 mb-2" />
                  <div className="h-3 bg-gray-50 rounded w-14" />
                </div>
              </div>
              <div className="h-3 bg-gray-50 rounded w-16 mt-4" />
            </div>
          ))}
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {initialData.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] ?? Package;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <IconComponent size={22} className="text-blue-700" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {cat.name_ar}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:py-1 rounded-full shrink-0 ${
                      cat.is_active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {cat.is_active ? "فعّال" : "معطّل"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    الترتيب: {cat.sort_order}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(cat);
                        setShowForm(true);
                      }}
                      className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-700 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deleting === cat.id}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                      {deleting === cat.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {initialData.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <FolderTree size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد فئات بعد</p>
              <button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                إضافة أول فئة
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
