import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  gamingName: varchar("gamingName", { length: 100 }),
  dpUrl: text("dpUrl"),
  upiId: varchar("upiId", { length: 100 }),
  qrUrl: text("qrUrl"),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  totalInvested: decimal("totalInvested", { precision: 12, scale: 2 }).default("0").notNull(),
  totalProfit: decimal("totalProfit", { precision: 12, scale: 2 }).default("0").notNull(),
  totalLoss: decimal("totalLoss", { precision: 12, scale: 2 }).default("0").notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tournaments table
export const tournaments = mysqlTable("tournaments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  map: varchar("map", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  entryFee: decimal("entryFee", { precision: 10, scale: 2 }).notNull(),
  prizePool: decimal("prizePool", { precision: 10, scale: 2 }).notNull(),
  totalSlots: int("totalSlots").default(48).notNull(),
  joinedCount: int("joinedCount").default(0).notNull(),
  startTime: timestamp("startTime").notNull(),
  status: mysqlEnum("status", ["upcoming", "live", "completed", "cancelled"]).default("upcoming").notNull(),
  roomId: varchar("roomId", { length: 100 }),
  password: varchar("password", { length: 100 }),
  details: text("details"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = typeof tournaments.$inferInsert;

// Payments table
export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  tournamentId: varchar("tournamentId", { length: 36 }),
  type: mysqlEnum("type", ["tournament_join", "add_fund", "withdrawal"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  utr: varchar("utr", { length: 100 }),
  screenshotUrl: text("screenshotUrl"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  rejectedReason: text("rejectedReason"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Investment Plans table
export const investmentPlans = mysqlTable("investmentPlans", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  minAmount: decimal("minAmount", { precision: 10, scale: 2 }).notNull(),
  maxAmount: decimal("maxAmount", { precision: 10, scale: 2 }).notNull(),
  roi: decimal("roi", { precision: 5, scale: 2 }).notNull(),
  lockInDays: int("lockInDays").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium").notNull(),
  description: text("description"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestmentPlan = typeof investmentPlans.$inferSelect;
export type InsertInvestmentPlan = typeof investmentPlans.$inferInsert;

// User Investments table
export const userInvestments = mysqlTable("userInvestments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  planId: varchar("planId", { length: 36 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  roi: decimal("roi", { precision: 5, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  profitAmount: decimal("profitAmount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserInvestment = typeof userInvestments.$inferSelect;
export type InsertUserInvestment = typeof userInvestments.$inferInsert;

// Results table
export const results = mysqlTable("results", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tournamentId: varchar("tournamentId", { length: 36 }).notNull(),
  winnerId: int("winnerId").notNull(),
  winnerName: varchar("winnerName", { length: 100 }).notNull(),
  winnerUid: varchar("winnerUid", { length: 100 }),
  prizeAmount: decimal("prizeAmount", { precision: 10, scale: 2 }).notNull(),
  runnerUp: varchar("runnerUp", { length: 100 }),
  message: text("message"),
  imageUrl: text("imageUrl"),
  likes: int("likes").default(0).notNull(),
  comments: json("comments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Result = typeof results.$inferSelect;
export type InsertResult = typeof results.$inferInsert;

// Withdrawals table
export const withdrawals = mysqlTable("withdrawals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  upiId: varchar("upiId", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  processedBy: int("processedBy"),
  rejectedReason: text("rejectedReason"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["payment", "tournament", "investment", "withdrawal", "result"]).notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;