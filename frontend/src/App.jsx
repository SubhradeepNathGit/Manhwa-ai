import React from "react";
import Routing from "./routing/Routing";
import CursorGlow from "./layout/CursorGlow";
import AnimatedBackground from "./components/home/AnimatedBackground";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      {/* Global cursor glow */}  
      <CursorGlow />
      <AnimatedBackground/>  
      
      {/* App routing */}
      <Routing />
      
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;