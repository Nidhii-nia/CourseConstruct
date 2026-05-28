import { db } from "@/config/db";

import {
  usersTable,
  coursesTable,
  enrollCourseTable,
} from "@/config/schema";

import { eq } from "drizzle-orm";

export default async function UserDetail({
  params,
}) {
  const { id } = await params;

  const user = await db
    .select()
    .from(usersTable)
    .where(
      eq(usersTable.id, Number(id))
    )
    .then((res) => res[0]);

  if (!user) {
    return (
      <div
        className="
          p-6

          min-h-screen

          bg-linear-to-br
          from-emerald-50/40
          via-white
          to-blue-50/40

          dark:from-gray-950
          dark:via-gray-900
          dark:to-emerald-950

          text-gray-800
          dark:text-white
        "
      >
        User not found
      </div>
    );
  }

  const courses = await db
    .select()
    .from(coursesTable)
    .where(
      eq(
        coursesTable.useremail,
        user.email
      )
    );

  const enrolledCourses = await db
    .select({
      cid: coursesTable.cid,

      name: coursesTable.name,

      level: coursesTable.level,

      category:
        coursesTable.category,

      isPublished:
        coursesTable.isPublished,

      isDeleted:
        coursesTable.isDeleted,
    })
    .from(enrollCourseTable)
    .innerJoin(
      coursesTable,
      eq(
        enrollCourseTable.cid,
        coursesTable.cid
      )
    )
    .where(
      eq(
        enrollCourseTable.useremail,
        user.email
      )
    );

  return (
    <div
      className="
        p-4
        sm:p-6

        space-y-6

        min-h-screen

        bg-linear-to-br
        from-emerald-50/40
        via-white
        to-blue-50/40

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950

        transition-colors
        duration-500
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          flex-col
          sm:flex-row

          sm:items-center

          gap-4

          bg-white/80
          dark:bg-gray-900/70

          backdrop-blur-xl

          p-5

          rounded-3xl

          shadow-xl

          border
          border-gray-100
          dark:border-gray-700
        "
      >
        {/* AVATAR */}
        <div
          className="
            w-14
            h-14

            rounded-full

            bg-emerald-100
            dark:bg-emerald-500/20

            flex
            items-center
            justify-center

            text-xl
            font-bold

            text-emerald-700
            dark:text-emerald-300

            shrink-0
          "
        >
          {user.name?.charAt(0)}
        </div>

        {/* USER INFO */}
        <div className="min-w-0">

          <h1
            className="
              text-xl
              font-semibold

              text-gray-800
              dark:text-white

              wrap-break-word
            "
          >
            {user.name}
          </h1>

          <p
            className="
              text-sm

              text-gray-500
              dark:text-gray-400

              break-all
            "
          >
            {user.email}
          </p>

          <span
            className={`
              inline-block

              mt-2

              px-2
              py-1

              text-xs

              rounded-full

              ${
                user.subscriptionId
                  ? `
                    bg-green-100
                    dark:bg-green-500/20

                    text-green-700
                    dark:text-green-300
                  `
                  : `
                    bg-gray-100
                    dark:bg-gray-800

                    text-gray-600
                    dark:text-gray-300
                  `
              }
            `}
          >
            {user.subscriptionId
              ? "Premium"
              : "Free"}
          </span>

        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* CREATED */}
        <div
          className="
            bg-linear-to-br
            from-blue-50
            to-blue-100

            dark:from-blue-500/20
            dark:to-blue-500/5

            p-5

            rounded-3xl

            shadow-lg

            border
            border-blue-100
            dark:border-blue-500/20
          "
        >
          <p
            className="
              text-sm

              text-gray-600
              dark:text-gray-300
            "
          >
            Courses Created
          </p>

          <p
            className="
              text-2xl
              font-bold

              text-blue-700
              dark:text-blue-300

              mt-1
            "
          >
            {courses.length}
          </p>
        </div>

        {/* ENROLLED */}
        <div
          className="
            bg-linear-to-br
            from-purple-50
            to-purple-100

            dark:from-purple-500/20
            dark:to-purple-500/5

            p-5

            rounded-3xl

            shadow-lg

            border
            border-purple-100
            dark:border-purple-500/20
          "
        >
          <p
            className="
              text-sm

              text-gray-600
              dark:text-gray-300
            "
          >
            Courses Enrolled
          </p>

          <p
            className="
              text-2xl
              font-bold

              text-purple-700
              dark:text-purple-300

              mt-1
            "
          >
            {enrolledCourses.length}
          </p>
        </div>

      </div>

      {/* CREATED COURSES */}
      <div
        className="
          bg-white/80
          dark:bg-gray-900/70

          backdrop-blur-xl

          p-5

          rounded-3xl

          shadow-xl

          border
          border-gray-100
          dark:border-gray-700
        "
      >
        <h2
          className="
            font-semibold

            mb-4

            text-gray-800
            dark:text-white
          "
        >
          Created Courses
        </h2>

        {courses.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            No courses created
          </p>
        ) : (
          <div className="space-y-3">

            {courses.map((c) => (
              <div
                key={c.cid}
                className="
                  flex
                  flex-col
                  sm:flex-row

                  sm:items-center
                  sm:justify-between

                  gap-4

                  border
                  border-gray-100
                  dark:border-gray-800

                  rounded-2xl

                  p-4

                  hover:bg-gray-50
                  dark:hover:bg-gray-800/50

                  transition-all
                  duration-300
                "
              >
                {/* LEFT */}
                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="font-medium text-sm text-gray-800 dark:text-white wrap-break-word">
                      {c.name}
                    </p>

                    {/* DELETED */}
                    {c.isDeleted ===
                      true && (
                      <span
                        className="
                          px-2
                          py-0.5

                          text-[10px]

                          rounded-full

                          bg-red-100
                          dark:bg-red-500/20

                          text-red-700
                          dark:text-red-300

                          font-semibold
                        "
                      >
                        Deleted
                      </span>
                    )}

                  </div>

                  <p
                    className="
                      text-xs

                      text-gray-500
                      dark:text-gray-400

                      mt-1
                    "
                  >
                    {c.level} •{" "}
                    {c.category ||
                      "General"}
                  </p>

                </div>

                {/* STATUS */}
                <span
                  className={`
                    text-xs

                    px-3
                    py-1

                    rounded-full

                    font-medium

                    shrink-0

                    ${
                      c.isDeleted
                        ? `
                          bg-red-100
                          dark:bg-red-500/20

                          text-red-700
                          dark:text-red-300
                        `
                        : c.isPublished
                        ? `
                          bg-green-100
                          dark:bg-green-500/20

                          text-green-700
                          dark:text-green-300
                        `
                        : `
                          bg-gray-100
                          dark:bg-gray-800

                          text-gray-600
                          dark:text-gray-300
                        `
                    }
                  `}
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
      <div
        className="
          bg-white/80
          dark:bg-gray-900/70

          backdrop-blur-xl

          p-5

          rounded-3xl

          shadow-xl

          border
          border-gray-100
          dark:border-gray-700
        "
      >
        <h2
          className="
            font-semibold

            mb-4

            text-gray-800
            dark:text-white
          "
        >
          Enrolled Courses
        </h2>

        {enrolledCourses.length ===
        0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            No enrollments
          </p>
        ) : (
          <div className="space-y-3">

            {enrolledCourses.map(
              (c) => (
                <div
                  key={c.cid}
                  className="
                    flex
                    flex-col
                    sm:flex-row

                    sm:items-center
                    sm:justify-between

                    gap-4

                    border
                    border-gray-100
                    dark:border-gray-800

                    rounded-2xl

                    p-4

                    hover:bg-gray-50
                    dark:hover:bg-gray-800/50

                    transition-all
                    duration-300
                  "
                >
                  {/* LEFT */}
                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="font-medium text-sm text-gray-800 dark:text-white wrap-break-word">
                        {c.name}
                      </p>

                      {/* DELETED */}
                      {c.isDeleted ===
                        true && (
                        <span
                          className="
                            px-2
                            py-0.5

                            text-[10px]

                            rounded-full

                            bg-red-100
                            dark:bg-red-500/20

                            text-red-700
                            dark:text-red-300

                            font-semibold
                          "
                        >
                          Deleted
                        </span>
                      )}

                    </div>

                    <p
                      className="
                        text-xs

                        text-gray-500
                        dark:text-gray-400

                        mt-1
                      "
                    >
                      {c.level} •{" "}
                      {c.category ||
                        "General"}
                    </p>

                  </div>

                  {/* STATUS */}
                  <span
                    className={`
                      text-xs

                      px-3
                      py-1

                      rounded-full

                      font-medium

                      shrink-0

                      ${
                        c.isDeleted
                          ? `
                            bg-red-100
                            dark:bg-red-500/20

                            text-red-700
                            dark:text-red-300
                          `
                          : c.isPublished
                          ? `
                            bg-green-100
                            dark:bg-green-500/20

                            text-green-700
                            dark:text-green-300
                          `
                          : `
                            bg-gray-100
                            dark:bg-gray-800

                            text-gray-600
                            dark:text-gray-300
                          `
                      }
                    `}
                  >
                    {c.isDeleted
                      ? "Deleted"
                      : c.isPublished
                      ? "Published"
                      : "Draft"}
                  </span>

                </div>
              )
            )}

          </div>
        )}
      </div>
    </div>
  );
}