import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Button from "../UI/Button";

const Popup = ({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  onButton1Click,
  onButton2Click,
  button1Label = "Button 1",
  button2Label = "Button 2",
  button1Variant = "secondary",
  button2Variant = "primary",
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[10000] overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.9)",
            boxShadow:
              "0 25px 80px 0 rgba(0, 0, 0, 0.3), 0 10px 30px 0 rgba(0, 0, 0, 0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          

          {/* Content */}
          <div className="p-6">
            {description && (
              <p className="text-gray-700 leading-relaxed">{description}</p>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              {onButton1Click && (
                <Button
                  variant={button1Variant}
                  onClick={onButton1Click}
                  className="flex-1"
                >
                  {button1Label}
                </Button>
              )}
              {onButton2Click && (
                <Button
                  variant={button2Variant}
                  onClick={onButton2Click}
                  className="flex-1"
                >
                  {button2Label}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Popup;

