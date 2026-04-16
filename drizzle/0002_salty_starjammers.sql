CREATE TABLE "quizAttempt" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quizAttempt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"quizId" integer NOT NULL,
	"useremail" varchar(255) NOT NULL,
	"answers" json,
	"score" integer,
	"total" integer,
	"percentage" integer,
	"attemptNumber" integer DEFAULT 1,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quizStats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quizStats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"quizId" integer NOT NULL,
	"avgScore" integer DEFAULT 0,
	"totalAttempts" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "quiz" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quiz_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar(255) NOT NULL,
	"generatedBy" varchar(255) NOT NULL,
	"quizJson" json NOT NULL,
	"totalQuestions" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "quiz_cid_unique" UNIQUE("cid")
);
--> statement-breakpoint
ALTER TABLE "enrollCourse" DROP CONSTRAINT "enrollCourse_cid_useremail_unique";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "courseContent" SET DEFAULT 'null'::json;--> statement-breakpoint
ALTER TABLE "quizAttempt" ADD CONSTRAINT "quizAttempt_quizId_quiz_id_fk" FOREIGN KEY ("quizId") REFERENCES "public"."quiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizAttempt" ADD CONSTRAINT "quizAttempt_useremail_users_email_fk" FOREIGN KEY ("useremail") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizStats" ADD CONSTRAINT "quizStats_quizId_quiz_id_fk" FOREIGN KEY ("quizId") REFERENCES "public"."quiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_cid_courses_cid_fk" FOREIGN KEY ("cid") REFERENCES "public"."courses"("cid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_generatedBy_users_email_fk" FOREIGN KEY ("generatedBy") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_attempt_user_idx" ON "quizAttempt" USING btree ("quizId","useremail");--> statement-breakpoint
CREATE INDEX "quiz_stats_quiz_idx" ON "quizStats" USING btree ("quizId");--> statement-breakpoint
CREATE INDEX "quiz_cid_idx" ON "quiz" USING btree ("cid");