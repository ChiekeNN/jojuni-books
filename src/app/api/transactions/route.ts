import { db } from "@/db";
import { transactions, transactionLines, accounts } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await db
      .select({
        id: transactions.id,
        date: transactions.date,
        description: transactions.description,
        reference: transactions.reference,
        contactId: transactions.contactId,
        status: transactions.status,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .orderBy(desc(transactions.date));

    // Get lines for each transaction
    const result = [];
    for (const tx of all) {
      const lines = await db
        .select({
          id: transactionLines.id,
          accountId: transactionLines.accountId,
          debit: transactionLines.debit,
          credit: transactionLines.credit,
          description: transactionLines.description,
          accountCode: accounts.code,
          accountName: accounts.name,
        })
        .from(transactionLines)
        .innerJoin(accounts, eq(transactionLines.accountId, accounts.id))
        .where(eq(transactionLines.transactionId, tx.id))
        .orderBy(asc(transactionLines.id));

      result.push({ ...tx, lines });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Transactions GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const [tx] = await db
      .insert(transactions)
      .values({
        date: body.date,
        description: body.description,
        reference: body.reference ?? null,
        contactId: body.contactId ?? null,
        status: body.status ?? "draft",
      })
      .returning();

    if (body.lines && body.lines.length > 0) {
      await db.insert(transactionLines).values(
        body.lines.map((line: { accountId: string; debit: string; credit: string; description?: string }) => ({
          transactionId: tx.id,
          accountId: line.accountId,
          debit: line.debit ?? "0.00",
          credit: line.credit ?? "0.00",
          description: line.description ?? null,
        }))
      );
    }

    return NextResponse.json(tx, { status: 201 });
  } catch (error) {
    console.error("Transactions POST error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const [tx] = await db
      .update(transactions)
      .set({
        date: body.date,
        description: body.description,
        reference: body.reference ?? null,
        contactId: body.contactId ?? null,
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, body.id))
      .returning();

    // Delete old lines and insert new ones
    await db.delete(transactionLines).where(eq(transactionLines.transactionId, body.id));
    if (body.lines && body.lines.length > 0) {
      await db.insert(transactionLines).values(
        body.lines.map((line: { accountId: string; debit: string; credit: string; description?: string }) => ({
          transactionId: body.id,
          accountId: line.accountId,
          debit: line.debit ?? "0.00",
          credit: line.credit ?? "0.00",
          description: line.description ?? null,
        }))
      );
    }

    return NextResponse.json(tx);
  } catch (error) {
    console.error("Transactions PUT error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.delete(transactions).where(eq(transactions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transactions DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
