import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tournaments, payments, userInvestments, withdrawals, results, notifications, investmentPlans } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// User queries
export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserBalance(userId: number, amount: string | number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ balance: String(amount) }).where(eq(users.id, userId));
}

export async function updateUserProfile(userId: number, data: Record<string, any>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// Tournament queries
export async function getTournaments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tournaments).orderBy(tournaments.startTime);
}

export async function getTournamentById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Payment queries
export async function getPaymentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.userId, userId));
}

export async function getPendingPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.status, "pending"));
}

// Investment queries
export async function getUserInvestments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userInvestments).where(eq(userInvestments.userId, userId));
}

// Withdrawal queries
export async function getWithdrawalsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId));
}

export async function getPendingWithdrawals() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(withdrawals).where(eq(withdrawals.status, "pending"));
}

// Result queries
export async function getResultsByTournament(tournamentId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(results).where(eq(results.tournamentId, tournamentId));
}

// Notification queries
export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.userId, userId));
}

// Investment plan queries
export async function getActiveInvestmentPlans() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(investmentPlans).where(eq(investmentPlans.isActive, 1 as any));
}
