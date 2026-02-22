// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var tournaments = mysqlTable("tournaments", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var payments = mysqlTable("payments", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var investmentPlans = mysqlTable("investmentPlans", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  minAmount: decimal("minAmount", { precision: 10, scale: 2 }).notNull(),
  maxAmount: decimal("maxAmount", { precision: 10, scale: 2 }).notNull(),
  roi: decimal("roi", { precision: 5, scale: 2 }).notNull(),
  lockInDays: int("lockInDays").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium").notNull(),
  description: text("description"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var userInvestments = mysqlTable("userInvestments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  planId: varchar("planId", { length: 36 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  roi: decimal("roi", { precision: 5, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  profitAmount: decimal("profitAmount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var results = mysqlTable("results", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var withdrawals = mysqlTable("withdrawals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  upiId: varchar("upiId", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  processedBy: int("processedBy"),
  rejectedReason: text("rejectedReason"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["payment", "tournament", "investment", "withdrawal", "result"]).notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateUserBalance(userId, amount) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ balance: String(amount) }).where(eq(users.id, userId));
}
async function updateUserProfile(userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}
async function getTournaments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tournaments).orderBy(tournaments.startTime);
}
async function getTournamentById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPaymentsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.userId, userId));
}
async function getPendingPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.status, "pending"));
}
async function getUserInvestments(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userInvestments).where(eq(userInvestments.userId, userId));
}
async function getWithdrawalsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId));
}
async function getPendingWithdrawals() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(withdrawals).where(eq(withdrawals.status, "pending"));
}
async function getResultsByTournament(tournamentId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(results).where(eq(results.tournamentId, tournamentId));
}
async function getUserNotifications(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.userId, userId));
}
async function getActiveInvestmentPlans() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(investmentPlans).where(eq(investmentPlans.isActive, 1));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
import { nanoid } from "nanoid";
import { eq as eq2 } from "drizzle-orm";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // User Profile Routes
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const user = await db.select().from(users).where(eq2(users.id, ctx.user.id)).limit(1);
      return user.length > 0 ? user[0] : null;
    }),
    updateProfile: protectedProcedure.input(
      z2.object({
        phone: z2.string().optional(),
        gamingName: z2.string().optional(),
        dpUrl: z2.string().optional(),
        upiId: z2.string().optional(),
        qrUrl: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const user = await db.select().from(users).where(eq2(users.id, ctx.user.id)).limit(1);
      if (user.length === 0) return null;
      return {
        balance: user[0].balance,
        totalInvested: user[0].totalInvested,
        totalProfit: user[0].totalProfit,
        totalLoss: user[0].totalLoss
      };
    })
  }),
  // Tournament Routes
  tournament: router({
    list: publicProcedure.query(async () => {
      return await getTournaments();
    }),
    getById: publicProcedure.input(z2.string()).query(async ({ input }) => {
      return await getTournamentById(input);
    }),
    create: protectedProcedure.input(
      z2.object({
        map: z2.string(),
        type: z2.string(),
        entryFee: z2.number(),
        prizePool: z2.number(),
        totalSlots: z2.number().default(48),
        startTime: z2.date(),
        details: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
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
        entryFee: String(input.entryFee),
        prizePool: String(input.prizePool),
        totalSlots: input.totalSlots,
        startTime: input.startTime,
        details: input.details,
        createdBy: ctx.user.id
      });
      return { id, success: true };
    }),
    updateRoomCredentials: protectedProcedure.input(
      z2.object({
        tournamentId: z2.string(),
        roomId: z2.string(),
        password: z2.string()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can update room credentials");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(tournaments).set({ roomId: input.roomId, password: input.password }).where(eq2(tournaments.id, input.tournamentId));
      return { success: true };
    })
  }),
  // Payment Routes
  payment: router({
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getPaymentsByUserId(ctx.user.id);
    }),
    submitPayment: protectedProcedure.input(
      z2.object({
        tournamentId: z2.string().optional(),
        amount: z2.number(),
        utr: z2.string(),
        screenshotUrl: z2.string(),
        type: z2.enum(["tournament_join", "add_fund", "withdrawal"])
      })
    ).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const id = nanoid();
      await db.insert(payments).values({
        id,
        userId: ctx.user.id,
        tournamentId: input.tournamentId,
        amount: String(input.amount),
        utr: input.utr,
        screenshotUrl: input.screenshotUrl,
        type: input.type,
        status: "pending"
      });
      return { id, success: true };
    }),
    approvePayment: protectedProcedure.input(z2.object({ paymentId: z2.string() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can approve payments");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const payment = await db.select().from(payments).where(eq2(payments.id, input.paymentId)).limit(1);
      if (payment.length === 0) throw new Error("Payment not found");
      await db.update(payments).set({ status: "approved", approvedBy: ctx.user.id }).where(eq2(payments.id, input.paymentId));
      const user = await db.select().from(users).where(eq2(users.id, payment[0].userId)).limit(1);
      if (user.length > 0) {
        const newBalance = parseFloat(String(user[0].balance)) + payment[0].amount;
        await updateUserBalance(payment[0].userId, newBalance);
      }
      return { success: true };
    }),
    rejectPayment: protectedProcedure.input(
      z2.object({ paymentId: z2.string(), reason: z2.string().optional() })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can reject payments");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(payments).set({
        status: "rejected",
        rejectedReason: input.reason,
        approvedBy: ctx.user.id
      }).where(eq2(payments.id, input.paymentId));
      return { success: true };
    }),
    getPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view pending payments");
      }
      return await getPendingPayments();
    })
  }),
  // Investment Routes
  investment: router({
    getPlans: publicProcedure.query(async () => {
      return await getActiveInvestmentPlans();
    }),
    getUserInvestments: protectedProcedure.query(async ({ ctx }) => {
      return await getUserInvestments(ctx.user.id);
    }),
    invest: protectedProcedure.input(
      z2.object({
        planId: z2.string(),
        amount: z2.number()
      })
    ).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const plan = await db.select().from(investmentPlans).where(eq2(investmentPlans.id, input.planId)).limit(1);
      if (plan.length === 0) throw new Error("Plan not found");
      const user = await db.select().from(users).where(eq2(users.id, ctx.user.id)).limit(1);
      if (user.length === 0) throw new Error("User not found");
      if (parseFloat(String(user[0].balance)) < input.amount) {
        throw new Error("Insufficient balance");
      }
      const investmentId = nanoid();
      const endDate = /* @__PURE__ */ new Date();
      endDate.setDate(endDate.getDate() + plan[0].lockInDays);
      await db.insert(userInvestments).values({
        id: investmentId,
        userId: ctx.user.id,
        planId: input.planId,
        amount: String(input.amount),
        roi: String(plan[0].roi),
        endDate
      });
      const newBalance = parseFloat(String(user[0].balance)) - input.amount;
      await updateUserBalance(ctx.user.id, newBalance);
      return { id: investmentId, success: true };
    })
  }),
  // Withdrawal Routes
  withdrawal: router({
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getWithdrawalsByUserId(ctx.user.id);
    }),
    requestWithdrawal: protectedProcedure.input(
      z2.object({
        amount: z2.number(),
        upiId: z2.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const user = await db.select().from(users).where(eq2(users.id, ctx.user.id)).limit(1);
      if (user.length === 0) throw new Error("User not found");
      if (parseFloat(String(user[0].balance)) < input.amount) {
        throw new Error("Insufficient balance");
      }
      const id = nanoid();
      await db.insert(withdrawals).values({
        id,
        userId: ctx.user.id,
        amount: String(input.amount),
        upiId: input.upiId,
        status: "pending"
      });
      return { id, success: true };
    }),
    approveWithdrawal: protectedProcedure.input(z2.object({ withdrawalId: z2.string() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can approve withdrawals");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const withdrawal = await db.select().from(withdrawals).where(eq2(withdrawals.id, input.withdrawalId)).limit(1);
      if (withdrawal.length === 0) throw new Error("Withdrawal not found");
      await db.update(withdrawals).set({ status: "completed", processedBy: ctx.user.id }).where(eq2(withdrawals.id, input.withdrawalId));
      return { success: true };
    }),
    rejectWithdrawal: protectedProcedure.input(
      z2.object({
        withdrawalId: z2.string(),
        reason: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can reject withdrawals");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const withdrawal = await db.select().from(withdrawals).where(eq2(withdrawals.id, input.withdrawalId)).limit(1);
      if (withdrawal.length === 0) throw new Error("Withdrawal not found");
      await db.update(withdrawals).set({
        status: "rejected",
        rejectedReason: input.reason,
        processedBy: ctx.user.id
      }).where(eq2(withdrawals.id, input.withdrawalId));
      const user = await db.select().from(users).where(eq2(users.id, withdrawal[0].userId)).limit(1);
      if (user.length > 0) {
        const newBalance = parseFloat(String(user[0].balance)) + parseFloat(String(withdrawal[0].amount));
        await updateUserBalance(withdrawal[0].userId, newBalance);
      }
      return { success: true };
    }),
    getPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view pending withdrawals");
      }
      return await getPendingWithdrawals();
    })
  }),
  // Results Routes
  result: router({
    getByTournament: publicProcedure.input(z2.string()).query(async ({ input }) => {
      return await getResultsByTournament(input);
    }),
    publish: protectedProcedure.input(
      z2.object({
        tournamentId: z2.string(),
        winnerId: z2.number(),
        winnerName: z2.string(),
        winnerUid: z2.string().optional(),
        prizeAmount: z2.number(),
        runnerUp: z2.string().optional(),
        message: z2.string().optional(),
        imageUrl: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
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
        prizeAmount: String(input.prizeAmount),
        runnerUp: input.runnerUp,
        message: input.message,
        imageUrl: input.imageUrl
      });
      const winner = await db.select().from(users).where(eq2(users.id, input.winnerId)).limit(1);
      if (winner.length > 0) {
        const newBalance = parseFloat(String(winner[0].balance)) + input.prizeAmount;
        await updateUserBalance(input.winnerId, newBalance);
      }
      return { id, success: true };
    })
  }),
  // Notification Routes
  notification: router({
    getUnread: protectedProcedure.query(async ({ ctx }) => {
      return await getUserNotifications(ctx.user.id);
    })
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
    getUserById: protectedProcedure.input(z2.number()).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view user details");
      }
      const db = await getDb();
      if (!db) return null;
      const user = await db.select().from(users).where(eq2(users.id, input)).limit(1);
      return user.length > 0 ? user[0] : null;
    }),
    updateUserBalance: protectedProcedure.input(
      z2.object({
        userId: z2.number(),
        balance: z2.number()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can update user balance");
      }
      await updateUserBalance(input.userId, input.balance);
      return { success: true };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid as nanoid2 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
