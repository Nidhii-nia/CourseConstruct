import { boolean, integer, json, pgTable, varchar, index } from "drizzle-orm/pg-core";

// USERS TABLE
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subscriptionId: varchar(),
}, (table) => ({
  emailIndex: index("users_email_idx").on(table.email)
}));

// COURSES TABLE
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
  useremail: varchar({ length: 255 })
    .notNull()
    .references(() => usersTable.email),
  clientRequestIdContent: varchar({ length: 255 }).default(""),
}, (table) => ({
  cidIndex: index("courses_cid_idx").on(table.cid),
  userEmailIndex: index("courses_useremail_idx").on(table.useremail),
  cidUserEmailCompositeIndex: index("courses_cid_useremail_idx").on(table.cid, table.useremail),
}));

// ENROLL TABLE
export const enrollCourseTable = pgTable('enrollCourse', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar({ length: 255 })
    .references(() => coursesTable.cid)
    .notNull(),
  useremail: varchar({ length: 255 })
    .references(() => usersTable.email)
    .notNull(),
  completedChapters: json()
}, (table) => ({
  enrollCidIndex: index("enroll_cid_idx").on(table.cid),
  enrollUserEmailIndex: index("enroll_useremail_idx").on(table.useremail),
  enrollUserCidCompositeIndex: index("enroll_user_cid_idx").on(table.useremail, table.cid),
  enrollIdDescIndex: index("enroll_id_desc_idx").on(table.id.desc()), 
  enrollCidUserEmailCompositeIndex: index("enroll_cid_useremail_idx").on(table.cid, table.useremail),
}));