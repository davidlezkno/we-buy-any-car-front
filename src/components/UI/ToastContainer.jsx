/**
 * ToastContainer - Manages multiple toast notifications
 */

import { useState, useEffect } from 'react';
import Toast from './Toast';

let toastId = 0;
let addToastFn = null;

/**
 * Global function to show toast from anywhere in the app
 */
export const showToast = (message, type = 'info', duration = 5000) => {
  if (addToastFn) {
    addToastFn(message, type, duration);
  }
};

// Make showToast available globally
if (typeof window !== 'undefined') {
  window.showToast = showToast;
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Register the addToast function
    addToastFn = (message, type, duration) => {
      const id = toastId++;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    return () => {
      addToastFn = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
