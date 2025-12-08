import { motion, AnimatePresence } from "framer-motion";
import { Car } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const VehiclePreview = ({ vehicle, loading = true, imageUrl = null }) => {
  const location = useLocation();
  // Check if we're on step 2 (Series & Body) - URL is /valuation/vehicledetails
  const isStep2 = location.pathname.indexOf("/valuation/vehicledetails") >= 0;  
  const [imageLoading, setImageLoading] = useState(false);
  const [imageToShow, setImageToShow] = useState(imageUrl);

  useEffect(() => {
    if(imageUrl !== ""){
      setImageLoading(false);
      setImageToShow(imageUrl);
    }
  }, [imageUrl]);


  // Only show waiting message if we don't have the minimum required vehicle data
  if (!vehicle || !vehicle.year || !vehicle.make || !vehicle.model) {
    return (
      <div className={`card ${isStep2 ? "block lg:block" : "hidden lg:block"}`}>
        <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
          <div className="text-center">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">Waiting for vehicle info...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${vehicle.year}-${vehicle.make}-${vehicle.model}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`card ${isStep2 ? "block lg:block" : "hidden lg:block"}`}
        style={{ maxWidth: "460px" }}
      >
        {/* Header: Improved spacing */}
        <div className="mb-3">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.trim && (
            <p className="text-gray-600 text-lg">{vehicle.trim}</p>
          )}
        </div>

        {/* Vehicle Image: Improved design with rounded borders */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden relative shadow-lg flex items-center justify-center mx-auto">
          {imageLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="spinner border-primary-600 border-t-transparent" />
            </div>
          ) : imageToShow ?  (
            <motion.img
              id="vehicle-image"
              src={imageToShow}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onError={(e) => {
                // If image fails, use default image
                const basePath = import.meta.env.BASE_URL || "/";
                e.currentTarget.src = `${basePath}vehicles/default-car.jpg`;
              }}
            />
          ) : (
            <Car className="w-20 h-20 text-gray-300" />
          )}

            

          {/* Color Badge */}
          {vehicle.color && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
              {vehicle.color}
            </div>
          )}
        </div>

        {/* VIN Display: Improved design */}
        {vehicle.vin && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">VIN Number</p>
            <p className="font-mono text-sm md:text-base font-bold text-gray-900 break-all bg-gray-50 px-4 py-2 rounded-xl">
              {vehicle.vin}
            </p>
          </div>
        )}

        {/* License Plate Display */}
        {vehicle.plateNumber && vehicle.plateState && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">License Plate</p>
            <div className="flex items-center justify-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
              <p className="font-mono text-sm md:text-base font-bold text-gray-900">
                {vehicle.plateNumber}
              </p>
              <span className="text-gray-400">•</span>
              <p className="text-sm md:text-base font-semibold text-gray-700">
                {vehicle.plateState}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VehiclePreview;
