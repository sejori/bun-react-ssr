import { useEffect, useMemo, useState } from "react";
import { Document } from "../_common/components/Document";
import { Layout } from "../_common/components/Layout";
import { DemoProvider } from "../_common/contexts/demoContext";
import { generateMsTimeString } from "../../_common/utils/date.utils";

export default function Home(props: { requestTime: string }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Steve");
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

        <div className="row centered">
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{count}</p>
          &nbsp;
          <button 
            onClick={() => setCount(count+1)}
          >
            UP
          </button>
        </div>

        <hr />

        <div className="row centered">
          <input 
            type="text"
            aria-label="name-input"
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          &nbsp;
          <a 
            aria-label="about-link" 
            href={`/about/${name}`}
          >
            About {name}
          </a>
        </div>

        <hr />
      </Layout>
    </DemoProvider>
  </Document>;
}
