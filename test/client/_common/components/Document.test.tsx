import { test, describe, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import { Document } from "../../../../src/client/_common/components/Document";

describe("Document component", () => {
  test("renders correct HTML structure with metadata", () => {
    const page = "test-page";
    const testContent = "Test Child Content";
    
    // use renderToString for full <html> doc support
    const htmlString = renderToString(
      <Document page={page}>
        <div>{testContent}</div>
      </Document>
    );

    // Check basic HTML structure
    expect(htmlString).toContain('<head>');
    expect(htmlString).toContain('<body>');

    // Check meta tags and metadata
    expect(htmlString).toContain('<meta charSet="UTF-8"/>');
    expect(htmlString).toContain('<meta name="viewport" content=\"width=device-width, initial-scale=1.0"/>');
    expect(htmlString).toContain('<title>Bun React SSR | test-page</title>');
    expect(htmlString).toContain('<meta name="description" content="The smoothest React SSR on the web"/>');

    // Check page-specific CSS
    expect(htmlString).toContain(`/${page}/${page}.client.css`);

    // Check children are rendered
    expect(htmlString).toContain(testContent);
  });

  test("includes correct external resources", () => {
    const page = "index";
    const htmlString = renderToString(
      <Document page={page}>
        <div>Test</div>
      </Document>
    );  
    // Check favicon
    expect(htmlString).toContain('/assets/react.svg');
    
    // Check bundled CSS
    expect(htmlString).toContain('/index/index.client.css');
  });

  test("uses correct page parameter in CSS link", () => {
    const differentPages = ["index", "about", "contact", "projects"];
    
    differentPages.forEach(page => {
      const htmlString = renderToString(
        <Document page={page}>
          <div>Test</div>
        </Document>
      );

      expect(htmlString).toContain(`/${page}/${page}.client.css`);
    });
  });
});