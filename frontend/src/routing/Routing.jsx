// src/routing/Routing.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Layout components
import Navbar from "../layout/Header";
import Footer from "../layout/Footer";
import ScrollToTop from "../components/ScrollonTop"; 
import DocumentationPage from "../pages/Documentation";


// Lazy load pages for better performance
const LandingPage = lazy(() => import("../pages/Landing"));
const UploadPage = lazy(() => import("../pages/Upload"));
const ContactPage = lazy(() => import("../pages/Contact"));
const NotFoundPage = lazy(() => import("../pages/NotFound"));

// Layout Wrapper
const Layout = ({ children }) => {
  const location = useLocation();

  // Routes where we HIDE Navbar + Footer
  const hideLayoutRoutes = ["/login", "/signup", "/404", "/"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
};

const Routing = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
   
      <ScrollToTop />  

      <Routes>
        {/* Pages wrapped with Layout */}
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/upload" element={<Layout><UploadPage/></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
         <Route path="/docs" element={<Layout><DocumentationPage/></Layout>} />



        {/* Catch-all for unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default Routing;
