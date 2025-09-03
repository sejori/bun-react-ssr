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

        <p>{count}</p>
        <button 
          onClick={() => setCount(count+1)}
        >
          UP
        </button>
        <br />
        <br />

        <input 
          type="text"
          aria-label="name-input"
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        <a 
          aria-label="about-link" 
          href={`/about?name=${name}`}
        >
          About {name}
        </a>
      </Layout>
    </DemoProvider>
  </Document>;
}
