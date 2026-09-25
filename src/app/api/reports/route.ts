import { db } from "@/db";
import { accounts, transactions, transactionLines } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") ?? "pnl";

    if (reportType === "pnl") {
      return await profitAndLoss();
    } else if (reportType === "balance") {
      return await balanceSheet();
    } else if (reportType === "trial") {
      return await trialBalance();
    }

    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

async function profitAndLoss() {
  // Revenue accounts with their balances
  const revenueAccounts = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      credit: sql<string>`coalesce(sum(tl.credit::numeric), 0)`,
      debit: sql<string>`coalesce(sum(tl.debit::numeric), 0)`,
    })
    .from(accounts)
    .leftJoin(transactionLines, eq(transactionLines.accountId, accounts.id))
    .leftJoin(transactions, eq(transactionLines.transactionId, transactions.id))
    .where(eq(accounts.type, "revenue"))
    .groupBy(accounts.id, accounts.code, accounts.name)
    .orderBy(accounts.code);

  const revenue = revenueAccounts.map((a) => ({
    ...a,
    balance: parseFloat(a.credit) - parseFloat(a.debit),
  }));

  // Expense accounts with their balances
  const expenseAccounts = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      debit: sql<string>`coalesce(sum(tl.debit::numeric), 0)`,
      credit: sql<string>`coalesce(sum(tl.credit::numeric), 0)`,
    })
    .from(accounts)
    .leftJoin(transactionLines, eq(transactionLines.accountId, accounts.id))
    .leftJoin(transactions, eq(transactionLines.transactionId, transactions.id))
    .where(eq(accounts.type, "expense"))
    .groupBy(accounts.id, accounts.code, accounts.name)
    .orderBy(accounts.code);

  const expenses = expenseAccounts.map((a) => ({
    ...a,
    balance: parseFloat(a.debit) - parseFloat(a.credit),
  }));

  const totalRevenue = revenue.reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalRevenue - totalExpenses;

  return NextResponse.json({
    type: "pnl",
    revenue,
    expenses,
    totalRevenue,
    totalExpenses,
    netIncome,
  });
}

async function balanceSheet() {
  // Asset accounts
  const assetAccounts = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      debit: sql<string>`coalesce(sum(tl.debit::numeric), 0)`,
      credit: sql<string>`coalesce(sum(tl.credit::numeric), 0)`,
    })
    .from(accounts)
    .leftJoin(transactionLines, eq(transactionLines.accountId, accounts.id))
    .leftJoin(transactions, eq(transactionLines.transactionId, transactions.id))
    .where(eq(accounts.type, "asset"))
    .groupBy(accounts.id, accounts.code, accounts.name)
    .orderBy(accounts.code);

  const assets = assetAccounts.map((a) => ({
    ...a,
    balance: parseFloat(a.debit) - parseFloat(a.credit),
  }));

  // Liability accounts
  const liabilityAccounts = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      credit: sql<string>`coalesce(sum(tl.credit::numeric), 0)`,
      debit: sql<string>`coalesce(sum(tl.debit::numeric), 0)`,
    })
    .from(accounts)
    .leftJoin(transactionLines, eq(transactionLines.accountId, accounts.id))
    .leftJoin(transactions, eq(transactionLines.transactionId, transactions.id))
    .where(eq(accounts.type, "liability"))
    .groupBy(accounts.id, accounts.code, accounts.name)
    .orderBy(accounts.code);

  const liabilities = liabilityAccounts.map((a) => ({
    ...a,
    balance: parseFloat(a.credit) - parseFloat(a.debit),
  }));

  // Equity accounts
  const equityAccounts = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      credit: sql<string>`coalesce(sum(tl.credit::numeric), 0)`,
      debit: sql<string>`coalesce(sum(tl.debit::numeric), 0)`,
    })
    .from(accounts)
    .leftJoin(transactionLines, eq(transactionLines.accountId, accounts.id))
    .leftJoin(transactions, eq(transactionLines.transactionId, transactions.id))
    .where(eq(accounts.type, "equity"))
    .groupBy(accounts.id, accounts.code, accounts.name)
    .orderBy(accounts.code);

  const equity = equityAccounts.map((a) => ({
    ...a,
    balance: parseFloat(a.credit) - parseFloat(a.debit),
  }));

  const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0);

  return NextResponse.json({
    type: "balance",
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
  });
}

async function trialBalance() {
  const allAccounts = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      type: accounts.type,
      debit: sql<string>`coalesce(sum(tl.debit::numeric), 0)`,
      credit: sql<string>`coalesce(sum(tl.credit::numeric), 0)`,
    })
    .from(accounts)
    .leftJoin(transactionLines, eq(transactionLines.accountId, accounts.id))
    .leftJoin(transactions, eq(transactionLines.transactionId, transactions.id))
    .groupBy(accounts.id, accounts.code, accounts.name, accounts.type)
    .orderBy(accounts.code);

  const totalDebit = allAccounts.reduce((sum, a) => sum + parseFloat(a.debit), 0);
  const totalCredit = allAccounts.reduce((sum, a) => sum + parseFloat(a.credit), 0);

  return NextResponse.json({
    type: "trial",
    accounts: allAccounts,
    totalDebit,
    totalCredit,
  });
}
