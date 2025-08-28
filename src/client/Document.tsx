import { ReactNode } from "react";
import "./assets/style.css";
import "./assets/react.svg";

interface DocumentProps {
  page: string;
  children: ReactNode
}

export default function ({ page, children }: DocumentProps) {
  return <html>
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{`Bun React SSR | ${page}`}</title>
      <meta name="description" content="The smoothest React SSR on the web" />
      <meta name="robots" content="index, follow" />
      <link rel="icon" href="/assets/react.svg" type="image/svg+xml" />
      <link rel="stylesheet" href={`/${page}/${page}.client.css`} />
    </head>

    <body>
      {children}
    </body>
  </html>;
}