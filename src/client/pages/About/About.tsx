import { Layout } from "../../components/Layout";
import Document from "../../Document";

export default function About(props: { 
  name: string, 
  logged: boolean 
}) {
  return <Document page="About">
    <Layout>
      <h1>About</h1>
      <p>{props.name} is a strong and dignified individual with a good heart.</p>
      <p>P.s. your request to this page was logged by the server: {props.logged ? "true" : "false"}</p>
      <a href="/">Home</a>
    </Layout>
  </Document>;
}