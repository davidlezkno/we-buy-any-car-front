// ReviewsSection displays Trustpilot reviews using the official TrustBox widget.
import { memo, useEffect, useRef } from "react";

const ReviewsSection = () => {
  const widgetContainerRef = useRef(null);
  const mobileWidgetRef = useRef(null);

  useEffect(() => {
    // Wait for TrustBox script to load and initialize widgets
    const initTrustBox = () => {
      if (typeof window !== "undefined" && window.Trustpilot) {
        // Initialize desktop widget
        const desktopWidget = widgetContainerRef.current?.querySelector(".trustpilot-widget");
        if (desktopWidget && window.Trustpilot.loadFromElement) {
          try {
            window.Trustpilot.loadFromElement(desktopWidget, true);
          } catch (error) {
            console.warn("TrustBox desktop widget initialization error:", error);
          }
        }
        
        // Initialize mobile widget
        const mobileWidget = mobileWidgetRef.current?.querySelector(".trustpilot-widget");
        if (mobileWidget && window.Trustpilot.loadFromElement) {
          try {
            window.Trustpilot.loadFromElement(mobileWidget, true);
          } catch (error) {
            console.warn("TrustBox mobile widget initialization error:", error);
          }
        }
      }
    };

    // Check if script is already loaded
    if (typeof window !== "undefined" && window.Trustpilot) {
      // Small delay to ensure DOM is ready
      setTimeout(initTrustBox, 100);
    } else {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (typeof window !== "undefined" && window.Trustpilot) {
          clearInterval(checkInterval);
          setTimeout(initTrustBox, 100);
        }
      }, 100);

      // Cleanup after 15 seconds
      setTimeout(() => clearInterval(checkInterval), 15000);
    }
  }, []);

  return (
    <section className="bg-white py-16 md:py-24 border-t border-gray-200">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center hidden md:block">
          Here&apos;s What Our Customers Have to Say ...
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-1 max-w-6xl mx-auto">
          {/* Mobile widget - Mini */}
          <div
            ref={mobileWidgetRef}
            className="relative w-full block md:hidden"
            style={{ minHeight: "150px", overflow: "visible" }}
          >
            <div
              className="trustpilot-widget"
              data-locale="en-US"
              data-template-id="53aa8807dec7e10d38f59f32"
              data-businessunit-id="530e101e0000640005784b1e"
              data-style-height="150px"
              data-style-width="100%"
              data-token="4b39b9ea-696e-4fa7-b558-fbafccd56a9a"
              style={{ position: "relative", width: "100%", minHeight: "150px" }}
            >
              <a
                href="https://www.trustpilot.com/review/webuyanycarusa.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Trustpilot
              </a>
            </div>
          </div>

          {/* BBB Badge - Mobile only */}
          <div id="bbb-badge-mobile" className="mobile-only block md:hidden flex justify-center">
            <a
              href="https://www.bbb.org/us/pa/springfield/profile/car-buying/webuyanycar-com-0241-235989197/#sealclick"
              target="_blank"
              title="webuyanycar.com BBB Business Review"
              rel="nofollow noreferrer"
              className="hover:opacity-80 transition-opacity inline-block"
              style={{
                backgroundColor: "#0baa4a",
                borderRadius: "10px",
              }}
            >
              <img
                src="/accredited.png"
                style={{ border: 0 }}
                alt="webuyanycar.com BBB Business Review"
              />
            </a>
          </div>

          {/* Desktop widget - Carousel */}
          <div
            ref={widgetContainerRef}
            id="wrapper-right"
            className="relative w-full hidden md:block"
            style={{ minHeight: "300px", overflow: "visible" }}
          >
            <div
              className="trustpilot-widget"
              data-locale="en-US"
              data-template-id="53aa8912dec7e10d38f59f36"
              data-businessunit-id="530e101e0000640005784b1e"
              data-style-height="300px"
              data-style-width="100%"
              data-token="8d88f602-a92a-4f1e-9448-3a2135d11619"
              data-tags="verified"
              data-stars="5"
              data-review-languages="en"
              style={{ position: "relative", width: "100%", minHeight: "300px" }}
            >
              <a
                href="https://www.trustpilot.com/review/webuyanycarusa.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Trustpilot
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ReviewsSection);
