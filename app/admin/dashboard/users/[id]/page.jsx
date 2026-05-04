import { db } from "@/config/db";
import { usersTable, coursesTable, enrollCourseTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export default async function UserDetail({ params }) {
  const { id } = await params;

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(id)))
    .then((res) => res[0]);

  if (!user) {
    return <div className="p-6">User not found</div>;
  }

  const courses = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.useremail, user.email));

  const enrolledCourses = await db
    .select({
      cid: coursesTable.cid,
      name: coursesTable.name,
      level: coursesTable.level,
      category: coursesTable.category,
      isPublished: coursesTable.isPublished,
      isDeleted: coursesTable.isDeleted, // ✅ FIX ADDED
    })
    .from(enrollCourseTable)
    .innerJoin(coursesTable, eq(enrollCourseTable.cid, coursesTable.cid))
    .where(eq(enrollCourseTable.useremail, user.email));

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 bg-white p-5 rounded-xl shadow">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700">
          {user.name?.charAt(0)}
        </div>

        <div>
          <h1 className="text-xl font-semibold">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>

          <span
            className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
              user.subscriptionId
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {user.subscriptionId ? "Premium" : "Free"}
          </span>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-5 rounded-xl shadow">
          <p className="text-sm text-gray-600">Courses Created</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {courses.length}
          </p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-5 rounded-xl shadow">
          <p className="text-sm text-gray-600">Courses Enrolled</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            {enrolledCourses.length}
          </p>
        </div>
      </div>

      {/* CREATED COURSES */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold mb-4 text-gray-800">Created Courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm">No courses created</p>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.cid}
                className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{c.name}</p>

                    {/* 🗑 DELETED BADGE */}
                    {c.isDeleted === true && ( // ✅ STRICT CHECK
                      <span className="px-2 py-0.5 text-[10px] rounded bg-red-100 text-red-700 font-semibold">
                        Deleted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {c.level} • {c.category || "General"}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    c.isDeleted
                      ? "bg-red-100 text-red-700"
                      : c.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {c.isDeleted
                    ? "Deleted"
                    : c.isPublished
                      ? "Published"
                      : "Draft"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ENROLLED COURSES */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold mb-4 text-gray-800">Enrolled Courses</h2>

        {enrolledCourses.length === 0 ? (
          <p className="text-gray-400 text-sm">No enrollments</p>
        ) : (
          <div className="space-y-3">
            {enrolledCourses.map((c) => (
              <div
                key={c.cid}
                className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{c.name}</p>

                    {/* 🗑 DELETED BADGE */}
                    {c.isDeleted === true && ( // ✅ FIX NOW WORKS
                      <span className="px-2 py-0.5 text-[10px] rounded bg-red-100 text-red-700 font-semibold">
                        Deleted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {c.level} • {c.category || "General"}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    c.isDeleted
                      ? "bg-red-100 text-red-700"
                      : c.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {c.isDeleted
                    ? "Deleted"
                    : c.isPublished
                      ? "Published"
                      : "Draft"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}