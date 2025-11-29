import { db } from "@/config/db";
import { coursesTable, enrollCourseTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req){
    const {courseId} = await req.json();

    const user = await currentUser();

    //if already enrolled to course
    const enrolled = await db.select().from(enrollCourseTable)
    .where(and(eq(enrollCourseTable.useremail,user?.primaryEmailAddress.emailAddress),
eq(enrollCourseTable.cid, courseId)));


if(enrolled?.length==0){
    const result = await db.insert(enrollCourseTable)
    .values({
        cid: courseId,
        useremail: user.primaryEmailAddress?.emailAddress
    }).returning(enrollCourseTable)

    return NextResponse.json(result);
}

return NextResponse.json({'response': 'Already Enrolled to the course'})
}

export async function GET(req) {

    const user = await currentUser();
        const { searchParams } = new URL(req.url);
    const courseId = searchParams?.get("courseId");

    if(courseId){
            const result = await db.select().from(coursesTable)
    .innerJoin(enrollCourseTable,eq(coursesTable.cid,enrollCourseTable.cid))
    .where(and(eq(enrollCourseTable.useremail,user?.primaryEmailAddress?.emailAddress),
eq(enrollCourseTable.cid,courseId)));

return NextResponse.json(result[0]);

    }else{
            const result = await db.select().from(coursesTable)
    .innerJoin(enrollCourseTable,eq(coursesTable.cid,enrollCourseTable.cid))
    .where(eq(enrollCourseTable.useremail,user?.primaryEmailAddress?.emailAddress))
    .orderBy(desc(enrollCourseTable.id));
    

    return NextResponse.json(result);
    }
}