import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  date,
  timestamp,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────

export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
]);

export const contactTypeEnum = pgEnum("contact_type", [
  "vendor",
  "client",
  "both",
]);

export const txStatusEnum = pgEnum("tx_status", ["draft", "posted"]);

export const invoiceTypeEnum = pgEnum("invoice_type", [
  "sales",
  "purchase",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]);

// ─── Accounts (Chart of Accounts) ────────────────────────────────────

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  type: accountTypeEnum("type").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Contacts (Vendors / Clients) ────────────────────────────────────

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  type: contactTypeEnum("type").notNull().default("both"),
  email: varchar("email", { length: 300 }),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Transactions (Journal Entries) ──────────────────────────────────

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  reference: varchar("reference", { length: 100 }),
  contactId: uuid("contact_id").references(() => contacts.id),
  status: txStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Transaction Lines (Debit / Credit) ──────────────────────────────

export const transactionLines = pgTable("transaction_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transactions.id, { onDelete: "cascade" }).notNull(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  debit: numeric("debit", { precision: 15, scale: 2 }).notNull().default("0.00"),
  credit: numeric("credit", { precision: 15, scale: 2 }).notNull().default("0.00"),
  description: varchar("description", { length: 500 }),
});

// ─── Invoices ────────────────────────────────────────────────────────

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: varchar("number", { length: 30 }).notNull().unique(),
  contactId: uuid("contact_id").references(() => contacts.id).notNull(),
  type: invoiceTypeEnum("type").notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull().default("0.00"),
  taxAmount: numeric("tax_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  total: numeric("total", { precision: 15, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Invoice Items ───────────────────────────────────────────────────

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: numeric("quantity", { precision: 15, scale: 2 }).notNull().default("1"),
  unitPrice: numeric("unit_price", { precision: 15, scale: 2 }).notNull().default("0.00"),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
});
