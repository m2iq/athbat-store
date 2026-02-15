"use client";

import { useToast } from "@/components/toast";
import { ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";

interface Category {
  id: string;
  name_ar: string;
}

interface Product {
  id: string;
  category_id: string;
  name_ar: string;
  description_ar?: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  icon: string;
  is_active: boolean;
}

interface Props {
  product: Product | null;
  categories: Category[];
  onSave: (p: Product) => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
}: Props) {
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [form, setForm] = useState({
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    name_ar: product?.name_ar ?? "",
    description_ar: product?.description_ar ?? "",
    price: product?.price ?? 0,
    currency: product?.currency ?? "IQD",
    image_url: product?.image_url ?? "",
    icon: product?.icon ?? "Package",
    is_active: product?.is_active ?? true,
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (res.ok) {
        setForm({ ...form, image_url: data.url });
        toast.success("تم رفع الصورة بنجاح");
      } else {
        toast.error(data.error || "فشل رفع الصورة");
      }
    } catch {
      toast.error("خطأ في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name_ar.trim()) {
      toast.error("اسم المنتج بالعربية مطلوب");
      return;
    }
    if (!form.category_id) {
      toast.error("يرجى اختيار الفئة");
      return;
    }
    if (!form.price || form.price <= 0) {
      toast.error("السعر يجب أن يكون أكبر من صفر");
      return;
    }

    setLoading(true);
    try {
      const body = {
        ...form,
        image_url: form.image_url || null,
      };
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        onSave(data);
      } else {
        toast.error(data.error || "فشل حفظ المنتج");
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
          {isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
        </h3>
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            صورة المنتج
          </label>
          <div className="flex items-start gap-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors cursor-pointer flex items-center justify-center overflow-hidden shrink-0"
            >
              {form.image_url ? (
                <img
                  src={form.image_url}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-gray-300 mx-auto" />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        رفع صورة
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            <div className="text-xs text-gray-400 pt-2 space-y-1">
              <p>اضغط على المربع لرفع صورة</p>
              <p>الصيغ: PNG, JPG, WebP</p>
              {form.image_url && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image_url: "" })}
                  className="text-red-400 hover:text-red-500"
                >
                  إزالة الصورة
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            اسم المنتج <span className="text-red-400">*</span>
          </label>
          <input
            value={form.name_ar}
            onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
            dir="rtl"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none transition-all min-h-11"
            placeholder="مثال: رصيد زين 5000"
            required
          />
          <p className="text-[10px] text-gray-400 mt-1">
            الكلمة الأولى تُستخدم كفلتر تلقائي في التطبيق
          </p>
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

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            الفئة <span className="text-red-400">*</span>
          </label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none transition-all min-h-11"
            required
          >
            <option value="">اختر الفئة</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_ar}
              </option>
            ))}
          </select>
        </div>

        {/* Price + Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              السعر <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none transition-all min-h-11"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              العملة
            </label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none transition-all min-h-11"
            >
              <option value="IQD">دينار عراقي (IQD)</option>
              <option value="USD">دولار (USD)</option>
            </select>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer min-h-11">
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
