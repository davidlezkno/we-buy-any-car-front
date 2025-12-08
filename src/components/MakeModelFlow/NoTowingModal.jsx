/**
 * NoTowingModal - Modal for no towing service notification
 * Implements Single Responsibility Principle (SRP)
 */

import { motion } from 'framer-motion';

/**
 * No towing service modal component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Handler to close modal
 * @param {Function} props.onContinue - Handler to continue after modal
 */
const NoTowingModal = ({ isOpen, onClose, onContinue }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-lg shadow-2xl z-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <p className="text-base md:text-lg text-gray-900 leading-relaxed">
              Sorry, we don&apos;t offer a towing service.
              <br />
              We&apos;ll be happy to buy your vehicle at
              <br />
              any webuyanycar.com branch when
              <br />
              you arrange delivery.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onContinue}
              className="px-6 py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition-colors duration-200"
              id="continue-after-no-towing-modal-button"
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NoTowingModal;
