// src/routing/Routing.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Layout components
import Navbar from "../layout/Header";
import Footer from "../layout/Footer";
import ScrollToTop from "../components/ScrollonTop";
import DocumentationPage from "../pages/Documentation";
// import VerifyEmail from "../pages/VerifyEmail";

// 🚀 Home MUST NOT be lazy
import HomePage from "../pages/Home";
import UploadPage from "../pages/Upload";
import AuthCallback from "../components/auth/AuthCallback";

// Lazy-loaded pages (OK)

const ContactPage = lazy(() => import("../pages/Contact"));
const NotFoundPage = lazy(() => import("../pages/NotFound"));
const LoginPage = lazy(() => import("../pages/Login"));

// Layout Wrapper
const Layout = ({ children }) => {
  const location = useLocation();

  const hideLayoutRoutes = ["/login", "/signup", "/404"];
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
    <>
      <ScrollToTop />

      <Routes>
        {/* HOME — NO SUSPENSE */}
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />

        {/* OTHER PAGES — SUSPENSE OK */}
        <Route
          path="/upload"
          element={
            <Suspense fallback={null}>
              <Layout>
                <UploadPage />
              </Layout>
            </Suspense>
          }
        />

        <Route
          path="/contact"
          element={
            <Suspense fallback={null}>
              <Layout>
                <ContactPage />
              </Layout>
            </Suspense>
          }
        />

        <Route
          path="/docs"
          element={
            <Layout>
              <DocumentationPage />
            </Layout>
          }
        />

        <Route
          path="/login"
          element={
            <Suspense fallback={null}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* <Route path="/verify" element={<VerifyEmail />} /> */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default Routing;
