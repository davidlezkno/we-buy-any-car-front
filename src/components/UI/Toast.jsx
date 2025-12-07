/**
 * Toast Notification Component
 * Displays temporary notifications for errors, success, info, etc.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
  };

  const { icon: Icon, bgColor, textColor } = config[type] || config.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`${bgColor} ${textColor} rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <p className="flex-1 text-sm font-medium">{message}</p>
          <button
            onClick={handleClose}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
