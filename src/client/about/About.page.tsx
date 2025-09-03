import { Document } from "../_common/components/Document";
import { Layout } from "../_common/components/Layout";
import { DemoProvider } from "../_common/contexts/demoContext";

export default function About(props: { 
  name: string, 
  logged: boolean 
}) {
  return <Document page="about">
    <DemoProvider>
      <Layout>
        <h1>About</h1>
        
        <p><span>{props.name}</span> is a strong and dignified individual with a good heart.</p>
        <p>P.s. your request to this page was logged by the server: <span>{props.logged ? "true" : "false"}</span></p>

        <a 
          aria-label="home-link" 
          href="/"
        >
          Home
        </a>
      </Layout>
    </DemoProvider>
  </Document>;
}