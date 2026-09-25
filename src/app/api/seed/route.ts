import { db } from "@/db";
import {
  accounts,
  contacts,
  transactions,
  transactionLines,
  invoices,
  invoiceItems,
} from "@/db/schema";
import { STANDARD_CHART_OF_ACCOUNTS } from "@/db/chart-of-accounts";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // ─── Chart of Accounts ────────────────────────────────────────
    const insertedAccounts = await db
      .insert(accounts)
      .values(
        STANDARD_CHART_OF_ACCOUNTS.map(({ code, name, type, description }) => ({
          code,
          name,
          type,
          description,
        }))
      )
      .returning();

    // ─── Contacts ────────────────────────────────────────────────
    const contactData = [
      { name: "Apex Digital Solutions", type: "client" as const, email: "billing@apexdigital.com", phone: "+1-555-0101" },
      { name: "Meridian Tech Corp", type: "client" as const, email: "accounts@meridiantech.com", phone: "+1-555-0102" },
      { name: "CloudNine Systems", type: "client" as const, email: "finance@cloudnine.io", phone: "+1-555-0103" },
      { name: "Greenfield Analytics", type: "client" as const, email: "ap@greenfieldanalytics.com", phone: "+1-555-0104" },
      { name: "Pinnacle Consulting Group", type: "both" as const, email: "hello@pinnaclecg.com", phone: "+1-555-0105" },
      { name: "Vercel Inc.", type: "vendor" as const, email: "billing@vercel.com", phone: "+1-555-0201" },
      { name: "Starlink Wholesale Distributors", type: "vendor" as const, email: "orders@starlinkwholesale.com", phone: "+1-555-0202" },
      { name: "GitHub / JetBrains", type: "vendor" as const, email: "billing@devtools.example", phone: "+1-555-0203" },
      { name: "OpenAI API", type: "vendor" as const, email: "billing@openai.com", phone: "+1-555-0204" },
      { name: "BrightPath Legal & Accounting", type: "vendor" as const, email: "services@brightpathlegal.com", phone: "+1-555-0205" },
    ];

    const insertedContacts = await db.insert(contacts).values(contactData).returning();

    // Helper to find account by code
    const findAccount = (code: string) => insertedAccounts.find((a) => a.code === code)!;
    const line = (code: string, debit: string, credit: string) => ({
      accountId: findAccount(code).id,
      debit,
      credit,
    });

    // ─── Transactions ────────────────────────────────────────────
    const txData = [
      {
        date: "2025-01-02",
        description: "Owner capital investment",
        reference: "EQ-001",
        contactId: null,
        status: "posted" as const,
        lines: [line("1010", "50000.00", "0.00"), line("3000", "0.00", "50000.00")],
      },
      {
        date: "2025-01-15",
        description: "Custom web app build - Apex Digital",
        reference: "INV-2025-001",
        contactId: insertedContacts[0].id,
        status: "posted" as const,
        lines: [line("1110", "12000.00", "0.00"), line("4010", "0.00", "12000.00")],
      },
      {
        date: "2025-01-20",
        description: "Development laptop purchase",
        reference: "CAPEX-001",
        contactId: null,
        status: "posted" as const,
        lines: [line("1210", "2800.00", "0.00"), line("1010", "0.00", "2800.00")],
      },
      {
        date: "2025-02-01",
        description: "Vercel & Supabase hosting - February",
        reference: "VER-0201",
        contactId: insertedContacts[5].id,
        status: "posted" as const,
        lines: [line("5010", "240.00", "0.00"), line("1010", "0.00", "240.00")],
      },
      {
        date: "2025-02-10",
        description: "Website design - Meridian Tech",
        reference: "INV-2025-002",
        contactId: insertedContacts[1].id,
        status: "posted" as const,
        lines: [line("1110", "8500.00", "0.00"), line("4020", "0.00", "8500.00")],
      },
      {
        date: "2025-02-14",
        description: "GitHub, Copilot & JetBrains subscriptions",
        reference: "SAAS-0214",
        contactId: insertedContacts[7].id,
        status: "posted" as const,
        lines: [line("5020", "180.00", "0.00"), line("1010", "0.00", "180.00")],
      },
      {
        date: "2025-03-01",
        description: "Starlink kits wholesale purchase (3 units)",
        reference: "PUR-2025-001",
        contactId: insertedContacts[6].id,
        status: "posted" as const,
        lines: [line("5040", "1650.00", "0.00"), line("2010", "0.00", "1650.00")],
      },
      {
        date: "2025-03-05",
        description: "Starlink hardware & installation - CloudNine",
        reference: "INV-2025-003",
        contactId: insertedContacts[2].id,
        status: "posted" as const,
        lines: [line("1110", "3900.00", "0.00"), line("4030", "0.00", "3900.00")],
      },
      {
        date: "2025-03-10",
        description: "Home office internet & power backup fuel - March",
        reference: "UTL-0310",
        contactId: null,
        status: "posted" as const,
        lines: [line("5140", "320.00", "0.00"), line("1010", "0.00", "320.00")],
      },
      {
        date: "2025-03-20",
        description: "Digital ads & newsletter campaign",
        reference: "MKT-0320",
        contactId: null,
        status: "posted" as const,
        lines: [line("5110", "1500.00", "0.00"), line("1010", "0.00", "1500.00")],
      },
      {
        date: "2025-04-01",
        description: "Monthly maintenance retainer - Greenfield Analytics",
        reference: "RET-0401",
        contactId: insertedContacts[3].id,
        status: "posted" as const,
        lines: [line("1010", "1200.00", "0.00"), line("4040", "0.00", "1200.00")],
      },
      {
        date: "2025-04-08",
        description: "OpenAI API credits - client chatbot project",
        reference: "API-0408",
        contactId: insertedContacts[8].id,
        status: "posted" as const,
        lines: [line("5030", "410.00", "0.00"), line("1010", "0.00", "410.00")],
      },
      {
        date: "2025-04-15",
        description: "Corporate IT training workshop - Pinnacle",
        reference: "INV-2025-004",
        contactId: insertedContacts[4].id,
        status: "posted" as const,
        lines: [line("1110", "4500.00", "0.00"), line("4050", "0.00", "4500.00")],
      },
      {
        date: "2025-04-30",
        description: "Annual company registry filing fee",
        reference: "REG-2025",
        contactId: null,
        status: "posted" as const,
        lines: [line("5150", "250.00", "0.00"), line("1010", "0.00", "250.00")],
      },
      {
        date: "2025-05-02",
        description: "Monthly maintenance retainer - Greenfield Analytics",
        reference: "RET-0502",
        contactId: insertedContacts[3].id,
        status: "posted" as const,
        lines: [line("1010", "1200.00", "0.00"), line("4040", "0.00", "1200.00")],
      },
      {
        date: "2025-05-12",
        description: "Template & theme sales (digital storefront)",
        reference: "DIG-0512",
        contactId: null,
        status: "posted" as const,
        lines: [line("1010", "760.00", "0.00"), line("4060", "0.00", "760.00")],
      },
      {
        date: "2025-05-20",
        description: "Accountant fees - corporate tax filing",
        reference: "PUR-2025-002",
        contactId: insertedContacts[9].id,
        status: "posted" as const,
        lines: [line("5120", "900.00", "0.00"), line("1010", "0.00", "900.00")],
      },
      {
        date: "2025-05-31",
        description: "Bank charges & FX fees - May",
        reference: "BNK-0531",
        contactId: null,
        status: "posted" as const,
        lines: [line("5130", "45.00", "0.00"), line("1010", "0.00", "45.00")],
      },
      {
        date: "2025-06-10",
        description: "Payment received - Apex Digital",
        reference: "RCV-001",
        contactId: insertedContacts[0].id,
        status: "posted" as const,
        lines: [line("1010", "12000.00", "0.00"), line("1110", "0.00", "12000.00")],
      },
      {
        date: "2025-06-26",
        description: "Payment received - Meridian Tech",
        reference: "RCV-002",
        contactId: insertedContacts[1].id,
        status: "posted" as const,
        lines: [line("1010", "8500.00", "0.00"), line("1110", "0.00", "8500.00")],
      },
      {
        date: "2025-06-30",
        description: "Owner's draw - June distribution",
        reference: "DRW-0630",
        contactId: null,
        status: "posted" as const,
        lines: [line("3010", "3000.00", "0.00"), line("1010", "0.00", "3000.00")],
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
        notes: "Custom web app build (4010 Software & App Dev Revenue)",
        items: [
          { description: "Custom web application - design & build", quantity: "1", unitPrice: "12000.00", amount: "12000.00" },
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
        notes: "Corporate website redesign (4020 Website Design Revenue)",
        items: [
          { description: "Website design & launch - 10 pages", quantity: "1", unitPrice: "8500.00", amount: "8500.00" },
        ],
      },
      {
        number: "INV-2025-003",
        contactId: insertedContacts[2].id,
        type: "sales" as const,
        status: "sent" as const,
        issueDate: "2025-03-05",
        dueDate: "2025-04-05",
        subtotal: "3900.00",
        taxAmount: "0.00",
        total: "3900.00",
        notes: "Starlink kits & installation (4030 Starlink Hardware & Installation)",
        items: [
          { description: "Starlink Standard Kit", quantity: "3", unitPrice: "950.00", amount: "2850.00" },
          { description: "On-site installation & mounting", quantity: "3", unitPrice: "350.00", amount: "1050.00" },
        ],
      },
      {
        number: "INV-2025-004",
        contactId: insertedContacts[4].id,
        type: "sales" as const,
        status: "overdue" as const,
        issueDate: "2025-04-15",
        dueDate: "2025-05-15",
        subtotal: "4500.00",
        taxAmount: "0.00",
        total: "4500.00",
        notes: "Corporate IT training workshop (4050 IT Training & Consulting)",
        items: [
          { description: "2-day corporate IT workshop - 15 staff", quantity: "1", unitPrice: "4500.00", amount: "4500.00" },
        ],
      },
      {
        number: "INV-2025-005",
        contactId: insertedContacts[3].id,
        type: "sales" as const,
        status: "paid" as const,
        issueDate: "2025-05-01",
        dueDate: "2025-05-15",
        subtotal: "1200.00",
        taxAmount: "0.00",
        total: "1200.00",
        notes: "Monthly retainer - May (4040 Monthly Maintenance Retainers)",
        items: [
          { description: "Website & cloud maintenance retainer - May", quantity: "1", unitPrice: "1200.00", amount: "1200.00" },
        ],
      },
      // Purchase invoices
      {
        number: "PUR-2025-001",
        contactId: insertedContacts[6].id,
        type: "purchase" as const,
        status: "sent" as const,
        issueDate: "2025-03-01",
        dueDate: "2025-03-31",
        subtotal: "1650.00",
        taxAmount: "0.00",
        total: "1650.00",
        notes: "Starlink wholesale stock (5040 Starlink Inventory Purchases)",
        items: [
          { description: "Starlink Standard Kit - wholesale", quantity: "3", unitPrice: "550.00", amount: "1650.00" },
        ],
      },
      {
        number: "PUR-2025-002",
        contactId: insertedContacts[9].id,
        type: "purchase" as const,
        status: "paid" as const,
        issueDate: "2025-05-20",
        dueDate: "2025-06-20",
        subtotal: "900.00",
        taxAmount: "0.00",
        total: "900.00",
        notes: "Corporate tax filing (5120 Professional Services & Legal)",
        items: [
          { description: "Annual corporate tax return preparation", quantity: "1", unitPrice: "900.00", amount: "900.00" },
        ],
      },
      {
        number: "PUR-2025-003",
        contactId: insertedContacts[5].id,
        type: "purchase" as const,
        status: "paid" as const,
        issueDate: "2025-04-01",
        dueDate: "2025-04-30",
        subtotal: "720.00",
        taxAmount: "0.00",
        total: "720.00",
        notes: "Hosting Q2 (5010 Hosting & Cloud Infrastructure)",
        items: [
          { description: "Vercel Pro + Supabase - 3 months", quantity: "3", unitPrice: "240.00", amount: "720.00" },
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
