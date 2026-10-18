import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

// GET: Fetch all donations for the logged-in user
export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // 1. Fetch donations and expenses
    const { data: donations, error: donationError } = await supabase
    .from("donation")
    .select(`
      *,
      User (
        name,
        cnic
      )
    `)
    .order("date", { ascending: false });

  const { data: expenses, error: expenseError } = await supabase
    .from("expense")
    .select("amount, type");

  if (donationError || expenseError) {
    return NextResponse.json({ error: "Failed to load financial data" }, { status: 500 });
  }

  // 2. Calculate Totals
  const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const globalBalance = totalDonations - totalExpenses;

  // 3. Calculate Specific Fund Balances (Donations - Expenses for that fund)
  const calculateFundBalance = (fundName: string) => {
    const fundIn = donations
      ?.filter((d) => d.category === fundName)
      .reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      
    const fundOut = expenses
      ?.filter((e) => e.type === fundName)
      .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    return fundIn - fundOut;
  };

  const balances = {
    global: globalBalance,
    zakat: calculateFundBalance("ZAKAT"),
    fitrana: calculateFundBalance("FITRANA"),
    sadqa: calculateFundBalance("SADQA"),
  };

  return NextResponse.json({
    donations: donations ?? [],
    balances
  });
}

// POST: Create a new donation
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    // Grab the userId sent from the form, fallback to the logged-in user if missing
    const { amount, date, description, category, userId } = body; 

    if (!amount || amount <= 0 || !category) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const receiptNumber = `RCPT-${Date.now()}`;

    const { data, error } = await supabase
      .from("donation")
      .insert({
        userId: userId, // <--- Uses the selected member's ID!
        amount: parseFloat(amount),
        date: date,
        description: description || null,
        category: category,
        reciept: receiptNumber,
        meeting_id: null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}