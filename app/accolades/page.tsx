import { AccoladeListing } from "../../components/puck/accolade-listing";

export const dynamic = "force-dynamic";

export default function AccoladesPage() {
  return (
    <AccoladeListing
      eyebrow="Recognition"
      heading="Our Accolades"
      subtext=""
      columns={3}
      accentColor="#5b21b6"
      backgroundColor="#ffffff"
    />
  );
}
