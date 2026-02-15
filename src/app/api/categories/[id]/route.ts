import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`[GET /api/categories/${id}]`, error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطأ غير متوقع";
    console.error("[GET /api/categories/:id]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name_ar?.trim()) {
      return NextResponse.json(
        { error: "الاسم بالعربية مطلوب" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .update({
        name_ar: body.name_ar.trim(),
        description_ar: body.description_ar?.trim() || null,
        icon: body.icon || "Package",
        sort_order: body.sort_order ?? 0,
        is_active: body.is_active ?? true,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[PUT /api/categories/${id}]`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل تحديث الفئة";
    console.error("[PUT /api/categories/:id]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف الفئة — تحتوي على ${count} منتج` },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error(`[DELETE /api/categories/${id}]`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل حذف الفئة";
    console.error("[DELETE /api/categories/:id]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
