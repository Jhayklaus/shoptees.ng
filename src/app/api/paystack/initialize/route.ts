import { NextResponse } from "next/server";
import { isPaystackConfigured } from "@/lib/paystack";

// STUB — real implementation gated behind HILCS #3 (SDK install + key provisioning).
export async function POST() {
  if (!isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Paystack not configured. See OPEN_QUESTIONS.md." },
      { status: 501 }
    );
  }
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
