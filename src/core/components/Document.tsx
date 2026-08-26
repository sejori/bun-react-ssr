import { ReactNode } from "react";
import "../assets/react.svg";
import { vendorImports } from "../utils/vendor";

// resolves the specifiers left external by the client build to the shared
// vendor bundle. Must precede any module script, hence the top of <head>.
const importMap = JSON.stringify({ imports: vendorImports });

// only the dev build leaves react external. Both renders have to agree on this
// or hydration mismatches, so the client reads the flag the react middleware
// injects for exactly that case.
const isVendored = () =>
  typeof window === "undefined"
    ? process.env.ENV === "dev"
    : !!window.__HMR__;

interface DocumentProps {
  page: string;
  children: ReactNode
}

export const Document = ({ page, children }: DocumentProps) => {
  return <html>
    <head>
      {isVendored() && <script
        type="importmap"
        dangerouslySetInnerHTML={{ __html: importMap }}
      />}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{`Bun React SSR | ${page}`}</title>
      <meta name="description" content="The smoothest React SSR on the web" />
      <meta name="robots" content="index, follow" />
      <link rel="icon" href="/static/assets/react.svg" type="image/svg+xml" />
      <link rel="stylesheet" href={`/static/${page}/${page}.client.css`} />
    </head>

    <body>
      {children}
    </body>
  </html>;
}