import { db } from "@/db";
import { accounts } from "@/db/schema";
import { STANDARD_CHART_OF_ACCOUNTS } from "@/db/chart-of-accounts";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Returns the standard Jojuni chart of accounts definition (no DB access). */
export async function GET() {
  return NextResponse.json(STANDARD_CHART_OF_ACCOUNTS);
}

/**
 * Loads the standard chart of accounts into the database.
 * Accounts whose code already exists are left untouched, so this is safe to
 * run on a live ledger — it only adds the codes that are missing.
 */
export async function POST() {
  try {
    const inserted = await db
      .insert(accounts)
      .values(
        STANDARD_CHART_OF_ACCOUNTS.map(({ code, name, type, description }) => ({
          code,
          name,
          type,
          description,
        }))
      )
      .onConflictDoNothing({ target: accounts.code })
      .returning({ code: accounts.code });

    return NextResponse.json({
      success: true,
      added: inserted.length,
      skipped: STANDARD_CHART_OF_ACCOUNTS.length - inserted.length,
      codes: inserted.map((a) => a.code),
    });
  } catch (error) {
    console.error("Standard COA load error:", error);
    return NextResponse.json({ error: "Failed to load standard chart of accounts" }, { status: 500 });
  }
}
