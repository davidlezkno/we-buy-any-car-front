// Layout responsible for rendering shared header, footer, and transition wrapper.
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // Hide header and footer when in valuation flow after step 1
  // Step 1 is /valuation, steps 2+ are /valuation/vehicledetails, /valuation/vehiclecondition, etc.
  const isValuationFlowAfterStep1 = 
    location.pathname.startsWith("/valuation/") && 
    location.pathname !== "/valuation";
  
  // Show header in mobile when showing price (step 4 - appointment)
  const isAppointmentStep = location.pathname === "/valuation/appointment" || location.pathname.includes("/appointment");
  
  // Always show header and footer on confirmation page (both mobile and desktop)
  const isConfirmationPage = location.pathname === "/valuation/confirmation" || location.pathname.includes("/confirmation");
  
  const shouldShowHeader = !isValuationFlowAfterStep1 || (isMobile && isAppointmentStep) || isConfirmationPage;
  const shouldShowFooter = !isValuationFlowAfterStep1 || (isMobile && isAppointmentStep) || isConfirmationPage;
  
  // Scroll to header when appointment step loads on mobile
  useEffect(() => {
    if (isMobile && isAppointmentStep && shouldShowHeader) {
      // Small delay to ensure header is rendered
      setTimeout(() => {
        const header = document.getElementById("main-header");
        if (header) {
          header.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [isMobile, isAppointmentStep, shouldShowHeader]);
  
  return (
    <div
      className="min-h-screen flex flex-col w-full overflow-x-hidden"
      style={{ boxSizing: "border-box", maxWidth: "100vw" }}
    >
      {shouldShowHeader && <Header />}
      <motion.main
        className="flex-grow w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ boxSizing: "border-box", maxWidth: "100%" }}
      >
        {children}
      </motion.main>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

export default Layout;
