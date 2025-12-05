import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { trackPageView } from "../utils/tracking";

const Confirmation = () => {
  const navigate = useNavigate();
  const { vehicleData, userInfo, appointmentInfo } = useApp();
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const trustpilotWidgetRef = useRef(null);
  const [branchInfo, setBranchInfo] = useState(null);
  useEffect(() => {
    console.log("valuation/confirmation ---- vehicleData ----", vehicleData);
    if (vehicleData) {
      const branch = vehicleData.branchInfo;
      const hoursData = {};
      for(let i = 0; i < branch.operationHours.length; i++){
        if(hoursData[branch.operationHours[i].dayOfWeek] && hoursData[branch.operationHours[i].dayOfWeek] != "Closed"){
          hoursData[branch.operationHours[i].dayOfWeek] += ` - ${branch.operationHours[i].closeTime}`;
        }else{
          hoursData[branch.operationHours[i].dayOfWeek] = branch.operationHours[i].type == "open" ? branch.operationHours[i].openTime : "Closed";
        }                
      }
      setBranchInfo({
        name: branch.branchName,
        city: branch.city,
        address: branch.address1,
        fullAddress: `${branch.address1}, ${branch.city}, ${branch.state} ${branch.zipCode}`,
        phone: branch.branchPhone,
        email: branch.branchEmail,
        manager: branch.branchManagerName,
        hours: hoursData,
        // {
        //   Tuesday: "Closed",
        //   Wednesday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
        //   Thursday: "11a.m. - 2p.m., 3p.m. - 8p.m.",
        //   Friday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
        //   Saturday: "9a.m. - 12p.m., 1p.m. - 6p.m.",
        //   Sunday: "Closed",
        //   Monday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
        // },
      });
      console.log("---- branchInfo ---", branchInfo);
    }
  }, [vehicleData]);
  const [expandedSections, setExpandedSections] = useState({
    checklist: true,
    landmarks: false,
    questions: {},
  });
  const [activeSlide, setActiveSlide] = useState(2); // Start with "Fair" slide (index 2)

  // Track page view for GTM and GA4 when confirmation page loads
  useEffect(() => {
    trackPageView("/valuation/confirmation", "Valuation - Confirmation", {
      valuation_step: 5,
      valuation_step_name: "Confirmation",
    });
  }, []);

  useEffect(() => { 
    // Redirect if no appointment info
    if (!appointmentInfo) {
      navigate("/");
      return;
    }

    // Scroll to main header after a short delay to ensure DOM is ready
    setTimeout(() => {
      const mainHeader = document.getElementById("main-header");
      if (mainHeader) {
        mainHeader.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback: scroll to top if header not found
        window.scrollTo(0, 0);
      }
    }, 100);
  }, [appointmentInfo, navigate]);

  // Initialize Trustpilot widget when component mounts
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 100; // Try for up to 10 seconds (100 * 100ms)
    let observer = null;

    // Function to set widget height based on screen size
    const setWidgetHeight = () => {
      if (trustpilotWidgetRef.current) {
        // Always use 180px for the widget to ensure content is visible
        const height = "180px";
        trustpilotWidgetRef.current.setAttribute("data-style-height", height);
        trustpilotWidgetRef.current.style.minHeight = height;
        trustpilotWidgetRef.current.style.height = height;
        
        // Update iframe height if it exists
        const iframe = trustpilotWidgetRef.current.querySelector("iframe");
        if (iframe) {
          iframe.style.height = height;
          iframe.style.minHeight = height;
          iframe.style.maxHeight = height;
          
          // Update iframe src to reflect correct height
          let iframeSrc = iframe.src;
          if (iframeSrc) {
            iframeSrc = iframeSrc.replace(/styleHeight=\d+px/g, `styleHeight=${height}`);
            if (iframe.src !== iframeSrc) {
              iframe.src = iframeSrc;
            }
          }
        }
      }
    };

    
    // Function to ensure widget wrapper is visible
    const ensureWidgetVisible = () => {
      if (trustpilotWidgetRef.current) {
        const widgetWrapper = trustpilotWidgetRef.current.querySelector("#tp-widget-wrapper");
        if (widgetWrapper) {
          widgetWrapper.style.display = "flex";
          widgetWrapper.style.width = "100%";
          widgetWrapper.style.minHeight = "180px";
          widgetWrapper.style.visibility = "visible";
          widgetWrapper.style.opacity = "1";
        }
        
        // Also check for iframe
        const iframe = trustpilotWidgetRef.current.querySelector("iframe");
        if (iframe) {
          iframe.style.display = "block";
          iframe.style.visibility = "visible";
          iframe.style.opacity = "1";
        }
      }
    };

    // Wait for Trustpilot script to be available and initialize widget
    const initTrustpilot = () => {
      attempts++;

      // Set widget height based on screen size
      setWidgetHeight();

      // Check if Trustpilot script is loaded
      if (window.Trustpilot && trustpilotWidgetRef.current) {
        try {
          // Trustpilot script is loaded, initialize the widget
          // First ensure the element is visible and has correct attributes
          setWidgetHeight();
          
          // Remove problematic attributes that cause 500 errors
          const widget = trustpilotWidgetRef.current;
          if (widget) {
            // Remove data-token, data-tags, and data-review-languages to avoid API errors
            // These attributes seem to cause 500 errors with the Carousel template
            widget.removeAttribute("data-token");
            widget.removeAttribute("data-tags");
            widget.removeAttribute("data-review-languages");
            
            // Ensure required attributes are present
            if (!widget.getAttribute("data-theme")) {
              widget.setAttribute("data-theme", "light");
            }
            if (!widget.getAttribute("data-schema-type")) {
              widget.setAttribute("data-schema-type", "Organization");
            }
          }
          
          // Try multiple initialization methods with error handling
          try {
            if (typeof window.Trustpilot.loadFromElement === "function") {
              // Use loadFromElement with force reload
              window.Trustpilot.loadFromElement(trustpilotWidgetRef.current, true);
            } else if (typeof window.Trustpilot.load === "function") {
              // Alternative initialization method - reload all widgets
              window.Trustpilot.load();
            }
      } catch (error) {
            console.warn("Error initializing Trustpilot widget:", error);
          }
          
          // Force initialization by calling loadFromElement multiple times if needed
          // Check multiple times to ensure widget loads
          const checkAndInit = (attempt = 0) => {
            if (attempt > 5) return; // Max 5 attempts
            
            setTimeout(() => {
              if (trustpilotWidgetRef.current && window.Trustpilot) {
                // Check if iframe or widget content was created
                const iframe = trustpilotWidgetRef.current.querySelector("iframe");
                const widgetWrapper = trustpilotWidgetRef.current.querySelector("#tp-widget-wrapper");
                
                if (!iframe && !widgetWrapper) {
                  // Widget not loaded yet, try to initialize
                  if (typeof window.Trustpilot.loadFromElement === "function") {
                    window.Trustpilot.loadFromElement(trustpilotWidgetRef.current, true);
                  } else if (typeof window.Trustpilot.load === "function") {
                    window.Trustpilot.load();
                  }
                  // Try again
                  if (attempt < 5) {
                    checkAndInit(attempt + 1);
                  }
                } else if (iframe) {
                  // Iframe exists, ensure it's visible and properly styled
                  const iframeHeight = "180px";
                  iframe.style.margin = "0 auto";
                  iframe.style.display = "block";
                  iframe.style.width = "100%";
                  iframe.style.height = iframeHeight;
                  iframe.style.minHeight = iframeHeight;
                  iframe.style.maxHeight = iframeHeight;
                  iframe.style.border = "none";
                  iframe.style.visibility = "visible";
                  iframe.style.opacity = "1";
                  
                  // Ensure iframe is properly configured
                  iframe.setAttribute("loading", "eager");
                  iframe.setAttribute("allowtransparency", "true");
                  iframe.setAttribute("frameborder", "0");
                  iframe.setAttribute("scrolling", "no");
                  
                  // Handle iframe load event
                  const handleIframeLoad = () => {
                    iframe.style.visibility = "visible";
                    iframe.style.opacity = "1";
                    iframe.style.display = "block";
                  };
                  
                  // Handle iframe errors (like 500 errors from Trustpilot API)
                  iframe.onerror = () => {
                    console.warn("Trustpilot iframe failed to load. This might be a temporary API issue.");
                    // The iframe might still display even if there are API errors
                  };
                  
                  iframe.onload = handleIframeLoad;
                  iframe.addEventListener("load", handleIframeLoad, { once: true });
                } else if (widgetWrapper) {
                  // Widget wrapper exists (inline widget), ensure it's visible
                  widgetWrapper.style.display = "flex";
                  widgetWrapper.style.width = "100%";
                  widgetWrapper.style.minHeight = "180px";
                  widgetWrapper.style.visibility = "visible";
                  widgetWrapper.style.opacity = "1";
                  
                  // Ensure all child elements are visible
                  const leftWrapper = widgetWrapper.querySelector("#wrapper-left");
                  const rightWrapper = widgetWrapper.querySelector("#wrapper-right");
                  if (leftWrapper) {
                    leftWrapper.style.display = "block";
                    leftWrapper.style.visibility = "visible";
                  }
                  if (rightWrapper) {
                    rightWrapper.style.display = "block";
                    rightWrapper.style.visibility = "visible";
                  }
                }
              }
            }, 500 * (attempt + 1)); // Increase delay with each attempt
          };
          
          checkAndInit(0);
          
          // Set up a MutationObserver to watch for widget content
          if (trustpilotWidgetRef.current && !observer) {
            observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                  setTimeout(() => {
                    ensureWidgetVisible();
                    // Check if widget wrapper was added
                    const widgetWrapper = trustpilotWidgetRef.current?.querySelector("#tp-widget-wrapper");
                    const iframe = trustpilotWidgetRef.current?.querySelector("iframe");
                    
                    if (widgetWrapper || iframe) {
                      ensureWidgetVisible();
                      // Apply styles to make sure everything is visible
                      if (widgetWrapper) {
                        widgetWrapper.style.cssText += `
                          display: flex !important;
                          width: 100% !important;
                          min-height: 180px !important;
                          visibility: visible !important;
                          opacity: 1 !important;
                        `;
                      }
                      if (iframe) {
                        const iframeHeight = "180px";
                        iframe.style.cssText = `
                          display: block !important;
                          visibility: visible !important;
                          opacity: 1 !important;
                          width: 100% !important;
                          height: ${iframeHeight} !important;
                          min-height: ${iframeHeight} !important;
                          max-height: ${iframeHeight} !important;
                          border: none !important;
                          margin: 0 auto !important;
                        `;
                      }
                    }
                  }, 100);
                }
              });
            });
            
            observer.observe(trustpilotWidgetRef.current, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ["style", "class"],
            });
          }
          
          // Also set up periodic checks to ensure widget is visible
          const visibilityCheckInterval = setInterval(() => {
            if (trustpilotWidgetRef.current) {
              ensureWidgetVisible();
              const widgetWrapper = trustpilotWidgetRef.current.querySelector("#tp-widget-wrapper");
              const iframe = trustpilotWidgetRef.current.querySelector("iframe");
              
              if (widgetWrapper || iframe) {
                ensureWidgetVisible();
              }
            }
          }, 2000);
          
          // Clean up interval after 30 seconds
          setTimeout(() => {
            clearInterval(visibilityCheckInterval);
          }, 30000);
        } catch (e) {
          console.error("Error initializing Trustpilot widget:", e);
        }
      } else if (attempts < maxAttempts) {
        // Script not loaded yet or widget not in DOM, try again after a short delay
        setTimeout(initTrustpilot, 100);
      } else {
        console.warn("Trustpilot script not loaded after maximum attempts");
        // Try to manually trigger widget load even if script seems not ready
        if (trustpilotWidgetRef.current) {
          // Create a script element to force load
          const script = document.createElement("script");
          script.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
          script.async = true;
          script.onload = () => {
            setTimeout(() => {
              if (window.Trustpilot && trustpilotWidgetRef.current) {
                if (typeof window.Trustpilot.loadFromElement === "function") {
                  window.Trustpilot.loadFromElement(trustpilotWidgetRef.current, true);
                } else if (typeof window.Trustpilot.load === "function") {
                  window.Trustpilot.load();
                }
              }
            }, 500);
          };
          document.head.appendChild(script);
        }
      }
    };

    // Start initialization after DOM is ready
    // Use multiple delays to ensure script has time to load
    const initDelay = setTimeout(() => {
      initTrustpilot();
    }, 500);

    // Also try after a longer delay in case script loads slowly
    const initDelayLong = setTimeout(() => {
      if (trustpilotWidgetRef.current && !trustpilotWidgetRef.current.querySelector("iframe")) {
        initTrustpilot();
      }
    }, 2000);

    // Update widget height on window resize
    const handleResize = () => {
      setWidgetHeight();
      if (window.Trustpilot && trustpilotWidgetRef.current) {
        if (typeof window.Trustpilot.loadFromElement === "function") {
          window.Trustpilot.loadFromElement(trustpilotWidgetRef.current, true);
        } else if (typeof window.Trustpilot.load === "function") {
          window.Trustpilot.load();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    
    // Cleanup function
    return () => {
      clearTimeout(initDelay);
      clearTimeout(initDelayLong);
      window.removeEventListener("resize", handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);
  
  // Additional effect to continuously ensure widget visibility
  useEffect(() => {
    if (!trustpilotWidgetRef.current) return;
    
    const checkWidgetVisibility = () => {
      const widgetWrapper = trustpilotWidgetRef.current?.querySelector("#tp-widget-wrapper");
      const iframe = trustpilotWidgetRef.current?.querySelector("iframe");
      
      if (widgetWrapper) {
        // Force widget wrapper to be visible using cssText
        widgetWrapper.style.cssText = `
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 100% !important;
          min-height: 180px !important;
          height: auto !important;
          position: relative !important;
        `;
        
        // Ensure child elements are visible
        const leftWrapper = widgetWrapper.querySelector(".wrapper-left, #wrapper-left");
        const rightWrapper = widgetWrapper.querySelector(".wrapper-right, #wrapper-right");
        const reviewsWrapper = widgetWrapper.querySelector("#tp-widget-reviews-wrapper, .tp-widget-reviews-wrapper");
        const reviews = widgetWrapper.querySelector("#tp-widget-reviews, .tp-widget-reviews");
        
        if (leftWrapper) {
          leftWrapper.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          `;
        }
        if (rightWrapper) {
          rightWrapper.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          `;
        }
        if (reviewsWrapper) {
          reviewsWrapper.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          `;
        }
        if (reviews) {
          reviews.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          `;
        }
      }
      
      if (iframe) {
        const iframeHeight = "180px";
        iframe.style.cssText = `
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 100% !important;
          height: ${iframeHeight} !important;
          min-height: ${iframeHeight} !important;
          max-height: ${iframeHeight} !important;
          border: none !important;
          margin: 0 auto !important;
          position: relative !important;
        `;
        
        // Ensure iframe attributes are set
        iframe.setAttribute("loading", "eager");
        iframe.setAttribute("allowtransparency", "true");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("scrolling", "no");
        
        // Also update the src to ensure correct height parameter
        const currentSrc = iframe.src;
        if (currentSrc) {
          const newSrc = currentSrc.replace(/styleHeight=\d+px/g, `styleHeight=${iframeHeight}`);
          if (newSrc !== currentSrc) {
            iframe.src = newSrc;
          }
        }
        
        // Force iframe to load if it hasn't
        if (!iframe.src || iframe.src === "") {
          // Re-initialize the widget
          if (window.Trustpilot && typeof window.Trustpilot.loadFromElement === "function") {
            window.Trustpilot.loadFromElement(trustpilotWidgetRef.current, true);
          }
        }
      }
    };
    
    // Check immediately and then periodically
    checkWidgetVisibility();
    const interval = setInterval(checkWidgetVisibility, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate slides for Why Sell widget
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 5);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Why Sell widget slides data
  const whySellSlides = [
    {
      id: 0,
      title: "Easy",
      description: "We Buy Any Car® Sell Your Car Fast, Safe, and Fair",
      image: "/green-car.png",
      alt: "Easy",
    },
    {
      id: 1,
      title: "Fast",
      description: "Get In. Get Out. Get Paid.℠",
      image: "/green-car.png",
      alt: "Fast",
    },
    {
      id: 2,
      title: "Fair",
      description: "Get a Fair Market Price for Your Car",
      image: "/green-car.png",
      alt: "Fair",
    },
    {
      id: 3,
      title: "Finance",
      description: "We Settle Finance and Pay You the Balance",
      image: "/green-car.png",
      alt: "Finance",
    },
    {
      id: 4,
      title: "Trade-In",
      description: "In Many Cases We Beat Dealer Trade-In Offers",
      image: "/green-car.png",
      alt: "Trade In",
    },
  ];

  const handleSlideClick = (index) => {
    setActiveSlide(index);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleQuestion = (questionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [questionId]: !prev.questions[questionId],
      },
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // If it's already formatted (dateFormatted), return it
    if (typeof dateString === "string" && dateString.includes(",")) {
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString("es-ES", options);
    } catch (error) {
      return dateString; // Return original if error
    }
  };

  // Convert time string to 24-hour format and get hours/minutes
  const parseTime = (timeString) => {
    if (!timeString) return { hours: 9, minutes: 0 };
    
    // Handle formats like "9:00 AM", "2:00 PM", etc.
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      
      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }
      
      return { hours, minutes };
    }
    
    // Default to 9:00 AM if can't parse
    return { hours: 9, minutes: 0 };
  };

  // Format date to iCalendar format (YYYYMMDDTHHMMSSZ)
  const formatICalDate = (dateString, timeString) => {
    try {
      let date;
      
      // Try to parse the date string
      if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        // Format: YYYY-MM-DD (from fullDate)
        date = new Date(dateString + "T00:00:00");
      } else if (dateString.includes("/")) {
        // Format: MM/DD/YYYY or DD/MM/YYYY
        const parts = dateString.split("/");
        if (parts.length === 3) {
          // Assume MM/DD/YYYY format
          date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}T00:00:00`);
        } else {
          date = new Date(dateString);
        }
      } else {
        // Try to parse as is
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        // Fallback to current date + 7 days
        date = new Date();
        date.setDate(date.getDate() + 7);
        date.setHours(0, 0, 0, 0);
      }
      
      const { hours, minutes } = parseTime(timeString);
      
      // Set the time in local timezone first
      date.setHours(hours, minutes, 0, 0);
      
      // Convert to UTC for iCalendar format
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hour = String(date.getUTCHours()).padStart(2, "0");
      const minute = String(date.getUTCMinutes()).padStart(2, "0");
      const second = String(date.getUTCSeconds()).padStart(2, "0");
      
      return `${year}${month}${day}T${hour}${minute}${second}Z`;
    } catch (error) {
      // Fallback to current date + 7 days at 9 AM
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + 7);
      fallbackDate.setHours(9, 0, 0, 0);
      
      const year = fallbackDate.getUTCFullYear();
      const month = String(fallbackDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(fallbackDate.getUTCDate()).padStart(2, "0");
      const hour = String(fallbackDate.getUTCHours()).padStart(2, "0");
      const minute = String(fallbackDate.getUTCMinutes()).padStart(2, "0");
      const second = String(fallbackDate.getUTCSeconds()).padStart(2, "0");
      
      return `${year}${month}${day}T${hour}${minute}${second}Z`;
    }
  };

  // Generate and download .ics file
  const handleAddToCalendar = () => {
    if (!appointmentInfo) return;

    const appointmentDate = appointmentInfo.date || appointmentInfo.dateFormatted;
    const appointmentTime = appointmentInfo.specificTime?.timeSlot24Hour || appointmentInfo.time || "9:00 AM";
    const location = appointmentInfo.location || branchInfo.name;
    
    // Generate UID (unique identifier for the event)
    const uid = appointmentInfo.locationId || 
                appointmentInfo.uid || 
                `appointment-${Date.now()}@webuyanycarusa.com`;
    
    // Format dates
    const dtStart = formatICalDate(appointmentDate, appointmentTime);
    
    // End time is 1 hour after start time
    // Parse dtStart to calculate end time
    let dtEnd;
    const startMatch = dtStart.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
    if (startMatch) {
      const [, year, month, day, hour, minute, second] = startMatch;
      const startDate = new Date(Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
      ));
      
      // Add 1 hour
      startDate.setUTCHours(startDate.getUTCHours() + 1);
      
      const endYear = startDate.getUTCFullYear();
      const endMonth = String(startDate.getUTCMonth() + 1).padStart(2, "0");
      const endDay = String(startDate.getUTCDate()).padStart(2, "0");
      const endHour = String(startDate.getUTCHours()).padStart(2, "0");
      const endMinute = String(startDate.getUTCMinutes()).padStart(2, "0");
      const endSecond = String(startDate.getUTCSeconds()).padStart(2, "0");
      
      dtEnd = `${endYear}${endMonth}${endDay}T${endHour}${endMinute}${endSecond}Z`;
    } else {
      // Fallback: use dtStart (shouldn't happen, but just in case)
      dtEnd = dtStart;
    }
    const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    // Build description
    const description = `Branch Manager:\\n${branchInfo.manager}\\n${branchInfo.email}\\n${branchInfo.phone}\\n\\nBranch Address:\\n${branchInfo.fullAddress}\\n\\nFor more details:\\nhttps://www.webuyanycarusa.com/location/appointmentbooked/${uid}`;
    
    // Build iCalendar content
    const icsContent = [
      "BEGIN:VCALENDAR",
      "METHOD:REQUEST",
      "PRODID:-//Schedule a Meeting",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DESCRIPTION:${description}`,
      `DTEND:${dtEnd}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `LOCATION:${branchInfo.fullAddress}`,
      `ORGANIZER;CN=${branchInfo.email}:MAILTO:${branchInfo.email}`,
      "SEQUENCE:0",
      `SUMMARY:Your appointment at We Buy Any Car ${location}`,
      `UID:${uid}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder",
      "TRIGGER:-PT15M",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    
    // Create blob and download
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `appointment-${location.replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Branch information (hardcoded for now, can be made dynamic)
  // const branchInfo = {
  //   name: "Elmdsdsdsdafasdfwood Park",
  //   city: "Elmasdfsadfsdawood Park, NJ",
  //   address: "68 Leliarts Lane",
  //   fullAddress: "68 Leliarts Lane, Elmwood Park, NJ 07407",
  //   phone: "(201) 773-1009",
  //   email: "elmwoodpark.nj@webuyanycarusa.com",
  //   manager: "Bernardo Sanchez",
  //   hours: {
  //     Tuesday: "Closed",
  //     Wednesday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
  //     Thursday: "11a.m. - 2p.m., 3p.m. - 8p.m.",
  //     Friday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
  //     Saturday: "9a.m. - 12p.m., 1p.m. - 6p.m.",
  //     Sunday: "Closed",
  //     Monday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
  //   },
  // };

  const landmarks = [
    "Off Broadway Street: Where the Firestone Complete Auto Care is ONTO 54th Steet towards Molnar Drive.",
    "Off Linden Ave onto Molnar Drive where the Boulevard Bar and Grill is. Left onto 54th Street towards Broadway Street.",
    "Off Broadway Street: After the K-Mart but before the Enterprise Rent A Car ONTO 54th Street towards Molnar Drive.",
  ];

  if (!appointmentInfo) {
    return null;
  }
  

  return (
    branchInfo && (
    <div className="section-container py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4" ref={contentRef}>
        {/* Title Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9">
              <h1 ref={headerRef} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <span>Thanks for Booking an Appointment</span>
          </h1>
            </div>
            <div className="lg:col-span-3 hidden lg:block">
              <div className="bg-white rounded-lg p-4 shadow-md text-center">
                <h2 className="text-lg font-bold text-gray-900">
                  {branchInfo.name}
                </h2>
                <p className="text-sm text-gray-600">{branchInfo.city}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-9 space-y-6">
            {/* Booking Confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
          >
              <div className="bg-primary-600 text-white px-6 py-4">
                <h2 className="text-2xl font-bold">Booking Confirmation</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">Branch</span>
                    <span className="text-gray-900">
                      {appointmentInfo.location
                        ? `${appointmentInfo.location} (${branchInfo.city})`
                        : `${branchInfo.name} (${branchInfo.city})`}
                  </span>
                </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">Date</span>
                    <span className="text-gray-900">
                      {appointmentInfo.dateFormatted
                        ? appointmentInfo.dateFormatted
                        : appointmentInfo.date
                          ? formatDate(appointmentInfo.date)
                          : "Not specified"}
                    </span>
                </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-semibold text-gray-700">Time</span>
                    <span className="text-gray-900">
                      {appointmentInfo.specificTime?.timeSlot24Hour ||
                        appointmentInfo.time ||
                        "Not specified"}
                    </span>
                </div>
              </div>
                <button
                  id="add-to-calendar"
                  onClick={handleAddToCalendar}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Add to calendar</span>
                </button>
              </div>
          </motion.div>

            {/* What to Bring Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleSection("checklist")}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  What do I need to bring to the appointment?
              </h2>
                {expandedSections.checklist ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {expandedSections.checklist && (
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Your car&apos;s title document, or pay-off information
                        if it is financed
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Valid registration to confirm you are the car&apos;s
                        owner
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Your valid state-issued photo identification
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        All keys for the car including any spares, remote fobs
                        etc.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Locking wheel nut, radio faceplate, satellite navigation
                        disc, user manuals, remote controls and all other
                        accessories that belong to the car
                      </span>
                    </li>
                  </ul>
                  </div>
                )}
            </motion.div>

            {/* Nearby Landmarks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleSection("landmarks")}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  Nearby Landmarks
                </h2>
                {expandedSections.landmarks ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {expandedSections.landmarks && (
                <div className="p-6">
                  <div className="space-y-3">
                    {landmarks.map((landmark, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-gray-400 mt-1">—</span>
                        <p className="text-gray-700">{landmark}</p>
                    </div>
                    ))}
                    </div>
                  </div>
                )}
            </motion.div>

            {/* Trustpilot Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md"
              style={{ overflow: "visible" }}
            >
              <div className="p-4" style={{ minHeight: "180px", position: "relative" }}>
                {/* TrustBox widget - Carousel */}
                <div
                  ref={trustpilotWidgetRef}
                  className="trustpilot-widget w-full"
                  style={{
                    minHeight: "180px",
                    height: "180px",
                    position: "relative",
                    display: "block",
                    visibility: "visible",
                    opacity: 1,
                  }}
                  data-locale="en-US"
                  data-template-id="53aa8912dec7e10d38f59f36"
                  data-businessunit-id="530e101e0000640005784b1e"
                  data-style-height="180px"
                  data-style-width="100%"
                  data-theme="light"
                  data-stars="5"
                  data-schema-type="Organization"
                >
                  <a rel="noreferrer"
                    href="https://www.trustpilot.com/review/webuyanycarusa.com"
                    target="_blank"
                    style={{ display: "none" }}
                  >
                    Trustpilot
                  </a>
                    </div>
                {/* End TrustBox widget */}
                  </div>
          </motion.div>

            {/* FAQ Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {/* Question 1 */}
              <div data-faq-section className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full px-6 py-4 bg-primary-600">
                  <h2 className="text-xl font-bold text-white">
                    I have questions about selling my car. Can I talk to
                    someone?
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700">
                    We&apos;ve listed answers to the most common questions on
                    the{" "}
                    <a
                      href="/faq"
                      target="_blank"
                      className="text-primary-600 hover:underline"
                    >
                      frequently asked questions
                    </a>{" "}
                    section of the website but if you&apos;d like to talk to
                    someone, you can reach {branchInfo.manager} who manages
                    our {branchInfo.name} car buying center at{" "}
                    <a
                      href={`tel:${branchInfo.phone.replace(/\D/g, "")}`}
                      className="font-semibold text-primary-600 hover:underline"
                    >
                      {branchInfo.phone}
                    </a>{" "}
                    during branch opening hours, listed above.
                  </p>
                </div>
              </div>

              {/* Question 2 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full px-6 py-4 bg-primary-600">
                  <h2 className="text-xl font-bold text-white">
                    What happens when I arrive to sell my car?
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700">
                    When you arrive for your appointment, our Branch Manager,{" "}
                    {branchInfo.manager.split(" ")[0]}, or another member of
                    our team, will be there to welcome you. They will first
                    review your required documents. Next, they&apos;ll conduct
                    a brief 15-20 minute inspection of your car, and we
                    encourage you to join them to see the process firsthand.
                    After the inspection, we&apos;ll confirm our offer with
                    you. If you choose to sell, the entire process takes about
                    one hour.
                  </p>
                </div>
            </div>

              {/* Question 3 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full px-6 py-4 bg-primary-600">
                  <h2 className="text-xl font-bold text-white">
                    How will I be able to get home once I&apos;ve sold my car?
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700">
                    Most customers arrange a ride with a friend or family
                    member beforehand. If you need assistance, just ask our
                    Branch Manager. They can help you coordinate a ride-share
                    (like Uber or Lyft) or provide details on local public
                    transportation.
                  </p>
                </div>
                </div>

              {/* Question 4 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full px-6 py-4 bg-primary-600">
                  <h2 className="text-xl font-bold text-white">
                    Once I&apos;ve sold my car, when will I receive my money?
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700">
                    When you sell your car, payment is immediate and
                    straightforward. Choose from a corporate check you can
                    deposit at your bank or cash at nearly 2,000 Truist Bank
                    locations, an ACH or wire transfer directly to your
                    account, or instant secure payment through Zelle for
                    eligible accounts. All options are designed to be safe and
                    reliable. If you have any questions, your local
                    webuyanycar.com branch team is ready to assist and ensure
                    the process is smooth and stress-free.
                  </p>
                </div>
                </div>
          </motion.div>
          </div>

          {/* Side Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Branch Hours and Information */}
        <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div>
                  <p className="font-bold text-gray-900 mb-1">Branch Manager</p>
                  <p className="text-gray-700">{branchInfo.manager}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">Address</p>
                  <p className="text-gray-700">
                    {branchInfo.address}
                    <br />
                    {branchInfo.fullAddress.split(", ").slice(1).join(", ")}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">Telephone</p>
                  <a
                    href={`tel:${branchInfo.phone.replace(/\D/g, "")}`}
                    className="text-primary-600 hover:underline"
                  >
                    {branchInfo.phone}
                  </a>
                </div>
                <a
                  href={`mailto:${branchInfo.email}`}
                  className="block w-full text-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Email Branch
                </a>
                </div>
              <div className="border-t border-gray-200 p-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary-600 text-white">
                      <th className="text-left py-2 px-2 font-bold text-white">
                        Day
                      </th>
                      <th className="text-left py-2 px-2 font-bold text-white">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(branchInfo.hours).map(([day, hours]) => (
                      <tr key={day} className="border-b border-gray-100">
                        <td className="py-2 px-2 text-gray-700">{day}</td>
                        <td className="py-2 px-2 text-gray-700">{hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-xs text-gray-500 italic">
                  * Branches close for lunch between listed time intervals
                </div>
              </div>
        </motion.div>

            {/* Map Widget */}
            <motion.div
              id="location-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hidden lg:block"
            >
              <div className="bg-primary-600 text-white px-6 py-4">
                <h3 className="text-lg font-bold">Location</h3>
              </div>
              <div className="p-4" style={{ minHeight: "180px", position: "relative" }}>
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps?cid=18078079413302142861&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Branch Location Map"
                    className="w-full h-full"
                  ></iframe>
                </div>
                <a
                  href="https://maps.google.com/maps?cid=18078079413302142861"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-sm text-primary-600 hover:text-primary-700 text-center"
                >
                  View on Google Maps
                </a>
              </div>
        </motion.div>

            {/* Why Sell Widget */}
        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hidden lg:block"
            >
              <div className="p-6">
                <div className="title mb-4 text-center">
                  <h1 className="text-xl md:text-2xl font-bold leading-tight">
                    <span className="text-primary-600">Why should I</span>
                    <br />
                    <span className="text-primary-600">sell my car to</span>
                    <br />
                    <span className="text-primary-600">we</span>
                    <span className="text-gray-900">buy</span>
                    <span className="text-primary-600">any</span>
                    <span className="text-gray-900">car</span>
                    <span className="text-primary-600">.com</span>
                    <sup className="text-[10px]">®</sup>
                    <span className="text-primary-600">?</span>
                  </h1>
                </div>

                <div className="description mb-4 flex justify-center">
                  <img
                    alt="We Buy Any Car"
                    src="/green-car.png"
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.target.style.display = "none";
                    }}
                  />
                </div>

                <div className="relative" style={{ width: "220px", height: "140px", margin: "0 auto" }}>
                  {whySellSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute top-0 left-0 transition-opacity duration-500 ${
                        activeSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
                      }`}
                      style={{
                        width: "220px",
                        display: activeSlide === index ? "block" : "none",
                      }}
                    >
                      <div className="body text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.title}</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {slide.description.includes("We Buy Any Car") ? (
                            <>
                              <span className="font-semibold text-gray-900">We Buy Any Car</span>
                              <sup className="text-[10px]">®</sup>{" "}
                              {slide.description.replace("We Buy Any Car®", "").trim()}
                            </>
                          ) : slide.description.includes("Get In") ? (
                            <>
                              {slide.description.split("℠")[0]}
                              <strong className="text-gray-900">℠</strong>
                            </>
                          ) : (
                            slide.description
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="footer mt-6">
                  <ul className="flex justify-center gap-2">
                    {whySellSlides.map((slide, index) => (
                      <li key={slide.id}>
                        <button
                          onClick={() => handleSlideClick(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            activeSlide === index
                              ? "bg-primary-600 scale-125"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                          aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                        >
                          <span className="sr-only">{slide.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
        </motion.div>
          </div>
        </div>
        
        {/* Action Buttons - Mobile Only */}
        <div className="mt-8 space-y-6 block lg:hidden">
          {/* Action Buttons - Hidden because they appear in footer */}
          <div className="flex flex-col gap-4 hidden">
            <button
              onClick={() => {
                window.location.href = "https://www.webuyanycarusa.com/locations";
              }}
              className="flex items-center justify-between bg-black text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              <span>Find Your Nearest Branch</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => {
                window.location.href = "https://www.webuyanycarusa.com/faq";
              }}
              className="flex items-center justify-between bg-black text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              <span>FAQ</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Legal Text - Mobile and Desktop */}
        <div className="mt-8">
          <div className="rounded-lg p-6" style={{ backgroundColor: '#f5f5f5', color: '#4e4e4e' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#4e4e4e' }}>
              <sup>*</sup> Valuations are provided as an estimate for informational purposes only and do not constitute an offer from webuyanycar.com<sup>®</sup>, except where you are expressly made a conditional 7 Day Offer. Valuations are based on the limited information we collect from you online and market information about your vehicle (which, for some makes, models and years, can be limited). Therefore the valuation may be adjusted at our discretion at any time, including prior to or during our in-branch vehicle inspection. Additional fees (e.g. titling) may also apply. By selecting to receive a valuation or conditional 7 Day Offer, you agree to our{" "}
              <a
                href="/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:opacity-80"
                style={{ color: '#4e4e4e' }}
              >
                Terms of Use
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>)
  );
};

export default Confirmation;
