CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"noOfChapters" integer NOT NULL,
	"includeVideo" boolean DEFAULT false,
	"level" varchar NOT NULL,
	"category" varchar,
	"courseJson" json,
	"bannerImgUrl" varchar DEFAULT '',
	"courseContent" json DEFAULT NULL,
	"hasContent" boolean DEFAULT false,
	"isDeleted" boolean DEFAULT false,
	"useremail" varchar(255) NOT NULL,
	"clientRequestIdContent" varchar(255) DEFAULT '',
	CONSTRAINT "courses_cid_unique" UNIQUE("cid")
);
--> statement-breakpoint
CREATE TABLE "enrollCourse" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "enrollCourse_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar(255) NOT NULL,
	"useremail" varchar(255) NOT NULL,
	"completedChapters" json,
	CONSTRAINT "enrollCourse_cid_useremail_unique" UNIQUE("cid", "useremail")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subscriptionId" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_useremail_users_email_fk" FOREIGN KEY ("useremail") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollCourse" ADD CONSTRAINT "enrollCourse_cid_courses_cid_fk" FOREIGN KEY ("cid") REFERENCES "public"."courses"("cid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollCourse" ADD CONSTRAINT "enrollCourse_useremail_users_email_fk" FOREIGN KEY ("useremail") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");