import React from "react";
import Routing from "./routing/Routing";
import CursorGlow from "./layout/CursorGlow";
import AnimatedBackground from "./components/home/AnimatedBackground";

function App() {
  return (
    <>
      {/* Global cursor glow */}  
      <CursorGlow />
      <AnimatedBackground/>  
      {/* App routing */}
      <Routing />
    </>
  );
}

export default App;
