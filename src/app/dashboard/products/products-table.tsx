"use client";

import { useConfirm } from "@/components/confirm-modal";
import { useToast } from "@/components/toast";
import { Loader2, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import ProductForm from "./product-form";

interface Category {
  id: string;
  name_ar: string;
}

interface Product {
  id: string;
  category_id: string;
  name_ar: string;
  price: number;
  currency: string;
  image_url: string | null;
  icon: string;
  is_active: boolean;
}

interface Props {
  initialProducts: Product[];
  categories: Category[];
  loading: boolean;
  onUpdate: (products: Product[]) => void;
}

export default function ProductsTable({
  initialProducts,
  categories,
  loading,
  onUpdate,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

  const filtered = initialProducts.filter((p) => {
    const matchSearch = !search || p.name_ar.includes(search);
    const matchCat = filterCat === "all" || p.category_id === filterCat;
    return matchSearch && matchCat;
  });

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name_ar ?? "—";

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "حذف المنتج",
      message:
        "هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.",
      confirmText: "حذف",
      cancelText: "إلغاء",
      variant: "danger",
    });

    if (!confirmed) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        onUpdate(initialProducts.filter((p) => p.id !== id));
        toast.success("تم حذف المنتج بنجاح");
      } else {
        toast.error(data.error || "فشل حذف المنتج");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (saved: Product) => {
    if (editing) {
      onUpdate(initialProducts.map((p) => (p.id === saved.id ? saved : p)));
      toast.success("تم تحديث المنتج بنجاح");
    } else {
      onUpdate([saved, ...initialProducts]);
      toast.success("تم إضافة المنتج بنجاح");
    }
    setShowForm(false);
    setEditing(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ar-IQ").format(price);

  return (
    <div>
      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onSave={handleSaved}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث..."
                className="w-full pr-9 pl-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none min-h-[40px]"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none min-h-[40px]"
            >
              <option value="all">جميع الفئات</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-linear-to-l from-blue-600 to-blue-700 rounded-xl hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200 min-h-[44px]"
          >
            <Plus size={16} />
            إضافة منتج
          </button>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="w-full aspect-square bg-gray-100" />
                <div className="p-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-50 rounded w-1/2 mb-3" />
                  <div className="h-5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p>لا توجد منتجات</p>
            {initialProducts.length === 0 && (
              <button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                إضافة أول منتج
              </button>
            )}
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="flex flex-col bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-200 group overflow-hidden"
              >
                {/* Image / Icon */}
                <div className="w-full aspect-square bg-blue-50 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name_ar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={40} className="text-blue-300" />
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate mb-1">
                    {product.name_ar}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-2 truncate">
                    {catName(product.category_id)}
                  </p>

                  <div className="flex items-baseline gap-1 mt-auto mb-1.5">
                    <span className="text-sm sm:text-base font-bold text-blue-700">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {product.currency}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        product.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.is_active ? "فعّال" : "معطّل"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 p-2 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditing(product);
                      setShowForm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors min-h-[36px]"
                  >
                    <Pencil size={14} />
                    <span className="hidden sm:inline">تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deleting === product.id}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 min-h-[36px]"
                  >
                    {deleting === product.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    <span className="hidden sm:inline">حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
