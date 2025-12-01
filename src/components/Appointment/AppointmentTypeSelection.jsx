// AppointmentTypeSelection presents available appointment modes and triggers user choice.
import { memo } from "react";
import { motion } from "framer-motion";
import Card from "../UI/Card";

/**
 * @param {{ options: Array, onSelect: (type: string) => void }} props
 */
const AppointmentTypeSelection = ({ options, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="grid grid-cols-1 md:grid-cols-2 gap-6"
  >
    {options.map(
      ({ id, label, description, icon: Icon, highlights, accent }, index) => (
        <Card
          key={id + "-" + index}
          hover
          onClick={() => onSelect(id)}
          className="cursor-pointer group"
        >
          <div className="text-center">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${accent.container}`}
            >
              <Icon className={`w-10 h-10 ${accent.icon}`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{label}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
            <div className="space-y-2 text-sm text-gray-600">
              {highlights.map(
                ({ id: highlightId, icon: HighlightIcon, text }, index) => (
                  <div
                    key={highlightId + "-" + index}
                    className="flex items-center justify-center gap-2"
                  >
                    <HighlightIcon
                      className={`w-4 h-4 ${accent.highlightIcon ?? ""}`}
                    />
                    <span>{text}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </Card>
      ),
    )}
  </motion.div>
);

export default memo(AppointmentTypeSelection);
