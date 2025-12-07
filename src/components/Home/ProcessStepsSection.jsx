// ProcessStepsSection preserves the three-step explanation of the selling process.
import { memo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROCESS_STEPS } from "../../utils/homeContent";

const ProcessStepsSection = () => {
  const basePath = import.meta.env.BASE_URL || "/";
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoRotateRef = useRef(null);

  // Auto-rotate slides on mobile
  useEffect(() => {
    autoRotateRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % PROCESS_STEPS.length);
    }, 4000); // Change slide every 4 seconds

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, []);

  // Handle touch events for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    // Pause auto-rotate while user is interacting
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe left - next slide
        setActiveSlide((prev) => (prev + 1) % PROCESS_STEPS.length);
      } else {
        // Swipe right - previous slide
        setActiveSlide((prev) => (prev - 1 + PROCESS_STEPS.length) % PROCESS_STEPS.length);
      }
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchEndX.current = 0;

    // Resume auto-rotate after a delay
    setTimeout(() => {
      autoRotateRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % PROCESS_STEPS.length);
      }, 4000);
    }, 2000);
  };

  const handleSlideClick = (index) => {
    setActiveSlide(index);
    // Pause and reset auto-rotate when user clicks
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
    // Resume auto-rotate after a delay
    setTimeout(() => {
      autoRotateRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % PROCESS_STEPS.length);
      }, 4000);
    }, 2000);
  };

  return (
    <section className="bg-white py-5 md:py-5 border-t border-gray-200">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-12 text-center">
          Get In. Get Out. Get Paid.<sup className="text-sm">SM</sup>
        </h2>
        
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PROCESS_STEPS.map((step, index) => (
            <div key={step.label + "-" + index} className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto"
                style={{ backgroundColor: "#000000" }}
              >
                {index + 1}
              </div>
              <div className="w-32 h-32 mx-auto flex items-center justify-center">
                <img
                  src={`${basePath}${step.image}`}
                  alt={step.alt}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {step.label}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: Slider */}
        <div className="md:hidden max-w-md mx-auto">
          <div 
            className="relative overflow-hidden rounded-lg touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              {PROCESS_STEPS.map((step, index) => {
                if (index !== activeSlide) return null;
                return (
                  <motion.div
                    key={`${step.label}-${index}`}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="text-center px-4"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto"
                      style={{ backgroundColor: "#000000" }}
                    >
                      {index + 1}
                    </div>
                    <div className="w-32 h-32 mx-auto flex items-center justify-center my-4">
                      <img
                        src={`${basePath}${step.image}`}
                        alt={step.alt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {step.label}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {PROCESS_STEPS.map((step, index) => (
              <button
                key={step.label + "-" + index}
                onClick={() => handleSlideClick(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeSlide === index
                    ? "bg-black scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}: ${step.label}`}
              >
                <span className="sr-only">{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ProcessStepsSection);
