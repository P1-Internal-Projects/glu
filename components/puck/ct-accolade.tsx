"use client";
import { ComponentConfig } from "@puckeditor/core";

export type CtAccoladeProps = {
  accoladeName: string;
  image: string;
  year: string;
};

export function CtAccolade({ accoladeName, image, year }: CtAccoladeProps) {
  return (
    <>
      <style>{`
        .ct-accolade-card {
          font-family: system-ui, -apple-system, sans-serif;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          max-width: 520px;
          margin: 1.5rem auto;
        }
        .ct-accolade-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: #ede9fe;
          color: #5b21b6;
          padding: 0.15rem 0.55rem;
          border-radius: 99px;
          margin-bottom: 0.5rem;
        }
        .ct-accolade-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.5rem;
        }
        .ct-accolade-body {
          font-size: 0.875rem;
          color: #4b5563;
          line-height: 1.65;
          margin: 0 0 0.75rem;
        }
        .ct-accolade-meta {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.25rem 0.75rem;
          font-size: 0.82rem;
          color: #6b7280;
          margin: 0;
        }
        .ct-accolade-meta dt { font-weight: 600; color: #374151; }
        .ct-accolade-meta dd { margin: 0; }
      `}</style>
      <article className="ct-accolade-card">
        <h2 className="ct-accolade-title">{accoladeName}</h2>
        <dl className="ct-accolade-meta">
          {image && <><dt>Image URL</dt><dd>{image}</dd></>}
          {year && <><dt>Year</dt><dd>{year}</dd></>}
        </dl>
      </article>
    </>
  );
}

export const ctAccoladeConfig = {
  label: "Accolade",
  ai: {
    instructions: "Accolade record — defines a single award or ranking. Use Accolade Listing to display collections on pages.",
  },
  fields: {
    accoladeName: { type: "text", label: "Accolade Name" },
    image: { type: "text", label: "Image URL" },
    year: { type: "text", label: "Year" },
  },
  defaultProps: {
    accoladeName: "",
    image: "",
    year: "",
  },
  render: (props) => <CtAccolade {...props} />,
} as ComponentConfig<CtAccoladeProps>;
