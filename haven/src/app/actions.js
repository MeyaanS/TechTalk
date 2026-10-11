"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";
import { GUEST_COOKIE, createGuestSession, getGuestFromCookie } from "@/lib/guest";
import { mergeGuestIntoUser } from "@/lib/mergeGuest";

/** "Skip for now": start (or resume) a guest session, then open the app. */
export async function continueAsGuest() {
  const existing = await getGuestFromCookie();
  if (!existing) await createGuestSession();
  redirect("/dashboard");
}

/** Send a magic link. Login always continues at /api/merge. */
export async function sendMagicLink(formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/login?error=email");
  }
  await signIn("email", { email, redirectTo: "/api/merge" });
}

/** Hide the guest reminder for good (saved with the guest's settings). */
export async function dismissGuestBanner() {
  const user = await getCurrentUser();
  if (user?.kind !== "guest") return;
  await prisma.userSettings.upsert({
    where: { guestId: user.id },
    create: { guestId: user.id, guestBannerDismissed: true },
    update: { guestBannerDismissed: true },
  });
  redirect("/dashboard");
}

/** Resolve a merge conflict using the person's choice. */
export async function resolveMerge(formData) {
  const keep = String(formData.get("keep") || "");
  if (keep !== "guest" && keep !== "account") redirect("/merge?error=choose");

  const user = await getCurrentUser();
  const guest = await getGuestFromCookie();
  if (user?.kind !== "account" || !guest) redirect("/dashboard");

  await mergeGuestIntoUser({ guestId: guest.id, userId: user.id, keep });
  cookies().delete(GUEST_COOKIE);
  redirect("/dashboard");
}

/** Log out of an account. */
export async function logOut() {
  await signOut({ redirectTo: "/login" });
}

/** "Delete my account and data": removes everything, for accounts and guests. */
export async function deleteEverything(formData) {
  if (formData.get("confirm") !== "yes") redirect("/settings?error=confirm");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const jar = cookies();
  if (user.kind === "account") {
    // Cascade rules in the schema delete sessions, profile, checklist, go-bag...
    await prisma.user.delete({ where: { id: user.id } });
    jar.delete("authjs.session-token");
    jar.delete("__Secure-authjs.session-token");
  }
  // Also remove any guest data still tied to this browser.
  const guest = await getGuestFromCookie();
  if (guest) await prisma.guestSession.delete({ where: { id: guest.id } });
  jar.delete(GUEST_COOKIE);

  redirect("/login?deleted=1");
}
