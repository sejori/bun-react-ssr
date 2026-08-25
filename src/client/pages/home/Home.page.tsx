import { useEffect, useState } from "react";
import { Document } from "../../components/Document";
import { Layout } from "../../components/Layout";
import { DemoProvider } from "../../contexts/demoContext";
import { generateMsTimeString } from "../../../utils/date.utils";
import { Counter } from "./components/Counter";
import { AboutNav } from "./components/AboutNav";

export default function Home(props: { requestTime: string }) {
  const [hydrateTime, setHydrateTime] = useState("");
  useEffect(() => setHydrateTime(generateMsTimeString()), [setHydrateTime]);

  return <Document page="home">
    <DemoProvider>
      <Layout>
        <h2>Barebones Full-Stack starter template</h2>
        <p><strong>Server render time: </strong><span>{props.requestTime}</span></p>
        <p><strong>Client interactive time: </strong><span>{hydrateTime}</span></p>
        <ul>
          <li>No framework. Just Bun's HTTP router, React and Zod</li>
          <li>Auto asset building and super-fast server provided by Bun</li>
          <li>Extensible middleware cascade util on the server for logging, auth etc</li>
          <li>Type-safe React server-side rendering, never miss a prop</li>
          <li>Simple client-side react context example for global state</li>
          <li>Un-opinionated, implement your favourite styling, ORM, etc</li>
        </ul>
        <Counter />
        <hr />
        <AboutNav />
        <hr />
      </Layout>
    </DemoProvider>
  </Document>;
}

