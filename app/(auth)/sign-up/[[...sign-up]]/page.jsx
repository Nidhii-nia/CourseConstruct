import { SignUp } from "@clerk/nextjs";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function Page() {
  return (
    <div
      className="
        relative
        flex
        items-center
        justify-center
        min-h-screen
        overflow-hidden

        bg-linear-to-br
        from-emerald-50
        via-white
        to-teal-100

        dark:from-gray-950
        dark:via-gray-900
        dark:to-emerald-950

        transition-colors
        duration-500

        px-4
      "
    >
      {/* THEME TOGGLE */}
      <ThemeToggle />

      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-yellow-200 dark:bg-yellow-500/10 rounded-full blur-3xl opacity-40"></div>

      <div className="absolute bottom-10 right-10 w-56 h-56 bg-emerald-200 dark:bg-emerald-500/10 rounded-full blur-3xl opacity-40"></div>

      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-sky-200 dark:bg-sky-500/10 rounded-full blur-3xl opacity-30"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
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

      {/* Sign In Card */}
        <SignUp />
    </div>
  );
}