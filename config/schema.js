import {
  boolean,
  integer,
  json,
  pgTable,
  varchar,
  index,
  timestamp,
} from "drizzle-orm/pg-core";

/* =========================
   USERS TABLE
========================= */
export const usersTable = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    subscriptionId: varchar(),
  },
  (table) => ({
    emailIndex: index("users_email_idx").on(table.email),
  })
);

/* =========================
   COURSES TABLE
========================= */
export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar().notNull().unique(),
  name: varchar().notNull(),
  description: varchar(),
  noOfChapters: integer().notNull(),
  includeVideo: boolean().default(false),
  level: varchar().notNull(),
  category: varchar(),
  courseJson: json(),
  bannerImgUrl: varchar().default(""),
  courseContent: json().default(null),
  hasContent: boolean().default(false),
  isDeleted: boolean().default(false),
  isPublished: boolean().default(false),

  useremail: varchar({ length: 255 })
    .notNull()
    .references(() => usersTable.email),

  clientRequestIdContent: varchar({ length: 255 }).default(""),
});

/* =========================
   ENROLL TABLE
========================= */
export const enrollCourseTable = pgTable(
  "enrollCourse",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    cid: varchar({ length: 255 })
      .references(() => coursesTable.cid)
      .notNull(),

    useremail: varchar({ length: 255 })
      .references(() => usersTable.email)
      .notNull(),

    completedChapters: json(),
  },
  (table) => ({
    enrollUserCidIdx: index("enroll_user_cid_idx").on(
      table.useremail,
      table.cid
    ),
  })
);

/* =========================
   QUIZ TABLE
========================= */
export const quizTable = pgTable(
  "quiz",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    cid: varchar({ length: 255 })
      .references(() => coursesTable.cid)
      .notNull()
      .unique(), // ✅ prevents duplicate quizzes per course

    generatedBy: varchar({ length: 255 })
      .references(() => usersTable.email)
      .notNull(),

    quizJson: json().notNull(),
    totalQuestions: integer().notNull(),

    createdAt: timestamp().defaultNow(), // ✅ FIXED
  },
  (table) => ({
    quizCidIdx: index("quiz_cid_idx").on(table.cid),
  })
);

/* =========================
   QUIZ ATTEMPT TABLE
========================= */
export const quizAttemptTable = pgTable(
  "quizAttempt",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    quizId: integer()
      .references(() => quizTable.id)
      .notNull(),

    useremail: varchar({ length: 255 })
      .references(() => usersTable.email)
      .notNull(),

    answers: json(),
    score: integer(),
    total: integer(),
    percentage: integer(),

    attemptNumber: integer().default(1), // ✅ future analytics

    createdAt: timestamp().defaultNow(), // ✅ FIXED
  },
  (table) => ({
    quizUserIdx: index("quiz_attempt_user_idx").on(
      table.quizId,
      table.useremail
    ),
  })
);

/* =========================
   QUIZ STATS TABLE
========================= */
export const quizStatsTable = pgTable(
  "quizStats",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    quizId: integer()
      .references(() => quizTable.id)
      .notNull(),

    avgScore: integer().default(0),
    totalAttempts: integer().default(0),
  },
  (table) => ({
    quizStatsIdx: index("quiz_stats_quiz_idx").on(table.quizId),
  })
);