import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const Tabs = ({
  tabs,
  defaultTab = 0,
  className,
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);

  // Use controlled value if provided, otherwise use internal state
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = (index) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(index);
    }
    if (onTabChange) {
      onTabChange(index);
    }
  };

  // Sync when controlledActiveTab changes
  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setInternalActiveTab(controlledActiveTab);
    }
  }, [controlledActiveTab]);

  return (
    <div className={clsx("w-full", className)}>
      {/* Tab Navigation: Smaller white container, centered */}
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="flex gap-1 sm:gap-2 md:gap-3 p-2 md:p-3 rounded-2xl md:rounded-3xl bg-white shadow-md w-full max-w-2xl md:w-auto md:inline-flex">
          {tabs.map((tab, index) =>
            activeTab === index ? (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className="relative px-2 sm:px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm md:text-base transition-all duration-500 flex-1 sm:flex-shrink-0 flex items-center justify-center gap-1 sm:gap-2 text-white min-w-0"
                style={{
                  background:
                    "linear-gradient(135deg, #20B24D 0%, #1a9a3e 50%, #158234 100%)",
                  boxShadow:
                    "0 4px 12px 0 rgba(32, 178, 77, 0.25), 0 2px 6px 0 rgba(32, 178, 77, 0.15)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id={`${tab.id}-tab-active-button`}
              >
                {tab.icon && <tab.icon className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 flex-shrink-0" />}
                <span className="truncate sm:whitespace-nowrap">{tab.label}</span>
              </motion.button>
            ) : (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-semibold text-xs sm:text-sm md:text-base transition-colors duration-300 flex-1 sm:flex-shrink-0 text-gray-700 hover:text-gray-900 min-w-0"
                id={`${tab.id}-tab-inactive-button`}
              >
                {tab.icon && <tab.icon className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 flex-shrink-0" />}
                <span className="truncate sm:whitespace-nowrap">{tab.label}</span>
              </button>
            ),
          )}
        </div>
      </div>

      {/* Tab Content: Enhanced animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {tabs[activeTab]?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Tabs;
