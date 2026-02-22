import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  getUserByPhone,
  updateUserProfile,
  getTournaments,
  getTournamentById,
  getPaymentsByUserId,
  getPendingPayments,
  getUserInvestments,
  getWithdrawalsByUserId,
  getPendingWithdrawals,
  getResultsByTournament,
  getUserNotifications,
  getActiveInvestmentPlans,
  getDb,
  updateUserBalance,
} from "./db";
import {
  users,
  tournaments,
  payments,
  userInvestments,
  withdrawals,
  results,
  notifications,
  investmentPlans,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User Profile Routes
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      return user.length > 0 ? user[0] : null;
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          phone: z.string().optional(),
          gamingName: z.string().optional(),
          dpUrl: z.string().optional(),
          upiId: z.string().optional(),
          qrUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      if (user.length === 0) return null;
      return {
        balance: user[0].balance,
        totalInvested: user[0].totalInvested,
        totalProfit: user[0].totalProfit,
        totalLoss: user[0].totalLoss,
      };
    }),
  }),

  // Tournament Routes
  tournament: router({
    list: publicProcedure.query(async () => {
      return await getTournaments();
    }),

    getById: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await getTournamentById(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          map: z.string(),
          type: z.string(),
          entryFee: z.number(),
          prizePool: z.number(),
          totalSlots: z.number().default(48),
          startTime: z.date(),
          details: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can create tournaments");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const id = nanoid();
        await db.insert(tournaments).values({
          id,
          map: input.map,
          type: input.type,
          entryFee: String(input.entryFee) as any,
          prizePool: String(input.prizePool) as any,
          totalSlots: input.totalSlots,
          startTime: input.startTime,
          details: input.details,
          createdBy: ctx.user.id,
        });
        return { id, success: true };
      }),

    updateRoomCredentials: protectedProcedure
      .input(
        z.object({
          tournamentId: z.string(),
          roomId: z.string(),
          password: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can update room credentials");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(tournaments)
          .set({ roomId: input.roomId, password: input.password })
          .where(eq(tournaments.id, input.tournamentId));
        return { success: true };
      }),
  }),

  // Payment Routes
  payment: router({
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getPaymentsByUserId(ctx.user.id);
    }),

    submitPayment: protectedProcedure
      .input(
        z.object({
          tournamentId: z.string().optional(),
          amount: z.number(),
          utr: z.string(),
          screenshotUrl: z.string(),
          type: z.enum(["tournament_join", "add_fund", "withdrawal"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const id = nanoid();
        await db.insert(payments).values({
          id,
          userId: ctx.user.id,
          tournamentId: input.tournamentId,
          amount: String(input.amount) as any,
          utr: input.utr,
          screenshotUrl: input.screenshotUrl,
          type: input.type as any,
          status: "pending" as any,
        });
        return { id, success: true };
      }),

    approvePayment: protectedProcedure
      .input(z.object({ paymentId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can approve payments");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get payment details
        const payment = await db
          .select()
          .from(payments)
          .where(eq(payments.id, input.paymentId))
          .limit(1);

        if (payment.length === 0) throw new Error("Payment not found");

        // Update payment status
        await db
          .update(payments)
          .set({ status: "approved", approvedBy: ctx.user.id })
          .where(eq(payments.id, input.paymentId));

        // Credit user wallet
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, payment[0].userId))
          .limit(1);

        if (user.length > 0) {
          const newBalance =
            parseFloat(String(user[0].balance)) + payment[0].amount;
          await updateUserBalance(payment[0].userId, newBalance);
        }

        return { success: true };
      }),

    rejectPayment: protectedProcedure
      .input(
        z.object({ paymentId: z.string(), reason: z.string().optional() })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can reject payments");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(payments)
          .set({
            status: "rejected",
            rejectedReason: input.reason,
            approvedBy: ctx.user.id,
          })
          .where(eq(payments.id, input.paymentId));

        return { success: true };
      }),

    getPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view pending payments");
      }
      return await getPendingPayments();
    }),
  }),

  // Investment Routes
  investment: router({
    getPlans: publicProcedure.query(async () => {
      return await getActiveInvestmentPlans();
    }),

    getUserInvestments: protectedProcedure.query(async ({ ctx }) => {
      return await getUserInvestments(ctx.user.id);
    }),

    invest: protectedProcedure
      .input(
        z.object({
          planId: z.string(),
          amount: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get plan details
        const plan = await db
          .select()
          .from(investmentPlans)
          .where(eq(investmentPlans.id, input.planId))
          .limit(1);

        if (plan.length === 0) throw new Error("Plan not found");

        // Check user balance
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (user.length === 0) throw new Error("User not found");
        if (parseFloat(String(user[0].balance)) < input.amount) {
          throw new Error("Insufficient balance");
        }

        // Create investment
        const investmentId = nanoid();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan[0].lockInDays);

        await db.insert(userInvestments).values({
          id: investmentId,
          userId: ctx.user.id,
          planId: input.planId,
          amount: String(input.amount) as any,
          roi: String(plan[0].roi) as any,
          endDate,
        });

        // Deduct from balance
        const newBalance =
          parseFloat(String(user[0].balance)) - input.amount;
        await updateUserBalance(ctx.user.id, newBalance);

        return { id: investmentId, success: true };
      }),
  }),

  // Withdrawal Routes
  withdrawal: router({
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getWithdrawalsByUserId(ctx.user.id);
    }),

    requestWithdrawal: protectedProcedure
      .input(
        z.object({
          amount: z.number(),
          upiId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Check balance
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (user.length === 0) throw new Error("User not found");
        if (parseFloat(String(user[0].balance)) < input.amount) {
          throw new Error("Insufficient balance");
        }

        const id = nanoid();
        await db.insert(withdrawals).values({
          id,
          userId: ctx.user.id,
          amount: String(input.amount) as any,
          upiId: input.upiId,
          status: "pending" as any,
        });

        return { id, success: true };
      }),

    approveWithdrawal: protectedProcedure
      .input(z.object({ withdrawalId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can approve withdrawals");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get withdrawal details
        const withdrawal = await db
          .select()
          .from(withdrawals)
          .where(eq(withdrawals.id, input.withdrawalId))
          .limit(1);

        if (withdrawal.length === 0) throw new Error("Withdrawal not found");

        // Update withdrawal status
        await db
          .update(withdrawals)
          .set({ status: "completed", processedBy: ctx.user.id })
          .where(eq(withdrawals.id, input.withdrawalId));

        return { success: true };
      }),

    rejectWithdrawal: protectedProcedure
      .input(
        z.object({
          withdrawalId: z.string(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can reject withdrawals");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get withdrawal details
        const withdrawal = await db
          .select()
          .from(withdrawals)
          .where(eq(withdrawals.id, input.withdrawalId))
          .limit(1);

        if (withdrawal.length === 0) throw new Error("Withdrawal not found");

        // Update withdrawal status
        await db
          .update(withdrawals)
          .set({
            status: "rejected",
            rejectedReason: input.reason,
            processedBy: ctx.user.id,
          })
          .where(eq(withdrawals.id, input.withdrawalId));

        // Refund to balance
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, withdrawal[0].userId))
          .limit(1);

        if (user.length > 0) {
          const newBalance =
            parseFloat(String(user[0].balance)) +
            parseFloat(String(withdrawal[0].amount));
          await updateUserBalance(withdrawal[0].userId, newBalance);
        }

        return { success: true };
      }),

    getPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view pending withdrawals");
      }
      return await getPendingWithdrawals();
    }),
  }),

  // Results Routes
  result: router({
    getByTournament: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await getResultsByTournament(input);
      }),

    publish: protectedProcedure
      .input(
        z.object({
          tournamentId: z.string(),
          winnerId: z.number(),
          winnerName: z.string(),
          winnerUid: z.string().optional(),
          prizeAmount: z.number(),
          runnerUp: z.string().optional(),
          message: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can publish results");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const id = nanoid();
        await db.insert(results).values({
          id,
          tournamentId: input.tournamentId,
          winnerId: input.winnerId,
          winnerName: input.winnerName,
          winnerUid: input.winnerUid,
          prizeAmount: String(input.prizeAmount) as any,
          runnerUp: input.runnerUp,
          message: input.message,
          imageUrl: input.imageUrl,
        });

        // Credit winner
        const winner = await db
          .select()
          .from(users)
          .where(eq(users.id, input.winnerId))
          .limit(1);

        if (winner.length > 0) {
          const newBalance =
            parseFloat(String(winner[0].balance)) + input.prizeAmount;
          await updateUserBalance(input.winnerId, newBalance);
        }

        return { id, success: true };
      }),
  }),

  // Notification Routes
  notification: router({
    getUnread: protectedProcedure.query(async ({ ctx }) => {
      return await getUserNotifications(ctx.user.id);
    }),
  }),

  // Admin Routes
  admin: router({
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view all users");
      }
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(users);
    }),

    getUserById: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can view user details");
        }
        const db = await getDb();
        if (!db) return null;
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, input))
          .limit(1);
        return user.length > 0 ? user[0] : null;
      }),

    updateUserBalance: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          balance: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can update user balance");
        }
        await updateUserBalance(input.userId, input.balance);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
