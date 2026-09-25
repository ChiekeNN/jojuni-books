import { db } from "@/db";
import {
  accounts,
  contacts,
  transactions,
  transactionLines,
  invoices,
  invoiceItems,
} from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // ─── Chart of Accounts ────────────────────────────────────────
    const accountData = [
      // Assets (1000-1999)
      { code: "1000", name: "Cash", type: "asset" as const, description: "Operating cash account" },
      { code: "1100", name: "Accounts Receivable", type: "asset" as const, description: "Money owed by clients" },
      { code: "1200", name: "Petty Cash", type: "asset" as const, description: "Small cash fund" },
      { code: "1500", name: "Office Equipment", type: "asset" as const, description: "Computers, furniture, etc." },
      { code: "1600", name: "Bank Savings", type: "asset" as const, description: "Savings account" },
      // Liabilities (2000-2999)
      { code: "2000", name: "Accounts Payable", type: "liability" as const, description: "Money owed to vendors" },
      { code: "2100", name: "Credit Card", type: "liability" as const, description: "Company credit card" },
      { code: "2200", name: "Accrued Expenses", type: "liability" as const, description: "Expenses incurred but not yet paid" },
      { code: "2300", name: "Tax Payable", type: "liability" as const, description: "Taxes owed" },
      // Equity (3000-3999)
      { code: "3000", name: "Owner's Equity", type: "equity" as const, description: "Owner investment" },
      { code: "3100", name: "Retained Earnings", type: "equity" as const, description: "Accumulated profits" },
      // Revenue (4000-4999)
      { code: "4000", name: "Consulting Revenue", type: "revenue" as const, description: "Consulting services income" },
      { code: "4100", name: "Software Revenue", type: "revenue" as const, description: "Software licensing income" },
      { code: "4200", name: "Support Revenue", type: "revenue" as const, description: "Support contract income" },
      { code: "4300", name: "Other Revenue", type: "revenue" as const, description: "Miscellaneous income" },
      // Expenses (5000-5999)
      { code: "5000", name: "Salaries & Wages", type: "expense" as const, description: "Employee compensation" },
      { code: "5100", name: "Office Rent", type: "expense" as const, description: "Monthly office rent" },
      { code: "5200", name: "Utilities", type: "expense" as const, description: "Electricity, water, internet" },
      { code: "5300", name: "Software Subscriptions", type: "expense" as const, description: "SaaS and tool subscriptions" },
      { code: "5400", name: "Marketing", type: "expense" as const, description: "Advertising and marketing costs" },
      { code: "5500", name: "Office Supplies", type: "expense" as const, description: "Stationery, printer supplies" },
      { code: "5600", name: "Travel & Entertainment", type: "expense" as const, description: "Business travel, meals" },
      { code: "5700", name: "Insurance", type: "expense" as const, description: "Business insurance premiums" },
      { code: "5800", name: "Depreciation", type: "expense" as const, description: "Asset depreciation" },
      { code: "5900", name: "Professional Services", type: "expense" as const, description: "Legal, accounting fees" },
    ];

    const insertedAccounts = await db.insert(accounts).values(accountData).returning();

    // ─── Contacts ────────────────────────────────────────────────
    const contactData = [
      { name: "Apex Digital Solutions", type: "client" as const, email: "billing@apexdigital.com", phone: "+1-555-0101" },
      { name: "Meridian Tech Corp", type: "client" as const, email: "accounts@meridiantech.com", phone: "+1-555-0102" },
      { name: "CloudNine Systems", type: "client" as const, email: "finance@cloudnine.io", phone: "+1-555-0103" },
      { name: "Greenfield Analytics", type: "client" as const, email: "ap@greenfieldanalytics.com", phone: "+1-555-0104" },
      { name: "Pinnacle Consulting Group", type: "both" as const, email: "hello@pinnaclecg.com", phone: "+1-555-0105" },
      { name: "TechRent Pro", type: "vendor" as const, email: "billing@techrentpro.com", phone: "+1-555-0201" },
      { name: "SwiftOffice Supplies", type: "vendor" as const, email: "orders@swiftoffice.com", phone: "+1-555-0202" },
      { name: "DataStream Hosting", type: "vendor" as const, email: "support@datastreamhost.com", phone: "+1-555-0203" },
      { name: "Atlas Insurance", type: "vendor" as const, email: "claims@atlasinsurance.com", phone: "+1-555-0204" },
      { name: "BrightPath Legal", type: "vendor" as const, email: "services@brightpathlegal.com", phone: "+1-555-0205" },
    ];

    const insertedContacts = await db.insert(contacts).values(contactData).returning();

    // Helper to find account by code
    const findAccount = (code: string) => insertedAccounts.find((a) => a.code === code)!;

    // ─── Transactions ────────────────────────────────────────────
    const txData = [
      // January - Initial capital injection
      {
        date: "2025-01-02",
        description: "Owner capital investment",
        reference: "EQ-001",
        contactId: null,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("1000").id, debit: "50000.00", credit: "0.00" },
          { accountId: findAccount("3000").id, debit: "0.00", credit: "50000.00" },
        ],
      },
      // January - Consulting revenue
      {
        date: "2025-01-15",
        description: "Consulting engagement - Apex Digital",
        reference: "INV-001",
        contactId: insertedContacts[0].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("1100").id, debit: "12000.00", credit: "0.00" },
          { accountId: findAccount("4000").id, debit: "0.00", credit: "12000.00" },
        ],
      },
      // January - Office rent
      {
        date: "2025-01-31",
        description: "January office rent",
        reference: "RENT-001",
        contactId: null,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5100").id, debit: "3500.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "3500.00" },
        ],
      },
      // February - Software revenue
      {
        date: "2025-02-10",
        description: "Software license - Meridian Tech",
        reference: "INV-002",
        contactId: insertedContacts[1].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("1100").id, debit: "8500.00", credit: "0.00" },
          { accountId: findAccount("4100").id, debit: "0.00", credit: "8500.00" },
        ],
      },
      // February - Salaries
      {
        date: "2025-02-28",
        description: "February payroll",
        reference: "PAY-002",
        contactId: null,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5000").id, debit: "18000.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "18000.00" },
        ],
      },
      // March - Support revenue
      {
        date: "2025-03-05",
        description: "Annual support contract - CloudNine",
        reference: "INV-003",
        contactId: insertedContacts[2].id,
        status: "posted" as const,
        lines: [
          { accountId: "1100" === "1100" ? findAccount("1100").id : findAccount("1100").id, debit: "15000.00", credit: "0.00" },
          { accountId: findAccount("4200").id, debit: "0.00", credit: "15000.00" },
        ],
      },
      // March - Utilities
      {
        date: "2025-03-15",
        description: "Utilities - March",
        reference: "UTIL-003",
        contactId: null,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5200").id, debit: "850.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "850.00" },
        ],
      },
      // March - Marketing
      {
        date: "2025-03-20",
        description: "Digital marketing campaign",
        reference: "MKT-003",
        contactId: null,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5400").id, debit: "4200.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "4200.00" },
        ],
      },
      // April - Consulting revenue
      {
        date: "2025-04-08",
        description: "Consulting - Greenfield Analytics",
        reference: "INV-004",
        contactId: insertedContacts[3].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("1100").id, debit: "9500.00", credit: "0.00" },
          { accountId: findAccount("4000").id, debit: "0.00", credit: "9500.00" },
        ],
      },
      // April - Software subscriptions expense
      {
        date: "2025-04-12",
        description: "SaaS subscriptions - April",
        reference: "SAAS-004",
        contactId: insertedContacts[7].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5300").id, debit: "2800.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "2800.00" },
        ],
      },
      // April - Rent
      {
        date: "2025-04-30",
        description: "April office rent",
        reference: "RENT-004",
        contactId: null,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5100").id, debit: "3500.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "3500.00" },
        ],
      },
      // May - Revenue
      {
        date: "2025-05-05",
        description: "Software license + support - Pinnacle",
        reference: "INV-005",
        contactId: insertedContacts[4].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("1100").id, debit: "11200.00", credit: "0.00" },
          { accountId: findAccount("4100").id, debit: "0.00", credit: "7200.00" },
          { accountId: findAccount("4200").id, debit: "0.00", credit: "4000.00" },
        ],
      },
      // May - Salaries
      {
        date: "2025-05-28",
        description: "May payroll",
        reference: "PAY-005",
        contactId: null,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5000").id, debit: "18000.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "18000.00" },
        ],
      },
      // May - Insurance
      {
        date: "2025-05-15",
        description: "Business insurance - Atlas",
        reference: "INS-005",
        contactId: insertedContacts[8].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5700").id, debit: "1200.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "1200.00" },
        ],
      },
      // June - Consulting revenue
      {
        date: "2025-06-03",
        description: "Consulting project - Apex Digital",
        reference: "INV-006",
        contactId: insertedContacts[0].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("1100").id, debit: "14500.00", credit: "0.00" },
          { accountId: findAccount("4000").id, debit: "0.00", credit: "14500.00" },
        ],
      },
      // June - Office supplies
      {
        date: "2025-06-10",
        description: "Office supplies - SwiftOffice",
        reference: "SUP-006",
        contactId: insertedContacts[6].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5500").id, debit: "450.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "450.00" },
        ],
      },
      // June - Professional services
      {
        date: "2025-06-18",
        description: "Legal services - BrightPath",
        reference: "LEG-006",
        contactId: insertedContacts[9].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5900").id, debit: "3500.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "3500.00" },
        ],
      },
      // June - Travel
      {
        date: "2025-06-22",
        description: "Client site travel",
        reference: "TRV-006",
        contactId: null,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("5600").id, debit: "1800.00", credit: "0.00" },
          { accountId: findAccount("1000").id, debit: "0.00", credit: "1800.00" },
        ],
      },
      // Cash collection from A/R
      {
        date: "2025-06-25",
        description: "Cash collection - Apex Digital",
        reference: "RCV-001",
        contactId: insertedContacts[0].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("1000").id, debit: "26500.00", credit: "0.00" },
          { accountId: findAccount("1100").id, debit: "0.00", credit: "26500.00" },
        ],
      },
      // Cash collection from A/R
      {
        date: "2025-06-26",
        description: "Cash collection - Meridian Tech",
        reference: "RCV-002",
        contactId: insertedContacts[1].id,
        status: "posted" as const,
        lines: [
          { accountId: findAccount("1000").id, debit: "8500.00", credit: "0.00" },
          { accountId: findAccount("1100").id, debit: "0.00", credit: "8500.00" },
        ],
      },
    ];

    for (const tx of txData) {
      const [insertedTx] = await db
        .insert(transactions)
        .values({
          date: tx.date,
          description: tx.description,
          reference: tx.reference,
          contactId: tx.contactId,
          status: tx.status,
        })
        .returning();

      await db.insert(transactionLines).values(
        tx.lines.map((line) => ({
          transactionId: insertedTx.id,
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
        }))
      );
    }

    // ─── Invoices ────────────────────────────────────────────────
    const invoiceData = [
      {
        number: "INV-2025-001",
        contactId: insertedContacts[0].id,
        type: "sales" as const,
        status: "paid" as const,
        issueDate: "2025-01-15",
        dueDate: "2025-02-15",
        subtotal: "12000.00",
        taxAmount: "0.00",
        total: "12000.00",
        notes: "Consulting engagement Q1",
        items: [
          { description: "Strategy consulting - 80 hours", quantity: "80", unitPrice: "150.00", amount: "12000.00" },
        ],
      },
      {
        number: "INV-2025-002",
        contactId: insertedContacts[1].id,
        type: "sales" as const,
        status: "paid" as const,
        issueDate: "2025-02-10",
        dueDate: "2025-03-10",
        subtotal: "8500.00",
        taxAmount: "0.00",
        total: "8500.00",
        notes: "Software license - annual",
        items: [
          { description: "Platform license - 1 year", quantity: "1", unitPrice: "8500.00", amount: "8500.00" },
        ],
      },
      {
        number: "INV-2025-003",
        contactId: insertedContacts[2].id,
        type: "sales" as const,
        status: "paid" as const,
        issueDate: "2025-03-05",
        dueDate: "2025-04-05",
        subtotal: "15000.00",
        taxAmount: "0.00",
        total: "15000.00",
        notes: "Support contract - annual",
        items: [
          { description: "Premium support - 12 months", quantity: "1", unitPrice: "15000.00", amount: "15000.00" },
        ],
      },
      {
        number: "INV-2025-004",
        contactId: insertedContacts[3].id,
        type: "sales" as const,
        status: "paid" as const,
        issueDate: "2025-04-08",
        dueDate: "2025-05-08",
        subtotal: "9500.00",
        taxAmount: "0.00",
        total: "9500.00",
        notes: "Consulting engagement",
        items: [
          { description: "Data analytics consulting - 50 hours", quantity: "50", unitPrice: "190.00", amount: "9500.00" },
        ],
      },
      {
        number: "INV-2025-005",
        contactId: insertedContacts[4].id,
        type: "sales" as const,
        status: "paid" as const,
        issueDate: "2025-05-05",
        dueDate: "2025-06-05",
        subtotal: "11200.00",
        taxAmount: "0.00",
        total: "11200.00",
        notes: "Software + support bundle",
        items: [
          { description: "Platform license - 1 year", quantity: "1", unitPrice: "7200.00", amount: "7200.00" },
          { description: "Standard support - 12 months", quantity: "1", unitPrice: "4000.00", amount: "4000.00" },
        ],
      },
      {
        number: "INV-2025-006",
        contactId: insertedContacts[0].id,
        type: "sales" as const,
        status: "sent" as const,
        issueDate: "2025-06-03",
        dueDate: "2025-07-03",
        subtotal: "14500.00",
        taxAmount: "0.00",
        total: "14500.00",
        notes: "Consulting project - Q2",
        items: [
          { description: "Advanced consulting - 100 hours", quantity: "100", unitPrice: "145.00", amount: "14500.00" },
        ],
      },
      {
        number: "INV-2025-007",
        contactId: insertedContacts[2].id,
        type: "sales" as const,
        status: "overdue" as const,
        issueDate: "2025-05-15",
        dueDate: "2025-06-15",
        subtotal: "7500.00",
        taxAmount: "0.00",
        total: "7500.00",
        notes: "Additional support hours",
        items: [
          { description: "Ad-hoc support - 50 hours", quantity: "50", unitPrice: "150.00", amount: "7500.00" },
        ],
      },
      // Purchase invoices
      {
        number: "PUR-2025-001",
        contactId: insertedContacts[5].id,
        type: "purchase" as const,
        status: "paid" as const,
        issueDate: "2025-01-10",
        dueDate: "2025-02-10",
        subtotal: "2800.00",
        taxAmount: "0.00",
        total: "2800.00",
        notes: "Equipment rental Q1",
        items: [
          { description: "Server rack rental - 3 months", quantity: "3", unitPrice: "933.33", amount: "2800.00" },
        ],
      },
      {
        number: "PUR-2025-002",
        contactId: insertedContacts[7].id,
        type: "purchase" as const,
        status: "paid" as const,
        issueDate: "2025-04-01",
        dueDate: "2025-05-01",
        subtotal: "2800.00",
        taxAmount: "0.00",
        total: "2800.00",
        notes: "SaaS subscriptions Q2",
        items: [
          { description: "Cloud hosting - 3 months", quantity: "3", unitPrice: "700.00", amount: "2100.00" },
          { description: "CI/CD platform - 3 months", quantity: "3", unitPrice: "233.33", amount: "700.00" },
        ],
      },
      {
        number: "PUR-2025-003",
        contactId: insertedContacts[8].id,
        type: "purchase" as const,
        status: "sent" as const,
        issueDate: "2025-05-15",
        dueDate: "2025-06-15",
        subtotal: "1200.00",
        taxAmount: "0.00",
        total: "1200.00",
        notes: "Insurance premium Q2",
        items: [
          { description: "Business liability insurance - Q2", quantity: "1", unitPrice: "1200.00", amount: "1200.00" },
        ],
      },
    ];

    for (const inv of invoiceData) {
      const { items: invItems, ...invFields } = inv;
      const [insertedInv] = await db.insert(invoices).values(invFields).returning();

      await db.insert(invoiceItems).values(
        invItems.map((item) => ({
          invoiceId: insertedInv.id,
          ...item,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      accounts: insertedAccounts.length,
      contacts: insertedContacts.length,
      transactions: txData.length,
      invoices: invoiceData.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed", details: String(error) }, { status: 500 });
  }
}
