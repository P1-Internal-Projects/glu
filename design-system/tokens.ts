export const colors = {
  crimson: "#8B0015",    // Deep collegiate crimson (nav, footer, dark sections)
  crimsonDark: "#6B0010",
  crimsonLight: "#B22030",
  blue: "#C0392B",       // Alizarin / medium red (accents, links)
  gold: "#C8922A",       // Collegiate gold (CTAs, highlights)
  goldDark: "#A87522",
  goldLight: "#E8B04A",
  white: "#ffffff",
  offWhite: "#FFF5F5",   // Warm blush off-white
  lightBlue: "#FDECEA",  // Very light red tint (subtle section bg)
  dark: "#1A0505",       // Near-black with red tint (body text)
  muted: "#6B4040",      // Warm muted (secondary text)
  border: "#EDD5D5",
  error: "#c0392b",
  success: "#1a7a4a",
} as const;

export const typography = {
  fontHeading: "'Playfair Display', Georgia, 'Times New Roman', serif",
  fontBody: "Inter, 'Helvetica Neue', Arial, sans-serif",
  fontMono: "'Fira Code', 'Courier New', monospace",
  sizeXs: "0.75rem",
  sizeSm: "0.875rem",
  sizeBase: "1rem",
  sizeLg: "1.125rem",
  sizeXl: "1.25rem",
  size2xl: "1.5rem",
  size3xl: "1.875rem",
  size4xl: "2.25rem",
  size5xl: "3rem",
  size6xl: "3.75rem",
  weightNormal: 400,
  weightMedium: 500,
  weightSemibold: 600,
  weightBold: 700,
  lineHeightTight: 1.2,
  lineHeightSnug: 1.375,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.625,
  lineHeightLoose: 2,
} as const;

export const spacing = {
  px: "1px",
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
} as const;

export const radii = {
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 3px rgba(139,0,21,0.08)",
  md: "0 4px 12px rgba(139,0,21,0.12)",
  lg: "0 8px 24px rgba(139,0,21,0.16)",
  xl: "0 16px 48px rgba(139,0,21,0.20)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const layout = {
  containerMax: "1200px",
  sectionPaddingY: "5rem",
  sectionPaddingYSm: "3rem",
  navHeight: "72px",
} as const;
