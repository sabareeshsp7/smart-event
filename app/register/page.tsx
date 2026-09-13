import { redirect } from "next/navigation";

/**
 * Registration page — redirected to the Live Events Directory.
 * EventIQ focuses purely on verified live event intelligence from Ticketmaster.
 */
export default function RegisterPage() {
  redirect("/events");
}
