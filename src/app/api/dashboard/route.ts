import { db } from "@/db";
import { accounts, transactions, transactionLines, invoices, contacts } from "@/db/schema";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Total accounts
    const accountCount = await db.select({ count: sql<number>`count(*)::int` }).from(accounts);

    // Total contacts
    const contactCount = await db.select({ count: sql<number>`count(*)::int` }).from(contacts);

    // Total transactions
    const txCount = await db.select({ count: sql<number>`count(*)::int` }).from(transactions);

    // Total invoices
    const invCount = await db.select({ count: sql<number>`count(*)::int` }).from(invoices);

    // Revenue total (credit side of revenue accounts)
    const revenueResult = await db
      .select({ total: sql<string>`coalesce(sum(tl.credit::numeric), 0)` })
      .from(transactionLines)
      .innerJoin(transactions, eq(transactionLines.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactionLines.accountId, accounts.id))
      .where(eq(accounts.type, "revenue"));

    // Expense total (debit side of expense accounts)
    const expenseResult = await db
      .select({ total: sql<string>`coalesce(sum(tl.debit::numeric), 0)` })
      .from(transactionLines)
      .innerJoin(transactions, eq(transactionLines.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactionLines.accountId, accounts.id))
      .where(eq(accounts.type, "expense"));

    // Invoice totals by status
    const invoiceByStatus = await db
      .select({
        status: invoices.status,
        count: sql<number>`count(*)::int`,
        total: sql<string>`coalesce(sum(i.total::numeric), 0)`,
      })
      .from(invoices)
      .groupBy(invoices.status);

    // Recent transactions
    const recentTx = await db
      .select({
        id: transactions.id,
        date: transactions.date,
        description: transactions.description,
        reference: transactions.reference,
        status: transactions.status,
      })
      .from(transactions)
      .orderBy(desc(transactions.date))
      .limit(5);

    // Recent invoices
    const recentInv = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        type: invoices.type,
        status: invoices.status,
        total: invoices.total,
        dueDate: invoices.dueDate,
      })
      .from(invoices)
      .orderBy(desc(invoices.createdAt))
      .limit(5);

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await db
      .select({
        month: sql<string>`to_char(t.date::date, 'YYYY-MM')`,
        total: sql<string>`coalesce(sum(tl.credit::numeric), 0)`,
      })
      .from(transactionLines)
      .innerJoin(transactions, eq(transactionLines.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactionLines.accountId, accounts.id))
      .where(
        and(
          eq(accounts.type, "revenue"),
          gte(transactions.date, sixMonthsAgo.toISOString().split("T")[0])
        )
      )
      .groupBy(sql`to_char(t.date::date, 'YYYY-MM')`)
      .orderBy(sql`to_char(t.date::date, 'YYYY-MM')`);

    const monthlyExpenses = await db
      .select({
        month: sql<string>`to_char(t.date::date, 'YYYY-MM')`,
        total: sql<string>`coalesce(sum(tl.debit::numeric), 0)`,
      })
      .from(transactionLines)
      .innerJoin(transactions, eq(transactionLines.transactionId, transactions.id))
      .innerJoin(accounts, eq(transactionLines.accountId, accounts.id))
      .where(
        and(
          eq(accounts.type, "expense"),
          gte(transactions.date, sixMonthsAgo.toISOString().split("T")[0])
        )
      )
      .groupBy(sql`to_char(t.date::date, 'YYYY-MM')`)
      .orderBy(sql`to_char(t.date::date, 'YYYY-MM')`);

    // Account balances by type
    const accountBalances = await db
      .select({
        type: accounts.type,
        balance: sql<string>`coalesce(sum(tl.credit::numeric) - sum(tl.debit::numeric), 0)`,
      })
      .from(accounts)
      .leftJoin(transactionLines, eq(transactionLines.accountId, accounts.id))
      .leftJoin(transactions, eq(transactionLines.transactionId, transactions.id))
      .groupBy(accounts.type);

    return NextResponse.json({
      accounts: accountCount[0]?.count ?? 0,
      contacts: contactCount[0]?.count ?? 0,
      transactions: txCount[0]?.count ?? 0,
      invoices: invCount[0]?.count ?? 0,
      revenue: parseFloat(revenueResult[0]?.total ?? "0"),
      expenses: parseFloat(expenseResult[0]?.total ?? "0"),
      profit: parseFloat(revenueResult[0]?.total ?? "0") - parseFloat(expenseResult[0]?.total ?? "0"),
      invoiceByStatus,
      recentTransactions: recentTx,
      recentInvoices: recentInv,
      monthlyRevenue,
      monthlyExpenses,
      accountBalances,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        accounts: 0,
        contacts: 0,
        transactions: 0,
        invoices: 0,
        revenue: 0,
        expenses: 0,
        profit: 0,
        invoiceByStatus: [],
        recentTransactions: [],
        recentInvoices: [],
        monthlyRevenue: [],
        monthlyExpenses: [],
        accountBalances: [],
      },
      { status: 200 }
    );
  }
}
