import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

// Header preserves marketing assets and responsive navigation while matching legacy markup for brand consistency.

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header id="main-header" className="relative z-50">
      <div id="banner" className="py-4" style={{ backgroundColor: "#20B24D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center justify-between flex-wrap gap-4">
            <div id="top-slogan">
              <a
                href="https://www.trustpilot.com/review/webuyanycarusa.com?utm_medium=trustbox&utm_source=custom"
                target="_blank"
                rel="noopener noreferrer"
                className=""
              >
                <img
                  alt="Trustpilot"
                  src={`${import.meta.env.BASE_URL}Content/Images/logo-estrella.png`}
                  id="trustpilot-logo"
                  className="w-100"
                />
              </a>
            </div>

            <div id="logo">
              <a
                id="top-logo"
                href="/"
                title="We Buy Any Car"
                className="block bg-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <img
                  src={`${import.meta.env.BASE_URL || "/"}logo.png`}
                  alt="We Buy Any Car Logo"
                  className="h-10 md:h-14 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </a>
            </div>

            <div className="bbb-logo flex items-center gap-2">
              <a
                href="https://www.bbb.org/us/pa/springfield/profile/car-buying/webuyanycar-com-0241-235989197/#sealclick"
                target="_blank"
                title="webuyanycar.com BBB Business Review"
                rel="nofollow noreferrer"
                className="hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                <img
                  src="https://seal-dc-easternpa.bbb.org/seals/blue-seal-250-52-whitetxt-bbb-235989197.png?t=20251104"
                  style={{ border: 0 }}
                  alt="webuyanycar.com BBB Business Review"
                  className="h-10 md:h-12 w-auto"
                />
              </a>
            </div>
          </div>

          <div className="md:hidden flex items-center justify-between gap-3">
            <div className="bg-white rounded-xl px-3 py-2 shadow-lg flex-shrink-0">
              <a href="/" title="We Buy Any Car" className="block">
                <img
                  src={`${import.meta.env.BASE_URL || "/"}logo.png`}
                  alt="We Buy Any Car Logo"
                  className="h-12 md:h-14 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-black rounded-xl p-4 md:p-3 flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors flex-shrink-0 min-w-[48px] min-h-[48px]"
              aria-label="Toggle menu"
              id="mobile-menu-toggle-button"
            >
              <ChevronDown
                className={`w-4 h-4 md:w-5 md:h-5 text-white transition-transform duration-200 ${mobileMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <nav
        id="nav"
        className="hidden md:block py-3"
        style={{ backgroundColor: "#000" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            <Link
              to="/how-it-works"
              className="black box bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
            >
              How it works
            </Link>

            <Link
              to="https://www.webuyanycarusa.com/locations"
              className="black box bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors font-semibold relative inline-flex items-center text-base"
            >
              Locations
            </Link>

            <Link
              to="https://www.webuyanycarusa.com/we-come-to-you"
              className="black box bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
            >
              Home Pickup
            </Link>

            <Link
              to="https://www.webuyanycarusa.com/faq"
              className="black box bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
            >
              FAQ
            </Link>

            <Link
              to="https://www.webuyanycarusa.com/contactus"
              className="black box bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          <nav
            id="nav"
            className="fixed top-[72px] left-0 right-0 z-50 py-3 md:hidden shadow-xl"
            style={{ backgroundColor: "#000" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-2 pb-4">
                <Link
                  to="https://www.webuyanycarusa.com/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gray-900 text-white px-4 py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
                >
                  How it works
                </Link>

                <Link
                  to="https://www.webuyanycarusa.com/locations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gray-900 text-white px-4 py-3 rounded hover:bg-gray-800 transition-colors font-semibold relative text-base"
                >
                  Locations
                  <span className="absolute top-2 right-4 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">
                    128
                  </span>
                </Link>

                <Link
                  to="https://www.webuyanycarusa.com/we-come-to-you"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gray-900 text-white px-4 py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
                >
                  Home Pickup
                </Link>

                <Link
                  to="https://www.webuyanycarusa.com/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gray-900 text-white px-4 py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
                >
                  FAQ
                </Link>

                <Link
                  to="https://www.webuyanycarusa.com/contactus"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gray-900 text-white px-4 py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
                >
                  Contact
                </Link>

                <a
                  href="https://webuyanycar.jobs"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gray-900 text-white px-4 py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
                >
                  Careers
                </a>

                <a
                  href="https://webuyanycarusa.com/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gray-900 text-white px-4 py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
                >
                  Blog
                </a>

                <a
                  href="https://www.webuyanycar.com?utm_source=us_site&utm_medium=homepage_flag&utm_campaign=us"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gray-900 text-white px-4 py-3 rounded hover:bg-gray-800 transition-colors font-semibold text-base"
                >
                  webuyanycar.com UK
                </a>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
