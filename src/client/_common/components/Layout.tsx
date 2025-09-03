import { useRef } from "react";
import "../assets/bun.svg";
import "../assets/react.svg";
import "./Layout.css";
import { useDemoStore } from "../hooks/useDemoStore";

export const Layout = ({ children }) => {
  const { items, storeItem, clearItems } = useDemoStore();
  const bunImg = useRef<HTMLImageElement>(null);
  const reactImg = useRef<HTMLImageElement>(null);

  return <>
    <header>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img 
          ref={bunImg} 
          src="/assets/bun.svg" 
          onMouseEnter={() => bunImg.current?.classList.add("spin-fast")}
          onMouseLeave={() => bunImg.current?.classList.remove("spin-fast")}
        />
        &nbsp;
        <img 
          ref={reactImg} 
          src="/assets/react.svg" 
          onMouseEnter={() => reactImg.current?.classList.add("spin-fast")}
          onMouseLeave={() => reactImg.current?.classList.remove("spin-fast")}
        />
      </div>

      <h1>
        Full-Stack Bun + React Template
      </h1>
    </header>

    <main>
      <div className="container">
        {children}
      </div>
      
      <div className="container">
        <button onClick={() => storeItem({
          itemId: crypto.randomUUID(),
          action: "click",
          details: Date.toString()
        })}>
          Add Item
        </button>
        <button onClick={clearItems}>
          Clear Items
        </button>
        {items.map(item => <p key={item.itemId}>
          {item.action} at {item.details}
        </p>)}
      </div>
    </main>

    <footer>
      Built by&nbsp;<a href="https://sejori.net">Sejori</a> 
    </footer>
  </>
}