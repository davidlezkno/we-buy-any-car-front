import { motion } from "framer-motion";

const ProgressBar = ({ currentStep, totalSteps, steps = [] }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-0 md:mb-10 px-4 sm:px-6 md:px-8 lg:px-12">
      {/* Progress Bar with Integrated Steps */}
      <div className="relative mb-6">
        {/* Background Bar - thicker to accommodate circles passing through */}
        <div className="relative h-4 md:h-5 bg-gray-200 rounded-full overflow-visible max-w-full">
          {/* Progress Fill - green bar that extends through circles */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ zIndex: 1 }}
          />

          {/* Step Circles - Integrated with the bar, bar passes through center */}
          {steps.length > 0 && (
            <div
              className="absolute inset-0 flex justify-between items-center"
              style={{ zIndex: 2 }}
            >
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber <= currentStep;
                // Calculate position with padding consideration for first and last steps
                const stepPosition =
                  index === 0
                    ? 0
                    : index === steps.length - 1
                      ? 100
                      : (index / (steps.length - 1)) * 100;

                return (
                  <div
                    key={index}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${stepPosition}%`,
                      transform: "translateX(-50%)",
                      top: "50%",
                      marginTop: "-1.5rem",
                    }}
                  >
                    {/* Circle - positioned so bar passes through center */}
                    <div
                      className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-base md:text-lg transition-all duration-300
                        ${
                          isCompleted
                            ? "bg-primary-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }
                      `}
                      style={{
                        border: "3px solid white",
                        boxShadow: isCompleted
                          ? "0 2px 8px rgba(32, 178, 77, 0.4), inset 0 0 0 2px rgba(255, 255, 255, 0.3)"
                          : "0 2px 4px rgba(0, 0, 0, 0.1)",
                        // Make the circle appear as if the bar passes through it
                        position: "relative",
                        zIndex: 10,
                      }}
                    >
                      {stepNumber}
                    </div>

                    {/* Step Label */}
                    <span
                      className={`
                        hidden md:block text-xs md:text-sm text-center mt-2 md:mt-3 font-semibold transition-colors duration-300 whitespace-nowrap
                        ${isCompleted ? "text-gray-900" : "text-gray-400"}
                      `}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        {/* Progress Text: Hidden but kept for future use */}
      </div>
    </div>
  );
};

export default ProgressBar;
