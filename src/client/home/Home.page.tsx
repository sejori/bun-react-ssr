import { useState } from "react";
import { Document } from "../_common/components/Document";
import { Layout } from "../_common/components/Layout";
import { DemoProvider } from "../_common/contexts/demoContext";

export default function Home(props: { message: string }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Steve");

  return <Document page="home">
    <DemoProvider>
      <Layout>
        <h2>{props.message}</h2>

        <ul>
          <li>No framework. Just React and Zod for API validation</li>
          <li>Auto-building and super-fast server provided by Bun</li>
          <li>Extensible middleware cascade on the server</li>
          <li>Use middleware to manage server props with ease</li>
          <li>Simple context example for client-side state</li>
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
            href={`/about?name=${name}`}
          >
            About {name}
          </a>
        </div>

        <hr />
      </Layout>
    </DemoProvider>
  </Document>;
}
