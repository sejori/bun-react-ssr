import { useRef } from "react";
import "../assets/bun.svg";
import "../assets/react.svg";
import "./Layout.css";
import { useDemoStore } from "../hooks/useDemoStore";

export const Layout = ({ children }) => {
  const { isLoading, items, storeItem, clearItems } = useDemoStore();
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
        Full-Stack Bun + React
      </h1>
      <a href="https://github.com/sejori/bun-react-ssr">source code</a>
    </header>

    <main>
      <div className="container">
        {children}
      </div>
      
      <details className="container">
        <summary>Local items</summary>
        {isLoading
          ? <div className="loader" />
          : <>
              <div className="flex">
                <button onClick={() => storeItem({
                  itemId: crypto.randomUUID(),
                  action: "click",
                  details: new Date().toISOString()
                })}>
                  Add Item
                </button>
                &nbsp;
                <button onClick={clearItems}>
                  Clear Items
                </button>
              </div>
              {items.length
                ? items.map(item => <p key={item.itemId}>
                    {item.action} at {item.details}
                  </p>)
                : <p>No items yet...</p>
                }
            </>
          }
      </details>
    </main>

    <footer>
      Built by&nbsp;<a href="https://sejori.net">Sejori</a> 
    </footer>
  </>
}