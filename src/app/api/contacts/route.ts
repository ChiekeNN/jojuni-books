import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    console.error("Contacts GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [created] = await db
      .insert(contacts)
      .values({
        name: body.name,
        type: body.type ?? "both",
        email: body.email ?? null,
        phone: body.phone ?? null,
        address: body.address ?? null,
      })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Contacts POST error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const [updated] = await db
      .update(contacts)
      .set({
        name: body.name,
        type: body.type,
        email: body.email ?? null,
        phone: body.phone ?? null,
        address: body.address ?? null,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, body.id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Contacts PUT error:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.delete(contacts).where(eq(contacts.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contacts DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
