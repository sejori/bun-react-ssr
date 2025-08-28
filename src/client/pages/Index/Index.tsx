import { useState } from "react";
import Document from "../../Document";
import { Layout } from "../../components/Layout";

export default function Index(props: { message: string }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Steve");

  return <Document page="Index">
    <Layout>
      <h2>{props.message}</h2>
      <p>{count}</p>
      <button onClick={() => setCount(count+1)}>UP</button>
      <br />
      <br />
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
      <a href={`/about?name=${name}`}>About {name}</a>
    </Layout>
  </Document>;
}