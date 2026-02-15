"use client";

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
    Gamepad2,
    Gift,
    Globe,
    Headphones,
    Heart,
    Home,
    Laptop,
    MessageCircle,
    MessageSquare,
    Monitor,
    Moon,
    Music,
    Package,
    Phone,
    Play,
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
    Tv,
    User,
    Users,
    Video,
    Wifi,
    X,
    Zap,
    type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name_ar: string;
  description_ar: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  category: Category | null;
  onSave: (cat: Category) => void;
  onCancel: () => void;
}

const ICON_LIST: { name: string; icon: LucideIcon; label: string }[] = [
  { name: "Smartphone", icon: Smartphone, label: "هاتف" },
  { name: "Tablet", icon: Tablet, label: "تابلت" },
  { name: "Laptop", icon: Laptop, label: "لابتوب" },
  { name: "Monitor", icon: Monitor, label: "شاشة" },
  { name: "Tv", icon: Tv, label: "تلفاز" },
  { name: "Wifi", icon: Wifi, label: "واي فاي" },
  { name: "Apple", icon: Apple, label: "آبل" },
  { name: "Chrome", icon: Chrome, label: "كروم" },
  { name: "Globe", icon: Globe, label: "انترنت" },
  { name: "Play", icon: Play, label: "بث" },
  { name: "Gamepad2", icon: Gamepad2, label: "ألعاب" },
  { name: "CreditCard", icon: CreditCard, label: "بطاقة" },
  { name: "ShoppingCart", icon: ShoppingCart, label: "سلة" },
  { name: "ShoppingBag", icon: ShoppingBag, label: "تسوق" },
  { name: "Gift", icon: Gift, label: "هدية" },
  { name: "Tag", icon: Tag, label: "عرض" },
  { name: "MessageCircle", icon: MessageCircle, label: "رسالة" },
  { name: "MessageSquare", icon: MessageSquare, label: "دردشة" },
  { name: "Phone", icon: Phone, label: "اتصال" },
  { name: "Music", icon: Music, label: "موسيقى" },
  { name: "Headphones", icon: Headphones, label: "سماعات" },
  { name: "Camera", icon: Camera, label: "كاميرا" },
  { name: "Video", icon: Video, label: "فيديو" },
  { name: "Heart", icon: Heart, label: "مفضلة" },
  { name: "Star", icon: Star, label: "نجمة" },
  { name: "Zap", icon: Zap, label: "سريع" },
  { name: "Flame", icon: Flame, label: "حار" },
  { name: "Award", icon: Award, label: "جائزة" },
  { name: "Book", icon: Book, label: "كتاب" },
  { name: "Briefcase", icon: Briefcase, label: "عمل" },
  { name: "Home", icon: Home, label: "منزل" },
  { name: "Building", icon: Building, label: "مبنى" },
  { name: "Store", icon: Store, label: "متجر" },
  { name: "User", icon: User, label: "مستخدم" },
  { name: "Users", icon: Users, label: "مجموعة" },
  { name: "Settings", icon: Settings, label: "إعدادات" },
  { name: "Shield", icon: Shield, label: "حماية" },
  { name: "Cloud", icon: Cloud, label: "سحابة" },
  { name: "Sun", icon: Sun, label: "شمس" },
  { name: "Moon", icon: Moon, label: "قمر" },
  { name: "Package", icon: Package, label: "طرد" },
  { name: "Box", icon: Box, label: "صندوق" },
];

export default function CategoryForm({ category, onSave, onCancel }: Props) {
  const isEdit = !!category;
  const toast = useToast();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [form, setForm] = useState({
    name_ar: category?.name_ar ?? "",
    description_ar: category?.description_ar ?? "",
    icon: category?.icon ?? "Package",
    sort_order: category?.sort_order ?? 0,
    is_active: category?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const selectedIcon = ICON_LIST.find((i) => i.name === form.icon);
  const SelectedIconComponent = selectedIcon?.icon ?? Package;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name_ar.trim()) {
      toast.error("الاسم بالعربية مطلوب");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit
        ? `/api/categories/${category!.id}`
        : "/api/categories";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        onSave(data);
      } else {
        toast.error(data.error || "فشل حفظ الفئة");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-5 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          {isEdit ? "تعديل الفئة" : "إضافة فئة جديدة"}
        </h3>
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Icon Picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            أيقونة الفئة
          </label>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 transition-colors w-full sm:w-auto min-h-11"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <SelectedIconComponent size={22} className="text-blue-700" />
            </div>
            <span className="text-sm text-gray-600">
              {selectedIcon?.label ?? form.icon}
            </span>
            <span className="text-xs text-blue-600 mr-auto">تغيير</span>
          </button>

          {showIconPicker && (
            <div className="mt-3 p-3 sm:p-4 border border-gray-100 rounded-xl bg-gray-50 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2">
                {ICON_LIST.map(({ name, icon: Icon, label }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, icon: name });
                      setShowIconPicker(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150 min-h-11 ${
                      form.icon === name
                        ? "bg-blue-600 text-white shadow-md"
                        : "hover:bg-white hover:shadow-sm text-gray-600"
                    }`}
                    title={label}
                  >
                    <Icon size={20} />
                    <span className="text-[10px] leading-tight truncate w-full text-center">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            اسم الفئة <span className="text-red-400">*</span>
          </label>
          <input
            value={form.name_ar}
            onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
            dir="rtl"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none transition-all min-h-11"
            placeholder="مثال: شحن الهاتف"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            الوصف
          </label>
          <textarea
            value={form.description_ar}
            onChange={(e) =>
              setForm({ ...form, description_ar: e.target.value })
            }
            dir="rtl"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none transition-all resize-none"
            rows={2}
          />
        </div>

        {/* Sort + Active */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-28 sm:w-32">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              الترتيب
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none transition-all min-h-11"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer pb-1 min-h-11">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="accent-blue-600 w-4 h-4"
            />
            فعّال
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 text-sm font-bold text-white bg-linear-to-l from-blue-600 to-blue-700 rounded-xl hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-50 transition-all duration-200 min-h-11"
          >
            {loading ? "جارٍ الحفظ..." : "حفظ"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors min-h-11"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
