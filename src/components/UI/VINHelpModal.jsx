import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const VINHelpModal = ({ isOpen, onClose, onSelectFromList }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl z-10 max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Verde Oscuro */}
          <div
            className="flex items-center justify-between p-4 md:p-6 sticky top-0 z-20"
            style={{ backgroundColor: "#005a2a" }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white pr-2">
              Where to Find Your VIN Number
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-300 transition-colors p-2 flex-shrink-0 z-30"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content - Blanco */}
          <div className="p-6 md:p-8 bg-white">
            {/* Vehicle Documents Section */}
            <div className="mb-8">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                Vehicle Documents
              </h3>
              <p className="text-gray-700 mb-3">
                You can find your VIN on your:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Vehicle Title</li>
                <li>Registration</li>
                <li>Insurance ID Card (or on insurance company website)</li>
              </ul>
            </div>

            {/* Visual Guidance Section - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Left Column: Driver Side Dashboard */}
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Driver Side Dashboard
                </h3>
                <p className="text-gray-700 mb-4">
                  Located behind the windshield
                </p>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden h-48 md:h-64">
                  {/* Vehicle image with VIN zoom */}
                  <img
                    src={`${import.meta.env.BASE_URL}Content/Images/vin-dashboard.jpg`}
                    alt="VIN location on dashboard"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                  {/* Fallback placeholder */}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-gray-200"
                    style={{ display: "none" }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2 opacity-50">🚗</div>
                      <p className="text-sm text-gray-600">
                        VIN Dashboard Image
                      </p>
                    </div>
                  </div>
                  {/* Zoom circle with VIN overlay */}
                  <div className="absolute bottom-4 left-4 z-10 bg-white rounded-full p-2 md:p-3 border-4 border-white shadow-2xl">
                    <div className="text-xs md:text-sm font-mono text-gray-900 font-bold whitespace-nowrap">
                      ABCDEFG0123456789O
                    </div>
                  </div>
                  {/* White arrow pointing to VIN */}
                  <div className="absolute bottom-16 left-8 z-10">
                    <svg
                      className="w-8 h-8 md:w-10 md:h-10 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                      }}
                    >
                      <path d="M12 2L2 12l4 4 6-6 6 6 4-4L12 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Column: Driver Side Door */}
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Driver Side Door
                </h3>
                <p className="text-gray-700 mb-4">
                  See VIN sticker inside the driver&apos;s door
                </p>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden h-48 md:h-64">
                  {/* Interior car image with door */}
                  <img
                    src={`${import.meta.env.BASE_URL}Content/Images/vin-door.jpg`}
                    alt="VIN sticker on driver door"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                  {/* Fallback placeholder */}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-gray-200"
                    style={{ display: "none" }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2 opacity-50">🚪</div>
                      <p className="text-sm text-gray-600">VIN Door Image</p>
                    </div>
                  </div>
                  {/* White arrow pointing to VIN sticker */}
                  <div className="absolute bottom-8 left-4 z-10">
                    <svg
                      className="w-10 h-10 md:w-12 md:h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                        transform: "rotate(45deg)",
                      }}
                    >
                      <path d="M12 2L2 12l4 4 6-6 6 6 4-4L12 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Verde Oscuro */}
          <div className="p-4 md:p-6" style={{ backgroundColor: "#005a2a" }}>
            <p className="text-white text-center">
              Still can&apos;t find your VIN?{" "}
              <button
                onClick={() => {
                  onClose();
                  if (onSelectFromList) {
                    onSelectFromList();
                  }
                }}
                className="text-yellow-300 hover:text-yellow-200 underline font-semibold"
              >
                Click to Select Your Car from a List
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VINHelpModal;
