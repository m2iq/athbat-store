import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit") ?? "20")),
    );
    const search = url.searchParams.get("search") ?? "";
    const categoryId = url.searchParams.get("category_id") ?? "";

    let query = supabase
      .from("products")
      .select("*, categories(name_ar)", { count: "exact" });

    if (search) {
      query = query.ilike("name_ar", `%${search}%`);
    }
    if (categoryId) query = query.eq("category_id", categoryId);

    const from = (page - 1) * limit;
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      console.error("[GET /api/products]", error);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطأ غير متوقع";
    console.error("[GET /api/products] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name_ar?.trim()) {
      return NextResponse.json(
        { error: "اسم المنتج بالعربية مطلوب" },
        { status: 400 },
      );
    }
    if (!body.category_id) {
      return NextResponse.json({ error: "الفئة مطلوبة" }, { status: 400 });
    }
    if (!body.price || body.price <= 0) {
      return NextResponse.json(
        { error: "السعر يجب أن يكون أكبر من صفر" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        category_id: body.category_id,
        name_ar: body.name_ar.trim(),
        description_ar: body.description_ar?.trim() || null,
        price: body.price,
        currency: body.currency || "IQD",
        image_url: body.image_url || null,
        icon: body.icon || "Package",
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/products]", error);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل إنشاء المنتج";
    console.error("[POST /api/products] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
