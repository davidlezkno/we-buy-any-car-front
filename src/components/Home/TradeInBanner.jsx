// TradeInBanner reinforces the trade-in differentiator while preserving the existing visual presentation.
import { memo } from "react";
import Button from "../UI/Button";

const TradeInBanner = () => (
  <section
    className="text-white md:py-16"
    style={{ backgroundColor: "#20B24D" }}
  >
    <div className="section-container">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
          &quot;buyers with a trade-in pay an average of $990 more...&quot;
        </p>
        <p className="text-base md:text-lg text-white/90 mb-6">
          The Journal of Industrial Economics, Dec. 2015
        </p>
        <Button
          size="lg"
          className="bg-transparent border-2 hover:bg-white/10 font-bold"
          style={{ color: "#ffffff" }}
        >
          Learn More
        </Button>
      </div>
    </div>
  </section>
);

export default memo(TradeInBanner);
