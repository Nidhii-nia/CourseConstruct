import { db } from "@/config/db";
import CourseDetailClient from "./CourseDetailClient";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export default async function CourseDetail({ params }) {
  const { cid } = params;

  const course = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.cid, cid))
    .then((res) => res[0]);

  if (!course) {
    return <div className="p-4 sm:p-6">Course not found</div>;
  }

  return <CourseDetailClient course={course} cid={cid} />;
}