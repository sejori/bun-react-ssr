import "./Layout.css";
import "../assets/bun.svg";
import "../assets/react.svg";
import { useRef } from "react";
import { LocalItems } from "./LocalItems";

export const Layout = ({ children }) => {
  const bunImg = useRef<HTMLImageElement>(null);
  const reactImg = useRef<HTMLImageElement>(null);

  return <>
    <header>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img 
          ref={bunImg} 
          src="/static/assets/bun.svg" 
          onMouseEnter={() => bunImg.current?.classList.add("spin-fast")}
          onMouseLeave={() => bunImg.current?.classList.remove("spin-fast")}
        />
        &nbsp;
        <img 
          ref={reactImg} 
          src="/static/assets/react.svg" 
          onMouseEnter={() => reactImg.current?.classList.add("spin-fast")}
          onMouseLeave={() => reactImg.current?.classList.remove("spin-fast")}
        />
      </div>

      <h1>
        Full-Stack Bun + React
      </h1>
      <a href="https://github.com/sejori/bun-react-ssr">source code</a>
    </header>

    <main>
      <div className="container">
        {children}
      </div>
      
      <LocalItems />
    </main>

    <footer>
      Built by&nbsp;<a href="https://sejori.net">Sejori</a> 
    </footer>
  </>
}