import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const search = searchParams.get("search")?.trim() || "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("profiles")
      .select(
        "id, full_name, phone, avatar_url, wallet_balance, is_blocked, created_at",
        {
          count: "exact",
        },
      );

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("[GET /api/users]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch emails from auth.users via service role
    const userIds = (data ?? []).map((u) => u.id);
    let emailMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: authData } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });

      if (authData?.users) {
        for (const u of authData.users) {
          if (userIds.includes(u.id)) {
            emailMap[u.id] = u.email ?? "";
          }
        }
      }
    }

    const users = (data ?? []).map((u) => ({
      ...u,
      email: emailMap[u.id] ?? "",
    }));

    return NextResponse.json({
      data: users,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "خطأ في جلب المستخدمين";
    console.error("[GET /api/users] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_blocked } = body;

    if (!id) {
      return NextResponse.json(
        { error: "معرف المستخدم مطلوب" },
        { status: 400 },
      );
    }

    if (typeof is_blocked !== "boolean") {
      return NextResponse.json(
        { error: "قيمة الحظر غير صالحة" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ is_blocked, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, full_name, is_blocked")
      .single();

    if (error) {
      console.error("[PATCH /api/users]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "خطأ في تحديث المستخدم";
    console.error("[PATCH /api/users] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
