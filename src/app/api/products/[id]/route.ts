import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name_ar)")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`[GET /api/products/${id}]`, error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطأ غير متوقع";
    console.error("[GET /api/products/:id]", err);
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
        { error: "اسم المنتج بالعربية مطلوب" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("products")
      .update({
        category_id: body.category_id,
        name_ar: body.name_ar.trim(),
        description_ar: body.description_ar?.trim() || null,
        price: body.price,
        currency: body.currency || "IQD",
        image_url: body.image_url || null,
        icon: body.icon || "Package",
        is_active: body.is_active ?? true,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[PUT /api/products/${id}]`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل تحديث المنتج";
    console.error("[PUT /api/products/:id]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error(`[DELETE /api/products/${id}]`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل حذف المنتج";
    console.error("[DELETE /api/products/:id]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
