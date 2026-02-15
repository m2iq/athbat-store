import { supabase } from "@/lib/supabase";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`;
}

function hashCode(code: string): string {
  const normalized = code.replace(/[-\s]/g, "").toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50")),
    );
    const batch = searchParams.get("batch") || undefined;
    const status = searchParams.get("status") || undefined;

    let query = supabase
      .from("recharge_codes")
      .select(
        "id, code_hash, amount, is_used, used_by, used_at, batch_id, expires_at, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (batch) query = query.eq("batch_id", batch);
    if (status === "used") query = query.eq("is_used", true);
    if (status === "unused") query = query.eq("is_used", false);

    const { data, error, count } = await query;

    if (error) {
      console.error("[GET /api/recharge-codes]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [], total: count ?? 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطأ في جلب الرموز";
    console.error("[GET /api/recharge-codes] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, count: codeCount, expires_days } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "المبلغ يجب أن يكون أكبر من صفر" },
        { status: 400 },
      );
    }

    if (!codeCount || codeCount < 1 || codeCount > 500) {
      return NextResponse.json(
        { error: "العدد يجب أن يكون بين 1 و 500" },
        { status: 400 },
      );
    }

    const batchId = crypto.randomUUID();
    const expiresAt = expires_days
      ? new Date(Date.now() + expires_days * 86400000).toISOString()
      : null;

    const codes: string[] = [];
    const records = [];

    for (let i = 0; i < codeCount; i++) {
      const code = generateCode();
      codes.push(code);
      records.push({
        code_hash: hashCode(code),
        amount,
        batch_id: batchId,
        expires_at: expiresAt,
      });
    }

    const { error } = await supabase.from("recharge_codes").insert(records);

    if (error) {
      console.error("[POST /api/recharge-codes]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      batch_id: batchId,
      codes,
      amount,
      count: codes.length,
      expires_at: expiresAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل توليد الرموز";
    console.error("[POST /api/recharge-codes] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
