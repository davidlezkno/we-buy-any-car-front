// HeroSection highlights the primary CTA and surfaces quick links to valuation paths.
import { memo } from "react";

const HeroSection = () => (
  <div
    id="title-bar"
    className="text-white py-3 md:py-7 relative overflow-hidden bg-black md:bg-[#20B24D]"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10  md:py-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold leading-tight">
          <span className="cta-trading-selling-question hidden md:block mb-2">
            Trading In or Selling Your Car? We Buy Any Car{""}
            <sup className="text-base md:text-xl">®</sup>
          </span>
          <span className="cta-trading-selling-question block md:hidden mb-2">
            Trading In or Selling Your Car?
          </span>
          <span className="cta-get-free-valuation-text block text-xl md:text-2xl lg:text-2xl font-bold mt-2">
            Get Your Free Online Valuation Now!
          </span>
        </h1>
      </div>
    </div>
  </div>
);

export default memo(HeroSection);
