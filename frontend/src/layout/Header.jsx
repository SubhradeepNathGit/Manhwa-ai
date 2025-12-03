// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Video, Home, Mail, LogIn, LogOut, BookOpen } from "lucide-react"; // Added BookOpen icon
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  // Handle Logout
  const handleLogout = async () => {
    // 1. Clear the saved story data
    sessionStorage.removeItem("pendingStory");
    sessionStorage.removeItem("pendingFileName");
    console.log("🧹 Clearing session data...");
    // 2. Perform Supabase Logout
    await logout();
    
    // 3. Close menu and redirect
    setIsOpen(false);
    navigate("/"); 
  };

  // Close menu with ESC
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleKeyDown, isOpen]);

  // Navigation links - Added Docs here
  const navLinks = [
    { name: "Upload", path: "/upload", icon: Video },
    { name: "Docs", path: "/docs", icon: BookOpen }, // Added Docs here
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };
  
  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/70 bg-opacity-80 backdrop-blur-md shadow-lg"
            : "bg-black"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-xl tracking-tight hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
            >
              <img
                src="/manhwa-logo.png"
                alt="Manhwa Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain animate-spin"
              />
              <span className="hidden xs:inline sm:inline">MANHWA AI</span>
              <span className="xs:hidden sm:hidden">MANHWA AI</span>
            </Link>

            {/* Desktop Nav - Now includes Docs */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative text-gray-300 hover:text-white font-medium transition-colors duration-200 group text-sm lg:text-base flex items-center gap-2"
                >
                  {link.name}
                  <span
                    className={`absolute left-0 -bottom-1 h-0.5 bg-purple-600 transition-all duration-300 ${
                      isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Desktop Right Side - ONLY AUTH now */}
            <div className="hidden md:flex items-center gap-4">
                
                {/* AUTH LOGIC */}
                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400">Logged in as</span>
                            <span className="text-sm font-bold text-white max-w-[120px] truncate">
                                {user.email?.split('@')[0]}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 text-sm flex items-center gap-2"
                    >
                        <LogIn className="w-4 h-4" />
                        Login
                    </button>
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200 flex-shrink-0"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            style={{ touchAction: "none" }}
          />

          {/* Sidebar */}
          <aside
            className="fixed top-0 right-0 bottom-0 w-full xs:w-80 sm:w-72 bg-gray-900/95 backdrop-blur-xl z-50 p-4 sm:p-6 flex flex-col shadow-2xl md:hidden border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <img
                  src="/manhwa-logo.png"
                  alt="Manhwa Logo"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-white font-bold text-lg">MANHWA AI</span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile User Info (If Logged In) */}
            {user && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Welcome</p>
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>
                </div>
            )}

            {/* Links - Now includes Docs */}
            <nav className="flex flex-col space-y-2 flex-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-base sm:text-lg font-medium rounded-lg transition-colors duration-200 ${
                    isActive(link.path)
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Button */}
            <div className="mt-auto pt-4 border-t border-gray-800 space-y-3">
              {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg transition-colors border border-red-500/20"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
              ) : (
                  <button
                    onClick={() => {
                        setIsOpen(false);
                        navigate("/login");
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20"
                  >
                    <LogIn className="w-5 h-5" />
                    Login / Sign Up
                  </button>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Spacer */}
      <div className="h-16 sm:h-20" aria-hidden="true" />
    </>
  );
};

export default Navbar;
