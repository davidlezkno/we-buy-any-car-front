// WhySellSection communicates key selling propositions while retaining existing copy and styling.
import { memo } from "react";
import { WHY_SELL_POINTS } from "../../utils/homeContent";

const WhySellSection = () => (
  <section className="bg-white py-16 md:py-24 border-t border-gray-200 md:border-t-0">
    <div className="section-container">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-12 text-center">
        Why Sell My Car to <span style={{ color: "#20B24D" }}>we</span>buy
        <span style={{ color: "#20B24D" }}>any</span>car
        <span style={{ color: "#20B24D" }}>
          .com<sup>®</sup>?
        </span>
      </h2>
      <div className="max-w-4xl mx-auto space-y-6">
        {WHY_SELL_POINTS.map(({ title, description }, index) => (
          <div key={title + "-" + index} className="flex items-start gap-4">
            <span className="font-bold text-gray-900 text-lg">{title}</span>
            <span className="text-gray-700">{description}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default memo(WhySellSection);
