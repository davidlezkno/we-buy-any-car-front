/**
 * ValuationBanner - Displays vehicle valuation with branding
 * Implements Single Responsibility Principle (SRP)
 */

import { useEffect } from 'react';

/**
 * Valuation banner component
 * @param {Object} props - Component props
 */
const ValuationBanner = ({ valuation, loading, isModalOpen, trustpilotWidgetRef }) => {
  // Initialize Trustpilot widget
  useEffect(() => {
    if (!trustpilotWidgetRef?.current) return;

    let attempts = 0;
    const maxAttempts = 50;

    const initTrustpilot = () => {
      attempts++;
      
      if (window.Trustpilot && trustpilotWidgetRef.current) {
        try {
          if (typeof window.Trustpilot.loadFromElement === 'function') {
            window.Trustpilot.loadFromElement(trustpilotWidgetRef.current, true);
          } else if (typeof window.Trustpilot.load === 'function') {
            window.Trustpilot.load();
          }
        } catch (e) {
          console.error('Error initializing Trustpilot widget:', e);
        }
      } else if (attempts < maxAttempts) {
        setTimeout(initTrustpilot, 100);
      }
    };

    // Start initialization after a short delay
    const timer = setTimeout(initTrustpilot, 300);

    return () => clearTimeout(timer);
  }, [trustpilotWidgetRef]);

  return (
    <div
      className="rounded-3xl p-5 md:p-8 lg:p-12 transition-all duration-500 relative overflow-visible md:overflow-visible w-full"
      style={{
        background: 'linear-gradient(135deg, #20B24D 0%, #1a9a3e 50%, #20B24D 100%)',
        boxShadow:
          '0 20px 60px 0 rgba(8, 162, 70, 0.3), 0 8px 24px 0 rgba(8, 162, 70, 0.2)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        zIndex: isModalOpen ? 0 : 'auto',
        position: 'relative',
        paddingTop: 0,
        overflow: 'visible',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div
          className="flex flex-col md:grid md:grid-cols-3 items-center gap-5 md:gap-8"
          style={{ alignItems: 'start' }}
        >
          {/* Left: Logo - Desktop only */}
          <LogoSection />

          {/* Center: Valuation */}
          <ValuationDisplay valuation={valuation} loading={loading} />

          {/* Right: Trust badges - Desktop only */}
          <TrustBadges trustpilotWidgetRef={trustpilotWidgetRef} />
        </div>
      </div>
    </div>
  );
};

/**
 * Logo section component
 */
const LogoSection = () => (
  <div className="hidden md:flex justify-center order-2 md:order-1">
    <div id="logo">
      <a
        id="top-logo"
        href="/"
        title="We Buy Any Car"
        className="block bg-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
      >
        <img
          src={`${import.meta.env.BASE_URL || '/'}logo.png`}
          alt="We Buy Any Car Logo"
          className="h-10 md:h-14 w-auto object-contain"
          style={{ height: '30px' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </a>
      <div id="cars-purchased">
        <span className="wbac-font">
          <span className="big-number">430,000+</span>cars purchased
        </span>
      </div>
    </div>
  </div>
);

/**
 * Valuation display component
 */
const ValuationDisplay = ({ valuation, loading }) => (
  <div
    className="text-center order-1 md:order-2 w-full md:w-auto px-2"
    style={{ paddingTop: '20px' }}
  >
    <h3
      className="text-white text-ms md:text-lg lg:text-xl mb-2 md:mb-3 font-semibold hidden md:block"
      style={{ fontSize: '150%', color: '#000000' }}
    >
      Your Valuation
    </h3>
    {loading ? (
      <div className="flex items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span className="text-white text-base md:text-lg">Calculating...</span>
      </div>
    ) : valuation ? (
      <div className="text-white">
        <div className="text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 md:mb-3 drop-shadow-lg break-words">
          {valuation.formattedValue}*
        </div>
        {/* Mobile: Book an Appointment */}
        <h3 className="text-white text-ms md:text-lg lg:text-xl mb-2 md:mb-3 font-semibold block md:hidden mt-4">
          Book an Appointment
        </h3>
      </div>
    ) : (
      <div className="text-white text-xl md:text-2xl">Loading...</div>
    )}
  </div>
);

/**
 * Trust badges component
 */
const TrustBadges = ({ trustpilotWidgetRef }) => (
  <div
    className="hidden md:flex flex-col items-center md:items-start gap-3 order-2 md:order-3 w-full md:w-auto"
    style={{ alignSelf: 'start', paddingTop: '20px' }}
  >
    {/* BBB Badge */}
    <a
      href="http://www.bbb.org/washington-dc-eastern-pa/business-reviews/auto-dealers-used-cars/webuyanycar-com-in-media-pa-235989197/#bbbonlineclick"
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <img
        src={`${import.meta.env.BASE_URL || '/'}Content/Images/bbb-horizontal.png`}
        alt="BBB Accredited Business"
        className="w-full max-w-[150px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[220px] h-auto object-contain"
        style={{ marginLeft: '14px', height: '67px' }}
      />
    </a>

    {/* TrustBox widget */}
    <div className="trustpilot-container">
      <div
        ref={trustpilotWidgetRef}
        className="trustpilot-widget"
        data-locale="en-US"
        data-template-id="53aa8807dec7e10d38f59f32"
        data-businessunit-id="530e101e0000640005784b1e"
        data-style-height="150px"
        data-style-width="100%"
        data-token="df471f76-5ae3-45d9-88a4-7d994ac21893"
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
);

export default ValuationBanner;
