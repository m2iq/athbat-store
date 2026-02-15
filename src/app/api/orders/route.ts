import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50")),
    );
    const status = searchParams.get("status") || undefined;

    let query = supabase
      .from("orders")
      .select("*, profiles(full_name, phone)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq("status", status);

    const { data, error, count } = await query;

    if (error) {
      console.error("[GET /api/orders]", error);
      // If the join fails, try without it
      if (error.message.includes("profiles")) {
        const {
          data: plainData,
          error: plainError,
          count: plainCount,
        } = await supabase
          .from("orders")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (plainError) {
          return NextResponse.json(
            { error: plainError.message },
            { status: 500 },
          );
        }
        return NextResponse.json({
          data: plainData ?? [],
          total: plainCount ?? 0,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [], total: count ?? 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطأ في جلب الطلبات";
    console.error("[GET /api/orders] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, admin_reply } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الطلب مطلوب" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    // Update status if provided
    if (status) {
      const validStatuses = ["completed", "pending"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
      }
      updateData.status = status;
    }

    // Update admin reply if provided
    if (admin_reply !== undefined) {
      updateData.admin_reply = admin_reply;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "لا توجد بيانات للتحديث" },
        { status: 400 },
      );
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select("*, profiles(full_name, phone)")
      .single();

    if (error) {
      console.error("[PATCH /api/orders]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل تحديث الطلب";
    console.error("[PATCH /api/orders] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الطلب مطلوب" }, { status: 400 });
    }

    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("[DELETE /api/orders]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل حذف الطلب";
    console.error("[DELETE /api/orders] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
