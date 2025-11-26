import { boolean, integer, json, pgTable, varchar } from "drizzle-orm/pg-core";

// USERS TABLE
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subscriptionId: varchar(),
});

// COURSES TABLE
export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  noOfChapters: integer().notNull(),
  includeVideo: boolean().default(false),
  level: varchar().notNull(),
  category: varchar(),
  courseJson: json(),
  bannerImgUrl: varchar().default(''),
  courseContent:json().default({}),
  // Correct foreign key reference
  useremail: varchar({ length: 255 })
    .notNull()
    .references(() => usersTable.email),
});
