import { useState } from "react";

export const Counter = () => {
  const [count, setCount] = useState(0);
  
  return <div className="row centered">
    <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{count}</p>
    &nbsp;
    <button 
      onClick={() => setCount(count+1)}
    >
      UP
    </button>
  </div>
}