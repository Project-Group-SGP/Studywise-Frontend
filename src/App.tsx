import { useState } from "react";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <p onClick={() => setCount((c) => c + 1)}>Hello World {count}</p>
        <ModeToggle />
        <p>{import.meta.env.VITE_API_URL}</p>
      </div>
    </>
  );
}

export default App;
