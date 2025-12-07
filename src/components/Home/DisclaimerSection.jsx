// DisclaimerSection keeps the valuation legal copy centralized.
import { memo } from "react";

const DisclaimerSection = () => (
  <section className="bg-white py-8 border-t border-gray-200">
    <div className="section-container">
      <p className="text-sm text-gray-600 text-justify md:text-center max-w-4xl mx-auto">
        <sup>*</sup> Valuations are provided as an estimate for informational
        purposes only and do not constitute an offer from webuyanycar.com
        <sup>®</sup>, except where you are expressly made a conditional 7 Day
        Offer. Valuations are based on the limited information we collect from
        you online and market information about your vehicle (which, for some
        makes, models and years, can be limited). Therefore the valuation may be
        adjusted at our discretion at any time, including prior to or during our
        in-branch vehicle inspection. Additional fees (e.g. titling) may also
        apply. By selecting to receive a valuation or conditional 7 Day Offer,
        you agree to our{" "}
        <a
          href="https://www.webuyanycarusa.com/termsofuse"
          className="text-primary-600 underline"
        >
          Terms of Use
        </a>
      </p>
    </div>
  </section>
);

export default memo(DisclaimerSection);
