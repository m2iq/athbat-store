import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    if (error) {
      console.error("[GET /api/categories]", error);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطأ غير متوقع";
    console.error("[GET /api/categories] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name_ar?.trim()) {
      return NextResponse.json(
        { error: "الاسم بالعربية مطلوب" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name_ar: body.name_ar.trim(),
        description_ar: body.description_ar?.trim() || null,
        icon: body.icon || "Package",
        sort_order: body.sort_order ?? 0,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/categories]", error);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل إنشاء الفئة";
    console.error("[POST /api/categories] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
