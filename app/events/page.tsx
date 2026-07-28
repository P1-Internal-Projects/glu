import { getEvents } from "../../lib/ct-client";
import EventsListing from "./EventsListing";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function EventsPage() {
  const events = await getEvents();
  return <EventsListing events={events} />;
}
