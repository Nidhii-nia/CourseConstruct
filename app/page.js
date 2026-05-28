import PageWrapper from "@/app/components/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Wand2,
  Cpu,
  BookOpen,
  Rocket,
  NotebookIcon,
} from "lucide-react";

import Link from "next/link";

export default function Home() {
  return (
    <PageWrapper>
      {/* GLOBAL THEME BUTTON */}
      

      {/* HERO SECTION */}
      <section
        className="
          relative
          overflow-hidden
          min-h-screen
          flex
          items-center
          pt-24
          lg:pt-10

          bg-linear-to-br
          from-emerald-50
          via-white
          to-teal-100

          dark:from-gray-950
          dark:via-gray-900
          dark:to-emerald-950

          transition-colors
          duration-500
        "
      >
        {/* Background Blobs */}
        <div className="absolute top-10 left-10 w-40 sm:w-52 h-40 sm:h-52 bg-yellow-200 dark:bg-yellow-500/10 rounded-full blur-3xl opacity-40"></div>

        <div className="absolute bottom-10 right-10 w-56 sm:w-72 h-56 sm:h-72 bg-emerald-200 dark:bg-emerald-500/10 rounded-full blur-3xl opacity-40"></div>

        <div className="absolute top-1/2 left-1/3 w-32 sm:w-40 h-32 sm:h-40 bg-sky-200 dark:bg-sky-500/10 rounded-full blur-3xl opacity-30"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-emerald-300 dark:bg-emerald-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-20 items-center max-w-7xl mx-auto">
            
            {/* LEFT SIDE */}
            <div className="relative z-10 order-2 lg:order-1 min-w-0 text-center lg:text-left">

              {/* Badge */}
              <div
                className="
                  inline-flex
                  items-center
                  gap-2

                  bg-white/80
                  dark:bg-gray-900/70

                  backdrop-blur-xl

                  px-4
                  py-2

                  rounded-full

                  mb-8

                  border
                  border-white
                  dark:border-gray-700

                  shadow-lg
                "
              >
                <Sparkles className="h-4 w-4 text-emerald-500" />

                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  AI-Powered Learning
                </span>
              </div>

              {/* Main Heading */}
              <h1
                className="
                  text-4xl
                  sm:text-5xl
                  lg:text-5xl
                  xl:text-6xl
                  2xl:text-7xl

                  font-extrabold
                  tracking-tight
                  leading-[0.95]

                  mb-6

                  wrap-break-word
                "
              >
                <span
                  className="
                    inline-block
                    bg-clip-text
                    text-transparent

                    bg-linear-to-r
                    from-emerald-500
                    via-teal-400
                    to-sky-400
                  "
                >
                  CourseConstruct
                </span>
              </h1>

              {/* Subtitle */}
              <div className="mb-8">
                <h2
                  className="
                    text-2xl
                    sm:text-3xl
                    lg:text-4xl
                    xl:text-5xl

                    font-bold
                    leading-tight

                    text-gray-900
                    dark:text-white

                    mb-3
                  "
                >
                  AI-Generated Courses,
                </h2>

                <h3
                  className="
                    text-xl
                    sm:text-2xl
                    lg:text-3xl
                    xl:text-4xl

                    font-semibold

                    text-emerald-700
                    dark:text-emerald-300
                  "
                >
                  Personalized for You
                </h3>
              </div>

              {/* Description */}
              <p
                className="
                  text-base
                  sm:text-lg

                  text-gray-600
                  dark:text-gray-300

                  leading-relaxed

                  mb-10

                  max-w-xl
                  mx-auto
                  lg:mx-0
                "
              >
                Generate custom learning paths instantly with artificial
                intelligence. No predefined courses—just tell us what you want
                to learn, and our AI builds it for you.
              </p>

              {/* CTA */}
              <div className="mb-12">
                <Link href="/workspace">
                  <Button
                    size="lg"
                    className="
                      w-full
                      sm:w-auto

                      px-8
                      py-6

                      text-base
                      sm:text-lg

                      rounded-2xl

                      text-white
                      font-bold

                      border
                      border-white/30

                      shadow-xl

                      bg-linear-to-r
                      from-emerald-400
                      via-teal-400
                      to-sky-400

                      dark:from-emerald-500
                      dark:via-teal-500
                      dark:to-cyan-500

                      hover:scale-105
                      hover:shadow-2xl

                      transition-all
                      duration-300
                    "
                  >
                    <Brain className="mr-3 h-5 w-5" />
                    See AI in Action
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-emerald-200 dark:border-gray-700">

                {/* CARD 1 */}
                <div
                  className="
                    p-5

                    rounded-4xl

                    bg-white/80
                    dark:bg-gray-900/70

                    border
                    border-white
                    dark:border-gray-700

                    shadow-lg
                    backdrop-blur-xl

                    transition-all
                    duration-300

                    hover:-translate-y-1
                  "
                >
                  <div className="text-3xl font-bold text-emerald-500 mb-2">
                    ∞
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Course Possibilities
                  </div>
                </div>

                {/* CARD 2 */}
                <div
                  className="
                    p-5

                    rounded-4xl

                    bg-white/80
                    dark:bg-gray-900/70

                    border
                    border-white
                    dark:border-gray-700

                    shadow-lg
                    backdrop-blur-xl

                    transition-all
                    duration-300

                    hover:-translate-y-1
                  "
                >
                  <div className="flex justify-center lg:justify-start">
                    <Brain className="h-7 w-7 text-emerald-500 mb-2" />
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    AI-Generated
                  </div>
                </div>

                {/* CARD 3 */}
                <div
                  className="
                    p-5

                    rounded-4xl

                    bg-white/80
                    dark:bg-gray-900/70

                    border
                    border-white
                    dark:border-gray-700

                    shadow-lg
                    backdrop-blur-xl

                    transition-all
                    duration-300

                    hover:-translate-y-1
                  "
                >
                  <div className="text-3xl font-bold text-emerald-500 mb-2">
                    100%
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Personalized
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="relative order-1 lg:order-2">
              <div
                className="
                  relative

                  w-full

                  min-h-105
                  sm:min-h-125
                  lg:min-h-135

                  rounded-[2.5rem]

                  overflow-hidden

                  bg-white/70
                  dark:bg-gray-900/70

                  backdrop-blur-2xl

                  border-4
                  border-white
                  dark:border-gray-700

                  shadow-[0_20px_60px_rgba(16,185,129,0.18)]

                  p-6
                "
              >
                {/* Decorative */}
                <div className="absolute top-6 right-6 text-5xl opacity-10 rotate-12">
                  ✨
                </div>

                <div className="absolute bottom-6 left-6 text-4xl opacity-10">
                  🚀
                </div>

                {/* Floating Brain */}
                <div
                  className="
                    absolute
                    top-6
                    left-6

                    w-14
                    h-14
                    sm:w-16
                    sm:h-16

                    rounded-3xl

                    bg-linear-to-br
                    from-yellow-100
                    to-emerald-100

                    dark:from-yellow-500/20
                    dark:to-emerald-500/20

                    border-2
                    border-white
                    dark:border-gray-700

                    flex
                    items-center
                    justify-center

                    shadow-md

                    animate-bounce
                  "
                >
                  <Brain className="h-7 w-7 text-emerald-500" />
                </div>

                {/* Floating Wand */}
                <div
                  className="
                    absolute
                    bottom-6
                    right-6

                    w-14
                    h-14
                    sm:w-16
                    sm:h-16

                    rounded-3xl

                    bg-linear-to-br
                    from-sky-100
                    to-emerald-100

                    dark:from-sky-500/20
                    dark:to-emerald-500/20

                    border-2
                    border-white
                    dark:border-gray-700

                    flex
                    items-center
                    justify-center

                    shadow-md

                    animate-bounce
                  "
                  style={{ animationDelay: "1s" }}
                >
                  <Wand2 className="h-7 w-7 text-sky-500" />
                </div>

                {/* Main Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-5 sm:px-8 text-center">

                  {/* AI Circle */}
                  <div
                    className="
                      w-28
                      h-28
                      sm:w-36
                      sm:h-36

                      rounded-full

                      bg-linear-to-br
                      from-emerald-400
                      to-sky-400

                      flex
                      items-center
                      justify-center

                      mb-8

                      shadow-2xl

                      animate-pulse
                    "
                  >
                    <Cpu className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      AI Course Generator
                    </h3>

                    <div className="h-2 w-24 rounded-full mx-auto bg-linear-to-r from-emerald-400 to-sky-400"></div>
                  </div>

                  {/* Status Card */}
                  <div
                    className="
                      w-full
                      max-w-sm

                      rounded-4xl

                      bg-white/85
                      dark:bg-gray-900/80

                      border
                      border-white
                      dark:border-gray-700

                      backdrop-blur-md

                      p-5
                      sm:p-6

                      shadow-xl
                    "
                  >
                    <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-200 font-semibold leading-relaxed">
                      Generating your personalized learning path...
                    </p>

                    {/* Progress */}
                    <div className="mt-5">
                      <div className="h-3 bg-emerald-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 rounded-full bg-linear-to-r from-emerald-400 to-sky-400"></div>
                      </div>

                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <span>Processing</span>
                        <span>75%</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="
          py-20
          sm:py-24

          bg-linear-to-b
          from-emerald-50
          via-white
          to-sky-50

          dark:from-gray-950
          dark:via-gray-900
          dark:to-gray-950
        "
      >
        <div className="container mx-auto px-4 sm:px-6">

          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              How{" "}
              <span className="text-emerald-500">
                CourseConstruct
              </span>{" "}
              Works
            </h2>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to your personalized AI-generated course
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {[
              {
                step: "01",
                icon: <Brain className="h-10 w-10" />,
                title: "Describe Your Goal",
                desc: "Tell our AI what you want to learn. Be as specific or broad as you like.",
              },
              {
                step: "02",
                icon: <Wand2 className="h-10 w-10" />,
                title: "AI Generates Course",
                desc: "Our AI instantly creates a complete learning path with modules, lessons, and projects.",
              },
              {
                step: "03",
                icon: <Rocket className="h-10 w-10" />,
                title: "Start Learning",
                desc: "Begin your personalized course immediately. Track your progress by marking chapters as complete.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="
                  relative

                  bg-white/80
                  dark:bg-gray-900/70

                  backdrop-blur-xl

                  border-4
                  border-white
                  dark:border-gray-700

                  shadow-[0_10px_40px_rgba(16,185,129,0.12)]

                  p-8
                  pt-12

                  rounded-[2.5rem]

                  hover:-translate-y-2

                  transition-all
                  duration-500
                "
              >
                <div className="absolute -top-5 left-8 w-14 h-14 bg-linear-to-r from-emerald-400 to-sky-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {item.step}
                </div>

                <div className="w-16 h-16 bg-linear-to-br from-yellow-100 to-emerald-100 dark:from-yellow-500/20 dark:to-emerald-500/20 rounded-4xl flex items-center justify-center mb-6 border-2 border-white dark:border-gray-700 shadow-md text-emerald-500">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {item.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        className="
          py-20
          sm:py-24

          bg-linear-to-b
          from-white
          to-emerald-50

          dark:from-gray-900
          dark:to-gray-950
        "
      >
        <div className="container mx-auto px-4 sm:px-6">

          <div className="text-center mb-16 sm:mb-20">

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered Features
            </h2>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for a personalized learning experience
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {[
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Dynamic Course Generation",
                desc: "Every course is unique, generated based on your specific learning goals",
              },
              {
                icon: <Wand2 className="h-8 w-8" />,
                title: "Instant Content Creation",
                desc: "Get comprehensive learning materials generated in seconds",
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Progress Tracking",
                desc: "Monitor your learning journey",
              },
              {
                icon: <Brain className="h-8 w-8" />,
                title: "Adaptive Learning Paths",
                desc: "Courses are build based on your understanding",
              },
              {
                icon: <Rocket className="h-8 w-8" />,
                title: "Interactive Modules",
                desc: "Engage with AI-generated quizzes and exercises",
              },
              {
                icon: <NotebookIcon className="h-8 w-8" />,
                title: "Export Content",
                desc: "Get PDF notes for the course",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="
                  bg-white/80
                  dark:bg-gray-900/70

                  backdrop-blur-xl

                  border-4
                  border-white
                  dark:border-gray-700

                  shadow-[0_10px_40px_rgba(16,185,129,0.12)]

                  p-8

                  rounded-[2.5rem]

                  hover:-translate-y-2

                  transition-all
                  duration-500
                "
              >
                <div className="w-16 h-16 bg-linear-to-br from-yellow-100 to-emerald-100 dark:from-yellow-500/20 dark:to-emerald-500/20 rounded-4xl flex items-center justify-center mb-6 border-2 border-white dark:border-gray-700 shadow-md text-emerald-500">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.desc}
                </p>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="
          relative
          overflow-hidden

          py-20
          sm:py-24

          bg-linear-to-r
          from-emerald-300
          via-teal-300
          to-sky-300

          dark:from-emerald-700
          dark:via-teal-700
          dark:to-cyan-700
        "
      >
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/30 rounded-full blur-3xl"></div>

        <div className="absolute bottom-10 right-10 w-56 h-56 bg-white/20 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 sm:px-6 text-center">

          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl px-5 py-3 rounded-full mb-8 border-2 border-white dark:border-gray-700 shadow-lg">

            <Sparkles className="h-5 w-5 text-emerald-500" />

            <span className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
              No Predefined Courses Needed
            </span>

          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-8 leading-tight">
            Ready to Learn Anything?
          </h2>

          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">
            Generate your first AI-powered course in seconds.
            The future of personalized learning starts here.
          </p>

          <Link href="/workspace">
            <Button
              size="lg"
              className="
                bg-white
                dark:bg-gray-900

                hover:scale-105

                text-emerald-600
                dark:text-emerald-300

                font-bold

                px-10
                py-6

                text-base
                sm:text-lg

                rounded-4xl

                transition-all
                duration-300

                shadow-xl

                w-full
                sm:w-auto
              "
            >
              <Brain className="mr-3 h-6 w-6" />
              Generate Your Course
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>

          <p className="text-white/80 mt-8 text-sm">
            No credit card required • Instant access • 100% personalized
          </p>

        </div>
      </section>
    </PageWrapper>
  );
}