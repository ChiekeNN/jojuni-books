import { db } from "@/db";
import { invoices, invoiceItems, contacts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        contactId: invoices.contactId,
        type: invoices.type,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        total: invoices.total,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        contactName: contacts.name,
      })
      .from(invoices)
      .innerJoin(contacts, eq(invoices.contactId, contacts.id))
      .orderBy(desc(invoices.createdAt));

    // Get items for each invoice
    const result = [];
    for (const inv of all) {
      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, inv.id));
      result.push({ ...inv, items });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Invoices GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const [inv] = await db
      .insert(invoices)
      .values({
        number: body.number,
        contactId: body.contactId,
        type: body.type,
        status: body.status ?? "draft",
        issueDate: body.issueDate,
        dueDate: body.dueDate,
        subtotal: body.subtotal ?? "0.00",
        taxAmount: body.taxAmount ?? "0.00",
        total: body.total ?? "0.00",
        notes: body.notes ?? null,
      })
      .returning();

    if (body.items && body.items.length > 0) {
      await db.insert(invoiceItems).values(
        body.items.map((item: { description: string; quantity: string; unitPrice: string; amount: string }) => ({
          invoiceId: inv.id,
          description: item.description,
          quantity: item.quantity ?? "1",
          unitPrice: item.unitPrice ?? "0.00",
          amount: item.amount ?? "0.00",
        }))
      );
    }

    return NextResponse.json(inv, { status: 201 });
  } catch (error) {
    console.error("Invoices POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const [inv] = await db
      .update(invoices)
      .set({
        number: body.number,
        contactId: body.contactId,
        type: body.type,
        status: body.status,
        issueDate: body.issueDate,
        dueDate: body.dueDate,
        subtotal: body.subtotal ?? "0.00",
        taxAmount: body.taxAmount ?? "0.00",
        total: body.total ?? "0.00",
        notes: body.notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, body.id))
      .returning();

    // Delete old items and insert new ones
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, body.id));
    if (body.items && body.items.length > 0) {
      await db.insert(invoiceItems).values(
        body.items.map((item: { description: string; quantity: string; unitPrice: string; amount: string }) => ({
          invoiceId: body.id,
          description: item.description,
          quantity: item.quantity ?? "1",
          unitPrice: item.unitPrice ?? "0.00",
          amount: item.amount ?? "0.00",
        }))
      );
    }

    return NextResponse.json(inv);
  } catch (error) {
    console.error("Invoices PUT error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.delete(invoices).where(eq(invoices.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Invoices DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
