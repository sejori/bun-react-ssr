import { useState } from "react";

export const AboutNav = () => {
  const [name, setName] = useState("Steve");
  
  return <div className="row centered">
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
}