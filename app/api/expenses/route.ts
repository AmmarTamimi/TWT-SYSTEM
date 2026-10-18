import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

// GET: Fetch all expenses
export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("expense")
    .select("*")
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST: Create a new expense
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { amount, description, date, category, type } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!category || !type) {
      return NextResponse.json({ error: "Category and Fund Type are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const expenseAmount = parseFloat(amount);
    const fundSource = type.toUpperCase();
    const isGeneral = fundSource === "GENERAL";

    // 1. Define which donation categories belong to this fund source
    const donationCategories = isGeneral
      ? ["GENERAL", "MEETING_FUND", "MEETING_DUE"]
      : [fundSource];

    // 2. Fetch the relevant donations
    const { data: donations } = await supabase
      .from("donation")
      .select("amount")
      .in("category", donationCategories);

    // 3. Fetch the expenses already taken from this fund
    const { data: expenses } = await supabase
      .from("expense")
      .select("amount")
      .eq("type", fundSource);

    // 4. Calculate available balance
    const totalIn = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
    const totalOut = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    const availableBalance = totalIn - totalOut;

    // 5. Block if insufficient
    if (expenseAmount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient funds in ${fundSource} pool. Available balance: PKR ${availableBalance.toLocaleString()}` },
        { status: 400 }
      );
    }

    // 6. Insert the expense
    const { data, error } = await supabase
      .from("expense")
      .insert({
        amount: expenseAmount,
        description: description || null,
        date: date || new Date().toISOString(),
        category: category.toUpperCase(), 
        type: fundSource,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Expense error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}