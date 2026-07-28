"use client";
import { ComponentConfig } from "@puckeditor/core";

export type CtCounselorProps = {
  firstName: string;
  lastName: string;
  title: string;
  credential: string;
  bio: string;
  photo: string;
  geographyServed: "United States" | "International" | "";
};

export function CtCounselor({
  firstName,
  lastName,
  title,
  credential,
  bio,
  photo,
  geographyServed,
}: CtCounselorProps) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const titleLine = [title, credential].filter(Boolean).join(" · ");

  return (
    <>
      <style>{`
        .ct-counselor-card {
          font-family: system-ui, -apple-system, sans-serif;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          max-width: 420px;
          margin: 1.5rem auto;
        }
        .ct-counselor-geo {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: #dbeafe;
          color: #1d4ed8;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
        }
        .ct-counselor-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #111827;
          margin: 0.5rem 0 0.2rem;
        }
        .ct-counselor-title {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0 0 0.75rem;
        }
        .ct-counselor-bio {
          font-size: 0.875rem;
          color: #4b5563;
          line-height: 1.65;
          margin: 0;
        }
      `}</style>
      <article className="ct-counselor-card">
        {photo ? (
          <img
            src={photo}
            alt={fullName}
            style={{ width: "100%", height: "240px", objectFit: "cover", objectPosition: "top", display: "block" }}
          />
        ) : (
          <div style={{
            height: "240px", background: "linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}
        <div style={{ padding: "1.5rem" }}>
          {geographyServed && <span className="ct-counselor-geo">{geographyServed}</span>}
          <h2 className="ct-counselor-name">{fullName || "Counselor Name"}</h2>
          {titleLine && <p className="ct-counselor-title">{titleLine}</p>}
          {bio && <p className="ct-counselor-bio">{bio}</p>}
        </div>
      </article>
    </>
  );
}

export const ctCounselorConfig = {
  label: "Counselor",
  ai: {
    instructions: "Counselor record — defines a single admissions counselor. Use Counselor Listing to display collections on pages.",
  },
  fields: {
    firstName: { type: "text", label: "First Name" },
    lastName: { type: "text", label: "Last Name" },
    title: { type: "text", label: "Title" },
    credential: { type: "text", label: "Credential (e.g. PhD, LCSW)" },
    bio: { type: "textarea", label: "Bio" },
    photo: { type: "text", label: "Photo URL" },
    geographyServed: {
      type: "select",
      label: "Geography Served",
      options: [
        { label: "— Select —", value: "" },
        { label: "United States", value: "United States" },
        { label: "International", value: "International" },
      ],
    },
  },
  defaultProps: {
    firstName: "",
    lastName: "",
    title: "",
    credential: "",
    bio: "",
    photo: "",
    geographyServed: "",
  },
  render: (props) => <CtCounselor {...props} />,
} as ComponentConfig<CtCounselorProps>;
