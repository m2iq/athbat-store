import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/products/filters?category_id=xxx
// Returns distinct filter_tag values for a category
export async function GET(req: NextRequest) {
  const categoryId = new URL(req.url).searchParams.get("category_id");

  let query = supabase
    .from("products")
    .select("filter_tag")
    .not("filter_tag", "is", null);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const tags = [
    ...new Set((data ?? []).map((d: { filter_tag: string }) => d.filter_tag)),
  ];
  tags.sort();

  return NextResponse.json(tags);
}
