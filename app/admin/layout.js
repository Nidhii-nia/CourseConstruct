import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminRootLayout({ children }) {
  const user = await currentUser();

  // Not logged in
  if (!user) {
    redirect("/");
  }

  const email = user.primaryEmailAddress?.emailAddress;

  // Not admin
  if (email !== "nia30207@gmail.com") {
    redirect("/workspace"); // or "/"
  }

  // Allowed
  return <>{children}</>;
}