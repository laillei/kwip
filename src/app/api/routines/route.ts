import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// GET /api/routines — list current user's routines
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/routines — create a new routine
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: { name: string; concern: string; products: unknown[] } =
    await request.json();

  if (!body.name || !body.concern || !Array.isArray(body.products)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .insert({
      user_id: (session.user as typeof session.user & { id?: string }).id ?? session.user.email,
      user_email: session.user.email,
      name: body.name,
      concern: body.concern,
      products: body.products,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
