import Document from "../../Document";

export default function About(props: { name?: string }) {
  return <Document page="About">
    <h1>About</h1>
    <p>{props.name} is a strong and dignified individual with a good heart.</p>
    <a href="/">Home</a>
  </Document>;
}