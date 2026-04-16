ALTER TABLE "courses" ADD COLUMN "isPublished" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "enroll_user_cid_idx" ON "enrollCourse" USING btree ("useremail","cid");