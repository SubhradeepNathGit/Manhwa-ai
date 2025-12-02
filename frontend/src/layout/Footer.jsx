import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaYoutube, FaDiscord } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Premium subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">

          {/* Brand Section */}
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/manhwa-logo.png"
                alt="Manhwa AI Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                MANHWA AI
              </h2>
            </Link>

            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              Transform your favorite manga into stunning videos using
              AI-powered Anime-style generation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-wider uppercase">
              Quick Links
            </h3>

            <ul className="space-y-3">
              {[
                { name: "Home", link: "/" },
                { name: "About", link: "/about" },
                { name: "Upload Manga", link: "/upload" },
                { name: "Contact", link: "/contact" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.link}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-wider uppercase">
              Resources
            </h3>

            <ul className="space-y-3">
              {[
                { name: "FAQ", link: "/faq" },
                { name: "Documentation", link: "/docs" },
                { name: "Terms of Service", link: "/terms" },
                { name: "Privacy Policy", link: "/privacy" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.link}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Socials */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-wider uppercase">
              Subscribe to Newsletter
            </h3>

            <form className="flex flex-col sm:flex-row items-center gap-3 mb-8">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 px-4 py-2 text-sm bg-gray-900 text-gray-300 border border-gray-800 rounded-lg focus:outline-none focus:border-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all"
              >
                Subscribe
              </button>
            </form>

            {/* Social Links */}
            <h3 className="text-sm font-semibold text-white mb-4 tracking-wider uppercase">
              Connect with Us
            </h3>

            <div className="flex items-center gap-3">
              {[FaGithub, FaTwitter, FaDiscord, FaYoutube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-white transition-all hover:scale-110"
                >
                  <Icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-gray-900">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 text-center sm:text-left">
            <p>© {new Date().getFullYear()} MANHWA AI - All rights reserved.</p>

            <p>
              Developed by{" "}
              <a
                href="https://github.com/SubhradeepNathGit"
                target="_blank"
                className="hover:text-white transition-colors"
              >
                Subhradeep Nath
              </a>{" "}
              &{" "}
              <a
                href="https://github.com/anurag-bitan"
                target="_blank"
                className="hover:text-white transition-colors"
              >
                Anurag Bhattacharya
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
