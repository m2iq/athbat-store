"use client";

import Header from "@/components/header";
import { useSidebar } from "@/components/sidebar";
import { useEffect, useState } from "react";
import CategoriesTable from "./categories-table";

interface Category {
  id: string;
  name_ar: string;
  description_ar: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export default function CategoriesPage() {
  const { setOpen } = useSidebar();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header title="الفئات" onMenuClick={() => setOpen(true)} />
      <div className="p-3 sm:p-6 lg:p-8">
        <CategoriesTable
          initialData={categories}
          loading={loading}
          onUpdate={setCategories}
        />
      </div>
    </>
  );
}
