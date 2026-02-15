"use client";

import Header from "@/components/header";
import { useSidebar } from "@/components/sidebar";
import { useEffect, useState } from "react";
import ProductsTable from "./products-table";

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

export default function ProductsPage() {
  const { setOpen } = useSidebar();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products?limit=100"),
          fetch("/api/categories"),
        ]);

        const prodJson = prodRes.ok ? await prodRes.json() : { data: [] };
        const catJson = catRes.ok ? await catRes.json() : [];

        setProducts(prodJson.data ?? []);
        setCategories(Array.isArray(catJson) ? catJson : []);
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
      <Header title="المنتجات" onMenuClick={() => setOpen(true)} />
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            المنتجات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة المنتجات وأسعارها وصورها
          </p>
        </div>
        <ProductsTable
          initialProducts={products}
          categories={categories}
          loading={loading}
          onUpdate={setProducts}
        />
      </div>
    </>
  );
}
