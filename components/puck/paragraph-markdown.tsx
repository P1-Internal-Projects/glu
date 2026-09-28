import type { Components } from "react-markdown";
import { bodyLinkStyle } from "../../design-system/components/body-copy";

export const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="m-0 max-w-prose leading-relaxed">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} style={bodyLinkStyle}>
      {children}
    </a>
  ),
};
