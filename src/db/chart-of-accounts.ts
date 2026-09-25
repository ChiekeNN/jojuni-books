/**
 * Jojuni Technologies Ltd — Standard Chart of Accounts
 *
 * Single source of truth for account codes, names and the guidance
 * descriptions shown to the accountant. Codes follow the convention:
 *
 *   1xxx  Assets (cash, receivables, capital equipment)
 *   2xxx  Liabilities (payables, taxes owed)
 *   3xxx  Equity (owner's capital, drawings, retained earnings)
 *   4xxx  Income / Revenue
 *   5xxx  Operating Expenses
 */

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface StandardAccount {
  code: string;
  name: string;
  type: AccountType;
  /** Section heading used to group accounts in the UI and reports. */
  group: string;
  /** Guidance for the accountant on exactly what belongs in this account. */
  description: string;
}

export const COA_GROUPS = [
  "Cash & Receivables",
  "Capital Expenditures (Long-Term Assets)",
  "Liabilities",
  "Owner Equity & Drawings",
  "Income (Revenue)",
  "Technical & Cloud Infrastructure",
  "General, Administrative & Marketing",
] as const;

export const STANDARD_CHART_OF_ACCOUNTS: StandardAccount[] = [
  // ── 1xxx Assets: cash & receivables (needed for double-entry bookkeeping)
  {
    code: "1010",
    name: "Business Bank Account",
    type: "asset",
    group: "Cash & Receivables",
    description:
      "Jojuni Technologies Ltd's main operating bank account. Every client payment received and every bill paid from the company account flows through here.",
  },
  {
    code: "1110",
    name: "Accounts Receivable",
    type: "asset",
    group: "Cash & Receivables",
    description:
      "Money owed to Jojuni by clients for invoices already issued but not yet paid. Cleared when the client's payment lands in the bank account.",
  },

  // ── 1xxx Assets: capital expenditures
  {
    code: "1210",
    name: "Computers & Tech Hardware",
    type: "asset",
    group: "Capital Expenditures (Long-Term Assets)",
    description:
      "High-value assets like your main development laptop, testing smartphones, external monitors, or training routers. Record here (not as an expense) so they can be depreciated over their useful life.",
  },

  // ── 2xxx Liabilities
  {
    code: "2010",
    name: "Accounts Payable",
    type: "liability",
    group: "Liabilities",
    description:
      "Bills received from vendors and suppliers (hosting, Starlink wholesale, legal) that Jojuni has not yet paid.",
  },
  {
    code: "2020",
    name: "Tax Payable",
    type: "liability",
    group: "Liabilities",
    description:
      "Corporate tax, VAT/sales tax or withholding tax that has been collected or accrued but not yet remitted to the tax authority.",
  },

  // ── 3xxx Owner equity & drawings
  {
    code: "3000",
    name: "Owner's Capital",
    type: "equity",
    group: "Owner Equity & Drawings",
    description:
      "Personal funds the owner invests INTO Jojuni Technologies Ltd (start-up capital or top-ups to cover expenses). The opposite of an owner's draw.",
  },
  {
    code: "3010",
    name: "Owner's Draw / Distributions",
    type: "equity",
    group: "Owner Equity & Drawings",
    description:
      "Personal funds you transfer out of Jojuni Technologies Ltd's bank account to pay yourself from company profits. Not a business expense — it reduces equity.",
  },
  {
    code: "3100",
    name: "Retained Earnings",
    type: "equity",
    group: "Owner Equity & Drawings",
    description:
      "Accumulated profits from prior financial years that have been kept in the business rather than drawn out. Updated at year-end close.",
  },

  // ── 4xxx Income
  {
    code: "4010",
    name: "Software & App Dev Revenue",
    type: "revenue",
    group: "Income (Revenue)",
    description:
      "One-time fees from building custom software, web apps, iOS, and Android applications.",
  },
  {
    code: "4020",
    name: "Website Design Revenue",
    type: "revenue",
    group: "Income (Revenue)",
    description: "Fees earned from designing and launching client websites.",
  },
  {
    code: "4030",
    name: "Starlink Hardware & Installation",
    type: "revenue",
    group: "Income (Revenue)",
    description:
      "Income generated from selling Starlink equipment and physical setup fees.",
  },
  {
    code: "4040",
    name: "Monthly Maintenance Retainers",
    type: "revenue",
    group: "Income (Revenue)",
    description:
      "Recurring revenue from ongoing website/app support, cloud management, and managed network services.",
  },
  {
    code: "4050",
    name: "IT Training & Consulting",
    type: "revenue",
    group: "Income (Revenue)",
    description:
      "Fees collected from providing IT training sessions, corporate workshops, or technical consulting.",
  },
  {
    code: "4060",
    name: "Digital Product Sales",
    type: "revenue",
    group: "Income (Revenue)",
    description:
      "Passive income from selling pre-built software, themes, templates, or SaaS subscriptions.",
  },

  // ── 5xxx Operating expenses: technical & cloud infrastructure
  {
    code: "5010",
    name: "Hosting & Cloud Infrastructure",
    type: "expense",
    group: "Technical & Cloud Infrastructure",
    description:
      "Subscriptions for Vercel, Supabase, AWS, Google Cloud, or DigitalOcean to host client or internal apps.",
  },
  {
    code: "5020",
    name: "Software & SaaS Tools",
    type: "expense",
    group: "Technical & Cloud Infrastructure",
    description:
      "Developer tools like GitHub, JetBrains, Copilot, Figma, Jira, and Slack.",
  },
  {
    code: "5030",
    name: "Third-Party APIs & Services",
    type: "expense",
    group: "Technical & Cloud Infrastructure",
    description:
      "Direct project costs like OpenAI API credits, Stripe transaction fees, Twilio SMS, or Google Maps API.",
  },
  {
    code: "5040",
    name: "Starlink Inventory Purchases",
    type: "expense",
    group: "Technical & Cloud Infrastructure",
    description:
      "The wholesale cost of purchasing Starlink kits, mounts, or extra cabling for clients.",
  },

  // ── 5xxx Operating expenses: general, administrative & marketing
  {
    code: "5110",
    name: "Advertising & Marketing",
    type: "expense",
    group: "General, Administrative & Marketing",
    description:
      "Costs for your business website domain, email newsletters (HubSpot/ConvertKit), and digital ads.",
  },
  {
    code: "5120",
    name: "Professional Services & Legal",
    type: "expense",
    group: "General, Administrative & Marketing",
    description:
      "Fees paid to an accountant for corporate tax filing, or legal fees for client contracts.",
  },
  {
    code: "5130",
    name: "Bank & Merchant Fees",
    type: "expense",
    group: "General, Administrative & Marketing",
    description:
      "Monthly account maintenance fees or foreign exchange transaction charges.",
  },
  {
    code: "5140",
    name: "Workspace & Utilities",
    type: "expense",
    group: "General, Administrative & Marketing",
    description:
      "Home office deduction expenses, high-speed internet, power/fuel backups, and office supplies.",
  },
  {
    code: "5150",
    name: "Company Registry & Licensing",
    type: "expense",
    group: "General, Administrative & Marketing",
    description:
      "Annual filing fees to keep Jojuni Technologies Ltd active and legal with the corporate registry.",
  },
];

/** Look up the section heading for an account code (falls back on the leading digit). */
export function groupForCode(code: string): string {
  const match = STANDARD_CHART_OF_ACCOUNTS.find((a) => a.code === code);
  if (match) return match.group;
  switch (code.charAt(0)) {
    case "1":
      return "Other Assets";
    case "2":
      return "Liabilities";
    case "3":
      return "Owner Equity & Drawings";
    case "4":
      return "Income (Revenue)";
    case "5":
      return "Other Operating Expenses";
    default:
      return "Other";
  }
}
