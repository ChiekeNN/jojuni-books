import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await db.select().from(accounts).orderBy(asc(accounts.code));
    return NextResponse.json(all);
  } catch (error) {
    console.error("Accounts GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [created] = await db
      .insert(accounts)
      .values({
        code: body.code,
        name: body.name,
        type: body.type,
        description: body.description ?? null,
        isActive: body.isActive ?? true,
      })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Accounts POST error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const [updated] = await db
      .update(accounts)
      .set({
        code: body.code,
        name: body.name,
        type: body.type,
        description: body.description ?? null,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, body.id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Accounts PUT error:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.delete(accounts).where(eq(accounts.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accounts DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
